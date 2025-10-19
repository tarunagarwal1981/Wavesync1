/**
 * Crew Planning Agent
 * 
 * Autonomous AI agent that:
 * 1. Monitors contract end dates
 * 2. Predicts relief needs
 * 3. Matches seafarers to positions
 * 4. Creates assignments (pending approval)
 * 5. Generates tasks automatically
 */

import { OpenAI } from 'openai';
import { supabase } from '../services/database.service';
import { logger } from '../services/logging.service';
import { cacheService } from '../services/cache.service';
import { z } from 'zod';

// ============================================
// TYPES & SCHEMAS
// ============================================

const ReliefAnalysisSchema = z.object({
  requires_relief: z.boolean(),
  days_until_relief: z.number(),
  urgency_level: z.enum(['low', 'medium', 'high', 'urgent']),
  reasoning: z.string(),
  recommended_action_date: z.string(),
  risk_factors: z.array(z.string()).optional()
});

const SeafarerMatchSchema = z.object({
  seafarer_id: z.string(),
  match_score: z.number().min(0).max(100),
  reasoning: z.string(),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
  recommendations: z.array(z.string())
});

interface Assignment {
  id: string;
  company_id: string;
  vessel_id: string;
  seafarer_id: string;
  rank: string;
  department: string;
  contract_start_date: string;
  contract_end_date: string;
  joining_port: string;
  status: string;
  vessel?: any;
  seafarer?: any;
}

interface Seafarer {
  id: string;
  user_id: string;
  rank: string;
  experience_years?: number;
  certificates?: string[];
  availability_status: string;
  user?: {
    full_name: string;
    email: string;
    phone?: string;
  };
  documents?: any[];
}

