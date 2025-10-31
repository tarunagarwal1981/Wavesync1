# 🔧 Fix All Issues - Complete Guide

## 🚨 Current Issues

### 1. **404 Errors - Missing RPC Functions** ❌
```
POST .../rpc/mark_broadcast_as_read 404 (Not Found)
POST .../rpc/acknowledge_broadcast 404 (Not Found)
```

### 2. **React Hooks Error** ❌
```
Error: Rendered fewer hooks than expected
in RoleBasedSidebar component
```

### 3. **Dismiss/Acknowledge Buttons Not Working** ❌
Buttons don't work because the RPC functions don't exist.

---

## ✅ **FIX 1: Run SQL Script for Missing RPC Functions**

**This is the MAIN fix that will make the buttons work!**

### Steps:
1. Open **Supabase Dashboard** → https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **"+ New Query"**
4. Open file: **`fix-missing-rpc-functions.sql`**
5. **Copy ALL contents**
6. **Paste** into SQL Editor
7. Click **RUN** (or press F5)

### Expected Output:
```
function_name            | status
------------------------ | -------------------
acknowledge_broadcast    | Created successfully!
mark_broadcast_as_read   | Created successfully!
```

### ✅ Verification:
Run this query to verify all 6 functions exist:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%broadcast%'
ORDER BY routine_name;
```

**Should show 6 functions:**
1. ✅ acknowledge_broadcast
2. ✅ get_broadcast_analytics
3. ✅ get_broadcast_recipients
4. ✅ get_my_broadcasts
5. ✅ get_unread_broadcasts_count
6. ✅ mark_broadcast_as_read

---

## ✅ **FIX 2: React Hooks Error (Already Fixed)**

The code has been fixed to ensure all hooks are called before any conditional returns.

**File fixed:** `src/components/layout/RoleBasedSidebar.tsx`

The hooks (`useAuth`, `useUnreadAnnouncements`) are now called at the top of the component, before any conditional returns.

---

## ✅ **FIX 3: Missing Key Props (Already Fixed)**

All `.map()` calls in `AnnouncementsPage.tsx` already have `key` props:
- Line 354: `pinnedBroadcasts.map(broadcast => <AnnouncementCard key={broadcast.id} ...`
- Line 377: `regularBroadcasts.map(broadcast => <AnnouncementCard key={broadcast.id} ...`

---

## 🚀 **After Running SQL Fix**

### 1. **Refresh Your App**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache if needed

### 2. **Test the Buttons**
- ✅ **Acknowledge** button should work
- ✅ **Dismiss** button should work
- ✅ **Mark as Read** should work
- ✅ No more 404 errors in console

### 3. **Verify No More Errors**
- ✅ No React Hooks errors
- ✅ No 404 errors
- ✅ Buttons are functional
- ✅ App loads successfully

---

## 📝 **Summary**

| Issue | Status | Action Required |
|-------|--------|----------------|
| 404 RPC Errors | ❌ | **Run `fix-missing-rpc-functions.sql`** |
| React Hooks Error | ✅ | Already fixed in code |
| Missing Key Props | ✅ | Already have keys |
| Infinite Loop | ✅ | Already fixed with `isMounted` flag |

---

## ⚡ **Quick Fix (2 minutes)**

**Just run the SQL script and refresh!**

1. Copy `fix-missing-rpc-functions.sql`
2. Paste in Supabase SQL Editor
3. Click RUN
4. Refresh browser

**That's it!** 🎉

---

## 🔍 **If Buttons Still Don't Work**

1. **Verify RPC functions exist** (use verification query above)
2. **Check browser console** for any new errors
3. **Clear browser cache** completely
4. **Check Supabase logs** for any RPC execution errors
5. **Verify user has `authenticated` role** in Supabase

---

## 📞 **Still Having Issues?**

1. Run the verification query to confirm all 6 functions exist
2. Check Supabase → Logs → API logs for any errors
3. Verify your Supabase project is not paused
4. Try creating a test announcement and see if it appears

---

**Estimated time to fix: 2 minutes** ⏱️

