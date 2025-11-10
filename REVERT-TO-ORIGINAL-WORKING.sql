-- ============================================================================
-- REVERT TO ORIGINAL WORKING VERSION
-- ============================================================================
-- This restores the analytics functions to the original working state
-- (where everything worked except crew count was incorrect)
-- ============================================================================

-- Drop the current broken functions
DROP FUNCTION IF EXISTS public.get_crew_statistics(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_analytics(UUID) CASCADE;

-- Recreate get_crew_statistics with ORIGINAL working version
-- (This version worked but only counted seafarers with seafarer_profiles records)
-- NOTE: This uses JOIN, so it only counts seafarers who have seafarer_profiles
-- The crew count will be lower than Crew Directory, but everything else will work
CREATE OR REPLACE FUNCTION get_crew_statistics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_crew', COUNT(*),
    'available', COUNT(*) FILTER (WHERE sp.availability_status = 'available'),
    'on_assignment', COUNT(*) FILTER (WHERE sp.availability_status = 'on_contract'),
    'on_leave', COUNT(*) FILTER (WHERE sp.availability_status = 'unavailable'),
    'by_rank', (
      SELECT json_object_agg(rank, count)
      FROM (
        SELECT sp.rank, COUNT(*) as count
        FROM user_profiles up
        JOIN seafarer_profiles sp ON up.id = sp.user_id
        WHERE up.company_id = p_company_id AND up.user_type = 'seafarer'
        GROUP BY sp.rank
      ) rank_counts
    ),
    'avg_experience_years', AVG(sp.experience_years)
  )
  INTO result
  FROM user_profiles up
  JOIN seafarer_profiles sp ON up.id = sp.user_id
  WHERE up.company_id = p_company_id AND up.user_type = 'seafarer';

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate get_dashboard_analytics with ORIGINAL working version
CREATE OR REPLACE FUNCTION get_dashboard_analytics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'crew', get_crew_statistics(p_company_id),
    'documents', get_document_statistics(p_company_id),
    'tasks', get_task_statistics(p_company_id),
    'assignments', get_assignment_statistics(p_company_id),
    'vessels', get_vessel_statistics(p_company_id),
    'generated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions (original version - no public. prefix, no anon role)
GRANT EXECUTE ON FUNCTION get_crew_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(UUID) TO authenticated;

-- Verify functions were created
SELECT 
    p.proname as function_name,
    n.nspname as schema
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('get_dashboard_analytics', 'get_crew_statistics')
ORDER BY p.proname;

-- Test the function (replace with your company_id)
-- SELECT get_dashboard_analytics('4082bf5c-3023-471e-97e9-c52d97147cd5'::UUID);

