# 🛠️ WaveSync AI - Technical Implementation Guide

## Overview
This document provides detailed technical guidance for implementing AI features in the WaveSync platform.

---

## 🏗️ Architecture Deep Dive

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │  AI Settings   │  │ AI Assignments │  │   AI Chat      ││
│  │     Panel      │  │     Queue      │  │   Interface    ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (HTTPS/WebSocket)
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Supabase + Edge Functions)           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  REST APIs           │  RPC Functions  │  Realtime     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Agent Service Layer                    │
│                        (Node.js/Python)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Agent Orchestrator                     │ │
│  │  - Routes requests to appropriate AI agents             │ │
│  │  - Manages agent lifecycle and state                    │ │
│  │  - Handles errors and fallbacks                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│     ┌────────────────────────┴────────────────────────┐    │
│     ▼                        ▼                         ▼    │
│  ┌────────┐          ┌──────────────┐          ┌──────────┐│
│  │ Crew   │          │  Document    │          │  Task    ││
│  │Planning│          │ Intelligence │          │Generator ││
│  │ Agent  │          │    Agent     │          │  Agent   ││
│  └────────┘          └──────────────┘          └──────────┘│
│     ▼                        ▼                         ▼    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              LLM Orchestration Layer                  │  │
│  │  - LangChain/LlamaIndex for workflow                │  │
│  │  - Prompt management and versioning                   │  │
│  │  - Response parsing and validation                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data & AI Services                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Supabase   │  │  Vector DB  │  │  External AI APIs   │ │
│  │  Postgres   │  │ (pgvector/  │  │  - OpenAI GPT-4     │ │
│  │  (Core DB)  │  │  Pinecone)  │  │  - Anthropic Claude │ │
│  │             │  │             │  │  - Azure Vision     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack Recommendations

### Core AI Infrastructure

#### **1. LLM Provider (Choose One)**

**Option A: OpenAI (Recommended for POC)**
```javascript
// Pros: Most advanced, best documentation, function calling
// Cons: Data privacy concerns, expensive

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAssignment(context) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "You are a maritime crew planning expert..." },
      { role: "user", content: JSON.stringify(context) }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "create_assignment",
          description: "Create a crew assignment",
          parameters: {
            type: "object",
            properties: {
              seafarer_id: { type: "string" },
              vessel_id: { type: "string" },
              reasoning: { type: "string" }
            }
          }
        }
      }
    ]
  });
  
  return response.choices[0].message;
}
```

**Option B: Azure OpenAI (Recommended for Production)**
```javascript
// Pros: Enterprise-grade, data privacy, SLA
// Cons: More complex setup, similar pricing

import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const client = new OpenAIClient(
  "https://your-resource.openai.azure.com/",
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
);

async function analyzeDocument(imageUrl) {
  const response = await client.getChatCompletions(
    "gpt-4-vision", // deployment name
    [
      {
        role: "user",
        content: [
          { type: "text", text: "Extract data from this maritime certificate:" },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ]
  );
  
  return response.choices[0].message.content;
}
```

