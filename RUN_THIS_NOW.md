# 🚨 RUN THIS NOW TO FIX BUTTONS

## The Problem
Your diagnostic query shows 2 functions are **MISSING**:
- ❌ `acknowledge_broadcast`
- ❌ `mark_broadcast_as_read`

**This is why the Acknowledge and Dismiss buttons return 404 errors.**

---

## The Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project: `pvlnhwsooclbarfhieep`
3. Click **"SQL Editor"** in left sidebar
4. Click **"+ New Query"**

### Step 2: Copy the SQL Script
1. Open file: **`fix-missing-rpc-functions.sql`** (in your project)
2. **Select ALL** (Ctrl+A or Cmd+A)
3. **Copy** (Ctrl+C or Cmd+C)

### Step 3: Paste and Run
1. **Paste** into the Supabase SQL Editor
2. Click the green **"RUN"** button (or press F5)

### Step 4: Verify Success
You should see this output:
```
function_name            | status
------------------------ | -------------------
acknowledge_broadcast    | Created successfully!
mark_broadcast_as_read   | Created successfully!
```

### Step 5: Test the Buttons
1. Go back to your app
2. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. Navigate to Announcements
4. Click on an announcement
5. Try the **Acknowledge** button
6. Try the **Dismiss** button

✅ **Both buttons should now work without 404 errors!**

---

## Verification

After running the script, run this query to verify:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('acknowledge_broadcast', 'mark_broadcast_as_read')
ORDER BY routine_name;
```

**Expected output:**
```
routine_name
--------------------------
acknowledge_broadcast
mark_broadcast_as_read
```

Both functions should appear!

---

## What the Script Does

The script creates two RPC functions:

1. **`mark_broadcast_as_read(broadcast_id)`**
   - Marks an announcement as read
   - Used by the "Dismiss" button

2. **`acknowledge_broadcast(broadcast_id)`**
   - Marks an announcement as acknowledged
   - Used by the "Acknowledge" button

Both functions include:
- ✅ Security checks
- ✅ Error handling
- ✅ Proper permissions for `authenticated` users

---

## After Running the Script

1. ✅ Acknowledge button will work
2. ✅ Dismiss button will work
3. ✅ No more 404 errors
4. ✅ Announcements can be marked as read
5. ✅ Critical banner will dismiss properly

---

## Still See Errors?

If you still see 404 errors after running the script:

1. **Verify functions were created** (use query above)
2. **Hard refresh browser** (Ctrl+Shift+R)
3. **Clear browser cache completely**
4. **Check Supabase logs** for the successful POST requests

---

**⏱️ Time required: 2 minutes**

**🎯 This will fix the buttons 100%**

