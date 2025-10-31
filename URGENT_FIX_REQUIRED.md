# 🚨 URGENT: SQL Migration Required

## ❌ Current Issues

You're seeing these 404 errors:
```
POST .../rpc/get_unread_broadcasts_count 404 (Not Found)
POST .../rpc/mark_broadcast_as_read 404 (Not Found)
POST .../rpc/get_my_broadcasts 404 (Not Found)
```

**This is because the announcement system database hasn't been set up yet!**

---

## ✅ SOLUTION: Run SQL Migration NOW

### Step-by-Step Instructions:

#### 1. Open Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Log in to your account
- Select your project: `pvlnhwsooclbarfhieep`

#### 2. Navigate to SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"** button

#### 3. Copy & Paste Migration
- Open file: `broadcast-system-setup.sql` in your project
- **SELECT ALL** (Ctrl+A or Cmd+A)
- **COPY** all 648 lines
- **PASTE** into Supabase SQL Editor

#### 4. Run the Migration
- Click the **"RUN"** button (or press Ctrl+Enter)
- Wait for execution (should take 2-5 seconds)
- Look for success message:
  ```
  ✅ Broadcast system setup complete!
  All tables, indexes, RLS policies, and RPC functions created successfully.
  ```

#### 5. Verify Installation
Run this query to verify:
```sql
-- Check if RPC functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%broadcast%'
ORDER BY routine_name;
```

You should see 6 functions:
- acknowledge_broadcast
- get_broadcast_analytics
- get_broadcast_recipients
- get_my_broadcasts
- get_unread_broadcasts_count
- mark_broadcast_as_read

#### 6. Refresh Your App
- Go back to your app: https://wavesyncdev.netlify.app
- **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
- The 404 errors should be gone!

---

## 🔍 Why This Is Happening

The announcement system code is deployed to Netlify, but the database schema hasn't been created yet in Supabase. It's like building a house (frontend) without laying the foundation (database).

**The migration creates:**
- 2 database tables (`broadcasts`, `broadcast_reads`)
- 6 RPC functions (the ones returning 404)
- Security policies (RLS)
- Performance indexes

---

## ⚠️ Additional Issue: Profile Timeout

You're also seeing:
```
❌ Error fetching user profile: Profile fetch timeout
```

This might resolve after the SQL migration, but if it persists, check:
1. Supabase project is not paused/sleeping
2. Network connection is stable
3. Supabase API keys are correct

---

## 📝 After Migration Checklist

Once migration is complete:

- [ ] Refresh browser (hard refresh)
- [ ] No more 404 errors for RPC functions
- [ ] Can navigate to Announcements page
- [ ] Can create announcements (as admin/company user)
- [ ] Unread count badge appears in navigation
- [ ] Test creating a broadcast
- [ ] Test marking as read
- [ ] Test acknowledgment

---

## 🆘 If You Still See Errors

1. **Clear browser cache**
   - Ctrl+Shift+Delete (Chrome/Edge)
   - Clear all cached files

2. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Look for any SQL errors

3. **Verify RPC functions exist**
   - Run the verification query above
   - Should return 6 rows

4. **Check environment variables**
   - Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
   - Redeploy if needed

---

## 🎯 Bottom Line

**YOU CANNOT USE THE ANNOUNCEMENT SYSTEM UNTIL THE SQL MIGRATION IS RUN!**

The frontend code is ready ✅  
The database is empty ❌  

**Fix:** Run `broadcast-system-setup.sql` in Supabase SQL Editor **NOW**

---

**This will take you 2 minutes and fix all the 404 errors.**