**Option C: Anthropic Claude (Best for long context)**
```javascript
// Pros: Better at long documents, less hallucination, strong reasoning
// Cons: Newer, less ecosystem support

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeComplexScenario(context) {
  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Analyze this crew planning scenario and provide recommendations:\n\n${context}`
      }
    ]
  });
  
  return message.content[0].text;
}
```

**Recommendation:** Start with **Azure OpenAI** (best of both worlds—GPT-4 power + enterprise security)

---

#### **2. Vector Database (for RAG)**

**Option A: pgvector (Simplest, use existing Postgres)**
```sql
-- Enable pgvector extension in Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE seafarer_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seafarer_id UUID REFERENCES seafarer_profile(id),
  content TEXT, -- description of seafarer
  embedding vector(1536), -- OpenAI ada-002 embedding size
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX ON seafarer_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Search for similar seafarers
CREATE OR REPLACE FUNCTION search_similar_seafarers(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  seafarer_id UUID,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT 
    seafarer_id,
    1 - (embedding <=> query_embedding) AS similarity
  FROM seafarer_embeddings
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

**Option B: Pinecone (Easiest managed solution)**
```javascript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index('wavesync-seafarers');

// Insert seafarer embeddings
async function indexSeafarer(seafarer, embedding) {
  await index.upsert([
    {
      id: seafarer.id,
      values: embedding,
      metadata: {
        rank: seafarer.rank,
        experience: seafarer.experience_years,
        certificates: seafarer.certificates,
        availability: seafarer.availability_status
      }
    }
  ]);
}

// Search for matching seafarers
async function findMatchingSeafarers(requirementEmbedding, filters) {
  const results = await index.query({
    vector: requirementEmbedding,
    topK: 10,
    includeMetadata: true,
    filter: {
      availability: { $eq: 'available' },
      rank: { $in: ['Chief Engineer', 'Second Engineer'] }
    }
  });
  
  return results.matches;
}
```

**Recommendation:** Start with **pgvector** (no extra cost, integrated with Supabase), move to Pinecone if scaling issues arise.

---

#### **3. Orchestration Framework**

**Option A: LangChain (Most popular)**
```javascript
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// Define output schema
const assignmentSchema = z.object({
  seafarer_id: z.string(),
  match_score: z.number(),
  reasoning: z.string(),
  risks: z.array(z.string()),
  recommendations: z.array(z.string())
});

const parser = StructuredOutputParser.fromZodSchema(assignmentSchema);

// Create prompt template
const prompt = new PromptTemplate({
  template: `You are a maritime crew planning expert. Analyze the following scenario and suggest the best seafarer for assignment.

Assignment Requirements:
{requirements}

Available Seafarers:
{seafarers}

{format_instructions}`,
  inputVariables: ["requirements", "seafarers"],
  partialVariables: { format_instructions: parser.getFormatInstructions() }
});

// Create LLM chain
const model = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.2
});

const chain = prompt.pipe(model).pipe(parser);

// Execute
const result = await chain.invoke({
  requirements: JSON.stringify(assignmentRequirements),
  seafarers: JSON.stringify(availableSeafarers)
});

console.log(result); // Parsed, structured output
```

**Option B: LlamaIndex (Better for RAG)**
```javascript
import { VectorStoreIndex, serviceContextFromDefaults } from "llamaindex";

// Create index from documents
const serviceContext = serviceContextFromDefaults();
const index = await VectorStoreIndex.fromDocuments(documents, { serviceContext });

// Query the index
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query(
  "Find engineers with bulk carrier experience and valid STCW certificates"
);

console.log(response.toString());
```

**Recommendation:** Use **LangChain** (more flexible, better for agent workflows)

---

#### **4. Task Queue & Orchestration**

**Option A: BullMQ (Simple, Redis-based)**
```javascript
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  maxRetriesPerRequest: null
});

// Create AI task queue
const aiQueue = new Queue('ai-agent-tasks', { connection });

// Add task to queue
await aiQueue.add('crew-planning', {
  type: 'analyze_relief_needs',
  vessel_id: 'vessel-123',
  contract_end_date: '2024-12-31'
}, {
  priority: 1, // high priority
  delay: 0, // execute immediately
  attempts: 3 // retry 3 times on failure
});

// Worker to process tasks
const worker = new Worker('ai-agent-tasks', async (job) => {
  console.log(`Processing job ${job.id} of type ${job.data.type}`);
  
  switch (job.data.type) {
    case 'analyze_relief_needs':
      return await analyzeReliefNeeds(job.data);
    case 'generate_assignment':
      return await generateAssignment(job.data);
    case 'process_document':
      return await processDocument(job.data);
    default:
      throw new Error(`Unknown job type: ${job.data.type}`);
  }
}, { connection });

// Listen to events
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

**Option B: Temporal (Advanced, for complex workflows)**
```typescript
import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from './activities';

const { analyzeReliefNeeds, matchSeafarers, createAssignment, generateTasks } = 
  proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
  });

