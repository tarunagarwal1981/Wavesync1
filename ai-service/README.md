# WaveSync AI Service

AI-powered autonomous crew planning service for WaveSync maritime platform.

## 🚀 Quick Start

### 1. Configure Environment Variables

Create `.env` file in this directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# Redis Configuration
REDIS_URL=redis://localhost:6379

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

### 2. Start Redis

**Windows (Docker):**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

**Windows (WSL):**
```bash
sudo service redis-server start
```

### 3. Start the AI Service

```bash
npm run dev
```

You should see:
```
═══════════════════════════════════════════════
🚀 WaveSync AI Service Started Successfully!
═══════════════════════════════════════════════
📡 Server running on port 3001
🌍 Environment: development
📅 Cron jobs initialized
🤖 AI Agent ready for autonomous crew planning
═══════════════════════════════════════════════
```

### 4. Test Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "wavesync-ai-agent",
  "timestamp": "2025-10-19T12:00:00.000Z",
  "environment": "development"
}
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Status Check
```
GET /api/status
```

### Manual Planning Trigger
```
POST /api/trigger-planning
Content-Type: application/json

{
  "company_id": "uuid-here"
}
```

## 🏗️ Architecture

```
ai-service/
├── src/
│   ├── agents/
│   │   └── CrewPlanningAgent.ts    # Core AI agent logic
│   ├── services/
│   │   ├── database.service.ts     # Supabase client
│   │   ├── logging.service.ts      # Winston logger
│   │   ├── cache.service.ts        # Redis caching
│   │   └── openai.service.ts       # OpenAI integration
│   ├── jobs/
│   │   └── crewPlanningJob.ts      # Cron scheduler
│   └── server.ts                    # Express server
├── logs/                            # Log files
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

1. Enable AI for a test company in the admin UI
2. Create test assignments with upcoming sign-off dates
3. Manually trigger planning:
   ```bash
   curl -X POST http://localhost:3001/api/trigger-planning \
     -H "Content-Type: application/json" \
     -d '{"company_id": "your-company-id"}'
   ```
4. Check results in `/ai-assignments` route

## 📊 Monitoring

View logs:
```bash
tail -f logs/combined.log
```

View errors only:
```bash
tail -f logs/error.log
```

## 🔧 Troubleshooting

### Redis Connection Error
- Ensure Redis is running: `docker ps` or `redis-cli ping`
- Check REDIS_URL in .env

### OpenAI API Error
- Verify API key is correct
- Check API usage limits at platform.openai.com
- Ensure sufficient credits

### Database Connection Error
- Verify Supabase URL and keys
- Check if ai-agent-setup.sql was executed
- Test connection with Supabase Studio

## 📚 Documentation

- Full setup guide: `../AI_SERVICE_SETUP.md`
- Quick reference: `../AI_IMPLEMENTATION_QUICK_REFERENCE.md`
- Implementation summary: `../AI_IMPLEMENTATION_SUMMARY.md`

## 🛠️ Development

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Watch mode (auto-restart):
```bash
npm run dev
```

## 📝 License

ISC




