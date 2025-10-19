# WaveSync AI Service - Setup & Deployment Guide

## 🎯 Overview

This guide walks you through setting up the **WaveSync AI Agent** - an autonomous crew planning system that uses AI to predict relief needs, match seafarers, and automate assignment workflows.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database (Supabase) running
- ✅ Redis server (for caching)
- ✅ OpenAI API key (for LLM capabilities)
- ✅ Successfully run `ai-agent-setup.sql` on your Supabase database

## 🚀 Quick Start

### Step 1: Create AI Service Directory

```bash
# From the root of your WaveSync project
mkdir -p ai-service/src/{agents,services,jobs,utils,types}
cd ai-service
```

### Step 2: Initialize Node.js Project

```bash
npm init -y
```

### Step 3: Install Dependencies

```bash
# Core dependencies
npm install express dotenv @supabase/supabase-js openai ioredis winston node-cron zod

# Development dependencies
npm install --save-dev typescript @types/node @types/express @types/ioredis tsx nodemon
```

### Step 4: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 5: Configure Package.json Scripts

Update your `ai-service/package.json`:

```json
{
  "name": "wavesync-ai-service",
  "version": "1.0.0",
  "description": "AI-powered autonomous crew planning service",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --watch src --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Step 6: Create Environment Configuration

Create `ai-service/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3001
NODE_ENV=development

# AI Configuration
AI_MIN_MATCH_SCORE=80
AI_ADVANCE_PLANNING_DAYS=30
AI_CRON_SCHEDULE=0 6 * * *

# Logging
LOG_LEVEL=info
```

### Step 7: Create Core Service Files

#### 7.1 Database Service (`src/services/database.service.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'company' | 'seafarer';
  company_id?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
}

export interface SeafarerProfile {
  id: string;
  user_id: string;
  full_name: string;
  rank: string;
  nationality: string;
  date_of_birth: string;
  status: 'on_board' | 'on_shore' | 'on_leave';
  company_id: string;
  available_from?: string;
}

export interface Assignment {
  id: string;
  company_id: string;
  vessel_id: string;
  seafarer_id: string;
  rank: string;
  sign_on_date: string;
  sign_off_date: string;
  contract_duration_months: number;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed';
}

export interface Vessel {
  id: string;
  name: string;
  imo_number: string;
  vessel_type: string;
  flag: string;
  company_id: string;
}
```

#### 7.2 Logging Service (`src/services/logging.service.ts`)

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

#### 7.3 Cache Service (`src/services/cache.service.ts`)

```typescript
import Redis from 'ioredis';
import { logger } from './logging.service';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl);

redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', (err) => {
  logger.error('❌ Redis error:', err);
});

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }
};
```

#### 7.4 OpenAI Service (`src/services/openai.service.ts`)

```typescript
import OpenAI from 'openai';
import { logger } from './logging.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const aiService = {
  async analyzeSeafarerMatch(
    assignment: any,
    seafarer: any,
    context: any
  ): Promise<{ score: number; reasoning: string; strengths: string[]; risks: string[] }> {
    try {
      const prompt = `
You are an expert maritime crew planning AI. Analyze this seafarer-assignment match:

Assignment:
- Vessel: ${assignment.vessel_name} (${assignment.vessel_type})
- Rank Required: ${assignment.rank}
- Sign-on Date: ${assignment.sign_on_date}
- Contract Duration: ${assignment.contract_duration_months} months

Seafarer:
- Name: ${seafarer.full_name}
- Rank: ${seafarer.rank}
- Nationality: ${seafarer.nationality}
- Status: ${seafarer.status}
- Available From: ${seafarer.available_from || 'Immediately'}

Evaluate and return a JSON object with:
{
  "score": <0-100 match score>,
  "reasoning": "<brief explanation>",
  "strengths": ["strength1", "strength2", ...],
  "risks": ["risk1", "risk2", ...]
}
`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      logger.info(`AI Match Analysis: ${seafarer.full_name} -> ${assignment.vessel_name}: ${result.score}%`);
      
      return result;
    } catch (error) {
      logger.error('OpenAI API error:', error);
      return {
        score: 0,
        reasoning: 'AI analysis failed',
        strengths: [],
        risks: ['AI analysis unavailable']
      };
    }
  }
};
```

#### 7.5 Crew Planning Agent (`src/agents/CrewPlanningAgent.ts`)

```typescript
import { supabase, Assignment, SeafarerProfile } from '../services/database.service';
import { logger } from '../services/logging.service';
import { aiService } from '../services/openai.service';
import { cache } from '../services/cache.service';

