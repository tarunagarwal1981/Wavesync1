# WaveSync Maritime Platform - Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Database Setup
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `pvlnhwsooclbarfhieep`
3. Navigate to **SQL Editor**
4. Copy and paste the entire contents of `database-cleanup.sql`
5. Click **Run** to execute the SQL

### Step 2: Create Test Users
After the database is set up, run:
```bash
node setup-users.js
```

### Step 3: Test Login
1. Visit: http://localhost:3000/login
2. Use the test credentials below

## 👥 Test User Credentials

### Seafarer Account
- **Email:** `seafarer@wavesync.com`
- **Password:** `password123`
- **Name:** John Smith
- **Rank:** Chief Officer
- **Role:** Seafarer

### Company Account
- **Email:** `company@wavesync.com`
- **Password:** `password123`
- **Name:** Sarah Johnson
- **Company:** Ocean Transport Ltd
- **Role:** Company User

### Admin Account
- **Email:** `admin@wavesync.com`
- **Password:** `password123`
- **Name:** Michael Admin
- **Role:** Admin

## 🔧 Troubleshooting

### If you get "table not found" errors:
1. Make sure you've run the SQL setup in Supabase
2. Check that all tables were created successfully
3. Verify your Supabase credentials in `.env.local`

### If login fails:
1. Check browser console for errors
2. Verify Supabase connection
3. Ensure users were created successfully

## 📱 Application Features

Once logged in, you'll have access to:
- **Seafarer:** Assignments, Tasks, Documents, Training, Profile
- **Company:** Crew Management, Fleet Management, Analytics, AI Assignments
- **Admin:** System Management, User Management, Analytics, Settings

## 🌐 Development Server
- **URL:** http://localhost:3000
- **Status:** Running with Supabase integration
- **Hot Reload:** Enabled

---

**Need Help?** Check the terminal output for detailed error messages and ensure all steps are completed in order.
