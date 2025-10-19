/**
 * AI Agent Server
 * Main entry point for the AI service
 */

import express from 'express';
import * as cron from 'node-cron';
import dotenv from 'dotenv';
import { logger } from './services/logging.service';
import { runCrewPlanningJob } from './jobs/crewPlanningJob';
import { CrewPlanningAgent } from './agents/CrewPlanningAgent';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.AI_SERVICE_PORT || 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'wavesync-ai-agent' });
});

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Trigger crew planning analysis manually for a specific company
 * POST /api/ai/crew-planning/:companyId
 */
app.post('/api/ai/crew-planning/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    logger.info(`[API] Manual trigger for company: ${companyId}`);
    
    const agent = new CrewPlanningAgent(companyId);
    await agent.run();
    
    res.json({ success: true, message: 'Crew planning analysis completed' });
  } catch (error) {
    logger.error('[API] Crew planning failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Trigger crew planning analysis for all AI-enabled companies
 * POST /api/ai/crew-planning/run-all
 */
app.post('/api/ai/crew-planning/run-all', async (req, res) => {
  try {
    logger.info('[API] Manual trigger for all companies');
    
    await runCrewPlanningJob();
    
    res.json({ success: true, message: 'Crew planning analysis completed for all companies' });
  } catch (error) {
    logger.error('[API] Crew planning job failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get AI service status
 * GET /api/ai/status
 */
app.get('/api/ai/status', (req, res) => {
  res.json({
    status: 'running',
    version: '1.0.0',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    cronSchedule: process.env.AI_CRON_CREW_PLANNING || '0 6 * * *'
  });
});

// ============================================
// CRON JOBS
// ============================================

// Schedule crew planning job (default: every day at 6 AM UTC)
const crewPlanningSchedule = process.env.AI_CRON_CREW_PLANNING || '0 6 * * *';
cron.schedule(crewPlanningSchedule, async () => {
  logger.info('[Cron] Starting scheduled crew planning job');
  try {
    await runCrewPlanningJob();
  } catch (error) {
    logger.error('[Cron] Crew planning job failed:', error);
  }
});

logger.info(`[Cron] Crew planning job scheduled: ${crewPlanningSchedule}`);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  logger.info(`🤖 AI Agent Service running on port ${PORT}`);
  logger.info(`Model: ${process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('[Server] SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('[Server] SIGINT signal received: closing HTTP server');
  process.exit(0);
});