// Define workflow
export async function crewPlanningWorkflow(vesselId: string): Promise<void> {
  // Step 1: Analyze relief needs
  const reliefNeeds = await analyzeReliefNeeds(vesselId);
  
  if (!reliefNeeds.required) {
    return; // No relief needed
  }
  
  // Step 2: Match seafarers
  const matches = await matchSeafarers(reliefNeeds.requirements);
  
  if (matches.length === 0) {
    throw new Error('No suitable seafarers found');
  }
  
  // Step 3: Create assignment (with retry)
  const assignment = await createAssignment({
    seafarer_id: matches[0].id,
    vessel_id: vesselId,
    reasoning: matches[0].reasoning
  });
  
  // Step 4: Wait for acceptance (with timeout)
  const accepted = await waitForAcceptance(assignment.id, '7 days');
  
  if (accepted) {
    // Step 5: Generate tasks
    await generateTasks(assignment.id);
  } else {
    // Try next candidate
    await createAssignment({
      seafarer_id: matches[1].id,
      vessel_id: vesselId,
      reasoning: matches[1].reasoning
    });
  }
}
```

**Recommendation:** Start with **BullMQ** (simple, sufficient for most use cases), consider Temporal for complex multi-step workflows with long durations.

---

## 🔧 Implementation Details

### Phase 1: Crew Planning Agent

#### **1. Database Setup**

```sql
-- AI configuration table
CREATE TABLE ai_agent_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  autonomy_level TEXT CHECK (autonomy_level IN ('full', 'semi', 'assistant')) DEFAULT 'semi',
  min_match_score INTEGER DEFAULT 85,
  advance_planning_days INTEGER DEFAULT 30,
  auto_approve_threshold_usd NUMERIC DEFAULT 500,
  enabled_features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI generated assignments tracking
CREATE TABLE ai_generated_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id),
  seafarer_candidates JSONB, -- [{ id, score, reasoning, rank }]
  selected_seafarer_id UUID,
  match_score NUMERIC,
  ai_reasoning JSONB,
  company_decision TEXT CHECK (company_decision IN ('approved', 'rejected', 'modified', 'pending')),
  company_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  decided_at TIMESTAMPTZ
);

