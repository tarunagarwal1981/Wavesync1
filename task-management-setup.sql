-- =====================================================
-- TASK MANAGEMENT SYSTEM
-- =====================================================
-- This script creates a comprehensive task management system
-- for maritime crew operations
-- =====================================================

-- ============================================================================
-- STEP 1: CREATE TASK ENUMS
-- ============================================================================

-- Task status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM (
      'pending',
      'in_progress',
      'completed',
      'cancelled',
      'overdue'
    );
  END IF;
END $$;

-- Task priority enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM (
      'low',
      'medium',
      'high',
      'urgent'
    );
  END IF;
END $$;

-- Task category enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_category') THEN
    CREATE TYPE task_category AS ENUM (
      'document_upload',
      'training',
      'medical',
      'compliance',
      'onboarding',
      'offboarding',
      'general',
      'other'
    );
  END IF;
END $$;

-- ============================================================================
-- STEP 2: ENHANCE TASKS TABLE
-- ============================================================================

-- Drop existing tasks table if needed and recreate with full schema
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Create comprehensive tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Task Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category task_category DEFAULT 'general',
  
  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  
  -- Status & Priority
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  
  -- Dates
  due_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Completion Details
  completion_notes TEXT,
  reviewed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'monthly'
  tags TEXT[],
  
  CONSTRAINT tasks_due_date_check CHECK (due_date IS NULL OR due_date > created_at)
);

-- ============================================================================
-- STEP 3: CREATE TASK ATTACHMENTS TABLE
-- ============================================================================

CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: CREATE TASK COMMENTS TABLE
-- ============================================================================

CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_assignment_id ON tasks(assignment_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES FOR TASKS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Company users can view their company's tasks" ON tasks;
DROP POLICY IF EXISTS "Company users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Company users can update their company's tasks" ON tasks;
DROP POLICY IF EXISTS "Assigned users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Company users can delete their company's tasks" ON tasks;

-- 1. Seafarers can view their assigned tasks
CREATE POLICY "Users can view their assigned tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.company_id = tasks.company_id
      AND up.user_type IN ('company', 'admin')
    )
  );

-- 2. Company users can create tasks for their company
CREATE POLICY "Company users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.company_id = company_id
      AND up.user_type IN ('company', 'admin')
    )
  );

-- 3. Company users can update their company's tasks
CREATE POLICY "Company users can update their company's tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.company_id = tasks.company_id
      AND up.user_type IN ('company', 'admin')
    )
  );

-- 4. Assigned users can update their own tasks (status, completion notes)
CREATE POLICY "Assigned users can update their own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid());

-- 5. Company users can delete their company's tasks
CREATE POLICY "Company users can delete their company's tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.company_id = tasks.company_id
      AND up.user_type IN ('company', 'admin')
    )
  );

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES FOR TASK ATTACHMENTS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view attachments for their tasks" ON task_attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their tasks" ON task_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON task_attachments;

-- 1. Users can view attachments for tasks they have access to
CREATE POLICY "Users can view attachments for their tasks"
  ON task_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id
      AND (
        t.assigned_to = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM user_profiles up
          WHERE up.id = auth.uid()
          AND up.company_id = t.company_id
          AND up.user_type IN ('company', 'admin')
        )
      )
    )
  );

-- 2. Users can upload attachments to tasks they have access to
CREATE POLICY "Users can upload attachments to their tasks"
  ON task_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id
      AND (
        t.assigned_to = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM user_profiles up
          WHERE up.id = auth.uid()
          AND up.company_id = t.company_id
          AND up.user_type IN ('company', 'admin')
        )
      )
    )
  );

-- 3. Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments"
  ON task_attachments FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- ============================================================================
-- STEP 9: CREATE RLS POLICIES FOR TASK COMMENTS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view comments for their tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can create comments on their tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON task_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON task_comments;

-- 1. Users can view comments for tasks they have access to
CREATE POLICY "Users can view comments for their tasks"
  ON task_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id
      AND (
        t.assigned_to = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM user_profiles up
          WHERE up.id = auth.uid()
          AND up.company_id = t.company_id
          AND up.user_type IN ('company', 'admin')
        )
      )
    )
  );

-- 2. Users can create comments on tasks they have access to
CREATE POLICY "Users can create comments on their tasks"
  ON task_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id
      AND (
        t.assigned_to = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM user_profiles up
          WHERE up.id = auth.uid()
          AND up.company_id = t.company_id
          AND up.user_type IN ('company', 'admin')
        )
      )
    )
  );

-- 3. Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON task_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON task_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- STEP 10: CREATE TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_timestamp ON tasks;
CREATE TRIGGER update_tasks_timestamp
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Auto-update task status to overdue
CREATE OR REPLACE FUNCTION check_overdue_tasks()
RETURNS void AS $$
BEGIN
  UPDATE tasks
  SET status = 'overdue'
  WHERE status IN ('pending', 'in_progress')
  AND due_date < NOW()
  AND due_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'TASK MANAGEMENT SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Created tables: tasks, task_attachments, task_comments';
  RAISE NOTICE 'Created enums: task_status, task_priority, task_category';
  RAISE NOTICE 'RLS policies enabled and configured';
  RAISE NOTICE 'Triggers created for timestamp updates';
  RAISE NOTICE 'Ready to implement UI components!';
  RAISE NOTICE '====================================================';
END $$;
