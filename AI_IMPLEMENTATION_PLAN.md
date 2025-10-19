# 🚀 WaveSync AI - Implementation Plan

**Status:** READY FOR IMPLEMENTATION  
**Approach:** Phased rollout with AI-enabled company option  
**Timeline:** 8-12 weeks for Phase 1  

---

## 🎯 IMPLEMENTATION STRATEGY

### Core Concept
Create an **AI-enabled version** of WaveSync where:
- Admin can enable/disable AI for specific companies
- AI runs autonomously in the background (cron jobs)
- Company users see AI-generated assignments in their dashboard
- Clean separation between manual and AI-generated workflows
- All AI actions are auditable and explainable

### Architecture Approach
```
Existing WaveSync Platform
    ├── Manual Flow (existing, unchanged)
    └── AI Flow (NEW)
        ├── AI Agent Service (Node.js + OpenAI)
        ├── AI Database Tables (Supabase extensions)
        ├── AI UI Components (React)
        └── Cron Jobs (scheduled AI operations)
```

---

## 📊 PHASE 1: FOUNDATION (Weeks 1-8)

### Week 1-2: Infrastructure Setup

#### **1.1 Database Extensions**

Create file: `ai-agent-setup.sql`

```sql
-- ============================================
-- AI AGENT DATABASE SETUP
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. AI AGENT CONFIGURATION
-- ============================================

CREATE TABLE ai_agent_config (
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

-- Index
CREATE INDEX idx_ai_config_company ON ai_agent_config(company_id);
CREATE INDEX idx_ai_config_enabled ON ai_agent_config(is_enabled) WHERE is_enabled = true;

-- ============================================
-- 2. AI GENERATED ASSIGNMENTS
-- ============================================

CREATE TABLE ai_generated_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  company_id UUID REFERENCES companies(id),
  
  -- AI Decision Data
  seafarer_candidates JSONB, -- [{ id, score, reasoning, rank }]
  selected_seafarer_id UUID REFERENCES seafarer_profile(id),
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
CREATE INDEX idx_ai_assignments_assignment ON ai_generated_assignments(assignment_id);
CREATE INDEX idx_ai_assignments_company ON ai_generated_assignments(company_id);
CREATE INDEX idx_ai_assignments_status ON ai_generated_assignments(company_decision);
CREATE INDEX idx_ai_assignments_seafarer ON ai_generated_assignments(selected_seafarer_id);
CREATE INDEX idx_ai_assignments_pending ON ai_generated_assignments(company_id, company_decision) 
  WHERE company_decision = 'pending';

-- ============================================
-- 3. AI ACTION LOGS (Audit Trail)
-- ============================================

CREATE TABLE ai_action_logs (
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
  related_seafarer_id UUID REFERENCES seafarer_profile(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_logs_company_date ON ai_action_logs(company_id, created_at DESC);
CREATE INDEX idx_ai_logs_type ON ai_action_logs(action_type);
CREATE INDEX idx_ai_logs_result ON ai_action_logs(result);
CREATE INDEX idx_ai_logs_assignment ON ai_action_logs(related_assignment_id) WHERE related_assignment_id IS NOT NULL;

-- ============================================
-- 4. SEAFARER PREFERENCES (AI Learning)
-- ============================================

CREATE TABLE seafarer_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seafarer_id UUID REFERENCES seafarer_profile(id) UNIQUE,
  
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
CREATE INDEX idx_seafarer_prefs_seafarer ON seafarer_preferences(seafarer_id);

-- ============================================
-- 5. AI DOCUMENT EXTRACTIONS
-- ============================================

CREATE TABLE ai_document_extractions (
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
CREATE INDEX idx_ai_docs_document ON ai_document_extractions(document_id);
CREATE INDEX idx_ai_docs_created ON ai_document_extractions(created_at DESC);

-- ============================================
-- 6. AI CONVERSATIONS (Chatbot)
-- ============================================

CREATE TABLE ai_conversations (
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
CREATE INDEX idx_ai_conv_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conv_id ON ai_conversations(conversation_id);
CREATE INDEX idx_ai_conv_created ON ai_conversations(created_at DESC);

-- ============================================
-- 7. AI PERFORMANCE METRICS
-- ============================================

CREATE TABLE ai_performance_metrics (
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
CREATE INDEX idx_ai_metrics_company_date ON ai_performance_metrics(company_id, metric_date DESC);

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

-- Index
CREATE INDEX idx_assignments_ai ON assignments(created_by_ai) WHERE created_by_ai = true;
CREATE INDEX idx_tasks_ai ON tasks(created_by_ai) WHERE created_by_ai = true;

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
  JOIN seafarer_profile sp ON sp.id = aga.selected_seafarer_id
  JOIN user_profiles up ON up.id = sp.user_id
  JOIN vessels v ON v.id = a.vessel_id
  WHERE aga.company_id = p_company_id
    AND aga.company_decision = 'pending'
  ORDER BY aga.created_at DESC;
END;
$$;

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
BEGIN
  -- Get assignment ID
  SELECT assignment_id INTO v_assignment_id
  FROM ai_generated_assignments
  WHERE id = p_ai_assignment_id;
  
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
    result
  )
  SELECT 
    company_id,
    'assignment_approved',
    jsonb_build_object('ai_assignment_id', p_ai_assignment_id, 'user_id', p_user_id),
    'success'
  FROM ai_generated_assignments
  WHERE id = p_ai_assignment_id;
  
  RETURN TRUE;
END;
$$;

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
BEGIN
  -- Get assignment ID
  SELECT assignment_id INTO v_assignment_id
  FROM ai_generated_assignments
  WHERE id = p_ai_assignment_id;
  
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
    result
  )
  SELECT 
    company_id,
    'assignment_rejected',
    jsonb_build_object(
      'ai_assignment_id', p_ai_assignment_id, 
      'user_id', p_user_id,
      'feedback', p_feedback,
      'reasoning', ai_reasoning
    ),
    'success'
  FROM ai_generated_assignments
  WHERE id = p_ai_assignment_id;
  
  RETURN TRUE;
END;
$$;

-- Get AI performance metrics
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

-- Policies for ai_agent_config
CREATE POLICY "Admins can manage all AI configs"
  ON ai_agent_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Company users can view their AI config"
  ON ai_agent_config FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

-- Policies for ai_generated_assignments
CREATE POLICY "Company users can view their AI assignments"
  ON ai_generated_assignments FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Company users can update their AI assignments"
  ON ai_generated_assignments FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

-- Policies for ai_action_logs
CREATE POLICY "Company users can view their AI logs"
  ON ai_action_logs FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all AI logs"
  ON ai_action_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Policies for seafarer_preferences
CREATE POLICY "Seafarers can view their own preferences"
  ON seafarer_preferences FOR SELECT
  USING (
    seafarer_id IN (
      SELECT id FROM seafarer_profile
      WHERE user_id = auth.uid()
    )
  );

-- Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
  ON ai_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policies for ai_performance_metrics
CREATE POLICY "Company users can view their metrics"
  ON ai_performance_metrics FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

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
-- COMPLETE
-- ============================================

COMMENT ON TABLE ai_agent_config IS 'Configuration for AI agent per company';
COMMENT ON TABLE ai_generated_assignments IS 'Assignments created by AI agent';
COMMENT ON TABLE ai_action_logs IS 'Audit log for all AI actions';
COMMENT ON TABLE seafarer_preferences IS 'Learned preferences for seafarers';
COMMENT ON TABLE ai_document_extractions IS 'AI-extracted data from documents';
COMMENT ON TABLE ai_conversations IS 'Chatbot conversation history';
COMMENT ON TABLE ai_performance_metrics IS 'AI performance tracking';
```

