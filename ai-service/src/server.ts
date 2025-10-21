import express from 'express';
import dotenv from 'dotenv';
import { logger } from './services/logging.service';
import { startCrewPlanningJob, runPlanningForCompany } from './jobs/crewPlanningJob';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'wavesync-ai-agent',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoint to manually trigger planning cycle for a company
app.post('/api/trigger-planning', async (req, res) => {
  try {
    const { company_id } = req.body;
    
    if (!company_id) {
      return res.status(400).json({ 
        error: 'company_id is required',
        example: { company_id: 'uuid-here' }
      });
    }

    logger.info(`Manual trigger requested for company: ${company_id}`);
    
    await runPlanningForCompany(company_id);
    
    res.json({ 
      message: 'Planning cycle triggered successfully',
      company_id: company_id,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Error triggering planning:', error);
    res.status(500).json({ 
      error: 'Failed to trigger planning cycle',
      details: error.message 
    });
  }
});

// API endpoint to get AI service status
app.get('/api/status', async (req, res) => {
  try {
    const { supabase } = await import('./services/database.service');
    
    // Test database connection
    const { data, error } = await supabase
      .from('ai_agent_config')
      .select('count')
      .limit(1);
    
    res.json({
      status: 'operational',
      database: error ? 'disconnected' : 'connected',
      redis: 'checking...',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      details: error.message
    });
  }
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start cron jobs
logger.info('🚀 Initializing WaveSync AI Service...');
startCrewPlanningJob();

// Start server
app.listen(PORT, () => {
  logger.info('═══════════════════════════════════════════════');
  logger.info('🚀 WaveSync AI Service Started Successfully!');
  logger.info('═══════════════════════════════════════════════');
  logger.info(`📡 Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📅 Cron jobs initialized`);
  logger.info(`🤖 AI Agent ready for autonomous crew planning`);
  logger.info('═══════════════════════════════════════════════');
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Status check: http://localhost:${PORT}/api/status`);
  logger.info('═══════════════════════════════════════════════');
});

export default app;
