# ⚡ Quick Setup Guide

## Step 1: Create your `.env` file

Create a file named `.env` in the `ai-service` folder with this content:

```env
# Supabase Configuration
# Copy these from your main WaveSync .env file (in parent folder)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# OpenAI Configuration
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4-turbo-preview

# Redis Configuration (Upstash)
USE_REDIS=true
REDIS_URL=redis://default:YOUR_PASSWORD@closing-bluebird-15255.upstash.io:6379

# Server Configuration
PORT=3001
NODE_ENV=development

# AI Configuration
AI_MIN_MATCH_SCORE=80
AI_ADVANCE_PLANNING_DAYS=30
AI_CRON_SCHEDULE=0 6 * * *

# Logging
LOG_LEVEL=info
```

## Step 2: Fill in your values

### Supabase (Required)
1. Open `../.env` (your main WaveSync .env file)
2. Copy `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`

### OpenAI (Required)
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### Redis (Already have from Upstash)
1. In Upstash dashboard, find the **ioredis** connection string
2. Should look like: `redis://default:YOUR_PASSWORD@closing-bluebird-15255.upstash.io:6379`
3. Replace `YOUR_PASSWORD` with your actual password from Upstash

## Step 3: Start the service

```bash
npm run dev
```

## Expected Output

```
═══════════════════════════════════════════════
🚀 WaveSync AI Service Started Successfully!
═══════════════════════════════════════════════
📡 Server running on port 3001
✅ Redis connected
🤖 AI Agent ready for autonomous crew planning
═══════════════════════════════════════════════
```

## Step 4: Test

Open new terminal:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "wavesync-ai-agent",
  "timestamp": "2025-10-19T..."
}
```

✅ **If you see this, you're ready to go!**

---

## Need Help?

**Can't find main .env file?**
- It should be at: `C:\Users\train\.cursor\Wavesync1\.env`

**Don't have OpenAI key?**
- You can start without it for now
- Set: `OPENAI_API_KEY=sk-test-key-replace-me-later`
- AI will use fallback scoring

**Redis connection fails?**
- Check password is correct
- Verify the format: `redis://default:PASSWORD@host:6379`
- Or disable Redis: Set `USE_REDIS=false`

---

## What's Next?

Once running:
1. Go to `/admin/ai-settings` in your WaveSync app
2. Enable AI for a company
3. Test it!

See `AI_NEXT_STEPS.md` for detailed testing instructions.




