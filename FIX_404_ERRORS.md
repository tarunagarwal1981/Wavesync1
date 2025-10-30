# 🔧 Fix 404 Errors - Missing RPC Functions

## 🚨 Problem

You're seeing these errors in the console:
```
POST .../rpc/acknowledge_broadcast 404 (Not Found)
POST .../rpc/mark_broadcast_as_read 404 (Not Found)
```

**Cause:** The SQL migration file didn't run completely. The tables were created, but some RPC functions are missing.

---

## ✅ Quick Fix (2 minutes)

### Step 1: Run the Fix Script

1. **Open Supabase Dashboard** → https://supabase.com/dashboard
2. **Go to SQL Editor** (left sidebar)
3. **Click "+ New Query"**
4. **Copy & Paste** the entire contents of `fix-missing-rpc-functions.sql`
5. **Click RUN** (or press F5)

You should see:
```
function_name            | status
------------------------ | -------------------
acknowledge_broadcast    | Created successfully!
mark_broadcast_as_read   | Created successfully!
```

### Step 2: Refresh Your App

1. Go back to your WaveSync app
2. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Try clicking **Dismiss** or **Acknowledge** buttons again

✅ **Should work now!**

---

## 🔍 Verify All Functions Exist

After running the fix, verify all 6 RPC functions exist:

**Run this in Supabase SQL Editor:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%broadcast%'
ORDER BY routine_name;
```

**Expected output (6 functions):**
1. ✅ acknowledge_broadcast
2. ✅ get_broadcast_analytics
3. ✅ get_broadcast_recipients
4. ✅ get_my_broadcasts
5. ✅ get_unread_broadcasts_count
6. ✅ mark_broadcast_as_read

If you see all 6, you're good! ✅

If you're missing more than these 2, run the **full migration** (`broadcast-system-setup.sql`) again.

---

## 🧪 Test the Buttons

After the fix:

1. **Navigate to Announcements** page
2. **Click on any announcement**
3. **Try the buttons:**
   - ✅ "Mark as Read" - Should mark announcement as read
   - ✅ "Acknowledge" - Should acknowledge announcement
   - ✅ "Dismiss" (on banner) - Should dismiss the critical banner

All buttons should work without 404 errors!

---

## 🔄 Alternative: Re-run Full Migration

If you prefer to re-run the complete migration:

1. Open `broadcast-system-setup.sql`
2. Copy all 648 lines
3. Paste in Supabase SQL Editor
4. Run

**Note:** The migration is idempotent (safe to run multiple times). It will:
- Drop and recreate policies
- Replace functions
- Not duplicate data

---

## 📝 Why This Happened

Possible reasons the functions were missing:

1. **Partial execution** - SQL script was interrupted
2. **Error midway** - An error occurred during execution
3. **Copy/paste issue** - Not all lines were copied
4. **Timeout** - Supabase SQL Editor timed out

**The fix script ensures only the missing functions are added.**

---

## ✅ Success Checklist

- [ ] Ran `fix-missing-rpc-functions.sql`
- [ ] Saw "Created successfully!" message
- [ ] Hard refreshed the app
- [ ] Tested "Acknowledge" button - works!
- [ ] Tested "Dismiss" button - works!
- [ ] No more 404 errors in console

---

**Estimated time: 2 minutes**

