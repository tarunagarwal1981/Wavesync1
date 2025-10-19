# Document Expiry & Compliance System - Testing Guide

## Overview
The Document Expiry System automatically tracks certificate expiration dates, provides visual indicators, and sends notifications to seafarers and companies when documents are expiring or expired.

## Features Implemented

### 1. **Database Functions** ✅
- `get_document_expiry_status(date)` - Calculate expiry status
- `get_days_until_expiry(date)` - Get days remaining
- `check_expiring_documents()` - Check and notify expiring documents
- `get_company_expiry_summary(company_id)` - Get company compliance overview
- `get_expiring_documents_for_company(company_id, status)` - Get filtered expiring documents
- `get_my_expiring_documents()` - Get seafarer's expiring documents
- `notify_expiring_documents(days)` - Bulk notification trigger

### 2. **Expiry Dashboard (Company View)** ✅
- Real-time compliance summary cards showing:
  - Expired documents count
  - Expiring urgent (< 30 days)
  - Expiring soon (30-90 days)
  - Valid documents
- Filterable document list by status
- Visual indicators with color-coded badges
- Seafarer identification
- Days until expiry countdown
- Quick navigation to seafarer documents

### 3. **Enhanced Document Management** ✅
- Expiry status badges on all documents
- Color-coded visual indicators:
  - 🔴 **Red** - Expired
  - 🟠 **Orange** - Expiring urgent (< 30 days)
  - 🟡 **Yellow** - Expiring soon (30-90 days)
  - 🟢 **Green** - Valid (> 90 days)
  - ⚪ **Gray** - No expiry date
- Human-readable expiry text (e.g., "Expires in 15 days")

### 4. **Navigation** ✅
- Added "Document Expiry" link to company sidebar
- Route: `/expiry-dashboard`
- Icon: ⚠️ AlertTriangle

## Setup Instructions

### Step 1: Run SQL Setup Script

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Create a new query

2. **Run the setup script**
   ```sql
   -- Copy and paste the contents of document-expiry-system.sql
   -- Execute the script
   ```

3. **Verify functions were created**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name LIKE '%expir%';
   ```

   Expected results:
   - get_document_expiry_status
   - get_days_until_expiry
   - check_expiring_documents
   - get_company_expiry_summary
   - get_expiring_documents_for_company
   - get_my_expiring_documents
   - notify_expiring_documents

### Step 2: Add Test Documents with Expiry Dates

Run this script to add test documents with various expiry dates:

```sql
-- See test-document-expiry.sql for the complete test data script
```

### Step 3: Test the Features

#### A. Test Expiry Dashboard (Company User)

1. **Login as a Company User**
2. **Navigate to Expiry Dashboard**
   - Click "Document Expiry" in the sidebar
   - URL: `/expiry-dashboard`

3. **Verify Summary Cards**
   - Should show counts for:
     - Expired documents
     - Expiring urgent (< 30 days)
     - Expiring soon (30-90 days)
     - Valid documents

4. **Test Filters**
   - Click "All Documents" - shows all documents
   - Click "Expired" - shows only expired
   - Click "Urgent" - shows documents expiring within 30 days
   - Click "Expiring Soon" - shows documents expiring within 30-90 days

5. **Verify Document List**
   - Each document should show:
     - Status badge with color
     - Seafarer name
     - Document filename
     - Document type
     - Expiry date
     - Days remaining (or "Expired X days ago")
   - Click on a document row should navigate to seafarer's documents

#### B. Test Document Management (Company User)

1. **Navigate to Document Management**
   - URL: `/company/documents`

2. **Verify Expiry Badges**
   - Each document with an expiry date should show:
     - Date badge with formatted date
     - Status badge with countdown text
     - Color-coded based on urgency

3. **Upload a New Document**
   - Select a seafarer
   - Choose document type
   - Set expiry date (try different dates):
     - Past date (expired)
     - Date within 15 days (urgent)
     - Date within 60 days (expiring soon)
     - Date beyond 90 days (valid)
   - Upload and verify the badges appear correctly

#### C. Test Expiry Notifications

1. **Manual Check**
   ```sql
   SELECT * FROM check_expiring_documents();
   ```
   - Returns count of documents checked and notifications created

2. **Verify Notifications Were Created**
   ```sql
   SELECT * FROM notifications 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC;
   ```

3. **Test Bulk Notification**
   ```sql
   -- Notify all documents expiring within 60 days
   SELECT notify_expiring_documents(60);
   ```

#### D. Test Seafarer View

1. **Login as a Seafarer**
2. **Check Notifications**
   - Bell icon should show notification count
   - Open notifications panel
   - Should see expiry notifications for their documents

3. **View Documents**
   - Navigate to "My Documents"
   - Should see expiry badges on documents
   - Expired or expiring documents should be prominently highlighted

## Manual Testing Scenarios

### Scenario 1: Expired Certificate
```sql
-- Create a document that expired 5 days ago
INSERT INTO documents (
  user_id,
  filename,
  file_url,
  document_type,
  expiry_date,
  status
) VALUES (
  '<seafarer-user-id>',
  'EXPIRED_STCW_Certificate.pdf',
  'https://example.com/doc.pdf',
  'STCW Certificate',
  CURRENT_DATE - INTERVAL '5 days',
  'approved'
);

