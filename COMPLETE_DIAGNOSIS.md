# 🔍 COMPLETE BROADCAST SYSTEM DIAGNOSIS

## 🚨 **PRIMARY ISSUE: React Hooks Error in RoleBasedSidebar**

### **Error:**
```
Error: Minified React error #310
at RoleBasedSidebar.tsx:54:30
```

### **Cause:**
The `useMemo` hook in `RoleBasedSidebar.tsx` is called AFTER conditional returns, which violates React's Rules of Hooks. When profile is loading but then loads, the number of hooks changes, causing the crash.

### **Status:**
✅ **FIXED in local code** but ❌ **NOT YET DEPLOYED**

The error shows bundle: `index-ce9c28e6.js` (OLD version)
Your fix is in the codebase but Netlify hasn't deployed it yet.

---

## 🔧 **SECONDARY ISSUE: Missing RPC Functions**

### **Missing Functions:**
- ❌ `acknowledge_broadcast`
- ❌ `mark_broadcast_as_read`

### **Impact:**
- Acknowledge button returns 404
- Dismiss button returns 404
- Critical banner cannot be dismissed

### **Fix:**
Run `fix-missing-rpc-functions.sql` in Supabase SQL Editor

---

## 📊 **OTHER ISSUES FOUND**

### **1. WebSocket Connection Failure**
```
WebSocket connection to 'wss://...' failed
WebSocket is closed before the connection is established
```

**Cause:** Real-time subscriptions failing when:
- Tables don't exist (`broadcasts`, `broadcast_reads`)
- Or network/firewall blocking WebSocket

**Impact:** Non-critical - polling still works (every 30 seconds)

**Fix:** Already handled gracefully in code with `isAvailable` flag

---

### **2. Profile Fetch Timeout**
```
❌ Error fetching user profile: Profile fetch timeout
⚠️ Could not fetch profile, continuing without profile data
```

**Causes:**
- Supabase query taking > 15 seconds (check `user_profiles` table size/indexes)
- Network latency to Supabase
- Database connection pool exhaustion

**Impact:** Medium - causes temporary "undefined" user type, triggering SeafarerDashboard render when should be AdminDashboard

**Recommendation:**
1. Check Supabase performance metrics
2. Add index on `user_profiles(id)` if missing
3. Increase timeout in `SupabaseAuthContext.tsx`

---

### **3. Potential Dependency Loop in useEffect**

In `useUnreadAnnouncements.ts` and `CriticalAnnouncementBanner.tsx`:

```typescript
useEffect(() => {
  // ...
}, [user, isAvailable]); // ⚠️ isAvailable is updated inside this effect
```

**Issue:** `isAvailable` state is set inside the effect, but it's also a dependency. This could cause:
- Effect re-runs when `isAvailable` changes
- But `isAvailable` only changes from `true` to `false`, so it's safe
- However, it's not ideal practice

**Current Status:** ✅ Safe but not optimal

**Improvement:**
```typescript
useEffect(() => {
  if (!user) return;
  // ...
}, [user]); // Remove isAvailable from dependencies
```

---

### **4. Real-time Subscription Cleanup**

**Current:** ✅ Proper cleanup
- All intervals are cleared
- All channels are removed
- `isMounted` flag prevents state updates after unmount

**No issues found** ✓

---

### **5. Polling Intervals**

**Current Setup:**
- `AnnouncementsPage`: 5 seconds
- `useUnreadAnnouncements`: 30 seconds
- `CriticalAnnouncementBanner`: 30 seconds

**Issue:** None, but could be optimized

**Recommendation:** Consider using only real-time subscriptions once WebSocket is working, disable polling

---

## 🎯 **ROOT CAUSE OF "SOMETHING WENT WRONG" PAGE**

### **The Flow:**

1. **User logs in** → `admin@wavesync.com`
2. **Profile fetch times out** → Profile is `undefined` for 15 seconds
3. **DashboardRouter renders** with `user_type: undefined`
4. **Renders SeafarerDashboard** (default) instead of AdminDashboard
5. **RoleBasedSidebar is called** with `profile: undefined`
6. **useMemo tries to access `profile.user_type`** → CRASH
7. **ErrorBoundary catches error** → Shows "Something Went Wrong"

### **Why It Shows After "Some Time":**

The profile eventually loads (after timeout or second attempt), which triggers a re-render. If the timing is bad, the `useMemo` dependencies change during the re-render, causing the hooks error.

---

## ✅ **SOLUTIONS (In Priority Order)**

### **1. Deploy the RoleBasedSidebar Fix**

**Status:** Code is ready, needs deployment

**Action:**
```bash
git add .
git commit -m "fix: Prevent hooks error in RoleBasedSidebar when profile loads"
git push
```

Wait 2-3 minutes for Netlify deployment.

---

### **2. Create Missing RPC Functions**

**Action:** Run `fix-missing-rpc-functions.sql` in Supabase SQL Editor

**Impact:** Fixes Acknowledge/Dismiss buttons immediately

---

### **3. Optimize Profile Fetching**

**Check:**
1. Supabase Dashboard → Database → Performance
2. Check if `user_profiles` table has index on `id` column
3. Check query execution time

**If slow, add index:**
```sql
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
```

---

### **4. Increase Timeout (Optional)**

In `SupabaseAuthContext.tsx`, increase timeout from 15s to 30s if needed:

```typescript
const timeoutId = setTimeout(() => {
  isTimedOut = true;
  reject(new Error('Profile fetch timeout'));
}, 30000); // Increased from 15000
```

---

## 📋 **TESTING CHECKLIST**

After deploying fixes:

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Login as admin
- [ ] Verify no "Something Went Wrong" page
- [ ] Navigate to Announcements
- [ ] Click Acknowledge button - should work
- [ ] Click Dismiss button - should work
- [ ] Check console - no React errors
- [ ] Check Supabase logs - 200 responses for RPC calls

---

## 🔄 **MONITORING**

After fixes are live, monitor:

1. **Netlify Logs** - Check for successful deployment
2. **Browser Console** - No React errors
3. **Supabase Logs** - API calls returning 200, not 404
4. **Performance** - Profile fetch time < 5 seconds

---

## 📝 **SUMMARY**

| Issue | Severity | Status | Action |
|-------|----------|--------|--------|
| React Hooks Error | 🔴 Critical | Fixed locally | Deploy now |
| Missing RPC Functions | 🔴 Critical | Not fixed | Run SQL script |
| Profile Timeout | 🟡 Medium | Ongoing | Optimize DB |
| WebSocket Failure | 🟢 Low | Handled gracefully | No action needed |
| Dependency Loop | 🟢 Low | Safe as-is | Optimize later |

---

## 🚀 **IMMEDIATE ACTIONS**

1. ✅ Run `fix-missing-rpc-functions.sql` in Supabase (2 min)
2. ✅ Deploy RoleBasedSidebar fix: `git push` (2 min)
3. ✅ Hard refresh browser (10 sec)
4. ✅ Test buttons (1 min)

**Total time: ~5 minutes to fix everything**

---

**Once these are done, the system should work perfectly!**

