// Setup script to create three test users for WaveSync Maritime Platform
// Run this script with: node setup-users.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure .env.local file exists with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testUsers = [
  {
    email: 'seafarer@wavesync.com',
    password: 'password123',
    full_name: 'John Smith',
    user_type: 'seafarer',
    phone: '+1-555-0101',
    rank: 'Chief Officer',
    certificate_number: 'CO-2024-001',
    experience_years: 8
  },
  {
    email: 'company@wavesync.com',
    password: 'password123',
    full_name: 'Sarah Johnson',
    user_type: 'company',
    phone: '+1-555-0102',
    company_name: 'Ocean Transport Ltd'
  },
  {
    email: 'admin@wavesync.com',
    password: 'password123',
    full_name: 'Michael Admin',
    user_type: 'admin',
    phone: '+1-555-0103'
  }
];

async function createTestUsers() {
  console.log('🚀 Setting up test users for WaveSync Maritime Platform...\n');

  for (const userData of testUsers) {
    try {
      console.log(`📝 Creating ${userData.user_type} user: ${userData.email}`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true // Auto-confirm email
      });

      if (authError) {
        console.error(`❌ Failed to create auth user: ${authError.message}`);
        continue;
      }

      console.log(`✅ Auth user created: ${authData.user.id}`);

      // Create user profile
      const profileData = {
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        user_type: userData.user_type,
        phone: userData.phone
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (profileError) {
        console.error(`❌ Failed to create user profile: ${profileError.message}`);
        continue;
      }

      console.log(`✅ User profile created`);

      // Create seafarer profile if user is a seafarer
      if (userData.user_type === 'seafarer') {
        const seafarerData = {
          user_id: authData.user.id,
          rank: userData.rank,
          certificate_number: userData.certificate_number,
          experience_years: userData.experience_years,
          availability_status: 'available'
        };

        const { error: seafarerError } = await supabase
          .from('seafarer_profiles')
          .insert(seafarerData);

        if (seafarerError) {
          console.error(`❌ Failed to create seafarer profile: ${seafarerError.message}`);
        } else {
          console.log(`✅ Seafarer profile created`);
        }
      }

      // Create company if user is a company user
      if (userData.user_type === 'company' && userData.company_name) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: userData.company_name,
            email: userData.email,
            phone: userData.phone
          })
          .select()
          .single();

        if (companyError) {
          console.error(`❌ Failed to create company: ${companyError.message}`);
        } else {
          console.log(`✅ Company created: ${companyData.id}`);

          // Update user profile with company_id
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ company_id: companyData.id })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error(`❌ Failed to link user to company: ${updateError.message}`);
          } else {
            console.log(`✅ User linked to company`);
          }
        }
      }

      console.log(`🎉 ${userData.user_type} user setup complete!\n`);

    } catch (error) {
      console.error(`❌ Error creating ${userData.user_type} user:`, error.message);
    }
  }

  console.log('🎯 Test users setup complete!');
  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  testUsers.forEach(user => {
    console.log(`👤 ${user.user_type.toUpperCase()}:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Name: ${user.full_name}`);
    if (user.rank) console.log(`   Rank: ${user.rank}`);
    if (user.company_name) console.log(`   Company: ${user.company_name}`);
    console.log('');
  });

  console.log('🌐 Visit: http://localhost:3000/login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run the setup
createTestUsers().catch(console.error);
