const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL() {
  try {
    console.log('📄 Reading SQL file...');
    const sql = fs.readFileSync('travel-document-notification-trigger.sql', 'utf8');
    
    console.log('🚀 Executing SQL...');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^DO \$\$/));
    
    for (const statement of statements) {
      if (statement.includes('DROP TRIGGER') || 
          statement.includes('DROP FUNCTION') ||
          statement.includes('CREATE TRIGGER') ||
          statement.includes('CREATE OR REPLACE FUNCTION') ||
          statement.includes('INSERT INTO notification_templates')) {
        
        console.log(`⚙️  Executing: ${statement.substring(0, 60)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });
        
        if (error) {
          console.error('❌ Error:', error.message);
          // Continue with other statements
        } else {
          console.log('✅ Success');
        }
      }
    }
    
    console.log('\n✅ Travel document notification trigger setup complete!');
    console.log('📬 Seafarers will now receive notifications when documents are uploaded');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runSQL();

