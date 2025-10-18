-- ============================================================================
-- NOTIFICATION SYSTEM SETUP
-- ============================================================================
-- This script sets up the notification system with database functions,
-- triggers, and sample notification templates for the maritime workflow.

-- ============================================================================
-- NOTIFICATION FUNCTIONS
-- ============================================================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read,
    created_at
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type::notification_type,
    false,
    NOW()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for all users in a company
CREATE OR REPLACE FUNCTION create_company_notification(
  p_company_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
) RETURNS INTEGER AS $$
DECLARE
  notification_count INTEGER := 0;
BEGIN
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
    p_title,
    p_message,
    p_type::notification_type,
    false,
    NOW()
  FROM user_profiles up
  WHERE up.company_id = p_company_id;
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for all seafarers in a company
CREATE OR REPLACE FUNCTION create_seafarer_notification(
  p_company_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
) RETURNS INTEGER AS $$
DECLARE
  notification_count INTEGER := 0;
BEGIN
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
    p_title,
    p_message,
    p_type::notification_type,
    false,
    NOW()
  FROM user_profiles up
  WHERE up.company_id = p_company_id 
  AND up.user_type = 'seafarer';
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NOTIFICATION TRIGGERS
-- ============================================================================

-- Function to handle assignment notifications
CREATE OR REPLACE FUNCTION handle_assignment_notifications()
RETURNS TRIGGER AS $$
DECLARE
  vessel_name TEXT;