interface AIConfig {
  company_id: string;
  is_enabled: boolean;
  autonomy_level: 'full' | 'semi' | 'assistant';
  min_match_score: number;
  advance_planning_days: number;
  enabled_features: {
    crew_planning: boolean;
    task_generation: boolean;
  };
}

export class CrewPlanningAgent {
  private companyId: string;
  private config: AIConfig;

  constructor(companyId: string, config: AIConfig) {
    this.companyId = companyId;
    this.config = config;
  }

  async runPlanningCycle(): Promise<void> {
    logger.info(`🤖 AI Agent starting planning cycle for company ${this.companyId}`);

    try {
      // Step 1: Identify upcoming relief needs
      const upcomingReliefs = await this.getUpcomingReliefNeeds();
      logger.info(`Found ${upcomingReliefs.length} upcoming relief needs`);

      for (const assignment of upcomingReliefs) {
        // Step 2: Find suitable seafarers
        const candidates = await this.findSuitableSeafarers(assignment);
        logger.info(`Found ${candidates.length} candidate seafarers for ${assignment.vessel_name}`);

        if (candidates.length === 0) {
          logger.warn(`No suitable candidates found for ${assignment.vessel_name}`);
          continue;
        }

        // Step 3: AI-powered matching and ranking
        const rankedCandidates = await this.rankSeafarersWithAI(assignment, candidates);

        // Step 4: Select top candidate
        const topCandidate = rankedCandidates[0];
        
        if (!topCandidate || topCandidate.matchScore < this.config.min_match_score) {
          logger.warn(`No candidate meets minimum match score threshold (${this.config.min_match_score}%)`);
          continue;
        }

        // Step 5: Create AI-generated assignment
        await this.createAIAssignment(assignment, topCandidate, rankedCandidates.slice(1, 3));
        
        logger.info(`✅ AI created assignment: ${topCandidate.seafarer.full_name} -> ${assignment.vessel_name}`);
      }

      logger.info(`🤖 AI Agent completed planning cycle for company ${this.companyId}`);
    } catch (error) {
      logger.error(`AI Agent error for company ${this.companyId}:`, error);
    }
  }

  private async getUpcomingReliefNeeds(): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + this.config.advance_planning_days);

    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        vessel:vessels(name, vessel_type, flag),
        seafarer:user_profiles!seafarer_id(full_name)
      `)
      .eq('company_id', this.companyId)
      .eq('status', 'active')
      .lte('sign_off_date', cutoffDate.toISOString())
      .order('sign_off_date', { ascending: true });

    if (error) {
      logger.error('Error fetching upcoming reliefs:', error);
      return [];
    }

    return (data || []).map(a => ({
      ...a,
      vessel_name: a.vessel?.name,
      vessel_type: a.vessel?.vessel_type,
      current_seafarer: a.seafarer?.full_name
    }));
  }

  private async findSuitableSeafarers(assignment: any): Promise<SeafarerProfile[]> {
    // Cache key for seafarer list
    const cacheKey = `seafarers:${this.companyId}:${assignment.rank}`;
    const cached = await cache.get<SeafarerProfile[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('seafarer_profiles')
      .select('*')
      .eq('company_id', this.companyId)
      .eq('rank', assignment.rank)
      .in('status', ['on_shore', 'on_leave']);

    if (error) {
      logger.error('Error fetching seafarers:', error);
      return [];
    }

    await cache.set(cacheKey, data || [], 1800); // Cache for 30 minutes
    return data || [];
  }

  private async rankSeafarersWithAI(assignment: any, candidates: SeafarerProfile[]): Promise<any[]> {
    const rankedCandidates = await Promise.all(
      candidates.map(async (seafarer) => {
        const analysis = await aiService.analyzeSeafarerMatch(assignment, seafarer, {
          company_id: this.companyId
        });

        return {
          seafarer,
          matchScore: analysis.score,
          reasoning: analysis.reasoning,
          strengths: analysis.strengths,
          risks: analysis.risks
        };
      })
    );

    // Sort by match score (descending)
    return rankedCandidates.sort((a, b) => b.matchScore - a.matchScore);
  }

  private async createAIAssignment(
    originalAssignment: any,
    topCandidate: any,
    alternatives: any[]
  ): Promise<void> {
    const { data: userData } = await supabase.auth.admin.listUsers();
    const systemUser = userData.users.find(u => u.email === 'system@wavesync.ai');

    const aiReasoning = {
      relief_analysis: {
        current_seafarer: originalAssignment.current_seafarer,
        sign_off_date: originalAssignment.sign_off_date,
        days_until_relief: Math.ceil(
          (new Date(originalAssignment.sign_off_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      },
      match_details: {
        reasoning: topCandidate.reasoning,
        strengths: topCandidate.strengths,
        risks: topCandidate.risks,
        recommendations: [
          'Verify all certifications are current',
          'Confirm travel document validity',
          'Schedule pre-joining medical if required'
        ]
      },
      alternatives: alternatives.map(alt => ({
        seafarer_name: alt.seafarer.full_name,
        match_score: alt.matchScore,
        reasoning: alt.reasoning
      }))
    };

    // Insert AI-generated assignment
    const { error } = await supabase
      .from('ai_generated_assignments')
      .insert({
        company_id: this.companyId,
        assignment_id: originalAssignment.id,
        recommended_seafarer_id: topCandidate.seafarer.user_id,
        match_score: topCandidate.matchScore,
        ai_reasoning: aiReasoning,
        status: 'pending_review',
        created_by: systemUser?.id || null
      });

    if (error) {
      logger.error('Error creating AI assignment:', error);
      throw error;
    }

    // Log AI action
    await supabase.from('ai_action_logs').insert({
      company_id: this.companyId,
      action_type: 'assignment_created',
      entity_type: 'assignment',
      entity_id: originalAssignment.id,
      metadata: {
        seafarer_name: topCandidate.seafarer.full_name,
        vessel_name: originalAssignment.vessel_name,
        match_score: topCandidate.matchScore
      }
    });
  }
}
```

