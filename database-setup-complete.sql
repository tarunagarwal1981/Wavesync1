-- ============================================================================
-- WAVESYNC MARITIME PLATFORM - COMPLETE DATABASE SETUP
-- ============================================================================
-- Run this script in Supabase SQL Editor to set up the complete database
-- This includes all tables, RLS policies, and storage buckets needed for Phase 1

-- ============================================================================
-- STEP 1: DROP EXISTING TABLES (IF ANY)
-- ============================================================================

DROP TABLE IF EXISTS seafarer_profiles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS availability_status CASCADE;
DROP TYPE IF EXISTS assignment_status CASCADE;
DROP TYPE IF EXISTS document_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- ============================================================================
-- STEP 2: CREATE CUSTOM TYPES
-- ============================================================================

CREATE TYPE user_type AS ENUM ('seafarer', 'company', 'admin');
CREATE TYPE availability_status AS ENUM ('available', 'unavailable', 'on_contract');
CREATE TYPE assignment_status AS ENUM ('pending', 'accepted', 'declined', 'active', 'completed', 'cancelled');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');

-- ============================================================================
-- STEP 3: CREATE COMPANIES TABLE
-- ============================================================================

CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  website VARCHAR(255),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: CREATE USER_PROFILES TABLE
-- ============================================================================

CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  user_type user_type NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: CREATE SEAFARER_PROFILES TABLE
-- ============================================================================

CREATE TABLE seafarer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  rank VARCHAR(100) NOT NULL,
  certificate_number VARCHAR(100),
  experience_years INTEGER DEFAULT 0,
  preferred_vessel_types TEXT[],
  availability_status availability_status DEFAULT 'available',
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),
  address TEXT,
  date_of_birth DATE,
  nationality VARCHAR(100),
  passport_number VARCHAR(100),
  passport_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: CREATE ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  seafarer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  vessel_name VARCHAR(255),
  vessel_type VARCHAR(100),
  departure_port VARCHAR(255),
  arrival_port VARCHAR(255),
  start_date DATE,
  end_date DATE,
  salary DECIMAL(10,2),
  status assignment_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 7: CREATE DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  document_type VARCHAR(100),
  description TEXT,
  status document_status DEFAULT 'pending',
  expiry_date DATE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- ============================================================================
-- STEP 8: CREATE NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 9: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seafarer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 10: CREATE RLS POLICIES
-- ============================================================================

-- Companies policies
CREATE POLICY "Admins can manage all companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Company users can view their own company" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all user profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Seafarer profiles policies
CREATE POLICY "Seafarers can view their own profile" ON seafarer_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Seafarers can update their own profile" ON seafarer_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all seafarer profiles" ON seafarer_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Company users can view seafarer profiles" ON seafarer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

-- Assignments policies
CREATE POLICY "Admins can manage all assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Company users can manage their company assignments" ON assignments
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

CREATE POLICY "Seafarers can view their own assignments" ON assignments
  FOR SELECT USING (seafarer_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can manage their own documents" ON documents
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all documents" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Company users can view seafarer documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- STEP 11: CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seafarer_profiles_updated_at BEFORE UPDATE ON seafarer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 12: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_seafarer_profiles_user_id ON seafarer_profiles(user_id);
CREATE INDEX idx_seafarer_profiles_availability ON seafarer_profiles(availability_status);
CREATE INDEX idx_assignments_company_id ON assignments(company_id);
CREATE INDEX idx_assignments_seafarer_id ON assignments(seafarer_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================================================
-- STEP 13: INSERT SAMPLE DATA (OPTIONAL)
-- ============================================================================

-- Insert sample companies
INSERT INTO companies (name, email, phone, address, website) VALUES
('Ocean Logistics Ltd', 'contact@oceanlogistics.com', '+1-555-0101', '123 Maritime Ave, Port City, PC 12345', 'https://oceanlogistics.com'),
('Global Shipping Co', 'info@globalshipping.com', '+1-555-0102', '456 Harbor Blvd, Seaport, SP 67890', 'https://globalshipping.com'),
('Maritime Solutions Inc', 'hello@maritimesolutions.com', '+1-555-0103', '789 Dock Street, Harbor Town, HT 11111', 'https://maritimesolutions.com');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'WAVESYNC DATABASE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: companies, user_profiles, seafarer_profiles, assignments, documents, notifications';
    RAISE NOTICE 'RLS policies configured for all tables';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Set up storage buckets for file uploads';
    RAISE NOTICE '2. Create admin user account';
    RAISE NOTICE '3. Test all Phase 1 functionalities';
    RAISE NOTICE '========================================';
END $$;
