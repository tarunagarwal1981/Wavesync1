# 🚀 AI Implementation Quick Reference

## ✅ What's Been Completed

### 1. Database Setup
- ✅ **File**: `ai-agent-setup.sql`
- ✅ **Status**: SQL executed successfully
- ✅ **Tables Created**: 7 new AI tables
- ✅ **RPC Functions**: 5 functions for AI operations
- ✅ **RLS Policies**: Complete security setup

### 2. Frontend Components
- ✅ **Admin Panel**: `src/components/admin/AIAgentSettings.tsx`
  - Enable/disable AI per company
  - Configure autonomy levels
  - Adjust AI parameters
  - Feature flags
  
- ✅ **Company Queue**: `src/components/company/AIAssignmentQueue.tsx`
  - View AI-generated assignments
  - Approve/reject with feedback
  - See AI reasoning and alternatives
  
- ✅ **Performance Dashboard**: `src/components/company/AIPerformanceDashboard.tsx`
  - Track approval rates
  - View match scores
  - Monitor time saved
  - See recent AI activity

### 3. Routing
- ✅ **Routes Added to**: `src/routes/AppRouter.tsx`
  - `/admin/ai-settings` - Admin configuration
  - `/ai-assignments` - Company assignment queue
  - `/ai-performance` - Performance metrics

### 4. Documentation
- ✅ **Setup Guide**: `AI_SERVICE_SETUP.md` (comprehensive)
- ✅ **Strategy Doc**: `AI_INTEGRATION_STRATEGY.md`
- ✅ **Implementation Plan**: `AI_IMPLEMENTATION_PLAN.md`
- ✅ **Technical Guide**: `AI_TECHNICAL_IMPLEMENTATION_GUIDE.md`

---

## 🔄 What's Remaining (AI Service Backend)

### Create AI Service Directory Structure

```bash
# Run these commands from project root
mkdir -p ai-service/src/{agents,services,jobs,utils,types}
mkdir -p ai-service/logs
cd ai-service
npm init -y
```

### Install Dependencies

```bash
npm install express dotenv @supabase/supabase-js openai ioredis winston node-cron zod
npm install --save-dev typescript @types/node @types/express @types/ioredis tsx nodemon
```

### Create Core Files

Copy from `AI_SERVICE_SETUP.md`:

1. `tsconfig.json` - TypeScript configuration
2. `.env` - Environment variables
3. `src/services/database.service.ts` - Supabase client
4. `src/services/logging.service.ts` - Winston logger
5. `src/services/cache.service.ts` - Redis caching
6. `src/services/openai.service.ts` - AI matching logic
7. `src/agents/CrewPlanningAgent.ts` - Core AI agent
8. `src/jobs/crewPlanningJob.ts` - Cron scheduler
9. `src/server.ts` - Express server

### Start Services

```bash
# Terminal 1: Start Redis
docker run -d -p 6379:6379 redis:alpine

# Terminal 2: Start AI Service
cd ai-service
npm run dev
```

---

## 📍 Access Points (Once Running)

| User Type | URL | Purpose |
|-----------|-----|---------|
| **Admin** | `/admin/ai-settings` | Configure AI for companies |
| **Company** | `/ai-assignments` | Review AI suggestions |
| **Company** | `/ai-performance` | Track AI performance |
| **API** | `http://localhost:3001/health` | Check AI service status |

---

## 🎯 Quick Test Flow

### 1. Enable AI (Admin)
1. Login as admin
2. Go to `/admin/ai-settings`
3. Select a company
4. Toggle "AI Agent Status" ON
5. Select "Semi-Autonomous"
6. Save

### 2. Wait for AI to Run
- AI runs daily at 6 AM (default)
- OR manually trigger via API:
```bash
curl -X POST http://localhost:3001/api/trigger-planning \
  -H "Content-Type: application/json" \
  -d '{"company_id": "your-company-id"}'
```

### 3. Review Assignments (Company)
1. Login as company user
2. Go to `/ai-assignments`
3. Click "View Details" on any assignment
4. Review AI reasoning, strengths, risks
5. Approve or reject with feedback

### 4. Monitor Performance (Company)
1. Go to `/ai-performance`
2. View metrics:
   - Approval rate
   - Average match score
   - Time saved
   - Recent activity

---

