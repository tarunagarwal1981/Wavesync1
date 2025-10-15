-- ============================================================================
-- WAVESYNC MARITIME PLATFORM - PHASE 2 DATABASE EXTENSIONS (CLEAN VERSION)
-- ============================================================================
-- This script extends the existing database schema for Phase 2 features
-- Handles existing objects gracefully

-- ============================================================================
-- STEP 1: CREATE NEW TYPES (IF NOT EXISTS)
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE vessel_type AS ENUM (
      'container', 'bulk_carrier', 'tanker', 'cargo', 'passenger', 
      'offshore', 'tug', 'fishing', 'yacht', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vessel_status AS ENUM (
      'active', 'maintenance', 'dry_dock', 'retired', 'sold'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_category AS ENUM (
      'medical', 'training', 'license', 'identity', 
      'contract', 'certificate', 'passport', 'visa', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_priority AS ENUM (
      'low', 'normal', 'high', 'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: CREATE VESSELS TABLE (IF NOT EXISTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vessels (
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

-- Add new columns to assignments table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'vessel_id') THEN
        ALTER TABLE assignments ADD COLUMN vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'tentative_start_date') THEN
        ALTER TABLE assignments ADD COLUMN tentative_start_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'tentative_end_date') THEN
        ALTER TABLE assignments ADD COLUMN tentative_end_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'actual_start_date') THEN
        ALTER TABLE assignments ADD COLUMN actual_start_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'actual_end_date') THEN
        ALTER TABLE assignments ADD COLUMN actual_end_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'priority') THEN
        ALTER TABLE assignments ADD COLUMN priority assignment_priority DEFAULT 'normal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'notes') THEN
        ALTER TABLE assignments ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'created_by') THEN
        ALTER TABLE assignments ADD COLUMN created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'approved_by') THEN
        ALTER TABLE assignments ADD COLUMN approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'approved_at') THEN
        ALTER TABLE assignments ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ============================================================================
-- STEP 4: ENHANCE DOCUMENTS TABLE
-- ============================================================================

-- Add new columns to documents table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'category') THEN
        ALTER TABLE documents ADD COLUMN category document_category DEFAULT 'other';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'document_number') THEN
        ALTER TABLE documents ADD COLUMN document_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'issued_by') THEN
        ALTER TABLE documents ADD COLUMN issued_by VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'issued_date') THEN
        ALTER TABLE documents ADD COLUMN issued_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'issued_place') THEN
        ALTER TABLE documents ADD COLUMN issued_place VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'is_required') THEN
        ALTER TABLE documents ADD COLUMN is_required BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'reminder_days') THEN
        ALTER TABLE documents ADD COLUMN reminder_days INTEGER DEFAULT 30;
    END IF;
END $$;

-- ============================================================================
-- STEP 5: CREATE NEW TABLES (IF NOT EXISTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_templates (
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

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

CREATE TABLE IF NOT EXISTS assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  status assignment_status NOT NULL,
  changed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: CREATE INDEXES (IF NOT EXISTS)
-- ============================================================================

-- Vessels indexes
CREATE INDEX IF NOT EXISTS idx_vessels_company_id ON vessels(company_id);
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
CREATE INDEX IF NOT EXISTS idx_vessels_type ON vessels(vessel_type);
CREATE INDEX IF NOT EXISTS idx_vessels_imo_number ON vessels(imo_number);

-- Assignments indexes
CREATE INDEX IF NOT EXISTS idx_assignments_vessel_id ON assignments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_assignments_tentative_start ON assignments(tentative_start_date);
CREATE INDEX IF NOT EXISTS idx_assignments_priority ON assignments(priority);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);

-- Documents indexes (only create if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_category') THEN
        CREATE INDEX idx_documents_category ON documents(category);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_expiry') THEN
        CREATE INDEX idx_documents_expiry ON documents(expiry_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_required') THEN
        CREATE INDEX idx_documents_required ON documents(is_required);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_status') THEN
        CREATE INDEX idx_documents_status ON documents(status);
    END IF;
END $$;

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Assignment history indexes
CREATE INDEX IF NOT EXISTS idx_assignment_history_assignment_id ON assignment_history(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_created_at ON assignment_history(created_at);

-- ============================================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES (DROP AND RECREATE)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all vessels" ON vessels;
DROP POLICY IF EXISTS "Company users can view their company vessels" ON vessels;
DROP POLICY IF EXISTS "Company users can manage their company vessels" ON vessels;
DROP POLICY IF EXISTS "Admins can manage notification templates" ON notification_templates;
DROP POLICY IF EXISTS "Users can manage their own notification preferences" ON user_notification_preferences;
DROP POLICY IF EXISTS "Admins can view all notification preferences" ON user_notification_preferences;
DROP POLICY IF EXISTS "Users can view assignment history for their assignments" ON assignment_history;
DROP POLICY IF EXISTS "Company users can view assignment history for their company" ON assignment_history;
DROP POLICY IF EXISTS "Admins can view all assignment history" ON assignment_history;

-- Create new policies
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

CREATE POLICY "Admins can manage notification templates" ON notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Users can manage their own notification preferences" ON user_notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all notification preferences" ON user_notification_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

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
-- STEP 9: CREATE TRIGGERS (DROP AND RECREATE)
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_vessels_updated_at ON vessels;
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON user_notification_preferences;
DROP TRIGGER IF EXISTS assignment_status_change_trigger ON assignments;

-- Create triggers
CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON vessels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
-- STEP 10: INSERT SAMPLE DATA (ONLY IF NOT EXISTS)
-- ============================================================================

-- Insert sample vessels (only if none exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM vessels LIMIT 1) THEN
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
    END IF;
END $$;

-- Insert notification templates (only if none exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM notification_templates LIMIT 1) THEN
        INSERT INTO notification_templates (name, type, subject, template, variables) VALUES
        ('Assignment Created', 'info', 'New Assignment Available', 'Hello {{seafarer_name}}, you have been assigned to {{vessel_name}} with tentative start date {{start_date}}.', '["seafarer_name", "vessel_name", "start_date"]'),
        ('Document Expiry Warning', 'warning', 'Document Expiring Soon', 'Your {{document_type}} is expiring on {{expiry_date}}. Please renew it soon.', '["document_type", "expiry_date"]'),
        ('Assignment Accepted', 'success', 'Assignment Accepted', '{{seafarer_name}} has accepted the assignment to {{vessel_name}}.', '["seafarer_name", "vessel_name"]'),
        ('Assignment Declined', 'error', 'Assignment Declined', '{{seafarer_name}} has declined the assignment to {{vessel_name}}.', '["seafarer_name", "vessel_name"]');
    END IF;
END $$;

-- ============================================================================
-- STEP 11: GRANT PERMISSIONS
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
    RAISE NOTICE '1. Add Vessel Management to navigation';
    RAISE NOTICE '2. Test vessel creation and management';
    RAISE NOTICE '3. Build assignment management system';
    RAISE NOTICE '4. Implement document management features';
    RAISE NOTICE '========================================';
END $$;