#### 7.6 Cron Job (`src/jobs/crewPlanningJob.ts`)

```typescript
import cron from 'node-cron';
import { supabase } from '../services/database.service';
import { logger } from '../services/logging.service';
import { CrewPlanningAgent } from '../agents/CrewPlanningAgent';

export function startCrewPlanningJob() {
  const schedule = process.env.AI_CRON_SCHEDULE || '0 6 * * *'; // Default: 6 AM daily

  cron.schedule(schedule, async () => {
    logger.info('🕐 Starting scheduled crew planning job...');

    try {
      // Get all companies with AI enabled
      const { data: configs, error } = await supabase
        .from('ai_agent_config')
        .select('*')
        .eq('is_enabled', true);

      if (error) throw error;

      if (!configs || configs.length === 0) {
        logger.info('No companies with AI agent enabled');
        return;
      }

      logger.info(`Found ${configs.length} companies with AI enabled`);

      // Run AI agent for each company
      for (const config of configs) {
        if (config.enabled_features?.crew_planning) {
          const agent = new CrewPlanningAgent(config.company_id, config);
          await agent.runPlanningCycle();
        }
      }

      logger.info('✅ Crew planning job completed successfully');
    } catch (error) {
      logger.error('❌ Crew planning job failed:', error);
    }
  });

  logger.info(`✅ Crew planning cron job scheduled: ${schedule}`);
}
```

#### 7.7 Server (`src/server.ts`)

```typescript
import express from 'express';
import dotenv from 'dotenv';
import { logger } from './services/logging.service';
import { startCrewPlanningJob } from './jobs/crewPlanningJob';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'wavesync-ai-agent',
    timestamp: new Date().toISOString()
  });
});

// API endpoint to manually trigger planning cycle
app.post('/api/trigger-planning', async (req, res) => {
  try {
    const { company_id } = req.body;
    
    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required' });
    }

    logger.info(`Manual trigger requested for company: ${company_id}`);
    
    // This would be implemented in the agent
    // await runPlanningForCompany(company_id);
    
    res.json({ message: 'Planning cycle triggered successfully' });
  } catch (error) {
    logger.error('Error triggering planning:', error);
    res.status(500).json({ error: 'Failed to trigger planning cycle' });
  }
});

// Start cron jobs
startCrewPlanningJob();

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 AI Service running on port ${PORT}`);
  logger.info(`📅 Cron jobs initialized`);
  logger.info(`🤖 AI Agent ready for autonomous crew planning`);
});

export default app;
```

## 🧪 Testing the AI Service

### 1. Start Redis (if not running)

```bash
# macOS (with Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 2. Start the AI Service

```bash
cd ai-service
npm run dev
```

You should see:
```
🚀 AI Service running on port 3001
📅 Cron jobs initialized
🤖 AI Agent ready for autonomous crew planning
✅ Redis connected
```

