-- ============================================================================
-- WAVESYNC MARITIME PLATFORM - FIX RLS POLICIES
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the RLS policies

-- ============================================================================
-- STEP 1: DISABLE RLS TEMPORARILY (if not already done)
-- ============================================================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: RECREATE PROPER RLS POLICIES
-- ============================================================================

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON user_profiles;

-- Create a simple policy that allows users to see their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Create a policy that allows users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create a policy that allows users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 3: TEST THE POLICIES
-- ============================================================================

-- Test if the policy works (this should return your admin profile)
SELECT * FROM user_profiles WHERE id = 'd5c5394f-aa4b-47b9-9791-7757a07572a8';

-- ============================================================================
-- STEP 4: CREATE POLICIES FOR OTHER TABLES
-- ============================================================================

-- Companies policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all companies" ON companies;
CREATE POLICY "Admins can manage all companies" ON companies
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Seafarer profiles policies
ALTER TABLE seafarer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seafarers can view their own profile" ON seafarer_profiles;
CREATE POLICY "Seafarers can view their own profile" ON seafarer_profiles
  FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Seafarers can update their own profile" ON seafarer_profiles;
CREATE POLICY "Seafarers can update their own profile" ON seafarer_profiles
  FOR UPDATE 
  USING (user_id = auth.uid());

-- ============================================================================
-- STEP 5: VERIFY POLICIES ARE WORKING
-- ============================================================================

-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'companies', 'seafarer_profiles')
ORDER BY tablename, policyname;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICIES FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Policies created for:';
    RAISE NOTICE '- user_profiles (view/update own profile)';
    RAISE NOTICE '- companies (admin management)';
    RAISE NOTICE '- seafarer_profiles (view/update own profile)';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh your app';
    RAISE NOTICE '2. Test login - should work with RLS enabled';
    RAISE NOTICE '3. Test admin dashboard functionality';
    RAISE NOTICE '========================================';
END $$;
