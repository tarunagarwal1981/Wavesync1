-- Temporary fix: Disable RLS completely for development
-- This will stop the profile fetch timeouts and allow the app to work

-- Disable RLS on all tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE seafarer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON seafarer_profiles TO authenticated;
GRANT ALL ON companies TO authenticated;

-- This is a temporary solution for development
-- In production, you should re-enable RLS with proper policies