## 🔑 Environment Variables Needed

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=development
```

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to Redis"
```bash
# Solution: Start Redis
docker run -d -p 6379:6379 redis:alpine
```

### Issue: "OpenAI API key invalid"
```bash
# Solution: Check API key in .env
echo $OPENAI_API_KEY
# Get new key from: https://platform.openai.com/api-keys
```

### Issue: "No AI assignments appearing"
**Checklist:**
- [ ] AI enabled in admin settings?
- [ ] Active assignments with sign-off date < 30 days?
- [ ] Available seafarers on shore?
- [ ] AI service running?
- [ ] Redis connected?

### Issue: "Database permission errors"
```sql
-- Solution: Verify RLS policies allow service role
SELECT * FROM ai_agent_config; -- Should work with service key
```

---

## 📊 Database Quick Queries

### Check AI Config
```sql
SELECT company_id, is_enabled, autonomy_level, min_match_score 
FROM ai_agent_config 
WHERE is_enabled = true;
```

### View Pending AI Assignments
```sql
SELECT 
  aga.id,
  c.name as company,
  u.full_name as seafarer,
  aga.match_score,
  aga.status
FROM ai_generated_assignments aga
JOIN user_profiles u ON u.id = aga.recommended_seafarer_id
JOIN companies c ON c.id = aga.company_id
WHERE aga.status = 'pending_review'
ORDER BY aga.created_at DESC;
```

### Check AI Performance
```sql
SELECT 
  metric_date,
  total_assignments,
  approved_assignments,
  approval_rate,
  avg_match_score
FROM ai_performance_metrics
WHERE company_id = 'your-company-id'
ORDER BY metric_date DESC
LIMIT 7;
```

### View AI Activity Log
```sql
SELECT 
  action_type,
  entity_type,
  metadata,
  created_at
FROM ai_action_logs
WHERE company_id = 'your-company-id'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🎨 UI Component Examples

### Admin: Enable AI
```
┌─────────────────────────────────────┐
│ AI Agent Settings                   │
├─────────────────────────────────────┤
│ Company: [Acme Shipping    ▼]      │
│                                      │
│ AI Agent Status    [ON]  ──────┐   │
│                            └───┘    │
│                                      │
│ Autonomy Level:                      │
│ ○ Assistant Mode                     │
│ ● Semi-Autonomous (Recommended)      │
│ ○ Full Autonomous                    │
│                                      │
│ Min Match Score: [85%] ────────────  │
│                                      │
│ [Save Configuration]                 │
└─────────────────────────────────────┘
```

### Company: Review AI Assignment
```
┌─────────────────────────────────────┐
│ 🤖 AI Generated                      │
│ Match Score: ⭐⭐⭐⭐⭐ 92%          │
├─────────────────────────────────────┤
│ 👤 John Smith                        │
│ 🚢 MV Ocean Star                     │
│ 📅 Created: Oct 19, 2025             │
│                                      │
│ AI Reasoning:                        │
│ "Perfect rank match with extensive   │
│  experience on similar vessels..."   │
│                                      │
│ [View Details]  [✓ Approve]          │
└─────────────────────────────────────┘
```

---

## 🚦 Implementation Status

| Component | Status | File |
|-----------|--------|------|
| Database Schema | ✅ Complete | `ai-agent-setup.sql` |
| Admin UI | ✅ Complete | `AIAgentSettings.tsx` |
| Company Queue UI | ✅ Complete | `AIAssignmentQueue.tsx` |
| Performance UI | ✅ Complete | `AIPerformanceDashboard.tsx` |
| Routing | ✅ Complete | `AppRouter.tsx` |
| AI Service | ⏳ **Pending** | See `AI_SERVICE_SETUP.md` |
| Testing | ⏳ **Pending** | After AI service setup |

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Full Setup Guide | `AI_SERVICE_SETUP.md` |
| Strategy & Vision | `AI_INTEGRATION_STRATEGY.md` |
| Implementation Plan | `AI_IMPLEMENTATION_PLAN.md` |
| Technical Details | `AI_TECHNICAL_IMPLEMENTATION_GUIDE.md` |
| Database Schema | `ai-agent-setup.sql` |

---

## ⏭️ Next Immediate Steps

1. **Create AI Service**
   ```bash
   cd ai-service
   # Follow AI_SERVICE_SETUP.md steps 1-7
   ```

2. **Configure Environment**
   - Set up `.env` with all required keys
   - Start Redis server
   - Verify Supabase connection

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Enable AI for Test Company**
   - Login as admin → `/admin/ai-settings`
   - Enable AI for a test company

5. **Create Test Scenarios**
   - Add assignments with upcoming sign-off dates
   - Ensure seafarers are available on shore
   - Manually trigger AI planning

6. **Verify Results**
   - Check `/ai-assignments` for AI suggestions
   - Approve/reject assignments
   - Monitor `/ai-performance`

---

**🎉 You're 80% done! Only the AI service backend remains.**

Follow `AI_SERVICE_SETUP.md` for detailed step-by-step instructions.

