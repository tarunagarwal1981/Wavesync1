-- ============================================================================
-- WAVESYNC MARITIME PLATFORM - PHASE 2 DATABASE EXTENSIONS
-- ============================================================================
-- This script extends the existing database schema for Phase 2 features:
-- - Vessel Management
-- - Enhanced Assignment System
-- - Document Management Improvements
-- - Notification System

-- ============================================================================
-- STEP 1: CREATE NEW TYPES
-- ============================================================================

-- Vessel types enum
CREATE TYPE vessel_type AS ENUM (
  'container', 'bulk_carrier', 'tanker', 'cargo', 'passenger', 
  'offshore', 'tug', 'fishing', 'yacht', 'other'
);

-- Vessel status enum
CREATE TYPE vessel_status AS ENUM (
  'active', 'maintenance', 'dry_dock', 'retired', 'sold'
);

-- Document category enum
CREATE TYPE document_category AS ENUM (
  'medical', 'training', 'license', 'identity', 
  'contract', 'certificate', 'passport', 'visa', 'other'
);

-- Assignment priority enum
CREATE TYPE assignment_priority AS ENUM (
  'low', 'normal', 'high', 'urgent'
);

-- ============================================================================
-- STEP 2: CREATE VESSELS TABLE
-- ============================================================================

CREATE TABLE vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  imo_number VARCHAR(50) UNIQUE,
  vessel_type vessel_type NOT NULL,
  flag VARCHAR(100),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status vessel_status DEFAULT 'active',
  specifications JSONB DEFAULT '{}',
  capacity INTEGER,
  built_year INTEGER,
  gross_tonnage DECIMAL(10,2),
  length_overall DECIMAL(8,2),
  beam DECIMAL(8,2),
  draft DECIMAL(6,2),
  engine_power DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: ENHANCE ASSIGNMENTS TABLE
-- ============================================================================

-- Add new columns to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS tentative_start_date DATE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS tentative_end_date DATE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS actual_start_date DATE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS actual_end_date DATE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS priority assignment_priority DEFAULT 'normal';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- STEP 4: ENHANCE DOCUMENTS TABLE
-- ============================================================================

-- Add new columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category document_category DEFAULT 'other';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_number VARCHAR(100);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS issued_by VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS issued_date DATE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS issued_place VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reminder_days INTEGER DEFAULT 30;

-- ============================================================================
-- STEP 5: CREATE NOTIFICATION TEMPLATES TABLE
-- ============================================================================

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type notification_type NOT NULL,
  subject VARCHAR(255) NOT NULL,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: CREATE USER NOTIFICATION PREFERENCES TABLE
-- ============================================================================

CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- ============================================================================
-- STEP 7: CREATE ASSIGNMENT HISTORY TABLE
-- ============================================================================

CREATE TABLE assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  status assignment_status NOT NULL,
  changed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 8: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Vessels indexes
CREATE INDEX idx_vessels_company_id ON vessels(company_id);
CREATE INDEX idx_vessels_status ON vessels(status);
CREATE INDEX idx_vessels_type ON vessels(vessel_type);
CREATE INDEX idx_vessels_imo_number ON vessels(imo_number);

-- Assignments indexes
CREATE INDEX idx_assignments_vessel_id ON assignments(vessel_id);
CREATE INDEX idx_assignments_tentative_start ON assignments(tentative_start_date);
CREATE INDEX idx_assignments_priority ON assignments(priority);
CREATE INDEX idx_assignments_created_by ON assignments(created_by);

-- Documents indexes
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_expiry ON documents(expiry_date);
CREATE INDEX idx_documents_required ON documents(is_required);
CREATE INDEX idx_documents_status ON documents(status);

-- Notifications indexes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Assignment history indexes
CREATE INDEX idx_assignment_history_assignment_id ON assignment_history(assignment_id);
CREATE INDEX idx_assignment_history_created_at ON assignment_history(created_at);

-- ============================================================================
-- STEP 9: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 10: CREATE RLS POLICIES
-- ============================================================================

