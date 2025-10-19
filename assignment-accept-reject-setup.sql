-- =====================================================
-- ASSIGNMENT ACCEPT/REJECT SYSTEM
-- =====================================================
-- This script adds the ability for seafarers to accept or reject assignments
-- =====================================================

-- ============================================================================
-- STEP 1: ADD COLUMNS TO ASSIGNMENTS TABLE
-- ============================================================================

-- Add response-related columns to assignments table
ALTER TABLE assignments 
  ADD COLUMN IF NOT EXISTS response_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS response_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS response_notes TEXT;

-- Add index for response status
CREATE INDEX IF NOT EXISTS idx_assignments_response_status ON assignments(response_status);

-- ============================================================================
-- STEP 2: CREATE ASSIGNMENT RESPONSES TABLE (HISTORY)
-- ============================================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS assignment_responses CASCADE;

-- Create assignment responses table for tracking history
CREATE TABLE assignment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  response_type VARCHAR(20) NOT NULL, -- 'accepted' or 'rejected'
  notes TEXT,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_assignment_responses_assignment ON assignment_responses(assignment_id);
CREATE INDEX idx_assignment_responses_seafarer ON assignment_responses(seafarer_id);
CREATE INDEX idx_assignment_responses_type ON assignment_responses(response_type);

-- Enable RLS
ALTER TABLE assignment_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignment_responses
-- 1. Seafarers can view their own responses
CREATE POLICY "Seafarers can view their own responses"
  ON assignment_responses
  FOR SELECT
  TO authenticated
  USING (
    seafarer_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.user_type IN ('company', 'admin')
    )
  );

-- 2. Seafarers can insert their own responses
CREATE POLICY "Seafarers can insert their own responses"
  ON assignment_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (seafarer_id = auth.uid());

-- 3. Company users can view all responses for their company
CREATE POLICY "Company users can view responses for their assignments"
  ON assignment_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN assignments a ON a.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND a.id = assignment_id
      AND up.user_type IN ('company', 'admin')
    )
  );

-- ============================================================================
-- STEP 3: CREATE NOTIFICATION TEMPLATES
-- ============================================================================

-- Assignment Accepted Template
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'assignment_accepted') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'assignment_accepted',
      'Assignment Accepted',
      '{{seafarer_name}} has accepted the assignment: {{assignment_title}}',
      'success',
      '["seafarer_name", "assignment_title"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Assignment Rejected Template
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'assignment_rejected') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'assignment_rejected',
      'Assignment Rejected',
      '{{seafarer_name}} has rejected the assignment: {{assignment_title}}. Reason: {{reason}}',
      'warning',
      '["seafarer_name", "assignment_title", "reason"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- ============================================================================
-- STEP 4: CREATE TRIGGER FUNCTION FOR ASSIGNMENT RESPONSE
-- ============================================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS notify_assignment_response();

-- Create function to notify company when seafarer responds
CREATE OR REPLACE FUNCTION notify_assignment_response()
RETURNS TRIGGER AS $$
DECLARE
  v_assignment RECORD;
  v_seafarer RECORD;
  v_notification_title TEXT;
  v_notification_message TEXT;
