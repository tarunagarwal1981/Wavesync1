# 📊 Analytics & Reporting System - Setup Guide

## 🎯 Overview

This guide will walk you through setting up the complete analytics and reporting system for WaveSync Maritime Platform.

## 📋 Prerequisites

- ✅ Supabase project set up
- ✅ Database tables created (crew, documents, tasks, assignments, vessels)
- ✅ Company user account
- ✅ Some test data in the system

## 🚀 Step-by-Step Setup

### **Step 1: Deploy Database Functions**

1. Open **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste contents of `analytics-functions.sql`
5. Click **Run**

**Expected Output:**
```
====================================================
ANALYTICS FUNCTIONS CREATED SUCCESSFULLY!
====================================================
Created functions:
  - get_crew_statistics
  - get_crew_availability_trend
  - get_document_statistics
  - get_document_upload_trend
  - get_task_statistics
  - get_task_completion_trend
  - get_assignment_statistics
  - get_assignment_trend
  - get_vessel_statistics
  - get_dashboard_analytics
====================================================
```

### **Step 2: Verify Functions**

Run this test query:

```sql
-- Test with your company_id
SELECT get_dashboard_analytics('YOUR-COMPANY-UUID-HERE');
```

**Expected Result:**
A JSON object with all analytics data:
```json
{
  "crew": { "total_crew": 25, "available": 12, ... },
  "documents": { "total_documents": 150, "compliance_rate": 85, ... },
  "tasks": { "total_tasks": 50, "completion_rate": 70, ... },
  "assignments": { "total_assignments": 30, ... },
  "vessels": { "total_vessels": 5, ... },
  "generated_at": "2025-10-19T10:30:00Z"
}
```

### **Step 3: Test the UI**

1. **Login** to WaveSync as a **company user**
2. Look for **"Analytics & Reports"** in the sidebar
3. Click on it
4. You should see the analytics dashboard load!

### **Step 4: Verify Charts**

The dashboard should show:
- ✅ 4 stat cards at the top (Crew, Documents, Tasks, Vessels)
- ✅ 2 pie charts (Crew Status, Document Compliance)
- ✅ 2 bar charts (Crew by Rank, Tasks by Priority)
- ✅ 2 data tables (Task Breakdown, Assignment Stats)

### **Step 5: Test Export**

1. Click **"Export PDF"** button
2. A PDF should download with all your analytics
3. Click **"Export CSV"** button
4. A CSV file should download with structured data

## 🧪 Testing with Sample Data

If you don't have enough data, here's a quick script to add some test records:

### **Add Test Crew Data**

```sql
-- This assumes you have a company_id
DO $$
DECLARE
  test_company_id UUID := 'YOUR-COMPANY-UUID-HERE';
  ranks TEXT[] := ARRAY['Captain', 'Chief Engineer', 'Second Officer', 'Able Seaman', 'Cook'];
  statuses availability_status[] := ARRAY['available'::availability_status, 'on_assignment'::availability_status, 'on_leave'::availability_status];
  i INT;
BEGIN
  FOR i IN 1..20 LOOP
    -- Insert user profile
    INSERT INTO user_profiles (
      id,
      email,
      full_name,
      user_type,
      company_id
    ) VALUES (
      uuid_generate_v4(),
      'testcrew' || i || '@example.com',
      'Test Crew ' || i,
      'seafarer',
      test_company_id
    )
    RETURNING id INTO test_user_id;

    -- Insert seafarer profile
    INSERT INTO seafarer_profile (
      user_id,
      rank,
      experience_years,
      availability_status
    ) VALUES (
      test_user_id,
      ranks[1 + (i % 5)],
      2 + (i % 10),
      statuses[1 + (i % 3)]
    );
  END LOOP;

  RAISE NOTICE 'Created 20 test crew members!';
END $$;
```

### **Add Test Documents**