#### **1.2 Environment Variables**

Create file: `.env.ai` (add to `.env`)

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.2

# Alternative: Azure OpenAI (more secure for production)
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# AZURE_OPENAI_KEY=your_azure_key_here
# AZURE_OPENAI_DEPLOYMENT=gpt-4-turbo

# AI Service Configuration
AI_SERVICE_PORT=3001
AI_AGENT_ENABLED=true
AI_LOG_LEVEL=debug

# Cron Schedule (using cron syntax)
AI_CRON_CREW_PLANNING=0 6 * * * # Every day at 6 AM UTC
AI_CRON_DOCUMENT_CHECK=0 8 * * * # Every day at 8 AM UTC
AI_CRON_METRICS=0 0 * * * # Every day at midnight

# Rate Limiting
AI_MAX_REQUESTS_PER_COMPANY_PER_DAY=100
AI_MAX_LLM_CALLS_PER_MINUTE=10

# Caching
REDIS_URL=redis://localhost:6379
AI_CACHE_TTL_SECONDS=3600

# Monitoring (optional)
HELICONE_API_KEY=your_helicone_key_here # For LLM monitoring
```

---

### Week 3-4: Backend AI Service

#### **2.1 Project Structure**

Create new directory structure:

```
ai-service/
├── src/
│   ├── agents/
│   │   ├── CrewPlanningAgent.ts
│   │   ├── TaskGenerationAgent.ts
│   │   └── BaseAgent.ts
│   ├── services/
│   │   ├── openai.service.ts
│   │   ├── database.service.ts
│   │   ├── cache.service.ts
│   │   └── logging.service.ts
│   ├── jobs/
│   │   ├── crewPlanningJob.ts
│   │   ├── documentCheckJob.ts
│   │   └── metricsJob.ts
│   ├── utils/
│   │   ├── prompts.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── ai.types.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

