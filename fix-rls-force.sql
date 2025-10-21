-- ============================================================================
-- WAVESYNC - FORCE RLS FIX (Drops ALL policies and recreates them)
-- ============================================================================
-- This script forcefully fixes RLS by dropping ALL existing policies first
-- ============================================================================

-- Step 1: Get a list of all policies and drop them
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies on user_profiles
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', pol.policyname);
    END LOOP;
    
    -- Drop all policies on seafarer_profiles
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'seafarer_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON seafarer_profiles', pol.policyname);
    END LOOP;
    
    -- Drop all policies on companies
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'companies' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON companies', pol.policyname);
    END LOOP;
END $$;

-- Step 2: Create simple, non-recursive policies for user_profiles
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

-- Step 3: Create simple policies for seafarer_profiles
CREATE POLICY "seafarer_profiles_select_own" ON seafarer_profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "seafarer_profiles_update_own" ON seafarer_profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "seafarer_profiles_insert_own" ON seafarer_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Step 4: Create simple policies for companies
CREATE POLICY "companies_select_all" ON companies
  FOR SELECT 
  USING (true);

CREATE POLICY "companies_update_own" ON companies
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.company_id = companies.id
    )
  );

-- Step 5: Grant necessary permissions
GRANT SELECT, UPDATE, INSERT ON user_profiles TO authenticated;
GRANT SELECT, UPDATE, INSERT ON seafarer_profiles TO authenticated;
GRANT SELECT ON companies TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'seafarer_profiles', 'companies')
ORDER BY tablename, policyname;

