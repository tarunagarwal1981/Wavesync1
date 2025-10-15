// ============================================================================
// WAVESYNC MARITIME PLATFORM - PHASE 1 TESTING SCRIPT
// ============================================================================
// Run this script to test all Phase 1 functionalities
// Make sure to update the Supabase configuration with your project details

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'your-supabase-url',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'
);

// Test data
const testCompany = {
  name: 'Test Maritime Company',
  email: 'test@maritime.com',
  phone: '+1-555-0123',
  address: '123 Test Street, Test City, TC 12345',
  website: 'https://testmaritime.com'
};

const testAdminUser = {
  email: 'admin@wavesync.com',
  password: 'admin123456',
  full_name: 'Admin User',
  user_type: 'admin',
  phone: '+1-555-0001'
};

const testCompanyUser = {
  email: 'company@wavesync.com',
  password: 'company123456',
  full_name: 'Company User',
  user_type: 'company',
  phone: '+1-555-0002'
};

const testSeafarerUser = {
  email: 'seafarer@wavesync.com',
  password: 'seafarer123456',
  full_name: 'John Seafarer',
  user_type: 'seafarer',
  phone: '+1-555-0003',
  rank: 'Chief Officer',
  experience_years: 8,
  certificate_number: 'CO-12345'
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
  const result = {
    name: testName,
    passed,
    message,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}: PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FAILED - ${message}`);
  }
}

// Helper function to clean up test data
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test users (this will cascade to profiles)
    const testEmails = [testAdminUser.email, testCompanyUser.email, testSeafarerUser.email];
    
    for (const email of testEmails) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find(u => u.email === email);
      
      if (user) {
        await supabase.auth.admin.deleteUser(user.id);
        console.log(`Deleted user: ${email}`);
      }
    }
    
    // Delete test company
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .eq('email', testCompany.email);
    
    if (companies && companies.length > 0) {
      await supabase
        .from('companies')
        .delete()
        .eq('id', companies[0].id);
      console.log(`Deleted company: ${testCompany.name}`);
    }
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    logTest('Database Connection', true);
  } catch (error) {
    logTest('Database Connection', false, error.message);
  }
}

async function testCompanyCreation() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([testCompany])
      .select()
      .single();
    
    if (error) throw error;
    
    // Store company ID for later tests
    testCompany.id = data.id;
    logTest('Company Creation', true, `Created company with ID: ${data.id}`);
  } catch (error) {
    logTest('Company Creation', false, error.message);
  }
}

async function testAdminUserCreation() {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testAdminUser.email,
      password: testAdminUser.password,
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: testAdminUser.email,
        full_name: testAdminUser.full_name,
        user_type: testAdminUser.user_type,
        phone: testAdminUser.phone
      });
    
    if (profileError) throw profileError;
    
    testAdminUser.id = authData.user.id;
    logTest('Admin User Creation', true, `Created admin user with ID: ${authData.user.id}`);
  } catch (error) {
    logTest('Admin User Creation', false, error.message);
  }
}

async function testCompanyUserCreation() {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testCompanyUser.email,
      password: testCompanyUser.password,
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: testCompanyUser.email,
        full_name: testCompanyUser.full_name,
        user_type: testCompanyUser.user_type,
        phone: testCompanyUser.phone,
        company_id: testCompany.id
      });
    
    if (profileError) throw profileError;
    
    testCompanyUser.id = authData.user.id;
    logTest('Company User Creation', true, `Created company user with ID: ${authData.user.id}`);
  } catch (error) {
    logTest('Company User Creation', false, error.message);
  }
}

async function testSeafarerUserCreation() {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testSeafarerUser.email,
      password: testSeafarerUser.password,
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: testSeafarerUser.email,
        full_name: testSeafarerUser.full_name,
        user_type: testSeafarerUser.user_type,
        phone: testSeafarerUser.phone
      });
    
    if (profileError) throw profileError;
    
    // Create seafarer profile
    const { error: seafarerError } = await supabase
      .from('seafarer_profiles')
      .insert({
        user_id: authData.user.id,
        rank: testSeafarerUser.rank,
        experience_years: testSeafarerUser.experience_years,
        certificate_number: testSeafarerUser.certificate_number,
        availability_status: 'available'
      });
    
    if (seafarerError) throw seafarerError;
    
    testSeafarerUser.id = authData.user.id;
    logTest('Seafarer User Creation', true, `Created seafarer user with ID: ${authData.user.id}`);
  } catch (error) {
    logTest('Seafarer User Creation', false, error.message);
  }
}

async function testUserAuthentication() {
  try {
    // Test admin login
    const { data: adminAuth, error: adminError } = await supabase.auth.signInWithPassword({
      email: testAdminUser.email,
      password: testAdminUser.password
    });
    
    if (adminError) throw adminError;
    
    // Test company user login
    await supabase.auth.signOut();
    const { data: companyAuth, error: companyError } = await supabase.auth.signInWithPassword({
      email: testCompanyUser.email,
      password: testCompanyUser.password
    });
    
    if (companyError) throw companyError;
    
    // Test seafarer login
    await supabase.auth.signOut();
    const { data: seafarerAuth, error: seafarerError } = await supabase.auth.signInWithPassword({
      email: testSeafarerUser.email,
      password: testSeafarerUser.password
    });
    
    if (seafarerError) throw seafarerError;
    
    logTest('User Authentication', true, 'All user types can authenticate successfully');
  } catch (error) {
    logTest('User Authentication', false, error.message);
  }
}

async function testProfileRetrieval() {
  try {
    // Sign in as seafarer
    await supabase.auth.signInWithPassword({
      email: testSeafarerUser.email,
      password: testSeafarerUser.password
    });
    
    // Test profile retrieval
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        seafarer_profile:seafarer_profiles(*)
      `)
      .eq('id', testSeafarerUser.id)
      .single();
    
    if (profileError) throw profileError;
    
    if (!profile.seafarer_profile) {
      throw new Error('Seafarer profile not found');
    }
    
    logTest('Profile Retrieval', true, 'Profile and seafarer data retrieved successfully');
  } catch (error) {
    logTest('Profile Retrieval', false, error.message);
  }
}

