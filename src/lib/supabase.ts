import { createClient } from '@supabase/supabase-js'

// Vite provides import.meta.env at runtime; for type-safety in TS, extend ImportMetaEnv in global.d.ts.
// At build time, treat these as strings.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database schema
export interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'seafarer' | 'company' | 'admin'
  avatar_url?: string
  phone?: string
  company_id?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  website?: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface SeafarerProfile {
  id: string
  user_id: string
  rank: string
  certificate_number?: string
  experience_years?: number
  preferred_vessel_types?: string[]
  availability_status: 'available' | 'unavailable' | 'on_contract'
  created_at: string
  updated_at: string
}