#### **2.2 Package.json**

Create file: `ai-service/package.json`

```json
{
  "name": "wavesync-ai-service",
  "version": "1.0.0",
  "description": "AI Agent Service for WaveSync Maritime Platform",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "openai": "^4.20.0",
    "express": "^4.18.2",
    "bullmq": "^5.0.0",
    "ioredis": "^5.3.2",
    "node-cron": "^3.0.3",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/node-cron": "^3.0.11",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
```

#### **2.3 Core AI Service Files**

I'll create the essential service files in the next steps. Let me know if you want me to continue with the complete implementation code.

---

### Week 5-6: Frontend Components

#### **3.1 AI Settings Panel** (Admin)

Create file: `src/components/admin/AIAgentSettings.tsx`

#### **3.2 AI Assignment Queue** (Company Users)

Create file: `src/components/company/AIAssignmentQueue.tsx`

#### **3.3 AI Performance Dashboard**

Create file: `src/components/company/AIPerformanceDashboard.tsx`

---

### Week 7-8: Testing & Integration

#### **4.1 Unit Tests**
#### **4.2 Integration Tests**
#### **4.3 End-to-End Tests**

---

## 📋 DETAILED IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Weeks 1-8)

- [ ] **Week 1: Database Setup**
  - [ ] Run `ai-agent-setup.sql` on Supabase
  - [ ] Verify all tables created successfully
  - [ ] Test RLS policies
  - [ ] Test RPC functions manually

- [ ] **Week 2: Environment & Dependencies**
  - [ ] Set up OpenAI API account
  - [ ] Get API keys (OpenAI or Azure OpenAI)
  - [ ] Set up Redis instance (local or cloud)
  - [ ] Configure environment variables
  - [ ] Install all dependencies

- [ ] **Week 3-4: AI Service Backend**
  - [ ] Create `ai-service/` directory
  - [ ] Implement `CrewPlanningAgent.ts`
  - [ ] Implement OpenAI service wrapper
  - [ ] Implement database service
  - [ ] Implement caching layer
  - [ ] Create cron jobs for scheduling
  - [ ] Add logging and monitoring
  - [ ] Test AI service locally

