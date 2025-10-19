-- Complete fix for RLS policies to prevent profile fetch timeouts
-- This will ensure users can access their own profiles and admins can access all profiles

-- First, let's check if RLS is enabled and disable it temporarily for development
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE seafarer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seafarer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own seafarer profile" ON seafarer_profiles;
DROP POLICY IF EXISTS "Users can update own seafarer profile" ON seafarer_profiles;
DROP POLICY IF EXISTS "Admins can view all seafarer profiles" ON seafarer_profiles;
DROP POLICY IF EXISTS "Admins can update all seafarer profiles" ON seafarer_profiles;
DROP POLICY IF EXISTS "Users can view companies" ON companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;

-- Create comprehensive RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create comprehensive RLS policies for seafarer_profiles
CREATE POLICY "Users can view own seafarer profile" ON seafarer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own seafarer profile" ON seafarer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all seafarer profiles" ON seafarer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all seafarer profiles" ON seafarer_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can insert seafarer profiles" ON seafarer_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create RLS policies for companies
CREATE POLICY "Users can view companies" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, UPDATE, INSERT ON seafarer_profiles TO authenticated;
GRANT SELECT ON companies TO authenticated;
GRANT ALL ON companies TO authenticated;

-- Create a function to check if user is admin (for use in policies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