-- AI action audit log
CREATE TABLE ai_action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  action_type TEXT, -- 'relief_analysis', 'seafarer_matching', 'assignment_created', etc.
  action_data JSONB,
  ai_model TEXT, -- 'gpt-4-turbo', 'claude-3-opus', etc.
  ai_confidence NUMERIC,
  execution_time_ms INTEGER,
  result TEXT CHECK (result IN ('success', 'failed', 'pending_approval')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_config_company ON ai_agent_config(company_id);
CREATE INDEX idx_ai_assignments_assignment ON ai_generated_assignments(assignment_id);
CREATE INDEX idx_ai_assignments_status ON ai_generated_assignments(company_decision);
CREATE INDEX idx_ai_logs_company_date ON ai_action_logs(company_id, created_at DESC);
```

#### **2. Core Agent Logic**

```typescript
// src/ai/agents/CrewPlanningAgent.ts

import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Define schemas
const SeafarerMatchSchema = z.object({
  seafarer_id: z.string(),
  match_score: z.number().min(0).max(100),
  reasoning: z.string(),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
  recommendations: z.array(z.string())
});

const ReliefAnalysisSchema = z.object({
  requires_relief: z.boolean(),
  days_until_relief: z.number(),
  urgency_level: z.enum(['low', 'medium', 'high', 'urgent']),
  reasoning: z.string(),
  recommended_action_date: z.string()
});

export class CrewPlanningAgent {
  private openai: OpenAI;
  private companyId: string;
  
  constructor(companyId: string) {
    this.companyId = companyId;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  /**
   * Analyze all active assignments and identify relief needs
   */
  async analyzeReliefNeeds(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Get all active assignments for this company
      const { data: assignments, error } = await supabase
        .from('assignments')
        .select(`
          *,
          vessel:vessels(*),
          seafarer:seafarer_profile(*, user:user_profiles(*))
        `)
        .eq('company_id', this.companyId)
        .eq('status', 'active');
      
      if (error) throw error;
      
      for (const assignment of assignments || []) {
        // Analyze each assignment
        const analysis = await this.analyzeAssignment(assignment);
        
        // Log action
        await this.logAction('relief_analysis', {
          assignment_id: assignment.id,
          vessel_id: assignment.vessel_id,
          analysis
        }, 'success', Date.now() - startTime);
        
        // If relief needed, trigger seafarer matching
        if (analysis.requires_relief && analysis.urgency_level !== 'low') {
          await this.initiateSeafarerMatching(assignment, analysis);
        }
      }
    } catch (error) {
      console.error('Relief analysis failed:', error);
      await this.logAction('relief_analysis', { error: error.message }, 'failed', Date.now() - startTime);
    }
  }
  
  /**
   * Analyze a single assignment for relief needs
   */
  private async analyzeAssignment(assignment: any): Promise<z.infer<typeof ReliefAnalysisSchema>> {
    const prompt = `You are a maritime crew planning expert. Analyze this assignment and determine if relief is needed.

Assignment Details:
- Seafarer: ${assignment.seafarer.user.full_name}
- Rank: ${assignment.seafarer.rank}
- Vessel: ${assignment.vessel.name} (${assignment.vessel.type})
- Contract Start: ${assignment.contract_start_date}
- Contract End: ${assignment.contract_end_date}
- Current Date: ${new Date().toISOString().split('T')[0]}

Consider:
1. Days until contract end
2. Typical advance planning time (30 days)
3. Document preparation time
4. Travel arrangement time
5. Seasonal factors (if applicable)

Provide analysis in JSON format:
{
  "requires_relief": boolean,
  "days_until_relief": number,
  "urgency_level": "low" | "medium" | "high" | "urgent",
  "reasoning": "detailed explanation",
  "recommended_action_date": "YYYY-MM-DD"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return ReliefAnalysisSchema.parse(result);
  }
  
  /**
   * Find and rank matching seafarers
   */
  private async initiateSeafarerMatching(assignment: any, analysis: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Get available seafarers
      const { data: seafarers, error } = await supabase
        .from('seafarer_profile')
        .select(`
          *,
          user:user_profiles(*),
          documents:documents(*)
        `)
        .eq('company_id', this.companyId)
        .eq('availability_status', 'available');
      
      if (error) throw error;
      
      // Get AI configuration
      const { data: config } = await supabase
        .from('ai_agent_config')
        .select('*')
        .eq('company_id', this.companyId)
        .single();
      
      // Match and rank seafarers
      const matches = await this.rankSeafarers(assignment, seafarers || []);
      
      // Filter by minimum match score
      const qualified = matches.filter(m => m.match_score >= (config?.min_match_score || 85));
      
      if (qualified.length === 0) {
        console.log('No qualified seafarers found');
        await this.logAction('seafarer_matching', {
          assignment_id: assignment.id,
          candidates_analyzed: matches.length,
          qualified_candidates: 0
        }, 'success', Date.now() - startTime);
        return;
      }
      
      // Create AI-generated assignment
      await this.createAIAssignment(assignment, qualified, analysis);
      
      await this.logAction('seafarer_matching', {
        assignment_id: assignment.id,
        candidates_analyzed: matches.length,
        qualified_candidates: qualified.length,
        top_match: qualified[0]
      }, 'success', Date.now() - startTime);
      
    } catch (error) {
      console.error('Seafarer matching failed:', error);
      await this.logAction('seafarer_matching', { error: error.message }, 'failed', Date.now() - startTime);
    }
  }
  
  /**
   * Rank seafarers using AI
   */
  private async rankSeafarers(assignment: any, seafarers: any[]): Promise<z.infer<typeof SeafarerMatchSchema>[]> {
    // Build comprehensive context
    const requirementsContext = {
      vessel: {
        name: assignment.vessel.name,
        type: assignment.vessel.type,
        flag_state: assignment.vessel.flag_state
      },
      position: {
        rank: assignment.seafarer.rank,
        department: assignment.seafarer.department
      },
      contract: {
        duration_months: this.calculateMonths(assignment.contract_start_date, assignment.contract_end_date),
        joining_port: assignment.joining_port,
        joining_date: assignment.contract_start_date
      }
    };
    
    const prompt = `You are a maritime crew matching expert. Rank these seafarers for the following assignment.

Assignment Requirements:
${JSON.stringify(requirementsContext, null, 2)}

Available Seafarers:
${JSON.stringify(seafarers.map(s => ({
  id: s.id,
  name: s.user.full_name,
  rank: s.rank,
  experience_years: s.experience_years,
  certificates: s.certificates,
  preferred_vessel_types: s.preferred_vessel_types,
  location: s.user.location,
  documents: s.documents.map(d => ({ type: d.type, expiry_date: d.expiry_date, status: d.status }))
})), null, 2)}

For EACH seafarer, provide a detailed match analysis in JSON array format:
[
  {
    "seafarer_id": "uuid",
    "match_score": 0-100,
    "reasoning": "why this score",
    "strengths": ["list", "of", "strengths"],
    "risks": ["list", "of", "risks"],
    "recommendations": ["list", "of", "recommendations"]
  }
]

Scoring criteria (out of 100):
- Rank match (25 points): Exact rank match
- Experience (20 points): Years of experience and vessel type
- Certifications (25 points): All required certificates valid
- Availability (10 points): Immediate availability
- Location (10 points): Proximity to joining port
- Document status (10 points): All documents approved and valid`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{"matches":[]}');
    const matches = z.array(SeafarerMatchSchema).parse(result.matches || result);
    
    // Sort by match score descending
    return matches.sort((a, b) => b.match_score - a.match_score);
  }
  
  /**
   * Create AI-generated assignment
   */
  private async createAIAssignment(originalAssignment: any, matches: any[], analysis: any): Promise<void> {
    const topMatch = matches[0];
    
    // Check autonomy level
    const { data: config } = await supabase
      .from('ai_agent_config')
      .select('autonomy_level')
      .eq('company_id', this.companyId)
      .single();
    
    // Create new assignment
    const { data: newAssignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        company_id: this.companyId,
        vessel_id: originalAssignment.vessel_id,
        seafarer_id: topMatch.seafarer_id,
        rank: originalAssignment.rank,
        department: originalAssignment.department,
        contract_start_date: originalAssignment.contract_end_date, // Start after current ends
        contract_end_date: this.addMonths(originalAssignment.contract_end_date, 6),
        joining_port: originalAssignment.joining_port,
        status: config?.autonomy_level === 'full' ? 'pending' : 'draft',
        created_by_ai: true
      })
      .select()
      .single();
    
    if (assignmentError) throw assignmentError;
    
    // Store AI reasoning
    const { error: aiError } = await supabase
      .from('ai_generated_assignments')
      .insert({
        assignment_id: newAssignment.id,
        seafarer_candidates: matches,
        selected_seafarer_id: topMatch.seafarer_id,
        match_score: topMatch.match_score,
        ai_reasoning: {
          relief_analysis: analysis,
          match_details: topMatch,
          alternatives: matches.slice(1, 4) // Top 3 alternatives
        },
        company_decision: config?.autonomy_level === 'full' ? 'approved' : 'pending'
      });
    
    if (aiError) throw aiError;
    
    // If full autonomy, send assignment offer immediately
    if (config?.autonomy_level === 'full') {
      await this.sendAssignmentOffer(newAssignment.id);
    } else {
      // Notify company for approval
      await this.notifyCompanyForApproval(newAssignment.id);
    }
  }
  
  /**
   * Log AI action for audit
   */
  private async logAction(actionType: string, actionData: any, result: string, executionTime: number): Promise<void> {
    await supabase
      .from('ai_action_logs')
      .insert({
        company_id: this.companyId,
        action_type: actionType,
        action_data: actionData,
        ai_model: 'gpt-4-turbo-preview',
        ai_confidence: actionData.match_score || actionData.analysis?.confidence || null,
        execution_time_ms: executionTime,
        result
      });
  }
  
  // Helper functions
  private calculateMonths(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }
  
  private addMonths(date: string, months: number): string {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  }
  
  private async sendAssignmentOffer(assignmentId: string): Promise<void> {
    // Implementation for sending assignment offer
  }
  
  private async notifyCompanyForApproval(assignmentId: string): Promise<void> {
    // Implementation for notifying company
  }
}
```

#### **3. Scheduled Job (Cron)**

```typescript
// src/ai/scheduler/crewPlanningScheduler.ts

import { Queue, QueueScheduler } from 'bullmq';
import { CrewPlanningAgent } from '../agents/CrewPlanningAgent';
import { supabase } from '@/lib/supabase';

// Create queue and scheduler
const queue = new Queue('crew-planning');
const scheduler = new QueueScheduler('crew-planning');

// Schedule daily relief analysis (every day at 6 AM)
export async function scheduleCrewPlanning(): Promise<void> {
  await queue.add(
    'analyze-all-companies',
    {},
    {
      repeat: {
        pattern: '0 6 * * *', // Cron: 6 AM daily
        tz: 'UTC'
      }
    }
  );
}

// Worker to process scheduled job
export async function startCrewPlanningWorker(): Promise<void> {
  const worker = new Worker('crew-planning', async (job) => {
    console.log(`Processing job: ${job.name}`);
    
    // Get all companies with AI agent enabled
    const { data: companies, error } = await supabase
      .from('ai_agent_config')
      .select('company_id')
      .eq('is_enabled', true);
    
    if (error) {
      console.error('Failed to fetch companies:', error);
      return;
    }
    
    // Analyze relief needs for each company
    for (const company of companies || []) {
      try {
        const agent = new CrewPlanningAgent(company.company_id);
        await agent.analyzeReliefNeeds();
      } catch (error) {
        console.error(`Failed to analyze company ${company.company_id}:`, error);
      }
    }
  });
  
  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });
  
  worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
  });
}

// Start scheduler
scheduleCrewPlanning();
startCrewPlanningWorker();
```

#### **4. API Endpoints**

```typescript
// src/api/ai/assignments.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/ai/assignments
 * Get AI-generated assignments pending approval
 */
export async function getAIAssignments(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { company_id } = req.query;
    
    const { data, error } = await supabase
      .from('ai_generated_assignments')
      .select(`
        *,
        assignment:assignments(
          *,
          vessel:vessels(*),
          seafarer:seafarer_profile(*, user:user_profiles(*))
        )
      `)
      .eq('assignment.company_id', company_id)
      .eq('company_decision', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.status(200).json({ assignments: data });
  } catch (error) {
    console.error('Failed to fetch AI assignments:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/ai/assignments/:id/approve
 * Approve AI-generated assignment
 */
export async function approveAIAssignment(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { feedback } = req.body;
    
    // Update AI assignment record
    const { error: aiError } = await supabase
      .from('ai_generated_assignments')
      .update({
        company_decision: 'approved',
        company_feedback: feedback,
        decided_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (aiError) throw aiError;
    
    // Get assignment ID
    const { data: aiAssignment } = await supabase
      .from('ai_generated_assignments')
      .select('assignment_id')
      .eq('id', id)
      .single();
    
    // Update assignment status to pending (ready to send to seafarer)
    const { error: assignmentError } = await supabase
      .from('assignments')
      .update({ status: 'pending' })
      .eq('id', aiAssignment?.assignment_id);
    
    if (assignmentError) throw assignmentError;
    
    // Send assignment offer to seafarer
    // TODO: Implement sendAssignmentOffer()
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to approve assignment:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/ai/assignments/:id/reject
 * Reject AI-generated assignment
 */
export async function rejectAIAssignment(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { feedback, reason } = req.body;
    
    // Update AI assignment record
    const { error: aiError } = await supabase
      .from('ai_generated_assignments')
      .update({
        company_decision: 'rejected',
        company_feedback: feedback,
        decided_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (aiError) throw aiError;
    
    // Get assignment ID
    const { data: aiAssignment } = await supabase
      .from('ai_generated_assignments')
      .select('assignment_id, seafarer_candidates')
      .eq('id', id)
      .single();
    
    // Delete the draft assignment
    const { error: deleteError } = await supabase
      .from('assignments')
      .delete()
      .eq('id', aiAssignment?.assignment_id);
    
    if (deleteError) throw deleteError;
    
    // Log rejection for AI learning
    await supabase
      .from('ai_action_logs')
      .insert({
        action_type: 'assignment_rejected',
        action_data: {
          rejected_seafarer: aiAssignment?.seafarer_candidates[0],
          reason,
          feedback
        },
        result: 'success'
      });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to reject assignment:', error);
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// tests/ai/CrewPlanningAgent.test.ts

import { CrewPlanningAgent } from '@/ai/agents/CrewPlanningAgent';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('CrewPlanningAgent', () => {
  let agent: CrewPlanningAgent;
  
  beforeEach(() => {
    agent = new CrewPlanningAgent('test-company-id');
  });
  
  describe('analyzeAssignment', () => {
    it('should identify relief needs 30 days before contract end', async () => {
      const assignment = {
        contract_end_date: '2024-12-31',
        seafarer: { rank: 'Chief Engineer' },
        vessel: { name: 'MV Test' }
      };
      
      const analysis = await agent.analyzeAssignment(assignment);
      
      expect(analysis.requires_relief).toBe(true);
      expect(analysis.urgency_level).toBe('high');
    });
    
    it('should not require relief if contract end is far away', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      
      const assignment = {
        contract_end_date: futureDate.toISOString().split('T')[0],
        seafarer: { rank: 'Chief Engineer' },
        vessel: { name: 'MV Test' }
      };
      
      const analysis = await agent.analyzeAssignment(assignment);
      
      expect(analysis.requires_relief).toBe(false);
      expect(analysis.urgency_level).toBe('low');
    });
  });
  
  describe('rankSeafarers', () => {
    it('should rank seafarers by match score', async () => {
      const assignment = { /* ... */ };
      const seafarers = [ /* ... */ ];
      
      const ranked = await agent.rankSeafarers(assignment, seafarers);
      
      expect(ranked).toHaveLength(seafarers.length);
      expect(ranked[0].match_score).toBeGreaterThanOrEqual(ranked[1].match_score);
    });
  });
});
```

### Integration Tests
```typescript
// tests/integration/ai-workflow.test.ts

import { describe, it, expect } from 'vitest';
import { supabase } from '@/lib/supabase';
import { CrewPlanningAgent } from '@/ai/agents/CrewPlanningAgent';

describe('AI Workflow Integration', () => {
  it('should complete full crew planning workflow', async () => {
    // 1. Enable AI agent for test company
    await supabase
      .from('ai_agent_config')
      .upsert({
        company_id: 'test-company',
        is_enabled: true,
        autonomy_level: 'semi'
      });
    
    // 2. Create test assignment ending soon
    const { data: assignment } = await supabase
      .from('assignments')
      .insert({
        company_id: 'test-company',
        vessel_id: 'test-vessel',
        seafarer_id: 'test-seafarer',
        contract_end_date: '2024-12-31',
        status: 'active'
      })
      .select()
      .single();
    
    // 3. Run AI agent
    const agent = new CrewPlanningAgent('test-company');
    await agent.analyzeReliefNeeds();
    
    // 4. Verify AI created assignment
    const { data: aiAssignments } = await supabase
      .from('ai_generated_assignments')
      .select('*')
      .eq('company_decision', 'pending');
    
    expect(aiAssignments).toHaveLength(1);
    expect(aiAssignments[0].match_score).toBeGreaterThan(85);
    
    // 5. Verify audit log
    const { data: logs } = await supabase
      .from('ai_action_logs')
      .select('*')
      .eq('company_id', 'test-company')
      .order('created_at', { ascending: false })
      .limit(1);
    
    expect(logs[0].action_type).toBe('assignment_created');
    expect(logs[0].result).toBe('success');
  });
});
```

---

## 📊 Monitoring & Observability

### LLM Call Monitoring
```typescript
// src/ai/monitoring/llmMonitor.ts

import { Helicone } from '@helicone/helicone';

const helicone = new Helicone({
  apiKey: process.env.HELICONE_API_KEY
});

export async function monitoredLLMCall(
  provider: 'openai' | 'anthropic',
  operation: string,
  params: any
): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Make LLM call with monitoring
    const response = await helicone.log({
      provider,
      operation,
      request: params,
      userId: params.companyId,
      properties: {
        environment: process.env.NODE_ENV,
        agent_type: params.agentType
      }
    }, async () => {
      // Actual LLM call here
      return await makeLLMCall(provider, params);
    });
    
    const executionTime = Date.now() - startTime;
    
    // Log metrics
    await logMetric({
      metric: 'llm_call',
      provider,
      operation,
      executionTime,
      tokenCount: response.usage?.total_tokens,
      cost: calculateCost(provider, response.usage),
      success: true
    });
    
    return response;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // Log error
    await logMetric({
      metric: 'llm_call',
      provider,
      operation,
      executionTime,
      success: false,
      error: error.message
    });
    
    throw error;
  }
}

function calculateCost(provider: string, usage: any): number {
  if (provider === 'openai') {
    // GPT-4 Turbo pricing
    const inputCost = (usage.prompt_tokens / 1000) * 0.01;
    const outputCost = (usage.completion_tokens / 1000) * 0.03;
    return inputCost + outputCost;
  }
  // Add other providers...
  return 0;
}
```

---

## 🔐 Security Considerations

### 1. API Key Management
```typescript
// Never expose API keys in frontend
// Use environment variables and server-side calls only

// .env (never commit this)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
PINECONE_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_KEY=...

// Use server-side only
import { OpenAI } from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Server-side only
});
```

### 2. Data Privacy
```typescript
// Anonymize sensitive data before sending to LLMs
function anonymizeForLLM(data: any): any {
  return {
    ...data,
    // Remove PII
    email: undefined,
    phone: undefined,
    passport_number: undefined,
    // Hash identifiers
    seafarer_id: hash(data.seafarer_id),
    // Keep relevant data
    rank: data.rank,
    experience_years: data.experience_years,
    certificates: data.certificates.map(c => ({
      type: c.type,
      expiry_date: c.expiry_date,
      // Remove certificate numbers
      certificate_number: undefined
    }))
  };
}
```

### 3. Input Validation
```typescript
// Validate all inputs before sending to LLM
import { z } from 'zod';

const AssignmentInputSchema = z.object({
  vessel_id: z.string().uuid(),
  rank: z.string().min(1).max(100),
  contract_duration_months: z.number().min(1).max(36)
});

async function createAssignment(input: unknown) {
  // Validate input
  const validated = AssignmentInputSchema.parse(input);
  
  // Proceed with validated data
  // ...
}
```

### 4. Rate Limiting
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function rateLimitedAICall(companyId: string, fn: () => Promise<any>) {
  const { success } = await ratelimit.limit(`ai_calls_${companyId}`);
  
  if (!success) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  return await fn();
}
```

---

## 💰 Cost Optimization

### 1. Caching Strategies
```typescript
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getCachedOrGenerate<T>(
  cacheKey: string,
  ttlSeconds: number,
  generator: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Generate if not cached
  const result = await generator();
  
  // Cache result
  await redis.setex(cacheKey, ttlSeconds, JSON.stringify(result));
  
  return result;
}

// Example usage
const seafarerMatches = await getCachedOrGenerate(
  `matches:${assignmentId}`,
  3600, // Cache for 1 hour
  async () => await rankSeafarers(assignment, seafarers)
);
```

### 2. Use Cheaper Models for Simple Tasks
```typescript
function selectModel(taskComplexity: 'simple' | 'medium' | 'complex'): string {
  switch (taskComplexity) {
    case 'simple':
      return 'gpt-3.5-turbo'; // $0.0005/1K tokens
    case 'medium':
      return 'gpt-4-turbo-preview'; // $0.01/1K tokens
    case 'complex':
      return 'gpt-4'; // $0.03/1K tokens
    default:
      return 'gpt-3.5-turbo';
  }
}

// Use GPT-3.5 for simple extractions
const extractedData = await openai.chat.completions.create({
  model: selectModel('simple'),
  messages: [{ role: 'user', content: 'Extract name and date from: ...' }]
});

// Use GPT-4 for complex reasoning
const matchAnalysis = await openai.chat.completions.create({
  model: selectModel('complex'),
  messages: [{ role: 'user', content: 'Analyze and rank these seafarers...' }]
});
```

### 3. Batch Processing
```typescript
// Instead of calling LLM for each seafarer individually,
// batch multiple seafarers into one LLM call

// ❌ Expensive (10 LLM calls)
for (const seafarer of seafarers) {
  await analyzeSeafarer(seafarer);
}

// ✅ Efficient (1 LLM call)
await analyzeAllSeafarers(seafarers);
```

---

## 📈 Performance Optimization

### 1. Parallel Processing
```typescript
// Process multiple AI tasks in parallel
const [reliefAnalysis, documentChecks, complianceReview] = await Promise.all([
  analyzeReliefNeeds(vesselId),
  checkAllDocuments(seafarerId),
  reviewCompliance(assignmentId)
]);
```

### 2. Streaming Responses
```typescript
// For conversational AI, stream responses for better UX
const stream = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: query }],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  // Send chunk to frontend immediately
  res.write(content);
}
```

---

## 🚀 Deployment Considerations

### Environment Setup
```bash
# Production environment variables
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
PINECONE_API_KEY=...
REDIS_URL=redis://...
DATABASE_URL=postgresql://...
NODE_ENV=production