async function testRLSPolicies() {
  try {
    // Test that users can only see their own data
    await supabase.auth.signInWithPassword({
      email: testSeafarerUser.email,
      password: testSeafarerUser.password
    });
    
    // Try to access admin data (should fail)
    const { data: adminData, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_type', 'admin');
    
    // This should return empty or error due to RLS
    if (adminData && adminData.length > 0) {
      throw new Error('RLS policy failed - seafarer can see admin data');
    }
    
    logTest('RLS Policies', true, 'Row Level Security policies working correctly');
  } catch (error) {
    logTest('RLS Policies', false, error.message);
  }
}

async function testStorageBuckets() {
  try {
    // Test if storage buckets exist
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;
    
    const requiredBuckets = ['documents', 'avatars', 'company-logos'];
    const existingBuckets = buckets.map(b => b.name);
    
    for (const bucket of requiredBuckets) {
      if (!existingBuckets.includes(bucket)) {
        throw new Error(`Required bucket '${bucket}' not found`);
      }
    }
    
    logTest('Storage Buckets', true, 'All required storage buckets exist');
  } catch (error) {
    logTest('Storage Buckets', false, error.message);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('🚀 Starting WaveSync Phase 1 Testing...\n');
  
  // Run all tests
  await testDatabaseConnection();
  await testCompanyCreation();
  await testAdminUserCreation();
  await testCompanyUserCreation();
  await testSeafarerUserCreation();
  await testUserAuthentication();
  await testProfileRetrieval();
  await testRLSPolicies();
  await testStorageBuckets();
  
  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.message}`);
      });
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Cleanup
  await cleanup();
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
