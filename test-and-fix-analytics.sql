-- ============================================================================
-- TEST AND FIX ANALYTICS FUNCTION
-- ============================================================================
-- This script tests the function and recreates it if needed
-- ============================================================================

-- Step 1: Check if function exists
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    n.nspname as schema
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_dashboard_analytics';

-- Step 2: Drop the function if it exists (to force recreation)
DROP FUNCTION IF EXISTS public.get_dashboard_analytics(UUID);
DROP FUNCTION IF EXISTS public.get_crew_statistics(UUID);

-- Step 3: Recreate get_crew_statistics with correct SQL
CREATE OR REPLACE FUNCTION public.get_crew_statistics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_crew_count INTEGER;
  available_count INTEGER;
  on_assignment_count INTEGER;
  on_leave_count INTEGER;
BEGIN
  -- Count total crew from user_profiles only (matching Crew Directory query)
  SELECT COUNT(*) INTO total_crew_count
  FROM public.user_profiles up
  WHERE up.company_id = p_company_id AND up.user_type = 'seafarer';

  -- Count availability status from seafarer_profiles (if exists)
  SELECT 
    COUNT(*) FILTER (WHERE sp.availability_status = 'available'),
    COUNT(*) FILTER (WHERE sp.availability_status = 'on_contract'),
    COUNT(*) FILTER (WHERE sp.availability_status = 'unavailable')
  INTO available_count, on_assignment_count, on_leave_count
  FROM public.user_profiles up
  LEFT JOIN public.seafarer_profiles sp ON up.id = sp.user_id
  WHERE up.company_id = p_company_id AND up.user_type = 'seafarer';

  SELECT json_build_object(
    'total_crew', total_crew_count,
    'available', COALESCE(available_count, 0),
    'on_assignment', COALESCE(on_assignment_count, 0),
    'on_leave', COALESCE(on_leave_count, 0),
    'by_rank', (
      SELECT json_object_agg(COALESCE(sp.rank, 'N/A'), count)
      FROM (
        SELECT COALESCE(sp.rank, 'N/A') as rank, COUNT(*) as count
        FROM public.user_profiles up
        LEFT JOIN public.seafarer_profiles sp ON up.id = sp.user_id
        WHERE up.company_id = p_company_id AND up.user_type = 'seafarer'
        GROUP BY COALESCE(sp.rank, 'N/A')
      ) rank_counts
    ),
    'avg_experience_years', (
      SELECT AVG(sp.experience_years)
      FROM public.user_profiles up
      LEFT JOIN public.seafarer_profiles sp ON up.id = sp.user_id
      WHERE up.company_id = p_company_id AND up.user_type = 'seafarer'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate get_dashboard_analytics
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

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_crew_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_crew_statistics(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO anon;

-- Step 6: Test the function (replace with your actual company_id)
-- SELECT public.get_dashboard_analytics('4082bf5c-3023-471e-97e9-c52d97147cd5'::UUID);

-- Step 7: Verify function was created
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    n.nspname as schema
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('get_dashboard_analytics', 'get_crew_statistics')
ORDER BY p.proname;

