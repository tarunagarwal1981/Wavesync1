import cron from 'node-cron';
import { supabase } from '../services/database.service';
import { logger } from '../services/logging.service';
import { CrewPlanningAgent } from '../agents/CrewPlanningAgent';

export function startCrewPlanningJob() {
  const schedule = process.env.AI_CRON_SCHEDULE || '0 6 * * *'; // Default: 6 AM daily

  logger.info(`📅 Scheduling crew planning job: ${schedule}`);

  cron.schedule(schedule, async () => {
    logger.info('🕐 Starting scheduled crew planning job...');

    try {
      // Get all companies with AI enabled
      const { data: configs, error } = await supabase
        .from('ai_agent_config')
        .select('*')
        .eq('is_enabled', true);

      if (error) {
        logger.error('Error fetching AI configs:', error);
        return;
      }

      if (!configs || configs.length === 0) {
        logger.info('No companies with AI agent enabled');
        return;
      }

      logger.info(`Found ${configs.length} companies with AI enabled`);

      // Run AI agent for each company
      for (const config of configs) {
        if (config.enabled_features?.crew_planning) {
          try {
            logger.info(`Running AI agent for company: ${config.company_id}`);
            const agent = new CrewPlanningAgent(config.company_id, config);
            await agent.runPlanningCycle();
          } catch (error) {
            logger.error(`AI agent failed for company ${config.company_id}:`, error);
            // Continue with other companies even if one fails
          }
        } else {
          logger.info(`Crew planning disabled for company: ${config.company_id}`);
        }
      }

      logger.info('✅ Crew planning job completed successfully');
    } catch (error) {
      logger.error('❌ Crew planning job failed:', error);
    }
  });

  logger.info(`✅ Crew planning cron job scheduled: ${schedule}`);
}

// Export function to manually trigger planning for a specific company
export async function runPlanningForCompany(companyId: string): Promise<void> {
  logger.info(`Manually triggering planning for company: ${companyId}`);

  try {
    // Get company's AI config
    const { data: config, error } = await supabase
      .from('ai_agent_config')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_enabled', true)
      .single();

    if (error || !config) {
      throw new Error(`AI not enabled for company ${companyId}`);
    }

    if (!config.enabled_features?.crew_planning) {
      throw new Error(`Crew planning feature not enabled for company ${companyId}`);
    }

    const agent = new CrewPlanningAgent(companyId, config);
    await agent.runPlanningCycle();

    logger.info(`✅ Manual planning completed for company: ${companyId}`);
  } catch (error) {
    logger.error(`Manual planning failed for company ${companyId}:`, error);
    throw error;
  }
}