BEGIN
  -- Get vessel name if vessel_id exists
  IF NEW.vessel_id IS NOT NULL THEN
    SELECT name INTO vessel_name FROM vessels WHERE id = NEW.vessel_id;
  END IF;
  
  -- New assignment created
  IF TG_OP = 'INSERT' THEN
    -- Notify the assigned seafarer
    PERFORM create_notification(
      NEW.seafarer_id,
      'New Assignment',
      'You have been assigned to ' || COALESCE(vessel_name, 'a vessel') || ' as ' || NEW.title,
      'success'
    );
    
    -- Notify company users about the new assignment
    PERFORM create_company_notification(
      NEW.company_id,
      'Assignment Created',
      'New assignment created: ' || NEW.title || CASE WHEN vessel_name IS NOT NULL THEN ' on ' || vessel_name ELSE '' END,
      'info'
    );
    
    RETURN NEW;
  END IF;
  
  -- Assignment updated
  IF TG_OP = 'UPDATE' THEN
    -- Notify seafarer of changes
    IF OLD.status != NEW.status THEN
      PERFORM create_notification(
        NEW.seafarer_id,
        'Assignment Status Updated',
        'Your assignment status has changed to: ' || NEW.status,
        'warning'
      );
    END IF;
    
    -- Notify company users of changes
    IF OLD.status != NEW.status OR OLD.tentative_start_date != NEW.tentative_start_date THEN
      PERFORM create_company_notification(
        NEW.company_id,
        'Assignment Updated',
        'Assignment updated: ' || NEW.title,
        'info'
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assignment notifications
DROP TRIGGER IF EXISTS assignment_notifications_trigger ON assignments;
CREATE TRIGGER assignment_notifications_trigger
  AFTER INSERT OR UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION handle_assignment_notifications();

-- Function to handle document expiry notifications
CREATE OR REPLACE FUNCTION handle_document_expiry_notifications()
RETURNS TRIGGER AS $$
DECLARE
  days_until_expiry INTEGER;
  expiry_date DATE;
BEGIN
  -- Only process if expiry_date is set
  IF NEW.expiry_date IS NOT NULL THEN
    expiry_date := NEW.expiry_date;
    days_until_expiry := expiry_date - CURRENT_DATE;
    
    -- Notify if document expires within 30 days
    IF days_until_expiry <= 30 AND days_until_expiry >= 0 THEN
      -- Notify the seafarer
      PERFORM create_notification(
        NEW.user_id,
        'Document Expiring Soon',
        NEW.document_type || ' expires in ' || days_until_expiry || ' days',
        CASE 
          WHEN days_until_expiry <= 7 THEN 'error'
          WHEN days_until_expiry <= 15 THEN 'warning'
          ELSE 'info'
        END
      );
      
      -- Notify company users
      PERFORM create_company_notification(
        (SELECT company_id FROM user_profiles WHERE id = NEW.user_id),
        'Seafarer Document Expiring',
        NEW.document_type || ' for ' || (SELECT full_name FROM user_profiles WHERE id = NEW.user_id) || ' expires in ' || days_until_expiry || ' days',
        CASE 
          WHEN days_until_expiry <= 7 THEN 'error'
          WHEN days_until_expiry <= 15 THEN 'warning'
          ELSE 'info'
        END
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document expiry notifications
DROP TRIGGER IF EXISTS document_expiry_notifications_trigger ON documents;
CREATE TRIGGER document_expiry_notifications_trigger
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION handle_document_expiry_notifications();

-- Function to handle vessel notifications
CREATE OR REPLACE FUNCTION handle_vessel_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- New vessel created
  IF TG_OP = 'INSERT' THEN
    PERFORM create_company_notification(
      NEW.company_id,
      'New Vessel Added',
      'Vessel ' || NEW.name || ' has been added to the fleet',
      'success'
    );
    
    RETURN NEW;
  END IF;
  
  -- Vessel updated
  IF TG_OP = 'UPDATE' THEN
    PERFORM create_company_notification(
      NEW.company_id,
      'Vessel Updated',
      'Vessel ' || NEW.name || ' information has been updated',
      'info'
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vessel notifications
DROP TRIGGER IF EXISTS vessel_notifications_trigger ON vessels;
CREATE TRIGGER vessel_notifications_trigger
  AFTER INSERT OR UPDATE ON vessels
  FOR EACH ROW
  EXECUTE FUNCTION handle_vessel_notifications();

-- ============================================================================
-- SAMPLE NOTIFICATION TEMPLATES
-- ============================================================================

-- Insert sample notification templates (only if they don't already exist)
DO $$
BEGIN
  -- assignment_created
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'assignment_created') THEN
    INSERT INTO notification_templates (name, type, subject, template, variables, is_active, created_at) 
    VALUES ('assignment_created', 'success', 'New Assignment Available', 'You have been assigned to {{vessel_name}} as {{position}}', '["vessel_name", "position"]'::jsonb, true, NOW());
  END IF;
  
  -- assignment_updated
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'assignment_updated') THEN
    INSERT INTO notification_templates (name, type, subject, template, variables, is_active, created_at) 
    VALUES ('assignment_updated', 'warning', 'Assignment Status Updated', 'Your assignment status has changed to: {{status}}', '["status"]'::jsonb, true, NOW());
  END IF;
  
  -- document_expiring_7_days
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'document_expiring_7_days') THEN
    INSERT INTO notification_templates (name, type, subject, template, variables, is_active, created_at) 
    VALUES ('document_expiring_7_days', 'error', 'Document Expiring Soon', 'Your {{document_type}} expires in 7 days', '["document_type"]'::jsonb, true, NOW());
  END IF;
  
  -- document_expiring_15_days
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'document_expiring_15_days') THEN
    INSERT INTO notification_templates (name, type, subject, template, variables, is_active, created_at) 
    VALUES ('document_expiring_15_days', 'warning', 'Document Expiring Soon', 'Your {{document_type}} expires in 15 days', '["document_type"]'::jsonb, true, NOW());
  END IF;
  
  -- document_expiring_30_days
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'document_expiring_30_days') THEN
    INSERT INTO notification_templates (name, type, subject, template, variables, is_active, created_at) 
    VALUES ('document_expiring_30_days', 'info', 'Document Expiring Soon', 'Your {{document_type}} expires in 30 days', '["document_type"]'::jsonb, true, NOW());
  END IF;
  
  -- vessel_added
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'vessel_added') THEN
    INSERT INTO notification_templates (name, type, subject, template, variables, is_active, created_at) 
    VALUES ('vessel_added', 'success', 'New Vessel Added', 'Vessel {{vessel_name}} has been added to the fleet', '["vessel_name"]'::jsonb, true, NOW());
  END IF;
  
  -- training_completed
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'training_completed') THEN
    INSERT INTO notification_templates (name, type, subject, template, variables, is_active, created_at) 
    VALUES ('training_completed', 'success', 'Training Completed', 'You have completed {{training_name}}', '["training_name"]'::jsonb, true, NOW());
  END IF;
  
  -- profile_updated
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'profile_updated') THEN
    INSERT INTO notification_templates (name, type, subject, template, variables, is_active, created_at) 
    VALUES ('profile_updated', 'info', 'Profile Updated', 'Your profile information has been updated', '[]'::jsonb, true, NOW());
  END IF;
