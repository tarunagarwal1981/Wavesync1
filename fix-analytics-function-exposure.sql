-- ============================================================================
-- FIX ANALYTICS FUNCTION EXPOSURE TO POSTGREST
-- ============================================================================
-- This script ensures the get_dashboard_analytics function is properly
-- exposed to PostgREST and accessible via RPC calls
-- ============================================================================

-- Step 1: Check if function exists
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    n.nspname as schema
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_dashboard_analytics';

-- Step 2: Ensure function is in public schema
-- If it's not in public schema, we need to move it or create an alias
DO $$
BEGIN
    -- Check if function exists in public schema
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'get_dashboard_analytics'
        AND n.nspname = 'public'
    ) THEN
        RAISE NOTICE 'Function get_dashboard_analytics not found in public schema';
        RAISE NOTICE 'Please ensure the function is created in the public schema';
    ELSE
        RAISE NOTICE '✅ Function exists in public schema';
    END IF;
END $$;

-- Step 3: Ensure function has correct permissions
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO anon;

-- Step 4: Verify all analytics functions have permissions
GRANT EXECUTE ON FUNCTION public.get_crew_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_crew_availability_trend(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_document_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_document_upload_trend(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_task_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_task_completion_trend(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_assignment_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_assignment_trend(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_vessel_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO authenticated;

-- Step 5: Test the function directly
-- Replace with your actual company_id
-- SELECT public.get_dashboard_analytics('4082bf5c-3023-471e-97e9-c52d97147cd5'::UUID);

-- Step 6: Check PostgREST can see the function
-- This query shows what PostgREST should be able to see
SELECT 
    routine_name,
    routine_schema,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_dashboard_analytics';

-- ============================================================================
-- ALTERNATIVE: Recreate function with explicit schema
-- ============================================================================
-- If the above doesn't work, uncomment and run this to recreate the function
-- in the public schema explicitly

/*
DROP FUNCTION IF EXISTS public.get_dashboard_analytics(UUID);

CREATE OR REPLACE FUNCTION public.get_dashboard_analytics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'crew', public.get_crew_statistics(p_company_id),
    'documents', public.get_document_statistics(p_company_id),
    'tasks', public.get_task_statistics(p_company_id),
    'assignments', public.get_assignment_statistics(p_company_id),
    'vessels', public.get_vessel_statistics(p_company_id),
    'generated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO anon;
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script, verify the function is accessible:
-- 1. Check Supabase Dashboard -> Database -> Functions
-- 2. The function should appear in the list
-- 3. Try calling it via SQL Editor:
--    SELECT public.get_dashboard_analytics('YOUR-COMPANY-ID'::UUID);

