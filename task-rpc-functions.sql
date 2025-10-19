-- ============================================================================
-- TASK MANAGEMENT RPC FUNCTIONS
-- ============================================================================
-- This script creates the RPC functions needed for task management operations
-- Run this after task-management-setup.sql

-- ============================================================================
-- Function: Complete Task
-- ============================================================================
-- This function allows seafarers to mark tasks as completed
-- and optionally add completion notes

CREATE OR REPLACE FUNCTION complete_task(
  p_task_id UUID,
  p_completion_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_task_record RECORD;
  v_result JSON;
BEGIN
  -- Check if task exists and user has permission
  SELECT * INTO v_task_record
  FROM tasks
  WHERE id = p_task_id
  AND assigned_to = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Task not found or you do not have permission to complete it'
    );
  END IF;
  
  -- Check if task is already completed
  IF v_task_record.status = 'completed' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Task is already completed'
    );
  END IF;
  
  -- Update the task
  UPDATE tasks
  SET 
    status = 'completed',
    completed_at = NOW(),
    completion_notes = p_completion_notes,
    updated_at = NOW()
  WHERE id = p_task_id;
  
  -- Create notification for the task creator
  IF v_task_record.assigned_by IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      read,
      created_at
    ) VALUES (
      v_task_record.assigned_by,
      'Task Completed',
      'Task "' || v_task_record.title || '" has been completed.',
      'success',
      false,
      NOW()
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Task completed successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_task(UUID, TEXT) TO authenticated;

-- ============================================================================
-- Function: Update Task Status (Company Users)
-- ============================================================================
-- This function allows company users to update task status

CREATE OR REPLACE FUNCTION update_task_status(
  p_task_id UUID,
  p_status TEXT
)
RETURNS JSON AS $$
DECLARE
  v_task_record RECORD;
  v_user_type TEXT;
BEGIN
  -- Check user type
  SELECT user_type INTO v_user_type
  FROM user_profiles
  WHERE id = auth.uid();
  
  -- Only company users and admins can update any task status
  IF v_user_type NOT IN ('company', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only company users can update task status'
    );
  END IF;
  
  -- Check if task exists
  SELECT * INTO v_task_record
  FROM tasks
  WHERE id = p_task_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Task not found'
    );
  END IF;
  
  -- Update the task
  UPDATE tasks
  SET 
    status = p_status::task_status,
    updated_at = NOW()
  WHERE id = p_task_id;
  
  -- Create notification for the assignee
  IF v_task_record.assigned_to IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      read,
      created_at
    ) VALUES (
      v_task_record.assigned_to,
      'Task Status Updated',
      'Task "' || v_task_record.title || '" status changed to ' || p_status,
      'info',
      false,
      NOW()
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Task status updated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_task_status(UUID, TEXT) TO authenticated;

-- ============================================================================
-- Function: Get User Tasks Summary
-- ============================================================================
-- This function returns a summary of tasks for the current user

CREATE OR REPLACE FUNCTION get_my_tasks_summary()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'overdue', COUNT(*) FILTER (WHERE status = 'overdue'),
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled')
  ) INTO v_result
  FROM tasks
  WHERE assigned_to = auth.uid();
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_my_tasks_summary() TO authenticated;

-- ============================================================================
-- Function: Get Company Tasks Summary
-- ============================================================================
-- This function returns a summary of all tasks for a company

CREATE OR REPLACE FUNCTION get_company_tasks_summary(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_user_company UUID;
BEGIN
  -- Get user's company
  SELECT company_id INTO v_user_company
  FROM user_profiles
  WHERE id = auth.uid();
  
  -- Check if user has access to this company
  IF v_user_company != p_company_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Access denied'
    );
  END IF;
  
  SELECT json_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'overdue', COUNT(*) FILTER (WHERE status = 'overdue'),
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'high_priority', COUNT(*) FILTER (WHERE priority = 'high'),
    'urgent_priority', COUNT(*) FILTER (WHERE priority = 'urgent')
  ) INTO v_result
  FROM tasks
  WHERE company_id = p_company_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_company_tasks_summary(UUID) TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'TASK RPC FUNCTIONS CREATED SUCCESSFULLY!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - complete_task(task_id, notes)';
  RAISE NOTICE '  - update_task_status(task_id, status)';
  RAISE NOTICE '  - get_my_tasks_summary()';
  RAISE NOTICE '  - get_company_tasks_summary(company_id)';
  RAISE NOTICE '====================================================';
END $$;

