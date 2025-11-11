-- ============================================================================
-- URGENT FIX: Recreate get_crew_statistics function
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the "missing FROM-clause entry for table 'sp'" error
-- ============================================================================

-- Step 1: Drop the old function
DROP FUNCTION IF EXISTS public.get_crew_statistics(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_analytics(UUID) CASCADE;

-- Step 2: Recreate get_crew_statistics with correct SQL
CREATE OR REPLACE FUNCTION public.get_crew_statistics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_crew_count INTEGER;
  available_count INTEGER := 0;
  on_assignment_count INTEGER := 0;
  on_leave_count INTEGER := 0;
BEGIN
  -- Count total crew from user_profiles only (matching Crew Directory query)
  SELECT COUNT(*) INTO total_crew_count
  FROM public.user_profiles
  WHERE company_id = p_company_id AND user_type = 'seafarer';

  -- Count availability status from seafarer_profiles (if exists)
  -- IMPORTANT: This query MUST have the FROM clause with LEFT JOIN
  SELECT 
    COUNT(*) FILTER (WHERE sp.availability_status = 'available'),
    COUNT(*) FILTER (WHERE sp.availability_status = 'on_contract'),
    COUNT(*) FILTER (WHERE sp.availability_status = 'unavailable')
  INTO available_count, on_assignment_count, on_leave_count
  FROM public.user_profiles up
  LEFT JOIN public.seafarer_profiles sp ON up.id = sp.user_id
  WHERE up.company_id = p_company_id AND up.user_type = 'seafarer';

  -- Build the result JSON
  SELECT json_build_object(
    'total_crew', COALESCE(total_crew_count, 0),
    'available', COALESCE(available_count, 0),
    'on_assignment', COALESCE(on_assignment_count, 0),
    'on_leave', COALESCE(on_leave_count, 0),
    'by_rank', (
      SELECT COALESCE(json_object_agg(COALESCE(sp.rank, 'N/A'), count), '{}'::json)
      FROM (
        SELECT COALESCE(sp.rank, 'N/A') as rank, COUNT(*) as count
        FROM public.user_profiles up
        LEFT JOIN public.seafarer_profiles sp ON up.id = sp.user_id
        WHERE up.company_id = p_company_id AND up.user_type = 'seafarer'
        GROUP BY COALESCE(sp.rank, 'N/A')
      ) rank_counts
    ),
    'avg_experience_years', (
      SELECT COALESCE(AVG(sp.experience_years), 0)
      FROM public.user_profiles up
      LEFT JOIN public.seafarer_profiles sp ON up.id = sp.user_id
      WHERE up.company_id = p_company_id AND up.user_type = 'seafarer'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate get_dashboard_analytics
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

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_crew_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_crew_statistics(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO anon;

-- Step 5: Verify functions were created
SELECT 
    p.proname as function_name,
    n.nspname as schema
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('get_dashboard_analytics', 'get_crew_statistics')
ORDER BY p.proname;

-- Step 6: Test the function (uncomment and replace with your company_id)
-- SELECT public.get_dashboard_analytics('4082bf5c-3023-471e-97e9-c52d97147cd5'::UUID);