# AI Configuration
AI_MODEL_PRIMARY=gpt-4-turbo-preview
AI_MODEL_FALLBACK=gpt-3.5-turbo
AI_MAX_RETRIES=3
AI_TIMEOUT_MS=30000
AI_RATE_LIMIT_PER_COMPANY=100
```

### Docker Configuration
```dockerfile
# Dockerfile for AI service

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start AI service
CMD ["node", "dist/ai/server.js"]
```

### Kubernetes Deployment
```yaml
# kubernetes/ai-service.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: wavesync-ai-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wavesync-ai
  template:
    metadata:
      labels:
        app: wavesync-ai
    spec:
      containers:
      - name: ai-service
        image: wavesync/ai-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: openai-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
```

---

## 📚 Additional Resources

### Recommended Reading
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Building LLM Applications](https://www.deeplearning.ai/short-courses/building-applications-vector-databases/)

### Example Prompts Library
Create a `prompts/` directory with reusable prompts:

```typescript
// prompts/crewPlanning.ts

export const RELIEF_ANALYSIS_PROMPT = `You are a maritime crew planning expert...`;
export const SEAFARER_MATCHING_PROMPT = `You are a maritime crew matching expert...`;
export const RISK_ASSESSMENT_PROMPT = `You are a maritime risk assessment expert...`;
```

---

**This technical guide provides everything you need to implement Phase 1 of the AI integration. Let me know if you need more details on any specific component!**

