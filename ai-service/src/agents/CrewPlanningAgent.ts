import { supabase, AIConfig, Assignment, SeafarerProfile } from '../services/database.service';
import { logger } from '../services/logging.service';
import { aiService } from '../services/openai.service';
import { cache } from '../services/cache.service';

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

      if (upcomingReliefs.length === 0) {
        logger.info(`No upcoming reliefs found for company ${this.companyId}`);
        return;
      }

      for (const assignment of upcomingReliefs) {
        try {
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
          
          logger.info(`✅ AI created assignment: ${topCandidate.seafarer.full_name} -> ${assignment.vessel_name} (${topCandidate.matchScore}%)`);
        } catch (error) {
          logger.error(`Error processing assignment ${assignment.id}:`, error);
          continue;
        }
      }

      logger.info(`🤖 AI Agent completed planning cycle for company ${this.companyId}`);
    } catch (error) {
      logger.error(`AI Agent error for company ${this.companyId}:`, error);
      throw error;
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
      vessel_name: a.vessel?.name || 'Unknown Vessel',
      vessel_type: a.vessel?.vessel_type || 'Unknown',
      current_seafarer: a.seafarer?.full_name || 'Unknown'
    }));
  }

  private async findSuitableSeafarers(assignment: any): Promise<SeafarerProfile[]> {
    // Cache key for seafarer list
    const cacheKey = `seafarers:${this.companyId}:${assignment.rank}`;
    const cached = await cache.get<SeafarerProfile[]>(cacheKey);
    
    if (cached) {
      logger.info(`Using cached seafarer list for rank ${assignment.rank}`);
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
        try {
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
        } catch (error) {
          logger.error(`Error analyzing seafarer ${seafarer.full_name}:`, error);
          // Return basic match if AI fails
          return {
            seafarer,
            matchScore: 50,
            reasoning: 'Analysis failed, manual review needed',
            strengths: [],
            risks: ['AI analysis failed']
          };
        }
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
    const aiReasoning = {
      relief_analysis: {
        current_seafarer: originalAssignment.current_seafarer,
        sign_off_date: originalAssignment.sign_off_date,
        days_until_relief: Math.ceil(
          (new Date(originalAssignment.sign_off_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        vessel_name: originalAssignment.vessel_name,
        vessel_type: originalAssignment.vessel_type
      },
      match_details: {
        reasoning: topCandidate.reasoning,
        strengths: topCandidate.strengths,
        risks: topCandidate.risks,
        recommendations: [
          'Verify all certifications are current',
          'Confirm travel document validity',
          'Schedule pre-joining medical if required',
          'Arrange vessel-specific training if needed'
        ]
      },
      alternatives: alternatives.map(alt => ({
        seafarer_name: alt.seafarer.full_name,
        match_score: alt.matchScore,
        reasoning: alt.reasoning
      }))
    };

    // Check if AI assignment already exists for this assignment
    const { data: existingAI } = await supabase
      .from('ai_generated_assignments')
      .select('id')
      .eq('assignment_id', originalAssignment.id)
      .eq('status', 'pending_review')
      .single();

    if (existingAI) {
      logger.info(`AI assignment already exists for ${originalAssignment.vessel_name}, skipping`);
      return;
    }

    // Insert AI-generated assignment
    const { error } = await supabase
      .from('ai_generated_assignments')
      .insert({
        company_id: this.companyId,
        assignment_id: originalAssignment.id,
        recommended_seafarer_id: topCandidate.seafarer.user_id,
        match_score: topCandidate.matchScore,
        ai_reasoning: aiReasoning,
        status: 'pending_review'
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
        match_score: topCandidate.matchScore,
        alternatives_count: alternatives.length
      }
    });

    logger.info(`✅ AI assignment created successfully`);
  }
}