// ============================================
// CREW PLANNING AGENT CLASS
// ============================================

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
   * Main entry point: Analyze all active assignments and identify relief needs
   */
  async run(): Promise<void> {
    const startTime = Date.now();
    
    try {
      logger.info(`[CrewPlanningAgent] Starting for company: ${this.companyId}`);

      // Get AI config
      const config = await this.getAIConfig();
      if (!config.is_enabled) {
        logger.info(`[CrewPlanningAgent] AI disabled for company: ${this.companyId}`);
        return;
      }

      // Get all active assignments
      const assignments = await this.getActiveAssignments();
      logger.info(`[CrewPlanningAgent] Found ${assignments.length} active assignments`);

      // Analyze each assignment
      let reliefNeeded = 0;
      for (const assignment of assignments) {
        try {
          const analysis = await this.analyzeAssignment(assignment);
          
          // Log analysis
          await this.logAction('relief_analysis', {
            assignment_id: assignment.id,
            vessel_id: assignment.vessel_id,
            analysis
          }, 'success', Date.now() - startTime);

          // If relief needed and urgent, trigger seafarer matching
          if (analysis.requires_relief && ['high', 'urgent'].includes(analysis.urgency_level)) {
            reliefNeeded++;
            await this.initiateSeafarerMatching(assignment, analysis);
          }
        } catch (error) {
          logger.error(`[CrewPlanningAgent] Failed to analyze assignment ${assignment.id}:`, error);
          await this.logAction('relief_analysis', { 
            assignment_id: assignment.id, 
            error: error.message 
          }, 'failed', Date.now() - startTime);
        }
      }

      logger.info(`[CrewPlanningAgent] Completed. Relief needed for ${reliefNeeded} assignments`);
      
    } catch (error) {
      logger.error(`[CrewPlanningAgent] Fatal error:`, error);
      throw error;
    }
  }

  /**
   * Get AI configuration for this company
   */
  private async getAIConfig(): Promise<any> {
    const { data, error } = await supabase
      .from('ai_agent_config')
      .select('*')
      .eq('company_id', this.companyId)
      .single();

    if (error) {
      logger.warn(`[CrewPlanningAgent] No AI config found for company: ${this.companyId}`);
      return { is_enabled: false };
    }

    return data;
  }

  /**
   * Get all active assignments for this company
   */
  private async getActiveAssignments(): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        vessel:vessels(*),
        seafarer:seafarer_profile(
          *,
          user:user_profiles(*)
        )
      `)
      .eq('company_id', this.companyId)
      .eq('status', 'active')
      .order('contract_end_date', { ascending: true });

    if (error) {
      logger.error('[CrewPlanningAgent] Failed to fetch assignments:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Analyze a single assignment for relief needs using AI
   */
  private async analyzeAssignment(assignment: Assignment): Promise<z.infer<typeof ReliefAnalysisSchema>> {
    // Check cache first
    const cacheKey = `relief_analysis:${assignment.id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.debug(`[CrewPlanningAgent] Using cached analysis for assignment ${assignment.id}`);
      return cached;
    }

    const config = await this.getAIConfig();
    const advancePlanningDays = config.advance_planning_days || 30;

    const prompt = `You are a maritime crew planning expert. Analyze this assignment and determine if relief is needed.

Assignment Details:
- Seafarer: ${assignment.seafarer?.user?.full_name || 'Unknown'}
- Rank: ${assignment.rank}
- Vessel: ${assignment.vessel?.name || 'Unknown'} (${assignment.vessel?.type || 'Unknown'})
- Contract Start: ${assignment.contract_start_date}
- Contract End: ${assignment.contract_end_date}
- Current Date: ${new Date().toISOString().split('T')[0]}

Analysis Requirements:
1. Calculate days until contract end
2. Consider advance planning time (${advancePlanningDays} days minimum)
3. Evaluate urgency level based on time remaining
4. Consider typical document preparation time (7-14 days)
5. Consider travel arrangement time (7-10 days)
6. Identify any risk factors

Urgency Levels:
- "urgent": < ${advancePlanningDays} days (need to act NOW)
- "high": ${advancePlanningDays}-${advancePlanningDays + 15} days (start planning soon)
- "medium": ${advancePlanningDays + 15}-${advancePlanningDays + 30} days (monitor)
- "low": > ${advancePlanningDays + 30} days (no action needed yet)

Respond in JSON format:
{
  "requires_relief": boolean,
  "days_until_relief": number,
  "urgency_level": "low" | "medium" | "high" | "urgent",
  "reasoning": "detailed explanation",
  "recommended_action_date": "YYYY-MM-DD",
  "risk_factors": ["list", "of", "risks"]
}`;

    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a maritime crew planning expert. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const analysis = ReliefAnalysisSchema.parse(result);

    // Cache for 6 hours
    await cacheService.set(cacheKey, analysis, 6 * 60 * 60);

    return analysis;
  }

  /**
   * Find and rank matching seafarers for relief
   */
  private async initiateSeafarerMatching(assignment: Assignment, analysis: any): Promise<void> {
    const startTime = Date.now();

    try {
      logger.info(`[CrewPlanningAgent] Starting seafarer matching for assignment ${assignment.id}`);

      // Get available seafarers
      const seafarers = await this.getAvailableSeafarers(assignment.rank);
      
      if (seafarers.length === 0) {
        logger.warn(`[CrewPlanningAgent] No available seafarers found for rank: ${assignment.rank}`);
        await this.logAction('seafarer_matching', {
          assignment_id: assignment.id,
          candidates_analyzed: 0,
          qualified_candidates: 0
        }, 'success', Date.now() - startTime);
        return;
      }

      // Get AI config
      const config = await this.getAIConfig();

      // Match and rank seafarers
      const matches = await this.rankSeafarers(assignment, seafarers);

      // Filter by minimum match score
      const qualified = matches.filter(m => m.match_score >= (config.min_match_score || 85));

      if (qualified.length === 0) {
        logger.warn(`[CrewPlanningAgent] No qualified seafarers found (min score: ${config.min_match_score})`);
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
      logger.error(`[CrewPlanningAgent] Seafarer matching failed:`, error);
      await this.logAction('seafarer_matching', { 
        assignment_id: assignment.id, 
        error: error.message 
      }, 'failed', Date.now() - startTime);
    }
  }

  /**
   * Get available seafarers matching the rank
   */
  private async getAvailableSeafarers(rank: string): Promise<Seafarer[]> {
    const { data, error } = await supabase
      .from('seafarer_profiles')
      .select(`
        *,
        user:user_profiles(*),
        documents:documents(*)
      `)
      .eq('rank', rank)
      .eq('availability_status', 'available');

    if (error) {
      logger.error('[CrewPlanningAgent] Failed to fetch seafarers:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Rank seafarers using AI
   */
  private async rankSeafarers(assignment: Assignment, seafarers: Seafarer[]): Promise<z.infer<typeof SeafarerMatchSchema>[]> {
    // Build comprehensive context
    const requirementsContext = {
      vessel: {
        name: assignment.vessel?.name,
        type: assignment.vessel?.type,
        flag_state: assignment.vessel?.flag_state
      },
      position: {
        rank: assignment.rank,
        department: assignment.department
      },
      contract: {
        duration_months: this.calculateMonths(assignment.contract_start_date, assignment.contract_end_date),
        joining_port: assignment.joining_port,
        joining_date: assignment.contract_end_date // Start after current ends
      }
    };

    const prompt = `You are a maritime crew matching expert. Rank these seafarers for the following assignment.

Assignment Requirements:
${JSON.stringify(requirementsContext, null, 2)}

Available Seafarers (${seafarers.length} candidates):
${JSON.stringify(seafarers.map(s => ({
  id: s.id,
  name: s.user?.full_name,
  rank: s.rank,
  experience_years: s.experience_years,
  certificates: s.certificates,
  availability_status: s.availability_status,
  documents: s.documents?.map(d => ({ 
    type: d.type, 
    expiry_date: d.expiry_date, 
    status: d.status 
  }))
})), null, 2)}

For EACH seafarer, provide a detailed match analysis.

Scoring criteria (out of 100):
- Rank match (25 points): Exact rank match
- Experience (20 points): Years of experience and vessel type
- Certifications (25 points): All required certificates valid
- Availability (10 points): Immediate availability
- Document status (20 points): All documents approved and valid

Respond in JSON array format:
[
  {
    "seafarer_id": "uuid",
    "match_score": 0-100,
    "reasoning": "why this score",
    "strengths": ["list", "of", "strengths"],
    "risks": ["list", "of", "risks"],
    "recommendations": ["list", "of", "recommendations"]
  }
]`;

    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a maritime crew matching expert. Always respond with valid JSON array.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{"matches":[]}');
    const matches = z.array(SeafarerMatchSchema).parse(result.matches || result);

    // Sort by match score descending
    return matches.sort((a, b) => b.match_score - a.match_score);
  }

  /**
   * Create AI-generated assignment (draft, pending company approval)
   */
  private async createAIAssignment(originalAssignment: Assignment, matches: any[], analysis: any): Promise<void> {
    const topMatch = matches[0];

    // Get AI config
    const config = await this.getAIConfig();

    // Create new assignment (draft)
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
        status: 'draft', // Draft status, not sent to seafarer yet
        created_by_ai: true
      })
      .select()
      .single();

    if (assignmentError) {
      logger.error('[CrewPlanningAgent] Failed to create assignment:', assignmentError);
      throw assignmentError;
    }

    // Store AI reasoning
    const { error: aiError } = await supabase
      .from('ai_generated_assignments')
      .insert({
        assignment_id: newAssignment.id,
        company_id: this.companyId,
        seafarer_candidates: matches,
        selected_seafarer_id: topMatch.seafarer_id,
        match_score: topMatch.match_score,
        ai_reasoning: {
          relief_analysis: analysis,
          match_details: topMatch,
          alternatives: matches.slice(1, 4) // Top 3 alternatives
        },
        ai_model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        ai_confidence: topMatch.match_score,
        company_decision: 'pending'
      });

    if (aiError) {
      logger.error('[CrewPlanningAgent] Failed to store AI reasoning:', aiError);
      throw aiError;
    }

    // Send notification to company
    await this.notifyCompanyForApproval(newAssignment.id);

    logger.info(`[CrewPlanningAgent] Created AI assignment: ${newAssignment.id} (pending approval)`);
  }

  /**
   * Notify company that AI generated an assignment needing approval
   */
  private async notifyCompanyForApproval(assignmentId: string): Promise<void> {
    // Get company users
    const { data: companyUsers } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('company_id', this.companyId)
      .eq('user_type', 'company');

    if (!companyUsers || companyUsers.length === 0) {
      logger.warn(`[CrewPlanningAgent] No company users found for company: ${this.companyId}`);
      return;
    }

    // Create notification for each company user
    for (const user of companyUsers) {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'info',
          title: '🤖 AI Agent Created Assignment',
          message: 'The AI agent has identified an upcoming crew relief need and created a recommended assignment for your approval.',
          related_entity_type: 'assignment',
          related_entity_id: assignmentId,
          action_url: `/assignments/${assignmentId}`
        });
    }

    logger.info(`[CrewPlanningAgent] Notified ${companyUsers.length} company users about assignment ${assignmentId}`);
  }

  /**
   * Log AI action for audit trail
   */
  private async logAction(
    actionType: string, 
    actionData: any, 
    result: string, 
    executionTime: number
  ): Promise<void> {
    await supabase
      .from('ai_action_logs')
      .insert({
        company_id: this.companyId,
        action_type: actionType,
        action_data: actionData,
        ai_model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        ai_confidence: actionData.match_score || actionData.analysis?.confidence || null,
        execution_time_ms: executionTime,
        result: result,
        related_assignment_id: actionData.assignment_id || null,
        related_seafarer_id: actionData.seafarer_id || null
      });
  }

  /**
   * Helper: Calculate months between two dates
   */
  private calculateMonths(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }

  /**
   * Helper: Add months to a date
   */
  private addMonths(date: string, months: number): string {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  }
}

