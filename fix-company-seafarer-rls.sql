-- Fix RLS policies to allow company users to view seafarers in their company
-- Run this in Supabase SQL Editor
-- This fixes infinite recursion by using SECURITY DEFINER functions that bypass RLS

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Company users can view their seafarers" ON user_profiles;
DROP POLICY IF EXISTS "Company users can view seafarer profiles in company" ON seafarer_profiles;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_user_company_id();

-- Create a helper function to get the company_id for the current user
-- SECURITY DEFINER bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid() AND user_type = 'company' LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Create a helper function to check if current user is company type
-- SECURITY DEFINER bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION is_company_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND user_type = 'company'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Create a helper function to check if current user is admin
-- SECURITY DEFINER bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Create policy for company users to view seafarers in their company
-- This allows:
-- 1. Users to view their own profile
-- 2. Company users to view seafarers where company_id matches their company_id
-- 3. Admins to view all profiles
CREATE POLICY "Company users can view their seafarers" ON user_profiles
  FOR SELECT USING (
    -- Allow if viewing own profile
    auth.uid() = id
    OR
    -- Allow company users to view seafarers in their company (using function that bypasses RLS)
    (
      user_type = 'seafarer'
      AND company_id IS NOT NULL
      AND is_company_user()
      AND company_id = get_user_company_id()
    )
    OR
    -- Allow admins to view all (using function that bypasses RLS)
    is_admin_user()
  );

-- Create a helper function to check if a seafarer belongs to the current company user's company
-- SECURITY DEFINER bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION seafarer_belongs_to_company(seafarer_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = seafarer_user_id 
    AND user_type = 'seafarer'
    AND company_id = (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'company' LIMIT 1
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Create policy for company users to view seafarer profiles in their company
CREATE POLICY "Company users can view seafarer profiles in company" ON seafarer_profiles
  FOR SELECT USING (
    -- Allow if viewing own profile
    user_id = auth.uid()
    OR
    -- Allow company users to view seafarer profiles in their company
    -- Using a function that bypasses RLS to avoid recursion
    (
      is_company_user()
      AND seafarer_belongs_to_company(seafarer_profiles.user_id)
    )
    OR
    -- Allow admins to view all
    is_admin_user()
  );

-- Grant necessary permissions
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON seafarer_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION seafarer_belongs_to_company(UUID) TO authenticated;

-- Show the policies
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'seafarer_profiles')
  AND policyname LIKE '%Company%'
ORDER BY tablename, policyname;

