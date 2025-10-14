// Simple database setup script for WaveSync Maritime Platform
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🗄️ Setting up WaveSync Maritime Platform database...\n');

  try {
    // Create custom types
    console.log('📝 Creating custom types...');
    
    const types = [
      "CREATE TYPE user_type AS ENUM ('seafarer', 'company', 'admin');",
      "CREATE TYPE availability_status AS ENUM ('available', 'unavailable', 'on_contract');",
      "CREATE TYPE assignment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');",
      "CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');",
      "CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');"
    ];

    for (const typeSQL of types) {
      try {
        const { error } = await supabase.rpc('exec', { sql: typeSQL });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️ Type creation warning: ${error.message}`);
        } else {
          console.log('✅ Type created');
        }
      } catch (err) {
        console.log(`⚠️ Type creation error: ${err.message}`);
      }
    }

    // Create companies table
    console.log('📝 Creating companies table...');
    const companiesSQL = `
      CREATE TABLE IF NOT EXISTS companies (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        website VARCHAR(255),
        logo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: companiesError } = await supabase.rpc('exec', { sql: companiesSQL });
    if (companiesError) {
      console.log(`⚠️ Companies table warning: ${companiesError.message}`);
    } else {
      console.log('✅ Companies table created');
    }

    // Create user_profiles table
    console.log('📝 Creating user_profiles table...');
    const userProfilesSQL = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        user_type user_type NOT NULL,
        avatar_url TEXT,
        phone VARCHAR(50),
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: userProfilesError } = await supabase.rpc('exec', { sql: userProfilesSQL });
    if (userProfilesError) {
      console.log(`⚠️ User profiles table warning: ${userProfilesError.message}`);
    } else {
      console.log('✅ User profiles table created');
    }

    // Create seafarer_profiles table
    console.log('📝 Creating seafarer_profiles table...');
    const seafarerProfilesSQL = `
      CREATE TABLE IF NOT EXISTS seafarer_profiles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
        rank VARCHAR(100) NOT NULL,
        certificate_number VARCHAR(100),
        experience_years INTEGER DEFAULT 0,
        preferred_vessel_types TEXT[],
        availability_status availability_status DEFAULT 'available',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: seafarerProfilesError } = await supabase.rpc('exec', { sql: seafarerProfilesSQL });
    if (seafarerProfilesError) {
      console.log(`⚠️ Seafarer profiles table warning: ${seafarerProfilesError.message}`);
    } else {
      console.log('✅ Seafarer profiles table created');
    }

    // Enable RLS
    console.log('📝 Enabling Row Level Security...');
    const rlsSQL = `
      ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE seafarer_profiles ENABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('exec', { sql: rlsSQL });
    if (rlsError) {
      console.log(`⚠️ RLS warning: ${rlsError.message}`);
    } else {
      console.log('✅ RLS enabled');
    }

    console.log('\n🎉 Database setup completed!');
    console.log('💡 You can now run: node setup-users.js');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of database-cleanup.sql');
    console.log('4. Execute the SQL');
    console.log('5. Run: node setup-users.js');
  }
}

setupDatabase();
