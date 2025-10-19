-- =====================================================
-- TASK MANAGEMENT NOTIFICATION SYSTEM
-- =====================================================
-- This script creates notification triggers for task events
-- =====================================================

-- ============================================================================
-- STEP 1: CREATE NOTIFICATION TEMPLATES
-- ============================================================================

-- Task Created Template
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'task_created') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'task_created',
      'New Task Assigned',
      'You have been assigned a new task: {{task_title}}. Due date: {{due_date}}',
      'info',
      '["task_title", "due_date"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Task Completed Template
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'task_completed') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'task_completed',
      'Task Completed',
      '{{seafarer_name}} has completed the task: {{task_title}}',
      'success',
      '["seafarer_name", "task_title"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Task Due Soon Template (24 hours)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'task_due_soon') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'task_due_soon',
      'Task Due Soon',
      'Reminder: Your task "{{task_title}}" is due in 24 hours!',
      'warning',
      '["task_title"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- Task Overdue Template
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'task_overdue') THEN
    INSERT INTO notification_templates (name, subject, template, type, variables, is_active, created_at) 
    VALUES (
      'task_overdue',
      'Task Overdue',
      'Alert: Your task "{{task_title}}" is overdue. Please complete it as soon as possible.',
      'error',
      '["task_title"]'::jsonb,
      true,
      NOW()
    );
  END IF;
END $$;

-- ============================================================================
-- STEP 2: CREATE NOTIFICATION FUNCTIONS
-- ============================================================================

-- Notify when task is created
DROP FUNCTION IF EXISTS notify_task_created();

CREATE OR REPLACE FUNCTION notify_task_created()
RETURNS TRIGGER AS $$
DECLARE
  v_due_date_formatted TEXT;
BEGIN
  -- Format due date
  IF NEW.due_date IS NOT NULL THEN
    v_due_date_formatted := TO_CHAR(NEW.due_date, 'Mon DD, YYYY');
  ELSE
    v_due_date_formatted := 'No due date';
  END IF;

  -- Create notification for assigned seafarer
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read,
    created_at
  ) VALUES (
    NEW.assigned_to,
    'New Task Assigned',
    'You have been assigned a new task: ' || NEW.title || '. Due date: ' || v_due_date_formatted,
    'info'::notification_type,
    false,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notify when task is completed
DROP FUNCTION IF EXISTS notify_task_completed();

CREATE OR REPLACE FUNCTION notify_task_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_seafarer_name TEXT;
  v_task RECORD;
BEGIN
  -- Only trigger if status changed to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Get task details
    SELECT * INTO v_task FROM tasks WHERE id = NEW.id;
    
    -- Get seafarer name
    SELECT full_name INTO v_seafarer_name
    FROM user_profiles
    WHERE id = NEW.assigned_to;

    -- Notify company users
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      read,
      created_at
    )
    SELECT 
      up.id,
      'Task Completed',
      v_seafarer_name || ' has completed the task: ' || NEW.title,
      'success'::notification_type,
      false,
      NOW()
    FROM user_profiles up
    WHERE up.company_id = NEW.company_id
    AND up.user_type IN ('company', 'admin')
    AND up.id != NEW.assigned_to; -- Don't notify the person who completed it

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send due soon reminders
DROP FUNCTION IF EXISTS send_task_reminders();

CREATE OR REPLACE FUNCTION send_task_reminders()
RETURNS void AS $$
BEGIN
  -- Send reminders for tasks due in 24 hours
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read,
    created_at
  )
  SELECT 
    t.assigned_to,
    'Task Due Soon',
    'Reminder: Your task "' || t.title || '" is due in 24 hours!',
    'warning'::notification_type,
    false,
    NOW()
  FROM tasks t
  WHERE t.status IN ('pending', 'in_progress')
  AND t.due_date IS NOT NULL
  AND t.due_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
  AND NOT EXISTS (
    -- Don't send duplicate reminders
    SELECT 1 FROM notifications n
    WHERE n.user_id = t.assigned_to
    AND n.message LIKE '%' || t.title || '%'
    AND n.created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to send overdue notifications
DROP FUNCTION IF EXISTS send_overdue_notifications();

CREATE OR REPLACE FUNCTION send_overdue_notifications()
RETURNS void AS $$
BEGIN
  -- Update overdue tasks
  UPDATE tasks
  SET status = 'overdue'
  WHERE status IN ('pending', 'in_progress')
  AND due_date < NOW()
  AND due_date IS NOT NULL;

  -- Send notifications for newly overdue tasks
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read,
    created_at
  )
  SELECT 
    t.assigned_to,
    'Task Overdue',
    'Alert: Your task "' || t.title || '" is overdue. Please complete it as soon as possible.',
    'error'::notification_type,
    false,
    NOW()
  FROM tasks t
  WHERE t.status = 'overdue'
  AND NOT EXISTS (
    -- Don't send duplicate overdue notifications
    SELECT 1 FROM notifications n
    WHERE n.user_id = t.assigned_to
    AND n.message LIKE '%' || t.title || '%overdue%'
    AND n.created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: CREATE TRIGGERS
-- ============================================================================

-- Trigger for task creation
DROP TRIGGER IF EXISTS trigger_notify_task_created ON tasks;

CREATE TRIGGER trigger_notify_task_created
AFTER INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION notify_task_created();

-- Trigger for task completion
DROP TRIGGER IF EXISTS trigger_notify_task_completed ON tasks;

CREATE TRIGGER trigger_notify_task_completed
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION notify_task_completed();

-- ============================================================================
-- STEP 4: HELPER FUNCTION TO COMPLETE TASK
-- ============================================================================

DROP FUNCTION IF EXISTS complete_task(UUID, TEXT);

CREATE OR REPLACE FUNCTION complete_task(
  p_task_id UUID,
  p_completion_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_task RECORD;
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  -- Get task
  SELECT * INTO v_task
  FROM tasks
  WHERE id = p_task_id
  AND assigned_to = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found or you do not have permission';
  END IF;

  -- Check if already completed
  IF v_task.status = 'completed' THEN
    RAISE EXCEPTION 'Task is already completed';
  END IF;

  -- Update task
  UPDATE tasks
  SET 
    status = 'completed',
    completed_at = NOW(),
    completion_notes = p_completion_notes,
    updated_at = NOW()
  WHERE id = p_task_id;

  -- Build result
  v_result := json_build_object(
    'success', true,
    'task_id', p_task_id,
    'completed_at', NOW()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION complete_task(UUID, TEXT) TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'TASK NOTIFICATION SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Created notification templates for:';
  RAISE NOTICE '  - Task Created';
  RAISE NOTICE '  - Task Completed';
  RAISE NOTICE '  - Task Due Soon';
  RAISE NOTICE '  - Task Overdue';
  RAISE NOTICE 'Created functions:';
  RAISE NOTICE '  - notify_task_created()';
  RAISE NOTICE '  - notify_task_completed()';
  RAISE NOTICE '  - send_task_reminders()';
  RAISE NOTICE '  - send_overdue_notifications()';
  RAISE NOTICE '  - complete_task()';
  RAISE NOTICE 'Created triggers on tasks table';
  RAISE NOTICE '====================================================';
END $$;