```sql
-- Add test documents for compliance analytics
DO $$
DECLARE
  test_company_id UUID := 'YOUR-COMPANY-UUID-HERE';
  test_user_id UUID;
  doc_types TEXT[] := ARRAY['Passport', 'STCW Certificate', 'Medical Certificate', 'Seamans Book', 'Visa'];
  i INT;
BEGIN
  -- Get a seafarer from this company
  SELECT id INTO test_user_id
  FROM user_profiles
  WHERE company_id = test_company_id AND user_type = 'seafarer'
  LIMIT 1;

  FOR i IN 1..30 LOOP
    INSERT INTO documents (
      user_id,
      document_type,
      filename,
      file_path,
      file_size,
      mime_type,
      status,
      expiry_date
    ) VALUES (
      test_user_id,
      doc_types[1 + (i % 5)],
      'test-doc-' || i || '.pdf',
      'documents/test-' || i || '.pdf',
      102400,
      'application/pdf',
      'approved',
      CASE
        WHEN i % 4 = 0 THEN NOW() - INTERVAL '10 days'  -- Expired
        WHEN i % 4 = 1 THEN NOW() + INTERVAL '15 days'  -- Expiring urgent
        WHEN i % 4 = 2 THEN NOW() + INTERVAL '45 days'  -- Expiring soon
        ELSE NOW() + INTERVAL '180 days'                 -- Valid
      END
    );
  END LOOP;

  RAISE NOTICE 'Created 30 test documents!';
END $$;
```

### **Add Test Tasks**

```sql
-- Add test tasks for task analytics
DO $$
DECLARE
  test_company_id UUID := 'YOUR-COMPANY-UUID-HERE';
  seafarer_id UUID;
  company_user_id UUID;
  categories task_category[] := ARRAY['document_upload'::task_category, 'training'::task_category, 'medical'::task_category, 'compliance'::task_category];
  priorities task_priority[] := ARRAY['urgent'::task_priority, 'high'::task_priority, 'medium'::task_priority, 'low'::task_priority];
  statuses task_status[] := ARRAY['pending'::task_status, 'in_progress'::task_status, 'completed'::task_status];
  i INT;
BEGIN
  -- Get IDs
  SELECT id INTO seafarer_id FROM user_profiles WHERE company_id = test_company_id AND user_type = 'seafarer' LIMIT 1;
  SELECT id INTO company_user_id FROM user_profiles WHERE company_id = test_company_id AND user_type = 'company' LIMIT 1;

  FOR i IN 1..50 LOOP
    INSERT INTO tasks (
      title,
      description,
      category,
      priority,
      status,
      assigned_to,
      assigned_by,
      company_id,
      due_date,
      completed_at
    ) VALUES (
      'Test Task ' || i,
      'This is a test task for analytics',
      categories[1 + (i % 4)],
      priorities[1 + (i % 4)],
      statuses[1 + (i % 3)],
      seafarer_id,
      company_user_id,
      test_company_id,
      NOW() + (i || ' days')::INTERVAL,
      CASE WHEN statuses[1 + (i % 3)] = 'completed' THEN NOW() - (i || ' days')::INTERVAL ELSE NULL END
    );
  END LOOP;

  RAISE NOTICE 'Created 50 test tasks!';
END $$;
```

## 🔍 Troubleshooting

### **Problem: Analytics page is blank**

**Solutions:**
1. Check browser console for errors
2. Verify you're logged in as a **company user** (not seafarer)
3. Check that `analytics-functions.sql` was run successfully
4. Verify your company_id exists in `user_profiles` table

### **Problem: "Failed to load analytics data" error**

**Solutions:**
1. Open browser console and check error message
2. Run this query to check permissions:
   ```sql
   SELECT * FROM pg_proc WHERE proname LIKE 'get_%_statistics';
   ```
3. Verify RLS policies aren't blocking the query
4. Check that you have data in your tables

### **Problem: Charts show no data**

**Solutions:**
1. Verify you have data in the relevant tables:
   ```sql
   SELECT COUNT(*) FROM user_profiles WHERE user_type = 'seafarer';
   SELECT COUNT(*) FROM documents;
   SELECT COUNT(*) FROM tasks;
   ```
2. Check that data belongs to your company:
   ```sql
   SELECT COUNT(*) FROM user_profiles WHERE company_id = 'YOUR-COMPANY-ID';
   ```
3. Use the test data scripts above to populate tables

### **Problem: PDF export fails**

**Solutions:**
1. Check browser console for errors
2. Verify jsPDF and autoTable are installed:
   ```bash
   npm list jspdf jspdf-autotable
   ```
