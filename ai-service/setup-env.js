/**
 * Interactive setup script to create .env file
 * Run with: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  { key: 'SUPABASE_URL', prompt: 'Supabase URL (https://xxx.supabase.co): ' },
  { key: 'SUPABASE_ANON_KEY', prompt: 'Supabase Anon Key: ' },
  { key: 'SUPABASE_SERVICE_KEY', prompt: 'Supabase Service Role Key: ' },
  { key: 'OPENAI_API_KEY', prompt: 'OpenAI API Key (sk-...): ' },
  { key: 'OPENAI_MODEL', prompt: 'OpenAI Model [gpt-4-turbo-preview]: ', default: 'gpt-4-turbo-preview' },
  { key: 'REDIS_URL', prompt: 'Redis URL [redis://localhost:6379]: ', default: 'redis://localhost:6379' },
  { key: 'PORT', prompt: 'Server Port [3001]: ', default: '3001' },
  { key: 'NODE_ENV', prompt: 'Environment [development]: ', default: 'development' },
  { key: 'AI_MIN_MATCH_SCORE', prompt: 'Min Match Score [80]: ', default: '80' },
  { key: 'AI_ADVANCE_PLANNING_DAYS', prompt: 'Advance Planning Days [30]: ', default: '30' },
  { key: 'AI_CRON_SCHEDULE', prompt: 'Cron Schedule [0 6 * * *]: ', default: '0 6 * * *' },
  { key: 'LOG_LEVEL', prompt: 'Log Level [info]: ', default: 'info' }
];

const config = {};
let currentIndex = 0;

console.log('\n🤖 WaveSync AI Service - Environment Setup\n');
console.log('Press Enter to use default values shown in [brackets]\n');

function askQuestion() {
  if (currentIndex >= questions.length) {
    createEnvFile();
    return;
  }

  const question = questions[currentIndex];
  
  rl.question(question.prompt, (answer) => {
    config[question.key] = answer.trim() || question.default || '';
    currentIndex++;
    askQuestion();
  });
}

function createEnvFile() {
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const envPath = path.join(__dirname, '.env');
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ .env file created successfully!');
  console.log('\nConfiguration:');
  console.log('─────────────────────────────────────');
  Object.entries(config).forEach(([key, value]) => {
    // Mask sensitive values
    const displayValue = key.includes('KEY') || key.includes('SECRET') 
      ? value.substring(0, 10) + '...' 
      : value;
    console.log(`${key}: ${displayValue}`);
  });
  console.log('─────────────────────────────────────');
  console.log('\nNext steps:');
  console.log('1. Start Redis: docker run -d -p 6379:6379 redis:alpine');
  console.log('2. Start AI Service: npm run dev');
  console.log('3. Test health: curl http://localhost:3001/health\n');
  
  rl.close();
}

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  rl.question('Do you want to overwrite it? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      askQuestion();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  askQuestion();
}