- [ ] **Week 5: Admin UI**
  - [ ] Create AI settings panel for admins
  - [ ] Add "Enable AI Agent" toggle per company
  - [ ] Add autonomy level selector
  - [ ] Add feature flags configuration
  - [ ] Test admin can enable/disable AI

- [ ] **Week 6: Company User UI**
  - [ ] Create AI assignment queue component
  - [ ] Add approve/reject workflow
  - [ ] Show AI reasoning and explanations
  - [ ] Add AI performance dashboard
  - [ ] Test company user can review AI suggestions

- [ ] **Week 7: Integration Testing**
  - [ ] End-to-end test: Enable AI → AI creates assignment → Company approves
  - [ ] Test AI rejection and learning
  - [ ] Test cron job execution
  - [ ] Load testing (can handle 50 companies)

- [ ] **Week 8: Documentation & Deployment**
  - [ ] Write deployment guide
  - [ ] Create user training materials
  - [ ] Deploy AI service to production
  - [ ] Deploy frontend changes
  - [ ] Monitor for 1 week

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Success Metrics:
- [ ] AI agent can be enabled for at least 3 test companies
- [ ] AI successfully creates 10+ assignments with >70% approval rate
- [ ] All AI actions are logged and auditable
- [ ] Company users can easily approve/reject AI suggestions
- [ ] No performance degradation for non-AI companies
- [ ] Zero security vulnerabilities
- [ ] Complete audit trail for all AI decisions

---

## 🚀 NEXT IMMEDIATE STEPS

### THIS WEEK (Week 1):

**Day 1-2: Database Setup**
1. Review and run `ai-agent-setup.sql` on your Supabase project
2. Verify all tables, indexes, and RPC functions are created
3. Test RPC functions manually using Supabase SQL editor

**Day 3-4: OpenAI Setup**
1. Create OpenAI account (or Azure OpenAI)
2. Get API keys
3. Test API connection with simple script
4. Set up environment variables

**Day 5: Project Structure**
1. Create `ai-service/` directory
2. Initialize Node.js project with TypeScript
3. Install dependencies
4. Create basic Express server

---

## 💡 DECISION POINTS

Before proceeding, you need to decide:

### 1. **LLM Provider**
- [ ] **OpenAI GPT-4** - Easiest, fast to implement ($0.03/1K tokens)
- [ ] **Azure OpenAI** - More secure, enterprise-ready (same pricing, but SLA)
- [ ] **Anthropic Claude** - Better for long documents, less hallucination

**Recommendation:** Start with OpenAI GPT-4 for speed, migrate to Azure OpenAI for production.

### 2. **Deployment Architecture**
- [ ] **Option A:** Deploy AI service as separate Node.js app on same server
- [ ] **Option B:** Deploy AI service as Supabase Edge Function
- [ ] **Option C:** Deploy AI service on separate cloud service (AWS Lambda, Google Cloud Run)

**Recommendation:** Option A (separate Node.js app) - most flexible, easier to scale.

### 3. **Caching Strategy**
- [ ] **Redis** (recommended) - Fast, reliable, easy to scale
- [ ] **In-memory cache** - Simple but lost on restart
- [ ] **Supabase cache** - Use Postgres for caching

**Recommendation:** Redis - industry standard, works great with BullMQ.

---

## 📞 WHAT DO YOU NEED FROM ME?

I can provide complete implementation code for:

1. ✅ **CrewPlanningAgent.ts** - Full agent logic with OpenAI integration
2. ✅ **Admin UI Components** - AI settings panel for admins
3. ✅ **Company UI Components** - AI assignment queue with approve/reject
4. ✅ **Cron Jobs** - Scheduled background jobs
5. ✅ **API Endpoints** - REST APIs for AI operations
6. ✅ **Testing Scripts** - Unit and integration tests

**Which would you like me to create first?**

My recommendation: Start with **CrewPlanningAgent.ts** as it's the core of the entire system.

Should I proceed with creating the complete implementation code for the AI agent?

