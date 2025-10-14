// Database setup script for WaveSync Maritime Platform
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

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
    // Read the SQL file
    const sqlContent = fs.readFileSync('database-cleanup.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`⚠️ Statement ${i + 1} warning: ${error.message}`);
          } else {
            console.log(`✅ Statement ${i + 1} completed`);
          }
        } catch (err) {
          console.log(`⚠️ Statement ${i + 1} error: ${err.message}`);
        }
      }
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