-- Vessels policies
CREATE POLICY "Admins can manage all vessels" ON vessels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Company users can view their company vessels" ON vessels
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

CREATE POLICY "Company users can manage their company vessels" ON vessels
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

-- Notification templates policies
CREATE POLICY "Admins can manage notification templates" ON notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- User notification preferences policies
CREATE POLICY "Users can manage their own notification preferences" ON user_notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all notification preferences" ON user_notification_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Assignment history policies
CREATE POLICY "Users can view assignment history for their assignments" ON assignment_history
  FOR SELECT USING (
    assignment_id IN (
      SELECT id FROM assignments WHERE seafarer_id = auth.uid()
    )
  );

CREATE POLICY "Company users can view assignment history for their company" ON assignment_history
  FOR SELECT USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN vessels v ON a.vessel_id = v.id
      JOIN user_profiles up ON v.company_id = up.company_id
      WHERE up.id = auth.uid() AND up.user_type = 'company'
    )
  );

CREATE POLICY "Admins can view all assignment history" ON assignment_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- STEP 11: CREATE TRIGGERS
-- ============================================================================

-- Update timestamps trigger for vessels
CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON vessels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update timestamps trigger for notification templates
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update timestamps trigger for user notification preferences
CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Assignment status change trigger
CREATE OR REPLACE FUNCTION log_assignment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO assignment_history (assignment_id, status, changed_by, notes)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER assignment_status_change_trigger
  AFTER UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION log_assignment_status_change();

-- ============================================================================
-- STEP 12: INSERT SAMPLE DATA
-- ============================================================================

-- Insert sample vessels (assuming we have companies)
INSERT INTO vessels (name, imo_number, vessel_type, flag, company_id, status, capacity, built_year, gross_tonnage)
SELECT 
  'MV Ocean Pioneer',
  'IMO1234567',
  'container',
  'Panama',
  c.id,
  'active',
  5000,
  2015,
  45000.00
FROM companies c LIMIT 1;

INSERT INTO vessels (name, imo_number, vessel_type, flag, company_id, status, capacity, built_year, gross_tonnage)
SELECT 
  'MV Sea Explorer',
  'IMO2345678',
  'bulk_carrier',
  'Liberia',
  c.id,
  'active',
  3000,
  2018,
  35000.00
FROM companies c LIMIT 1;

-- Insert notification templates
INSERT INTO notification_templates (name, type, subject, template, variables) VALUES
('Assignment Created', 'info', 'New Assignment Available', 'Hello {{seafarer_name}}, you have been assigned to {{vessel_name}} with tentative start date {{start_date}}.', '["seafarer_name", "vessel_name", "start_date"]'),
('Document Expiry Warning', 'warning', 'Document Expiring Soon', 'Your {{document_type}} is expiring on {{expiry_date}}. Please renew it soon.', '["document_type", "expiry_date"]'),
('Assignment Accepted', 'success', 'Assignment Accepted', '{{seafarer_name}} has accepted the assignment to {{vessel_name}}.', '["seafarer_name", "vessel_name"]'),
('Assignment Declined', 'error', 'Assignment Declined', '{{seafarer_name}} has declined the assignment to {{vessel_name}}.', '["seafarer_name", "vessel_name"]');

-- ============================================================================
-- STEP 13: GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON vessels TO authenticated;
GRANT ALL ON notification_templates TO authenticated;
GRANT ALL ON user_notification_preferences TO authenticated;
GRANT ALL ON assignment_history TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PHASE 2 DATABASE EXTENSIONS COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'New tables created: vessels, notification_templates, user_notification_preferences, assignment_history';
    RAISE NOTICE 'Enhanced tables: assignments, documents';
    RAISE NOTICE 'New types created: vessel_type, vessel_status, document_category, assignment_priority';
    RAISE NOTICE 'RLS policies configured for all new tables';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Triggers created for automatic logging';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create vessel management components';
    RAISE NOTICE '2. Build assignment management system';
    RAISE NOTICE '3. Implement document management features';
    RAISE NOTICE '4. Create notification system';
    RAISE NOTICE '========================================';
END $$;