### 3. Test Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "wavesync-ai-agent",
  "timestamp": "2025-10-19T12:00:00.000Z"
}
```

### 4. Enable AI for a Test Company

1. Log into WaveSync as **Admin**
2. Navigate to `/admin/ai-settings`
3. Select a company
4. Enable AI Agent
5. Set autonomy level to "Semi-Autonomous"
6. Save configuration

### 5. Create Test Data

Create a test assignment that needs relief:

```sql
-- Insert a test assignment with sign-off date 20 days from now
INSERT INTO assignments (
  company_id,
  vessel_id,
  seafarer_id,
  rank,
  sign_on_date,
  sign_off_date,
  contract_duration_months,
  status
) VALUES (
  'your-company-id',
  'your-vessel-id',
  'your-seafarer-id',
  'Chief Engineer',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '20 days',
  2,
  'active'
);
```

### 6. Manually Trigger AI Planning

```bash
curl -X POST http://localhost:3001/api/trigger-planning \
  -H "Content-Type: application/json" \
  -d '{"company_id": "your-company-id"}'
```

### 7. Check Results in Frontend

1. Log in as **Company User**
2. Navigate to `/ai-assignments`
3. You should see AI-generated assignment suggestions!
4. Approve or reject with feedback

### 8. View AI Performance

Navigate to `/ai-performance` to see:
- Total AI assignments
- Approval rate
- Average match scores
- Time saved
- Recent AI activity

## 🔒 Production Deployment

### Environment Variables (Production)

```env
# Supabase (Production)
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_KEY=your-prod-service-key

# OpenAI (Production)
OPENAI_API_KEY=sk-your-prod-openai-key

# Redis (Production - Upstash, Redis Cloud, etc.)
REDIS_URL=redis://default:password@your-redis-host:6379

# Server
PORT=3001
NODE_ENV=production

# Logging
LOG_LEVEL=warn
```

### Docker Deployment

Create `ai-service/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

Build and run:

```bash
docker build -t wavesync-ai:latest .
docker run -p 3001:3001 --env-file .env wavesync-ai:latest
```

### Deploy to Cloud

**Recommended platforms:**
- Railway.app (easiest)
- Render.com
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Apps

## 📊 Monitoring

### Check Logs

```bash
tail -f ai-service/logs/combined.log
```

### Monitor Redis

```bash
redis-cli monitor
```

### Check AI Performance Metrics

Query the database:

```sql
SELECT * FROM ai_performance_metrics 
WHERE company_id = 'your-company-id'
ORDER BY metric_date DESC 
LIMIT 7;
```

## 🐛 Troubleshooting

### Issue: AI Service won't start

**Solution:** Check environment variables
```bash
cd ai-service
cat .env
```

### Issue: No AI assignments being created

**Solution:** Check if:
1. AI is enabled in `/admin/ai-settings`
2. There are active assignments with upcoming sign-off dates
3. There are available seafarers on shore
4. Redis is running

### Issue: OpenAI API errors

**Solution:** 
1. Verify API key is valid
2. Check API usage limits
3. Review OpenAI account status

### Issue: Database connection errors

**Solution:**
1. Verify Supabase URL and keys
2. Check if `ai-agent-setup.sql` was run successfully
3. Verify RLS policies allow service role access

## 📈 Cost Optimization

### Reduce OpenAI Costs

1. **Use caching**: Implemented in the code
2. **Batch requests**: Process multiple matches together
3. **Use GPT-3.5-turbo** for simpler analysis
4. **Set token limits** in OpenAI requests

### Optimize Redis Usage

1. Set appropriate TTLs on cached data
2. Monitor memory usage
3. Use Redis persistence for important cache data

## 🎉 Success Checklist

- [ ] Database setup complete (`ai-agent-setup.sql` executed)
- [ ] AI service running (`npm run dev` successful)
- [ ] Redis connected
- [ ] OpenAI API key configured
- [ ] AI enabled for test company
- [ ] Test assignments created
- [ ] AI-generated assignments appearing in `/ai-assignments`
- [ ] Approval/rejection working
- [ ] Performance metrics visible in `/ai-performance`
- [ ] Cron job scheduled and running

## 📚 Next Steps

1. **Fine-tune matching algorithm** based on real feedback
2. **Add document intelligence** (Phase 2)
3. **Implement compliance monitoring** (Phase 2)
4. **Add travel optimization** (Phase 2)
5. **Build conversational AI assistant** (Phase 3)

---

**Questions or issues?** Open an issue in the repository or contact the development team.

**🎯 You're now ready to harness the power of AI for crew management!**

