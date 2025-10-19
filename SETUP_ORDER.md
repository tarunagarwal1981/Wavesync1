# Document Expiry System - Setup Order

## ⚠️ IMPORTANT: Run Scripts in This Order!

### Step 1: Run Main Setup Script FIRST ✅
**File:** `document-expiry-system.sql`

This script creates:
- The `document_expiry_status` enum
- All the functions (get_days_until_expiry, get_document_expiry_status, etc.)
- Database triggers and RLS policies

**How to run:**
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **"New query"**
4. Copy and paste the **entire contents** of `document-expiry-system.sql`
5. Click **"Run"** or press `Ctrl+Enter`
6. Wait for "Success. No rows returned"
7. You should see notices like:
   ```
   NOTICE: ====================================================
   NOTICE: DOCUMENT EXPIRY SYSTEM SETUP COMPLETE!
   NOTICE: ====================================================
   ```

### Step 2: Run Test Data Script SECOND ✅
**File:** `test-document-expiry.sql`

This script:
- Uses the functions created in Step 1
- Creates 11 test documents with various expiry dates
- Tests the functions
- Creates notifications

**How to run:**
1. In Supabase SQL Editor
2. Click **"New query"**
3. Copy and paste the **entire contents** of `test-document-expiry.sql`
4. Click **"Run"** or press `Ctrl+Enter`
5. You should see output like:
   ```
   NOTICE: ====================================================
   NOTICE: Using Seafarer ID: ...
   NOTICE: Using Company ID: ...
   NOTICE: ====================================================
   NOTICE: TESTING EXPIRY STATUS CALCULATIONS
   NOTICE: ...
   NOTICE: TEST DATA CREATED SUCCESSFULLY!
   ```

### Step 3: Test the UI ✅

1. **Login as Company User**
2. **Navigate to Expiry Dashboard**
   - Click "Document Expiry" in sidebar (⚠️ icon)
   - URL: `/expiry-dashboard`
3. **Verify the data:**
   - Summary cards show counts
   - Document list displays test documents
   - Status badges are color-coded
   - Filters work

### Step 4: Check Notifications ✅

1. Click the **Bell icon** in header
2. You should see notifications for:
   - Expired documents
   - Documents expiring urgently
   - Documents expiring soon

---

## Troubleshooting

### Error: "function get_days_until_expiry does not exist"
**Solution:** You haven't run Step 1 yet. Run `document-expiry-system.sql` first.

### Error: "No seafarer user found"
**Solution:** Create at least one seafarer and one company user in your system before running the test data script.

### Error: "enum type document_expiry_status does not exist"
**Solution:** Run `document-expiry-system.sql` completely. Make sure it finishes without errors.

### No data showing in dashboard
**Solution:** 
1. Verify Step 1 completed successfully
2. Verify Step 2 completed successfully
3. Check that you're logged in as the correct company user
4. Check browser console for errors

---

## Quick Verification

After running both scripts, verify the setup:

```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%expir%'
ORDER BY routine_name;

-- Should return:
-- check_expiring_documents
-- get_company_expiry_summary
-- get_days_until_expiry
-- get_document_expiry_status
-- get_expiring_documents_for_company
-- get_my_expiring_documents
-- notify_expiring_documents

-- Check if test documents were created
SELECT COUNT(*) FROM documents WHERE filename LIKE '%EXPIRED%' OR filename LIKE '%Expiring%';
-- Should return: 11 (if test data was loaded)

-- Test a function manually
SELECT get_document_expiry_status('2025-11-15'::date);
-- Should return: expiring_soon
```

---

## Summary

1. ✅ Run `document-expiry-system.sql` (creates functions)
2. ✅ Run `test-document-expiry.sql` (creates test data)
3. ✅ Test in UI (login as company user)
4. ✅ Done!


