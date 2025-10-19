# Deploy Edge Function for User Creation

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Deploy the Edge Function

1. Deploy the function:
```bash
supabase functions deploy create-user
```

2. Set environment variables (if not already set):
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Test the Function

You can test the function using curl:

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-user' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "user_type": "seafarer",
    "phone": "+1234567890",
    "rank": "Cadet",
    "experience_years": 2
  }'
```

## Local Development

To run the function locally:

1. Start Supabase locally:
```bash
supabase start
```

2. Serve the function:
```bash
supabase functions serve create-user
```

The function will be available at: `http://localhost:54321/functions/v1/create-user`

## Environment Variables

Make sure these are set in your Supabase project:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for admin operations)
- `SUPABASE_ANON_KEY`: Your anon key (for client operations)

## Security Notes

- The function validates that only admin users can create new users
- It uses the service role key only for admin operations
- All requests are logged for debugging
- CORS is properly configured
