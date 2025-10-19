#!/bin/bash

# Deploy Edge Function for User Creation
# Make sure you're logged in to Supabase CLI and have linked your project

echo "🚀 Deploying Edge Function for User Creation..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

# Deploy the function
echo "📦 Deploying create-user function..."
supabase functions deploy create-user

if [ $? -eq 0 ]; then
    echo "✅ Edge function deployed successfully!"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Make sure your service role key is set as a secret:"
    echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo ""
    echo "2. Test the function in your app - user creation should now work!"
    echo ""
    echo "3. Check the function logs if needed:"
    echo "   supabase functions logs create-user"
else
    echo "❌ Failed to deploy edge function"
    exit 1
fi
