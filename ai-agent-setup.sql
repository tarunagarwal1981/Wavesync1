-- ============================================
-- WAVESYNC AI AGENT - DATABASE SETUP
-- ============================================
-- Version: 1.0.0
-- Description: Complete database schema for AI Agent functionality
-- Features: Crew Planning Agent, Task Generation, Document Intelligence
-- 
-- Tables Created: 7
-- RPC Functions: 5
-- Policies: 15+
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. AI AGENT CONFIGURATION
-- ============================================
-- Stores AI agent settings per company

CREATE TABLE IF NOT EXISTS ai_agent_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  autonomy_level TEXT CHECK (autonomy_level IN ('full', 'semi', 'assistant')) DEFAULT 'semi',
  
  -- Configuration
  min_match_score INTEGER DEFAULT 85,
  advance_planning_days INTEGER DEFAULT 30,
  auto_approve_threshold_usd NUMERIC DEFAULT 500,
  
  -- Feature flags
  enabled_features JSONB DEFAULT '{
    "crew_planning": true,
    "task_generation": true,
    "document_analysis": false,
    "compliance_monitoring": false,
    "travel_optimization": false
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  
  -- Constraints
  CONSTRAINT valid_match_score CHECK (min_match_score >= 0 AND min_match_score <= 100),
  CONSTRAINT valid_planning_days CHECK (advance_planning_days >= 7 AND advance_planning_days <= 90)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_config_company ON ai_agent_config(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_config_enabled ON ai_agent_config(is_enabled) WHERE is_enabled = true;

COMMENT ON TABLE ai_agent_config IS 'AI agent configuration per company';
COMMENT ON COLUMN ai_agent_config.autonomy_level IS 'full: AI acts independently, semi: requires approval, assistant: suggests only';
COMMENT ON COLUMN ai_agent_config.min_match_score IS 'Minimum match score (0-100) required for AI to suggest assignment';
COMMENT ON COLUMN ai_agent_config.advance_planning_days IS 'How many days in advance AI should plan crew relief';

-- ============================================
-- 2. AI GENERATED ASSIGNMENTS
-- ============================================
-- Tracks assignments created by AI agent

CREATE TABLE IF NOT EXISTS ai_generated_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  company_id UUID REFERENCES companies(id),
  
  -- AI Decision Data
  seafarer_candidates JSONB, -- [{ id, score, reasoning, rank }]
  selected_seafarer_id UUID REFERENCES seafarer_profiles(id),
  match_score NUMERIC,
  
  -- AI Reasoning
  ai_reasoning JSONB, -- {relief_analysis, match_details, alternatives, risk_factors}
  ai_model TEXT DEFAULT 'gpt-4-turbo-preview',
  ai_confidence NUMERIC, -- 0-100
  
  -- Company Decision
  company_decision TEXT CHECK (company_decision IN ('approved', 'rejected', 'modified', 'pending')) DEFAULT 'pending',
  company_feedback TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES user_profiles(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_confidence CHECK (ai_confidence >= 0 AND ai_confidence <= 100)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_assignments_assignment ON ai_generated_assignments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_ai_assignments_company ON ai_generated_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_assignments_status ON ai_generated_assignments(company_decision);
CREATE INDEX IF NOT EXISTS idx_ai_assignments_seafarer ON ai_generated_assignments(selected_seafarer_id);
CREATE INDEX IF NOT EXISTS idx_ai_assignments_pending ON ai_generated_assignments(company_id, company_decision) 
  WHERE company_decision = 'pending';

COMMENT ON TABLE ai_generated_assignments IS 'Assignments created by AI agent pending company approval';
COMMENT ON COLUMN ai_generated_assignments.seafarer_candidates IS 'All candidates analyzed by AI with scores and reasoning';
COMMENT ON COLUMN ai_generated_assignments.ai_reasoning IS 'Detailed AI reasoning for the recommendation';
COMMENT ON COLUMN ai_generated_assignments.company_decision IS 'Company decision: pending, approved, rejected, or modified';

-- ============================================
-- 3. AI ACTION LOGS (Audit Trail)
-- ============================================
-- Complete audit trail of all AI actions

CREATE TABLE IF NOT EXISTS ai_action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  
  -- Action Details
  action_type TEXT NOT NULL, -- 'relief_analysis', 'seafarer_matching', 'assignment_created', 'task_generated', etc.
  action_data JSONB,
  
  -- AI Model Info
  ai_model TEXT,
  ai_confidence NUMERIC,
  
  -- Execution Info
  execution_time_ms INTEGER,
  result TEXT CHECK (result IN ('success', 'failed', 'pending_approval')) NOT NULL,
  error_message TEXT,
  
  -- Context
  related_assignment_id UUID REFERENCES assignments(id),
  related_seafarer_id UUID REFERENCES seafarer_profiles(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_logs_company_date ON ai_action_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_result ON ai_action_logs(result);
CREATE INDEX IF NOT EXISTS idx_ai_logs_assignment ON ai_action_logs(related_assignment_id) WHERE related_assignment_id IS NOT NULL;

COMMENT ON TABLE ai_action_logs IS 'Complete audit trail of all AI agent actions';
COMMENT ON COLUMN ai_action_logs.action_type IS 'Type of action: relief_analysis, seafarer_matching, assignment_created, task_generated, etc.';
COMMENT ON COLUMN ai_action_logs.execution_time_ms IS 'How long the AI operation took in milliseconds';

-- ============================================
-- 4. SEAFARER PREFERENCES (AI Learning)
-- ============================================
-- Learned preferences from seafarer behavior

CREATE TABLE IF NOT EXISTS seafarer_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seafarer_id UUID REFERENCES seafarer_profiles(id) UNIQUE,
  
  -- Learned Preferences
  preferred_vessel_types TEXT[],
  preferred_routes TEXT[],
  preferred_contract_duration_months INTEGER,
  min_salary_expectation NUMERIC,
  avoid_companies UUID[], -- companies seafarer rejected before
  
  -- Confidence
  preferences_confidence NUMERIC DEFAULT 0, -- 0-100, how confident AI is
  learning_data_points INTEGER DEFAULT 0, -- how many assignments AI learned from
  
  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_confidence CHECK (preferences_confidence >= 0 AND preferences_confidence <= 100)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_seafarer_prefs_seafarer ON seafarer_preferences(seafarer_id);

COMMENT ON TABLE seafarer_preferences IS 'AI-learned preferences based on seafarer acceptance/rejection patterns';
COMMENT ON COLUMN seafarer_preferences.preferences_confidence IS 'How confident AI is about these preferences (0-100)';
COMMENT ON COLUMN seafarer_preferences.learning_data_points IS 'Number of assignments AI learned from';

-- ============================================
-- 5. AI DOCUMENT EXTRACTIONS
-- ============================================
-- AI-extracted data from documents (OCR + LLM)

CREATE TABLE IF NOT EXISTS ai_document_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id),
  
  -- Extracted Data
  extracted_data JSONB, -- {name, dob, document_number, issue_date, expiry_date, etc.}
  
  -- Quality Scores
  authenticity_score NUMERIC, -- 0-100
  quality_score NUMERIC, -- 0-100 (image quality, readability)
  anomalies_detected TEXT[],
  
  -- Processing Info
  ai_model TEXT,
  processing_time_ms INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_authenticity CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
  CONSTRAINT valid_quality CHECK (quality_score >= 0 AND quality_score <= 100)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_docs_document ON ai_document_extractions(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_docs_created ON ai_document_extractions(created_at DESC);

COMMENT ON TABLE ai_document_extractions IS 'AI-extracted data from uploaded documents';
COMMENT ON COLUMN ai_document_extractions.authenticity_score IS 'AI assessment of document authenticity (0-100)';
COMMENT ON COLUMN ai_document_extractions.anomalies_detected IS 'List of detected anomalies or suspicious patterns';

-- ============================================
-- 6. AI CONVERSATIONS (Chatbot)
-- ============================================
-- Conversation history for AI chatbot

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  conversation_id UUID NOT NULL, -- group messages into conversations
  
  -- Message
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  
  -- Metadata
  metadata JSONB, -- {intent, entities, confidence, etc.}
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_id ON ai_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_created ON ai_conversations(created_at DESC);

COMMENT ON TABLE ai_conversations IS 'AI chatbot conversation history';
COMMENT ON COLUMN ai_conversations.conversation_id IS 'Groups messages into conversations (UUID)';
COMMENT ON COLUMN ai_conversations.role IS 'Message sender: user, assistant (AI), or system';

-- ============================================
-- 7. AI PERFORMANCE METRICS
-- ============================================
-- Daily performance tracking per company

CREATE TABLE IF NOT EXISTS ai_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  metric_date DATE NOT NULL,
  
  -- Assignment Metrics
  assignments_created INTEGER DEFAULT 0,
  assignments_approved INTEGER DEFAULT 0,
  assignments_rejected INTEGER DEFAULT 0,
  assignments_modified INTEGER DEFAULT 0,
  
  -- Task Metrics
  tasks_generated INTEGER DEFAULT 0,
  tasks_completed_on_time INTEGER DEFAULT 0,
  tasks_overdue INTEGER DEFAULT 0,
  
  -- Savings
  cost_savings_usd NUMERIC DEFAULT 0,
  time_saved_hours NUMERIC DEFAULT 0,
  
  -- Quality Metrics
  avg_match_score NUMERIC,
  avg_confidence NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, metric_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_metrics_company_date ON ai_performance_metrics(company_id, metric_date DESC);

COMMENT ON TABLE ai_performance_metrics IS 'Daily AI performance metrics per company';
COMMENT ON COLUMN ai_performance_metrics.time_saved_hours IS 'Estimated hours saved by AI automation';
COMMENT ON COLUMN ai_performance_metrics.cost_savings_usd IS 'Estimated cost savings in USD';

-- ============================================
-- 8. EXTEND EXISTING TABLES
-- ============================================

-- Add AI flag to assignments table
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS created_by_ai BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_assignment_id UUID REFERENCES ai_generated_assignments(id);

-- Add AI flag to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS created_by_ai BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_reasoning JSONB;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_ai ON assignments(created_by_ai) WHERE created_by_ai = true;
CREATE INDEX IF NOT EXISTS idx_tasks_ai ON tasks(created_by_ai) WHERE created_by_ai = true;

COMMENT ON COLUMN assignments.created_by_ai IS 'True if assignment was created by AI agent';
COMMENT ON COLUMN tasks.created_by_ai IS 'True if task was created by AI agent';
COMMENT ON COLUMN tasks.ai_reasoning IS 'AI reasoning for task creation (if applicable)';

-- ============================================
-- 9. RPC FUNCTIONS FOR AI
-- ============================================

-- Get AI config for company
CREATE OR REPLACE FUNCTION get_ai_config(p_company_id UUID)
RETURNS TABLE (
  is_enabled BOOLEAN,
  autonomy_level TEXT,
  min_match_score INTEGER,
  enabled_features JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.is_enabled,
    ac.autonomy_level,
    ac.min_match_score,
    ac.enabled_features
  FROM ai_agent_config ac
  WHERE ac.company_id = p_company_id;
END;
$$;

COMMENT ON FUNCTION get_ai_config IS 'Get AI agent configuration for a company';

-- ============================================

-- Get pending AI assignments for company
CREATE OR REPLACE FUNCTION get_pending_ai_assignments(p_company_id UUID)
RETURNS TABLE (
  ai_assignment_id UUID,
  assignment_id UUID,
  seafarer_name TEXT,
  vessel_name TEXT,
  match_score NUMERIC,
  ai_reasoning JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aga.id as ai_assignment_id,
    aga.assignment_id,
    up.full_name as seafarer_name,
    v.name as vessel_name,
    aga.match_score,
    aga.ai_reasoning,
    aga.created_at
  FROM ai_generated_assignments aga
  JOIN assignments a ON a.id = aga.assignment_id
  JOIN seafarer_profiles sp ON sp.id = aga.selected_seafarer_id
  JOIN user_profiles up ON up.id = sp.user_id
  JOIN vessels v ON v.id = a.vessel_id
  WHERE aga.company_id = p_company_id
    AND aga.company_decision = 'pending'
  ORDER BY aga.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_pending_ai_assignments IS 'Get all pending AI-generated assignments for a company';

-- ============================================

-- Approve AI assignment
CREATE OR REPLACE FUNCTION approve_ai_assignment(
  p_ai_assignment_id UUID,
  p_user_id UUID,
  p_feedback TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment_id UUID;
  v_company_id UUID;
BEGIN
  -- Get assignment ID and company ID
  SELECT assignment_id, company_id INTO v_assignment_id, v_company_id
  FROM ai_generated_assignments
  WHERE id = p_ai_assignment_id;
  
  IF v_assignment_id IS NULL THEN
    RAISE EXCEPTION 'AI assignment not found';
  END IF;
  
  -- Update AI assignment
  UPDATE ai_generated_assignments
  SET 
    company_decision = 'approved',
    company_feedback = p_feedback,
    decided_at = NOW(),
    decided_by = p_user_id
  WHERE id = p_ai_assignment_id;
  
  -- Update assignment status to pending (ready to send to seafarer)
  UPDATE assignments
  SET status = 'pending'
  WHERE id = v_assignment_id;
  
  -- Log action
  INSERT INTO ai_action_logs (
    company_id,
    action_type,
    action_data,
    result,
    related_assignment_id
  ) VALUES (
    v_company_id,
    'assignment_approved',
    jsonb_build_object('ai_assignment_id', p_ai_assignment_id, 'user_id', p_user_id, 'feedback', p_feedback),
    'success',
    v_assignment_id
  );
  
  -- Update performance metrics
  INSERT INTO ai_performance_metrics (company_id, metric_date, assignments_approved)
  VALUES (v_company_id, CURRENT_DATE, 1)
  ON CONFLICT (company_id, metric_date) 
  DO UPDATE SET assignments_approved = ai_performance_metrics.assignments_approved + 1;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION approve_ai_assignment IS 'Approve an AI-generated assignment';

-- ============================================

-- Reject AI assignment
CREATE OR REPLACE FUNCTION reject_ai_assignment(
  p_ai_assignment_id UUID,
  p_user_id UUID,
  p_feedback TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment_id UUID;
  v_company_id UUID;
  v_ai_reasoning JSONB;
BEGIN
  -- Get assignment ID, company ID, and AI reasoning
  SELECT assignment_id, company_id, ai_reasoning 
  INTO v_assignment_id, v_company_id, v_ai_reasoning
  FROM ai_generated_assignments
  WHERE id = p_ai_assignment_id;
  
  IF v_assignment_id IS NULL THEN
    RAISE EXCEPTION 'AI assignment not found';
  END IF;
  
  -- Update AI assignment
  UPDATE ai_generated_assignments
  SET 
    company_decision = 'rejected',
    company_feedback = p_feedback,
    decided_at = NOW(),
    decided_by = p_user_id
  WHERE id = p_ai_assignment_id;
  
  -- Delete the draft assignment (it was never sent)
  DELETE FROM assignments
  WHERE id = v_assignment_id;
  
  -- Log action for AI learning
  INSERT INTO ai_action_logs (
    company_id,
    action_type,
    action_data,
    result,
    related_assignment_id
  ) VALUES (
    v_company_id,
    'assignment_rejected',
    jsonb_build_object(
      'ai_assignment_id', p_ai_assignment_id, 
      'user_id', p_user_id,
      'feedback', p_feedback,
      'reasoning', v_ai_reasoning
    ),
    'success',
    v_assignment_id
  );
  
  -- Update performance metrics
  INSERT INTO ai_performance_metrics (company_id, metric_date, assignments_rejected)
  VALUES (v_company_id, CURRENT_DATE, 1)
  ON CONFLICT (company_id, metric_date) 
  DO UPDATE SET assignments_rejected = ai_performance_metrics.assignments_rejected + 1;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION reject_ai_assignment IS 'Reject an AI-generated assignment and learn from feedback';

-- ============================================

-- Get AI performance summary
CREATE OR REPLACE FUNCTION get_ai_performance_summary(
  p_company_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_assignments_created INTEGER,
  approval_rate NUMERIC,
  avg_match_score NUMERIC,
  total_time_saved_hours NUMERIC,
  total_cost_savings_usd NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(assignments_created)::INTEGER as total_assignments_created,
    CASE 
      WHEN SUM(assignments_created) > 0 
      THEN ROUND((SUM(assignments_approved)::NUMERIC / SUM(assignments_created)::NUMERIC) * 100, 2)
      ELSE 0
    END as approval_rate,
    AVG(avg_match_score) as avg_match_score,
    SUM(time_saved_hours) as total_time_saved_hours,
    SUM(cost_savings_usd) as total_cost_savings_usd
  FROM ai_performance_metrics
  WHERE company_id = p_company_id
    AND metric_date >= CURRENT_DATE - (p_days || ' days')::INTERVAL;
END;
$$;

COMMENT ON FUNCTION get_ai_performance_summary IS 'Get AI performance summary for a company over specified days';

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on AI tables
ALTER TABLE ai_agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seafarer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies for ai_agent_config
-- ============================================

DROP POLICY IF EXISTS "Admins can manage all AI configs" ON ai_agent_config;
CREATE POLICY "Admins can manage all AI configs"
  ON ai_agent_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Company users can view their AI config" ON ai_agent_config;
CREATE POLICY "Company users can view their AI config"
  ON ai_agent_config FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

-- ============================================
-- Policies for ai_generated_assignments
-- ============================================

DROP POLICY IF EXISTS "Company users can view their AI assignments" ON ai_generated_assignments;
CREATE POLICY "Company users can view their AI assignments"
  ON ai_generated_assignments FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Company users can update their AI assignments" ON ai_generated_assignments;
CREATE POLICY "Company users can update their AI assignments"
  ON ai_generated_assignments FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

-- ============================================
-- Policies for ai_action_logs
-- ============================================

DROP POLICY IF EXISTS "Company users can view their AI logs" ON ai_action_logs;
CREATE POLICY "Company users can view their AI logs"
  ON ai_action_logs FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all AI logs" ON ai_action_logs;
CREATE POLICY "Admins can view all AI logs"
  ON ai_action_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- ============================================
-- Policies for seafarer_preferences
-- ============================================

DROP POLICY IF EXISTS "Seafarers can view their own preferences" ON seafarer_preferences;
CREATE POLICY "Seafarers can view their own preferences"
  ON seafarer_preferences FOR SELECT
  USING (
    seafarer_id IN (
      SELECT id FROM seafarer_profiles
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Policies for ai_conversations
-- ============================================

DROP POLICY IF EXISTS "Users can view their own conversations" ON ai_conversations;
CREATE POLICY "Users can view their own conversations"
  ON ai_conversations FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own conversations" ON ai_conversations;
CREATE POLICY "Users can create their own conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- Policies for ai_performance_metrics
-- ============================================

DROP POLICY IF EXISTS "Company users can view their metrics" ON ai_performance_metrics;
CREATE POLICY "Company users can view their metrics"
  ON ai_performance_metrics FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all metrics" ON ai_performance_metrics;
CREATE POLICY "Admins can view all metrics"
  ON ai_performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- ============================================
-- GRANTS
-- ============================================

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Uncomment these to verify setup:

-- SELECT 'AI Tables Created' as status, COUNT(*) as count FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'ai_%';

-- SELECT 'AI Functions Created' as status, COUNT(*) as count FROM information_schema.routines 
-- WHERE routine_schema = 'public' AND routine_name LIKE '%ai%';

-- SELECT 'AI Policies Created' as status, COUNT(*) as count FROM pg_policies 
-- WHERE tablename LIKE 'ai_%';

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Next Steps:
-- 1. Verify all tables created: SELECT tablename FROM pg_tables WHERE tablename LIKE 'ai_%';
-- 2. Test RPC functions manually
-- 3. Enable AI for a test company: INSERT INTO ai_agent_config (company_id, is_enabled) VALUES ('your-company-id', true);
-- 4. Set up AI service (see AI_QUICK_START_GUIDE.md)

-- ============================================
-- END OF SETUP
-- ============================================