3. Try exporting with less data first
4. Check browser popup blocker isn't blocking download

### **Problem: CSV export shows incorrect data**

**Solutions:**
1. Check that analytics data is loading correctly first
2. Verify the structure of your analytics response
3. Look for console errors during CSV generation

## 📊 Understanding the Data

### **Crew Statistics**

| Metric | Description | Formula |
|--------|-------------|---------|
| Total Crew | All seafarers for company | COUNT(user_profiles WHERE user_type='seafarer') |
| Available | Crew available for assignment | COUNT WHERE availability_status='available' |
| On Assignment | Crew currently assigned | COUNT WHERE availability_status='on_assignment' |
| On Leave | Crew on leave | COUNT WHERE availability_status='on_leave' |

### **Document Compliance**

| Metric | Description | Good Target |
|--------|-------------|-------------|
| Compliance Rate | % of valid documents | > 90% |
| Expired | Documents past expiry | 0 |
| Expiring Urgent | < 30 days | < 5% |
| Expiring Soon | 30-90 days | < 15% |

### **Task Management**

| Metric | Description | Good Target |
|--------|-------------|-------------|
| Completion Rate | % of completed tasks | > 80% |
| Overdue | Tasks past due date | < 5% |
| Avg Completion Time | Days to complete | < 7 days |

### **Assignment Statistics**

| Metric | Description | Good Target |
|--------|-------------|-------------|
| Acceptance Rate | % of accepted assignments | > 85% |
| Pending | Awaiting response | < 20% |

## 🎨 Customization

### **Change Chart Colors**

Edit `src/components/AnalyticsDashboard.tsx`:

```typescript
const COLORS = {
  primary: '#667eea',      // Your primary color
  secondary: '#764ba2',    // Your secondary color
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber
  error: '#ef4444',        // Red
  info: '#3b82f6',         // Blue
};
```

### **Add Custom Metrics**

1. **Add SQL function** in `analytics-functions.sql`:
```sql
CREATE OR REPLACE FUNCTION get_custom_metric(p_company_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'your_metric', COUNT(*)
    FROM your_table
    WHERE company_id = p_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. **Update master function** to include it:
```sql
-- In get_dashboard_analytics function
SELECT json_build_object(
  'crew', get_crew_statistics(p_company_id),
  'documents', get_document_statistics(p_company_id),
  'tasks', get_task_statistics(p_company_id),
  'assignments', get_assignment_statistics(p_company_id),
  'vessels', get_vessel_statistics(p_company_id),
  'custom', get_custom_metric(p_company_id),  -- ADD THIS
  'generated_at', NOW()
) INTO result;
```

3. **Add to component** in `AnalyticsDashboard.tsx`:
```typescript
interface AnalyticsData {
  crew: any;
  documents: any;
  tasks: any;
  assignments: any;
  vessels: any;
  custom: any;  // ADD THIS
  generated_at: string;
}
```

### **Add New Chart**

```typescript
// Prepare data
const customData = analytics.custom
  ? Object.entries(analytics.custom).map(([name, value]) => ({
      name,
      value
    }))
  : [];

// Add to JSX
<div className={styles.chartCard}>
  <h3 className={styles.chartTitle}>Your Custom Chart</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={customData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill={COLORS.primary} />
    </BarChart>
  </ResponsiveContainer>
</div>
```

## ✅ Verification Checklist

- [ ] SQL functions created in Supabase
- [ ] Test query returns data
- [ ] Analytics page loads without errors
- [ ] All 4 stat cards show numbers
- [ ] All charts render with data
- [ ] PDF export downloads successfully
- [ ] CSV export downloads successfully
- [ ] Refresh button updates data
- [ ] Page is responsive on mobile
- [ ] No console errors

## 🎓 Next Steps

1. **Populate with real data** from your operations
2. **Share reports** with stakeholders (PDF exports)
3. **Monitor trends** over time
4. **Set up alerts** for metrics that need attention
5. **Customize metrics** for your specific needs

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review browser console for error messages
3. Verify SQL functions are created correctly
4. Check that you have appropriate test data

---

**You're all set!** 🎉 Your analytics dashboard is ready to provide insights into your maritime operations!

Navigate to `/analytics` and start exploring your data! 📊⚓