END $$;

-- ============================================================================
-- SAMPLE NOTIFICATIONS FOR TESTING
-- ============================================================================

-- Create sample notifications for existing users
DO $$
DECLARE
  admin_user_id UUID;
  company_user_id UUID;
  seafarer_user_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO admin_user_id FROM user_profiles WHERE user_type = 'admin' LIMIT 1;
  SELECT id INTO company_user_id FROM user_profiles WHERE user_type = 'company' LIMIT 1;
  SELECT id INTO seafarer_user_id FROM user_profiles WHERE user_type = 'seafarer' LIMIT 1;
  
  -- Create sample notifications if users exist
  IF admin_user_id IS NOT NULL THEN
    PERFORM create_notification(
      admin_user_id,
      'System Setup Complete',
      'The notification system has been successfully configured',
      'success'
    );
  END IF;
  
  IF company_user_id IS NOT NULL THEN
    PERFORM create_notification(
      company_user_id,
      'Welcome to WaveSync',
      'Your company account has been set up successfully',
      'info'
    );
    
    PERFORM create_notification(
      company_user_id,
      'Document Management Available',
      'You can now manage documents for your seafarers',
      'info'
    );
  END IF;
  
  IF seafarer_user_id IS NOT NULL THEN
    PERFORM create_notification(
      seafarer_user_id,
      'Welcome to WaveSync',
      'Your seafarer profile has been created successfully',
      'info'
    );
    
    PERFORM create_notification(
      seafarer_user_id,
      'Document Upload Available',
      'You can now upload and manage your documents',
      'info'
    );
  END IF;
END $$;

-- ============================================================================
-- NOTIFICATION PREFERENCES SETUP
-- ============================================================================

-- Create default notification preferences for existing users
-- Note: notification_type in user_notification_preferences is an enum ('info', 'success', 'warning', 'error')
-- not a template name, so we create preferences for each notification type
INSERT INTO user_notification_preferences (user_id, notification_type, email_enabled, in_app_enabled, created_at)
SELECT 
  up.id,
  nt.type,
  true, -- Enable email by default
  true, -- Enable in-app by default
  NOW()
FROM user_profiles up
CROSS JOIN (
  SELECT DISTINCT type FROM notification_templates
) nt
WHERE NOT EXISTS (
  SELECT 1 FROM user_notification_preferences unp 
  WHERE unp.user_id = up.id AND unp.notification_type = nt.type
);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Notification system setup completed successfully!';
  RAISE NOTICE '📋 Created notification functions and triggers';
  RAISE NOTICE '🔔 Set up sample notification templates';
  RAISE NOTICE '👥 Created sample notifications for existing users';
  RAISE NOTICE '⚙️ Configured default notification preferences';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '1. Test the notification system in the application';
  RAISE NOTICE '2. Create assignments and documents to trigger notifications';
  RAISE NOTICE '3. Configure email notification settings';
  RAISE NOTICE '4. Set up notification preferences for users';
END $$;

