#!/usr/bin/env node

// ============================================================================
// WAVESYNC MARITIME PLATFORM - PHASE 1 SETUP SCRIPT
// ============================================================================
// This script helps you set up Phase 1 of the WaveSync platform

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 WaveSync Maritime Platform - Phase 1 Setup');
  console.log('='.repeat(50));
  console.log('This script will help you set up Phase 1 of the WaveSync platform.\n');

  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);

  if (!envExists) {
    console.log('📝 Creating .env file...');

    // Prefer existing environment variables if provided when running the script
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

    const envContent = `# WaveSync Maritime Platform Environment Variables
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    if (supabaseUrl.includes('YOUR_') || supabaseKey.includes('YOUR_')) {
      console.warn('⚠️ Please update .env with your real Supabase credentials.');
    }
    console.log('');
  } else {
    console.log('✅ .env file already exists\n');
  }

  // Check if package.json exists
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageExists = fs.existsSync(packagePath);

  if (!packageExists) {
    console.log('📦 Creating package.json...');
    
    const packageContent = {
      name: 'wavesync-maritime-platform',
      version: '1.0.0',
      description: 'WaveSync Maritime Platform - Phase 1',
      main: 'index.js',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        test: 'node test-phase1.js'
      },
      dependencies: {
        '@supabase/supabase-js': '^2.38.0',
        'dotenv': '^16.3.1'
      },
      devDependencies: {
        'vite': '^4.4.5'
      }
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
    console.log('✅ package.json created successfully!\n');
  } else {
    console.log('✅ package.json already exists\n');
  }

  // Display setup instructions
  console.log('📋 SETUP INSTRUCTIONS:');
  console.log('='.repeat(50));
  console.log('1. Install dependencies:');
  console.log('   npm install\n');
  
  console.log('2. Set up your Supabase database:');
  console.log('   - Open your Supabase project dashboard');
  console.log('   - Go to SQL Editor');
  console.log('   - Run the database-setup-complete.sql script');
  console.log('   - Run the storage-setup.sql script\n');
  
  console.log('3. Create an admin user:');
  console.log('   - Go to Authentication in Supabase dashboard');
  console.log('   - Add a new user with email: admin@wavesync.com');
  console.log('   - Set password: admin123456');
  console.log('   - Auto-confirm the email\n');
  
  console.log('4. Add admin user to database:');
  console.log('   - In SQL Editor, run:');
  console.log('   INSERT INTO user_profiles (id, email, full_name, user_type, phone)');
  console.log('   SELECT id, email, \'Admin User\', \'admin\', \'+1-555-0001\'');
  console.log('   FROM auth.users WHERE email = \'admin@wavesync.com\';\n');
  
  console.log('5. Test the setup:');
  console.log('   npm run test\n');
  
  console.log('6. Start the development server:');
  console.log('   npm run dev\n');
  
  console.log('📚 For detailed instructions, see PHASE1_TESTING_GUIDE.md');
  console.log('='.repeat(50));
}

main().catch(console.error);