BEGIN
  -- Get assignment details
  SELECT a.*, v.name as vessel_name
  INTO v_assignment
  FROM assignments a
  LEFT JOIN vessels v ON v.id = a.vessel_id
  WHERE a.id = NEW.assignment_id;

  -- Get seafarer details
  SELECT full_name INTO v_seafarer
  FROM user_profiles
  WHERE id = NEW.seafarer_id;

  -- Build notification based on response type
  IF NEW.response_type = 'accepted' THEN
    v_notification_title := 'Assignment Accepted';
    v_notification_message := v_seafarer.full_name || ' has accepted the assignment: ' || 
      COALESCE(v_assignment.title, 'Assignment') || 
      CASE WHEN v_assignment.vessel_name IS NOT NULL 
        THEN ' (' || v_assignment.vessel_name || ')'
        ELSE ''
      END || '.';
  ELSE
    v_notification_title := 'Assignment Rejected';
    v_notification_message := v_seafarer.full_name || ' has rejected the assignment: ' || 
      COALESCE(v_assignment.title, 'Assignment') ||
      CASE WHEN v_assignment.vessel_name IS NOT NULL 
        THEN ' (' || v_assignment.vessel_name || ')'
        ELSE ''
      END || '.';
    
    IF NEW.notes IS NOT NULL THEN
      v_notification_message := v_notification_message || ' Reason: ' || NEW.notes;
    END IF;
  END IF;

  -- Create notification for company users
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read,
    created_at
  )
  SELECT 
    up.id,
    v_notification_title,
    v_notification_message,
    (CASE 
      WHEN NEW.response_type = 'accepted' THEN 'success'
      ELSE 'warning'
    END)::notification_type,
    false,
    NOW()
  FROM user_profiles up
  WHERE up.company_id = v_assignment.company_id
  AND up.user_type IN ('company', 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS notify_assignment_response_trigger ON assignment_responses;

CREATE TRIGGER notify_assignment_response_trigger
AFTER INSERT ON assignment_responses
FOR EACH ROW
EXECUTE FUNCTION notify_assignment_response();

-- ============================================================================
-- STEP 5: CREATE HELPER FUNCTION TO ACCEPT/REJECT ASSIGNMENT
-- ============================================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS respond_to_assignment(UUID, VARCHAR, TEXT);

-- Create function to handle assignment response
CREATE OR REPLACE FUNCTION respond_to_assignment(
  p_assignment_id UUID,
  p_response_type VARCHAR,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_assignment RECORD;
  v_seafarer_id UUID;
  v_new_status VARCHAR;
  v_response_id UUID;
  v_result JSON;
BEGIN
  -- Get current user ID
  v_seafarer_id := auth.uid();

  -- Validate response type
  IF p_response_type NOT IN ('accepted', 'rejected') THEN
    RAISE EXCEPTION 'Invalid response type. Must be "accepted" or "rejected"';
  END IF;

  -- Get assignment details
  SELECT * INTO v_assignment
  FROM assignments
  WHERE id = p_assignment_id
  AND seafarer_id = v_seafarer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assignment not found or you do not have permission to respond';
  END IF;

  -- Check if already responded
  IF v_assignment.response_status != 'pending' THEN
    RAISE EXCEPTION 'You have already responded to this assignment';
  END IF;

  -- Determine new status based on response
  IF p_response_type = 'accepted' THEN
    v_new_status := 'accepted';
  ELSE
    v_new_status := 'rejected';
  END IF;

  -- Update assignment
  UPDATE assignments
  SET 
    response_status = v_new_status,
    response_date = NOW(),
    response_notes = p_notes,
    status = CASE 
      WHEN p_response_type = 'accepted' THEN 'active'
      WHEN p_response_type = 'rejected' THEN 'cancelled'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_assignment_id;

  -- Insert response record (this will trigger notification)
  INSERT INTO assignment_responses (
    assignment_id,
    seafarer_id,
    response_type,
    notes,
    previous_status,
    new_status
  ) VALUES (
    p_assignment_id,
    v_seafarer_id,
    p_response_type,
    p_notes,
    v_assignment.status,
    v_new_status
  ) RETURNING id INTO v_response_id;

  -- Build result
  v_result := json_build_object(
    'success', true,
    'response_id', v_response_id,
    'assignment_id', p_assignment_id,
    'response_type', p_response_type,
    'new_status', v_new_status
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION respond_to_assignment(UUID, VARCHAR, TEXT) TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'ASSIGNMENT ACCEPT/REJECT SETUP COMPLETE!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Added columns: response_status, response_date, response_notes';
  RAISE NOTICE 'Created table: assignment_responses';
  RAISE NOTICE 'Created function: respond_to_assignment()';
  RAISE NOTICE 'Created notifications for accept/reject';
  RAISE NOTICE 'Ready to implement UI components!';
  RAISE NOTICE '====================================================';
END $$;
