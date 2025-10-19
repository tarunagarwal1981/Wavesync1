/**
 * Crew Planning Job
 * Scheduled job that runs daily to analyze crew relief needs
 */

import { CrewPlanningAgent } from '../agents/CrewPlanningAgent';
import { getAIEnabledCompanies } from '../services/database.service';
import { logger } from '../services/logging.service';

export async function runCrewPlanningJob(): Promise<void> {
  const startTime = Date.now();
  
  try {
    logger.info('[CrewPlanningJob] Starting crew planning analysis');

    // Get all companies with AI enabled
    const companies = await getAIEnabledCompanies();
    
    if (companies.length === 0) {
      logger.info('[CrewPlanningJob] No AI-enabled companies found');
      return;
    }

    logger.info(`[CrewPlanningJob] Processing ${companies.length} AI-enabled companies`);

    // Process each company
    let successCount = 0;
    let failCount = 0;

    for (const companyId of companies) {
      try {
        const agent = new CrewPlanningAgent(companyId);
        await agent.run();
        successCount++;
      } catch (error) {
        logger.error(`[CrewPlanningJob] Failed to process company ${companyId}:`, error);
        failCount++;
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`[CrewPlanningJob] Completed in ${duration}ms. Success: ${successCount}, Failed: ${failCount}`);

  } catch (error) {
    logger.error('[CrewPlanningJob] Fatal error:', error);
    throw error;
  }
}

