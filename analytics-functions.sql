-- ============================================================================
-- ANALYTICS & REPORTING SYSTEM
-- ============================================================================
-- This script creates database functions for advanced analytics and reporting
-- ============================================================================

-- Ensure functions are created in public schema
SET search_path TO public;

-- ============================================================================
-- CREW ANALYTICS FUNCTIONS
-- ============================================================================

-- Get crew statistics
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
  FROM user_profiles up
  WHERE up.company_id = p_company_id AND up.user_type = 'seafarer';

  -- Count availability status from seafarer_profiles (if exists)
  SELECT 
    COUNT(*) FILTER (WHERE sp.availability_status = 'available'),
    COUNT(*) FILTER (WHERE sp.availability_status = 'on_contract'),
    COUNT(*) FILTER (WHERE sp.availability_status = 'unavailable')
  INTO available_count, on_assignment_count, on_leave_count
  FROM user_profiles up
  LEFT JOIN seafarer_profiles sp ON up.id = sp.user_id
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
        FROM user_profiles up
        LEFT JOIN seafarer_profiles sp ON up.id = sp.user_id
        WHERE up.company_id = p_company_id AND up.user_type = 'seafarer'
        GROUP BY COALESCE(sp.rank, 'N/A')
      ) rank_counts
    ),
    'avg_experience_years', (
      SELECT AVG(sp.experience_years)
      FROM user_profiles up
      LEFT JOIN seafarer_profiles sp ON up.id = sp.user_id
      WHERE up.company_id = p_company_id AND up.user_type = 'seafarer'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get crew availability over time (last 12 months)
CREATE OR REPLACE FUNCTION public.get_crew_availability_trend(p_company_id UUID)
RETURNS TABLE (
  month TEXT,
  available BIGINT,
  on_assignment BIGINT,
  on_leave BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(date_trunc('month', CURRENT_DATE - (n || ' months')::INTERVAL), 'Mon YYYY') as month,
    0::BIGINT as available,
    0::BIGINT as on_assignment,
    0::BIGINT as on_leave
  FROM generate_series(11, 0, -1) n
  ORDER BY date_trunc('month', CURRENT_DATE - (n || ' months')::INTERVAL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DOCUMENT ANALYTICS FUNCTIONS
-- ============================================================================

-- Get document compliance statistics
CREATE OR REPLACE FUNCTION public.get_document_statistics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_docs INTEGER;
  expired_count INTEGER;
  expiring_urgent_count INTEGER;
  expiring_soon_count INTEGER;
  valid_count INTEGER;
BEGIN
  -- Count documents by expiry status
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE d.expiry_date IS NOT NULL AND d.expiry_date < NOW()),
    COUNT(*) FILTER (WHERE d.expiry_date IS NOT NULL AND d.expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'),
    COUNT(*) FILTER (WHERE d.expiry_date IS NOT NULL AND d.expiry_date BETWEEN NOW() + INTERVAL '30 days' AND NOW() + INTERVAL '90 days'),
    COUNT(*) FILTER (WHERE d.expiry_date IS NULL OR d.expiry_date > NOW() + INTERVAL '90 days')
  INTO total_docs, expired_count, expiring_urgent_count, expiring_soon_count, valid_count
  FROM documents d
  JOIN user_profiles up ON d.user_id = up.id
  WHERE up.company_id = p_company_id AND d.status = 'approved';

  SELECT json_build_object(
    'total_documents', total_docs,
    'expired', expired_count,
    'expiring_urgent', expiring_urgent_count,
    'expiring_soon', expiring_soon_count,
    'valid', valid_count,
    'compliance_rate', CASE WHEN total_docs > 0 THEN ROUND((valid_count::DECIMAL / total_docs::DECIMAL) * 100, 2) ELSE 0 END,
    'by_type', (
      SELECT json_object_agg(document_type, count)
      FROM (
        SELECT d.document_type, COUNT(*) as count
        FROM documents d
        JOIN user_profiles up ON d.user_id = up.id
        WHERE up.company_id = p_company_id AND d.status = 'approved'
        GROUP BY d.document_type
      ) type_counts
    ),
    'by_status', (
      SELECT json_object_agg(status, count)
      FROM (
        SELECT d.status, COUNT(*) as count
        FROM documents d
        JOIN user_profiles up ON d.user_id = up.id
        WHERE up.company_id = p_company_id
        GROUP BY d.status
      ) status_counts
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get document upload trend (last 12 months)
CREATE OR REPLACE FUNCTION public.get_document_upload_trend(p_company_id UUID)
RETURNS TABLE (
  month TEXT,
  uploads BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(date_trunc('month', d.created_at), 'Mon YYYY') as month,
    COUNT(d.id) as uploads
  FROM documents d
  JOIN user_profiles up ON d.user_id = up.id
  WHERE up.company_id = p_company_id
    AND d.created_at >= NOW() - INTERVAL '12 months'
  GROUP BY date_trunc('month', d.created_at)
  ORDER BY date_trunc('month', d.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TASK ANALYTICS FUNCTIONS
-- ============================================================================

-- Get task statistics
CREATE OR REPLACE FUNCTION public.get_task_statistics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_tasks', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE t.status = 'pending'),
    'in_progress', COUNT(*) FILTER (WHERE t.status = 'in_progress'),
    'completed', COUNT(*) FILTER (WHERE t.status = 'completed'),
    'overdue', COUNT(*) FILTER (WHERE t.status = 'pending' AND t.due_date < NOW()),
    'completion_rate', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE t.status = 'completed')::DECIMAL / COUNT(*)::DECIMAL) * 100, 2) ELSE 0 END,
    'avg_completion_time_days', ROUND(AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at)) / 86400) FILTER (WHERE t.completed_at IS NOT NULL), 2),
    'by_category', (
      SELECT json_object_agg(category, count)
      FROM (
        SELECT t.category, COUNT(*) as count
        FROM tasks t
        WHERE t.company_id = p_company_id
        GROUP BY t.category
      ) category_counts
    ),
    'by_priority', (
      SELECT json_object_agg(priority, count)
      FROM (
        SELECT t.priority, COUNT(*) as count
        FROM tasks t
        WHERE t.company_id = p_company_id
        GROUP BY t.priority
      ) priority_counts
    )
  )
  INTO result
  FROM tasks t
  WHERE t.company_id = p_company_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get task completion trend (last 12 months)