-- Run expiry check
SELECT * FROM check_expiring_documents();

-- Verify notification
SELECT * FROM notifications WHERE message LIKE '%EXPIRED_STCW%';
```

**Expected Result:**
- ❌ Red "Expired" badge
- Text: "Expired 5 days ago"
- Notification sent to seafarer and company
- Shows in "Expired" filter

### Scenario 2: Urgent Expiry (< 30 days)
```sql
-- Create a document expiring in 15 days
INSERT INTO documents (
  user_id,
  filename,
  file_url,
  document_type,
  expiry_date,
  status
) VALUES (
  '<seafarer-user-id>',
  'Medical_Certificate.pdf',
  'https://example.com/doc.pdf',
  'Medical Certificate',
  CURRENT_DATE + INTERVAL '15 days',
  'approved'
);
```

**Expected Result:**
- ⚠️ Orange "Expires Soon" badge
- Text: "Expires in 15 days"
- Shows in "Urgent" filter
- High priority visual indicator

### Scenario 3: Expiring Soon (30-90 days)
```sql
-- Create a document expiring in 45 days
INSERT INTO documents (
  user_id,
  filename,
  file_url,
  document_type,
  expiry_date,
  status
) VALUES (
  '<seafarer-user-id>',
  'Passport.pdf',
  'https://example.com/doc.pdf',
  'Passport',
  CURRENT_DATE + INTERVAL '45 days',
  'approved'
);
```

**Expected Result:**
- ⏰ Yellow "Expiring" badge
- Text: "Expires in 45 days"
- Shows in "Expiring Soon" filter
- Medium priority visual indicator

### Scenario 4: Valid Certificate (> 90 days)
```sql
-- Create a document expiring in 120 days
INSERT INTO documents (
  user_id,
  filename,
  file_url,
  document_type,
  expiry_date,
  status
) VALUES (
  '<seafarer-user-id>',
  'Training_Certificate.pdf',
  'https://example.com/doc.pdf',
  'Training Certificate',
  CURRENT_DATE + INTERVAL '120 days',
  'approved'
);
```

**Expected Result:**
- ✅ Green "Valid" badge
- Text: "Expires in 120 days"
- Normal display
- Low priority

## Automated Testing (Optional)

### Set Up Scheduled Job

If you have `pg_cron` extension enabled:

```sql
-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily check at 8 AM UTC
SELECT cron.schedule(
  'check-expiring-documents',
  '0 8 * * *',
  'SELECT check_expiring_documents()'
);

-- Verify scheduled jobs
SELECT * FROM cron.job;
```

### Alternative: Edge Function

Create a Supabase Edge Function to run daily:

```typescript
// supabase/functions/check-expiry/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase.rpc('check_expiring_documents');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ 
    success: true, 
    documents_checked: data[0]?.document_count,
    notifications_created: data[0]?.notifications_created
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## Troubleshooting

### Issue: Expiry badges not showing
**Solution:**
- Verify documents have `expiry_date` set
- Check browser console for errors
- Ensure `expiryHelpers.ts` is imported correctly

### Issue: Expiry dashboard shows zero counts
**Solution:**
- Verify company_id is set for documents
- Check that profile has company_id
- Run SQL query to verify data:
  ```sql
  SELECT d.*, up.company_id 
  FROM documents d
  JOIN user_profiles up ON d.user_id = up.id
  WHERE up.company_id = '<your-company-id>';
  ```

### Issue: Notifications not being created
**Solution:**
- Check that `check_expiring_documents()` runs without errors
- Verify notification table exists and is accessible
- Check that documents have users assigned
- Ensure RLS policies allow notification creation

### Issue: Functions not found
**Solution:**
- Re-run the `document-expiry-system.sql` script
- Check function ownership and permissions
- Verify functions exist:
  ```sql
  \df *expir*
  ```

## Next Steps

1. **Set up automated checking**
   - Configure pg_cron OR
   - Deploy Edge Function with daily trigger

2. **Customize notification frequency**
   - Modify the 7-day check interval in `check_expiring_documents()`
   - Add different notification thresholds

3. **Add email notifications**
   - Integrate with email service
   - Send email alerts for critical expiries

4. **Dashboard widgets**
   - Add expiry summary to main dashboard
   - Create expiry calendar view

5. **Reports**
   - Generate compliance reports
   - Export expiry data to Excel/PDF

## Support

If you encounter any issues:
1. Check the console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify all SQL functions are created
4. Ensure RLS policies are correctly configured
5. Check that user roles and permissions are set up

## Success Criteria

✅ SQL functions created without errors
✅ Expiry Dashboard accessible and showing data
✅ Document Management shows expiry badges
✅ Notifications are created for expiring documents
✅ Filters work correctly
✅ Visual indicators are color-coded appropriately
✅ Days countdown is accurate
✅ Expired documents show "Expired X days ago"

---

**System Status**: Ready for Production ✅
**Last Updated**: October 19, 2025

