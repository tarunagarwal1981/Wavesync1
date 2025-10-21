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

export interface AIConfig {
  company_id: string;
  is_enabled: boolean;
  autonomy_level: 'full' | 'semi' | 'assistant';
  min_match_score: number;
  advance_planning_days: number;
  enabled_features: {
    crew_planning: boolean;
    task_generation: boolean;
    document_analysis?: boolean;
    compliance_monitoring?: boolean;
    travel_optimization?: boolean;
  };
}