CREATE OR REPLACE FUNCTION public.get_task_completion_trend(p_company_id UUID)
RETURNS TABLE (
  month TEXT,
  created BIGINT,
  completed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT date_trunc('month', CURRENT_DATE - (n || ' months')::INTERVAL) as month_start
    FROM generate_series(11, 0, -1) n
  )
  SELECT
    TO_CHAR(m.month_start, 'Mon YYYY') as month,
    COUNT(t.id) FILTER (WHERE t.created_at >= m.month_start AND t.created_at < m.month_start + INTERVAL '1 month') as created,
    COUNT(t.id) FILTER (WHERE t.completed_at >= m.month_start AND t.completed_at < m.month_start + INTERVAL '1 month') as completed
  FROM months m
  LEFT JOIN tasks t ON t.company_id = p_company_id
  GROUP BY m.month_start
  ORDER BY m.month_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ASSIGNMENT ANALYTICS FUNCTIONS
-- ============================================================================

-- Get assignment statistics
CREATE OR REPLACE FUNCTION public.get_assignment_statistics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_assignments', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE a.status = 'pending'),
    'accepted', COUNT(*) FILTER (WHERE a.status = 'accepted'),
    'rejected', COUNT(*) FILTER (WHERE a.status = 'declined'),
    'active', COUNT(*) FILTER (WHERE a.status = 'active'),
    'completed', COUNT(*) FILTER (WHERE a.status = 'completed'),
    'cancelled', COUNT(*) FILTER (WHERE a.status = 'cancelled'),
    'acceptance_rate', CASE WHEN COUNT(*) FILTER (WHERE a.status IN ('accepted', 'declined')) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE a.status = 'accepted')::DECIMAL / COUNT(*) FILTER (WHERE a.status IN ('accepted', 'declined'))::DECIMAL) * 100, 2) 
      ELSE 0 END,
    'by_vessel', (
      SELECT json_object_agg(vessel_name, count)
      FROM (
        SELECT COALESCE(v.name, a.vessel_name, 'Unknown') as vessel_name, COUNT(*) as count
        FROM assignments a
        LEFT JOIN vessels v ON a.vessel_id = v.id
        WHERE a.company_id = p_company_id
        GROUP BY COALESCE(v.name, a.vessel_name, 'Unknown')
      ) vessel_counts
    )
  )
  INTO result
  FROM assignments a
  WHERE a.company_id = p_company_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get assignment trend (last 12 months)
CREATE OR REPLACE FUNCTION public.get_assignment_trend(p_company_id UUID)
RETURNS TABLE (
  month TEXT,
  assignments BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(date_trunc('month', a.created_at), 'Mon YYYY') as month,
    COUNT(a.id) as assignments
  FROM assignments a
  WHERE a.company_id = p_company_id
    AND a.created_at >= NOW() - INTERVAL '12 months'
  GROUP BY date_trunc('month', a.created_at)
  ORDER BY date_trunc('month', a.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VESSEL ANALYTICS FUNCTIONS
-- ============================================================================

-- Get vessel statistics
CREATE OR REPLACE FUNCTION public.get_vessel_statistics(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_vessels', COUNT(*),
    'active', COUNT(*) FILTER (WHERE v.status = 'active'),
    'in_maintenance', COUNT(*) FILTER (WHERE v.status = 'maintenance'),
    'dry_dock', COUNT(*) FILTER (WHERE v.status = 'dry_dock'),
    'retired', COUNT(*) FILTER (WHERE v.status = 'retired'),
    'sold', COUNT(*) FILTER (WHERE v.status = 'sold'),
    'inactive', COUNT(*) FILTER (WHERE v.status IN ('retired', 'sold')),
    'by_type', (
      SELECT json_object_agg(vessel_type, count)
      FROM (
        SELECT v.vessel_type, COUNT(*) as count
        FROM vessels v
        WHERE v.company_id = p_company_id
        GROUP BY v.vessel_type
      ) type_counts
    ),
    'avg_crew_capacity', ROUND(AVG(v.capacity), 0)
  )
  INTO result
  FROM vessels v
  WHERE v.company_id = p_company_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPREHENSIVE DASHBOARD ANALYTICS
-- ============================================================================

-- Get complete dashboard analytics
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

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on analytics functions to authenticated users
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
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(UUID) TO anon;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'ANALYTICS FUNCTIONS CREATED SUCCESSFULLY!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Created functions:';
  RAISE NOTICE '  - get_crew_statistics';
  RAISE NOTICE '  - get_crew_availability_trend';
  RAISE NOTICE '  - get_document_statistics';
  RAISE NOTICE '  - get_document_upload_trend';
  RAISE NOTICE '  - get_task_statistics';
  RAISE NOTICE '  - get_task_completion_trend';
  RAISE NOTICE '  - get_assignment_statistics';
  RAISE NOTICE '  - get_assignment_trend';
  RAISE NOTICE '  - get_vessel_statistics';
  RAISE NOTICE '  - get_dashboard_analytics';
  RAISE NOTICE '====================================================';
END $$;

