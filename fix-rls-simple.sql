-- ============================================================================
-- WAVESYNC - SIMPLE RLS FIX (NO CIRCULAR DEPENDENCIES)
-- ============================================================================
-- This script fixes the RLS policies to prevent circular dependency issues
-- that cause profile fetch timeouts.
--
-- ISSUE: Policies that check user_type from user_profiles create circular
-- dependencies when querying user_profiles itself.
--
-- SOLUTION: Use simple, non-recursive policies for user profile access.
-- ============================================================================

-- Step 1: Drop all existing policies that might cause circular dependencies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON user_profiles;

-- Step 2: Create simple, non-recursive policies
-- These policies avoid querying user_profiles to check user_type

-- Allow users to view their own profile (no recursion)
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile (no recursion)
CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to insert their own profile during signup (no recursion)
CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Step 3: For admin access, use a more efficient approach
-- Instead of checking user_type in the policy (which causes recursion),
-- we'll allow admins to access via application logic or a separate function

-- Grant necessary permissions
GRANT SELECT, UPDATE, INSERT ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================================================
-- OPTIONAL: For development/testing, you can disable RLS entirely
-- ============================================================================
-- Uncomment the following lines to disable RLS for easier development:
-- 
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE seafarer_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
--
-- Note: Re-enable RLS before deploying to production!
-- ============================================================================

-- Step 4: Verify the policies are working
-- Test with the following query (run as authenticated user):
-- SELECT * FROM user_profiles WHERE id = auth.uid();

