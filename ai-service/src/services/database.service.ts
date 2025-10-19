/**
 * Database Service
 * Supabase client and helper functions
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from './logging.service';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for server-side

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Get all companies with AI enabled
 */
export async function getAIEnabledCompanies(): Promise<string[]> {
  const { data, error } = await supabase
    .from('ai_agent_config')
    .select('company_id')
    .eq('is_enabled', true);

  if (error) {
    logger.error('[Database] Failed to fetch AI-enabled companies:', error);
    return [];
  }

  return data?.map(c => c.company_id) || [];
}

/**
 * Get AI config for a company
 */
export async function getAIConfig(companyId: string): Promise<any> {
  const { data, error } = await supabase
    .from('ai_agent_config')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error) {
    logger.warn(`[Database] No AI config found for company: ${companyId}`);
    return null;
  }

  return data;
}

/**
 * Update AI performance metrics
 */
export async function updatePerformanceMetrics(
  companyId: string,
  metrics: {
    assignments_created?: number;
    assignments_approved?: number;
    assignments_rejected?: number;
    tasks_generated?: number;
    time_saved_hours?: number;
    cost_savings_usd?: number;
  }
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('ai_performance_metrics')
    .upsert({
      company_id: companyId,
      metric_date: today,
      ...metrics
    }, {
      onConflict: 'company_id,metric_date'
    });

  if (error) {
    logger.error('[Database] Failed to update performance metrics:', error);
  }
}

