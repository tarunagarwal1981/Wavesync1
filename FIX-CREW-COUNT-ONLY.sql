-- ============================================================================
-- FIX CREW COUNT ONLY - MINIMAL CHANGE
-- ============================================================================
-- This fixes ONLY the total_crew count to match Crew Directory
-- Everything else stays the same (working as before)
-- ============================================================================

-- Update get_crew_statistics to count total crew correctly
-- We'll count total from user_profiles (like Crew Directory)
-- But keep availability counts from seafarer_profiles (as before)
CREATE OR REPLACE FUNCTION get_crew_statistics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_crew_count INTEGER;
BEGIN
  -- Count total crew from user_profiles only (matching Crew Directory)
  -- This is the ONLY change - count all seafarers, not just those with seafarer_profiles
  SELECT COUNT(*) INTO total_crew_count
  FROM user_profiles
  WHERE company_id = p_company_id AND user_type = 'seafarer';

  -- Everything else stays the same - availability counts from seafarer_profiles
  SELECT json_build_object(
    'total_crew', total_crew_count,
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_crew_statistics(UUID) TO authenticated;

-- Test the function (replace with your company_id)
-- SELECT get_crew_statistics('4082bf5c-3023-471e-97e9-c52d97147cd5'::UUID);

