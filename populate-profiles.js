// Populate user profiles for existing auth users
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

const userProfiles = [
  {
    email: 'seafarer@wavesync.com',
    full_name: 'John Smith',
    user_type: 'seafarer',
    phone: '+1-555-0101',
    rank: 'Chief Officer',
    certificate_number: 'CO-2024-001',
    experience_years: 8
  },
  {
    email: 'company@wavesync.com',
    full_name: 'Sarah Johnson',
    user_type: 'company',
    phone: '+1-555-0102',
    company_name: 'Ocean Transport Ltd'
  },
  {
    email: 'admin@wavesync.com',
    full_name: 'Michael Admin',
    user_type: 'admin',
    phone: '+1-555-0103'
  }
];

async function populateUserProfiles() {
  console.log('👥 Populating user profiles for existing auth users...\n');

  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Failed to fetch auth users:', authError.message);
      return;
    }

    console.log(`📋 Found ${authUsers.users.length} auth users`);

    for (const authUser of authUsers.users) {
      console.log(`\n👤 Processing user: ${authUser.email}`);
      
      // Find matching profile data
      const profileData = userProfiles.find(p => p.email === authUser.email);
      
      if (!profileData) {
        console.log(`⚠️ No profile data found for ${authUser.email}`);
        continue;
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (existingProfile) {
        console.log(`✅ Profile already exists for ${authUser.email}`);
        continue;
      }

      // Create company if needed
      let companyId = null;
      if (profileData.company_name) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: profileData.company_name,
            email: authUser.email,
            phone: profileData.phone
          })
          .select()
          .single();

        if (companyError) {
          console.log(`⚠️ Company creation failed: ${companyError.message}`);
        } else {
          companyId = company.id;
          console.log(`✅ Company created: ${company.name}`);
        }
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          full_name: profileData.full_name,
          user_type: profileData.user_type,
          phone: profileData.phone,
          company_id: companyId
        });

      if (profileError) {
        console.log(`❌ Profile creation failed: ${profileError.message}`);
        continue;
      }

      console.log(`✅ User profile created for ${authUser.email}`);

      // Create seafarer profile if needed
      if (profileData.user_type === 'seafarer') {
        const { error: seafarerError } = await supabase
          .from('seafarer_profiles')
          .insert({
            user_id: authUser.id,
            rank: profileData.rank,
            certificate_number: profileData.certificate_number,
            experience_years: profileData.experience_years,
            availability_status: 'available'
          });

        if (seafarerError) {
          console.log(`⚠️ Seafarer profile creation failed: ${seafarerError.message}`);
        } else {
          console.log(`✅ Seafarer profile created`);
        }
      }
    }

    console.log('\n🎉 User profiles population completed!');
    console.log('\n📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    userProfiles.forEach(user => {
      console.log(`👤 ${user.user_type.toUpperCase()}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: password123`);
      console.log(`   Name: ${user.full_name}`);
      if (user.rank) console.log(`   Rank: ${user.rank}`);
      if (user.company_name) console.log(`   Company: ${user.company_name}`);
      console.log('');
    });

    console.log('🌐 Visit: http://localhost:3000/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error populating profiles:', error.message);
  }
}

// Run the population
populateUserProfiles().catch(console.error);
