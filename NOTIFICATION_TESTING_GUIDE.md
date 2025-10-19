# WaveSync Notification System - Testing Guide

## 🧪 Comprehensive Testing Checklist

This guide will help you test all aspects of the notification system to ensure it's working correctly.

---

## ✅ Phase 1: Database Setup Verification

### Step 1.1: Run the Notification Setup Script

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `notification-system-setup.sql`
3. Click "Run" to execute the script
4. **Expected Output:**
   ```
   ✅ Notification system setup completed successfully!
   📋 Created notification functions and triggers
   🔔 Set up sample notification templates
   👥 Created sample notifications for existing users
   ⚙️ Configured default notification preferences
   ```

### Step 1.2: Verify Database Objects

Run these queries in SQL Editor to verify:

#### Check Notification Functions:
```sql
-- Should return 3 functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%notification%'
AND routine_schema = 'public';
```

**Expected Results:**
- `create_notification`
- `create_company_notification`
- `create_seafarer_notification`

#### Check Triggers:
```sql
-- Should return 3 triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%notification%';
```

**Expected Results:**
- `assignment_notifications_trigger` on `assignments`
- `document_expiry_notifications_trigger` on `documents`
- `vessel_notifications_trigger` on `vessels`

#### Check Notification Templates:
```sql
-- Should return 8 templates
SELECT name, type, subject
FROM notification_templates
ORDER BY type, name;
```

**Expected Results:** 8 rows with templates like:
- assignment_created (success)
- assignment_updated (warning)
- document_expiring_7_days (error)
- etc.

#### Check Sample Notifications:
```sql
-- Should return notifications for your users
SELECT 
  n.title,
  n.message,
  n.type,
  n.read,
  up.full_name as recipient,
  up.user_type
FROM notifications n
JOIN user_profiles up ON n.user_id = up.id
ORDER BY n.created_at DESC;
```

**Expected Results:** Sample notifications for admin, company, and seafarer users.

---

## ✅ Phase 2: UI Component Testing

### Step 2.1: Check Notification Bell Visibility

1. **Run the application:**
   ```bash
   npm run dev
   ```

2. **Login as admin user:**
   - Email: `admin@wavesync.com`
   - Password: `admin123`

3. **Look for the notification bell** in the header (top-right corner)
   - ✅ Bell icon should be visible
   - ✅ Should show a red badge with unread count
   - ✅ Badge should show the number of sample notifications

### Step 2.2: Test Notification Center

1. **Click the notification bell**
   - ✅ Notification panel should slide in from the right
   - ✅ Should show a list of notifications
   - ✅ Unread notifications should have a blue background

2. **Check notification details:**
   - ✅ Each notification should show:
     - Icon (emoji) based on type
     - Title
     - Message
     - Time ago (e.g., "2 hours ago")
     - Delete button (appears on hover)

3. **Test "Mark as Read" functionality:**
   - Click on an unread notification
   - ✅ Blue background should disappear
   - ✅ Badge count should decrease by 1

4. **Test "Mark All Read" button:**
   - Click "Mark all read" in the header
   - ✅ All notifications should lose blue background
   - ✅ Badge should disappear

5. **Test Delete functionality:**
   - Hover over a notification
   - Click the trash icon (🗑️)
   - ✅ Notification should be removed from the list

6. **Close the panel:**
   - Click outside the panel or the X button
   - ✅ Panel should slide out and close

---

## ✅ Phase 3: Real-Time Updates Testing

### Step 3.1: Test in Multiple Browser Windows

1. **Open two browser windows side-by-side:**
   - Window 1: Login as `admin@wavesync.com`
   - Window 2: Login as `company@wavesync.com`

2. **Keep both notification centers open**

### Step 3.2: Create Manual Notification via SQL

In Supabase SQL Editor, run:

```sql
-- Create a test notification for the company user
SELECT create_notification(
  (SELECT id FROM user_profiles WHERE email = 'company@wavesync.com'),
  'Test Notification',
  'This is a real-time test notification',
  'info'
);
```

**Expected Result:**
- ✅ Window 2 (company user) should immediately show the new notification
- ✅ Badge count should increase
- ✅ No manual refresh needed

---

## ✅ Phase 4: Automatic Trigger Testing

### Step 4.1: Test Assignment Notifications

1. **Login as company user** (`company@wavesync.com`)

2. **Navigate to Assignment Management**
   - Click "Assignment Management" in sidebar

3. **Create a new assignment:**
   - Click "Create Assignment"
   - Fill in the form:
     - **Assignment Title:** "Test Assignment"
     - **Seafarer:** Select a seafarer from the list
     - **Vessel:** Select a vessel
     - **Status:** "pending"
     - **Tentative Start Date:** Pick a future date
   - Click "Create Assignment"

4. **Check notifications immediately:**

   **In Company User's notifications:**
   - ✅ Should see "Assignment Created" notification (info/blue)
   - ✅ Message: "New assignment created: Test Assignment on [Vessel Name]"

5. **Login as the assigned seafarer:**
   - Open notification bell
   - ✅ Should see "New Assignment" notification (success/green)
   - ✅ Message: "You have been assigned to [Vessel Name] as Test Assignment"

### Step 4.2: Test Assignment Update Notifications

1. **Still as company user:**
   - Edit the assignment you just created
   - Change **Status** from "pending" to "active"
   - Click "Update Assignment"

2. **Check seafarer's notifications:**
   - ✅ Should see "Assignment Status Updated" notification (warning/yellow)
   - ✅ Message: "Your assignment status has changed to: active"

3. **Check company user's notifications:**
   - ✅ Should see "Assignment Updated" notification (info/blue)

### Step 4.3: Test Document Expiry Notifications

1. **Login as company user**

2. **Navigate to Document Management**
   - Click "Document Management" in sidebar

3. **Upload a document with expiry date:**
   - Click "Upload New Document"
   - Fill in the form:
     - **Seafarer:** Select a seafarer
     - **Document Type:** "Medical Certificate"
     - **Expiry Date:** **Set to 20 days from today**
     - **Status:** "verified"
   - Upload a test file (any PDF)
   - Click "Upload Document"

4. **Check notifications immediately:**

   **Seafarer's notifications:**
   - ✅ Should see "Document Expiring Soon" notification (info/blue for 30 days)
   - ✅ Message: "Medical Certificate expires in 20 days"

   **Company user's notifications:**
   - ✅ Should see "Seafarer Document Expiring" notification
   - ✅ Message: "Medical Certificate for [Seafarer Name] expires in 20 days"

5. **Test different expiry thresholds:**

   Create documents with different expiry dates:
   - **6 days from today** → Should trigger ERROR notification (red)
   - **14 days from today** → Should trigger WARNING notification (yellow)
   - **29 days from today** → Should trigger INFO notification (blue)

### Step 4.4: Test Vessel Notifications

1. **Login as admin or company user**

2. **Navigate to Fleet Management**
   - Click "Fleet Management" in sidebar

3. **Create a new vessel:**
   - Click "Create Vessel"
   - Fill in the form:
     - **Vessel Name:** "Test Vessel"
     - **IMO Number:** "IMO1234567"
     - **Vessel Type:** "Container"
     - **Flag:** "Panama"
   - Click "Create Vessel"

4. **Check company user's notifications:**
   - ✅ Should see "New Vessel Added" notification (success/green)
   - ✅ Message: "Vessel Test Vessel has been added to the fleet"

5. **Update the vessel:**
   - Edit the vessel you just created
   - Change any field (e.g., flag to "Liberia")
   - Click "Update Vessel"

6. **Check notifications:**
   - ✅ Should see "Vessel Updated" notification (info/blue)
   - ✅ Message: "Vessel Test Vessel information has been updated"

---

## ✅ Phase 5: Edge Cases & Error Handling

### Test 5.1: No Notifications State

1. **Create a new user** (or use a user with no notifications)
2. **Open notification center**
   - ✅ Should show empty state with icon and message
   - ✅ Message: "No notifications yet"

### Test 5.2: Many Notifications

Create multiple notifications via SQL:
```sql
-- Create 10 test notifications
DO $$
DECLARE
  i INTEGER;
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM user_profiles WHERE email = 'company@wavesync.com';
  
  FOR i IN 1..10 LOOP
    PERFORM create_notification(
      user_id,
      'Test Notification ' || i,
      'This is test notification number ' || i,
      CASE (i % 4)
        WHEN 0 THEN 'info'
        WHEN 1 THEN 'success'
        WHEN 2 THEN 'warning'
        ELSE 'error'
      END
    );
  END LOOP;
END $$;
```

**Expected Results:**
- ✅ Notification list should be scrollable
- ✅ Badge should show "10" (or "99+" if more)
- ✅ All notifications should be visible

### Test 5.3: Real-Time Subscription Reconnection

1. **Open notification center**
2. **Disconnect internet** for 5 seconds
3. **Reconnect internet**
4. **Create a new notification via SQL**
   - ✅ Should appear automatically after reconnection

### Test 5.4: Performance Test

1. **Create 50 notifications:**
```sql
DO $$
DECLARE
  i INTEGER;
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM user_profiles WHERE email = 'company@wavesync.com';
  
  FOR i IN 1..50 LOOP
    PERFORM create_notification(
      user_id,
      'Performance Test ' || i,
      'Testing notification system performance with notification ' || i,
      'info'
    );
  END LOOP;
END $$;
```

2. **Open notification center**
   - ✅ Should load within 1-2 seconds
   - ✅ Scrolling should be smooth
   - ✅ Only 50 most recent notifications shown (per limit)

---

## ✅ Phase 6: Cross-Browser Testing

Test in multiple browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Check for:**
- Notification panel appearance
- Real-time updates
- Click interactions
- Animations

---

## ✅ Phase 7: Mobile Responsiveness

1. **Open in mobile view** (Chrome DevTools → Toggle device toolbar)
2. **Test different screen sizes:**
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)

**Expected Results:**
- ✅ Notification bell should be visible and properly sized
- ✅ Notification panel should fit screen width
- ✅ Touch interactions should work
- ✅ Panel should slide in from right

---

## ✅ Phase 8: Security Testing

### Test 8.1: User Isolation

1. **Login as user A** (e.g., company@wavesync.com)
2. **Note the notifications shown**
3. **Login as user B** (e.g., seafarer@wavesync.com)
4. **Check notifications**
   - ✅ User B should NOT see User A's notifications
   - ✅ Each user should only see their own notifications

### Test 8.2: RLS Policy Verification

Run in SQL Editor:
```sql
-- Try to read another user's notifications (should fail)
SET request.jwt.claims.sub = (SELECT id FROM user_profiles WHERE email = 'company@wavesync.com')::text;
SELECT * FROM notifications WHERE user_id != (SELECT id FROM user_profiles WHERE email = 'company@wavesync.com');
```

**Expected Result:** Should return 0 rows (RLS prevents access)

---

## 🐛 Common Issues & Solutions

### Issue 1: Notification Bell Not Showing Badge

**Cause:** No unread notifications or badge CSS not loaded

**Solution:**
1. Check if there are unread notifications in database:
   ```sql
   SELECT COUNT(*) FROM notifications WHERE read = false AND user_id = '[your-user-id]';
   ```
2. Check browser console for CSS errors
3. Hard refresh (Ctrl+Shift+R)

### Issue 2: Notifications Not Appearing in Real-Time

**Cause:** Realtime subscription not working

**Solution:**
1. Check browser console for subscription errors
2. Verify Supabase Realtime is enabled in project settings
3. Check if the notifications table has Realtime enabled:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
   ```

### Issue 3: Triggers Not Firing

**Cause:** Trigger might not be created or disabled

**Solution:**
1. Verify triggers exist:
   ```sql
   SELECT * FROM information_schema.triggers WHERE trigger_name LIKE '%notification%';
   ```
2. If missing, run the trigger creation section of the setup script

### Issue 4: "Permission Denied" Errors

**Cause:** RLS policies not configured correctly

**Solution:**
1. Check if RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'notifications';
   ```
2. Verify policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

---

## 📊 Testing Checklist Summary

Use this checklist to track your testing progress:

- [ ] Database setup script runs successfully
- [ ] Functions created (create_notification, create_company_notification, create_seafarer_notification)
- [ ] Triggers created (assignment, document, vessel)
- [ ] Notification templates inserted (8 templates)
- [ ] Sample notifications created
- [ ] Notification bell visible in header
- [ ] Badge shows unread count
- [ ] Notification center opens on click
- [ ] Mark as read works
- [ ] Mark all read works
- [ ] Delete notification works
- [ ] Real-time updates work
- [ ] Assignment notifications fire on create
- [ ] Assignment notifications fire on update
- [ ] Document expiry notifications fire
- [ ] Vessel notifications fire on create
- [ ] Vessel notifications fire on update
- [ ] Empty state displays correctly
- [ ] Scrolling works with many notifications
- [ ] Mobile responsive design works
- [ ] User isolation (RLS) works correctly
- [ ] Cross-browser compatibility verified

---

## ✅ Success Criteria

The notification system is working correctly if:

1. ✅ All database functions and triggers are created
2. ✅ Notification bell shows in header with correct badge count
3. ✅ Notification center opens and displays notifications
4. ✅ Users can mark notifications as read/unread
5. ✅ Real-time updates work without refresh
6. ✅ All 3 trigger types fire correctly (assignments, documents, vessels)
7. ✅ Users only see their own notifications (RLS working)
8. ✅ Mobile responsive design works
9. ✅ No console errors in browser
10. ✅ Performance is acceptable (< 2s to load 50 notifications)

---

## 📞 Need Help?

If you encounter any issues during testing:

1. **Check browser console** for JavaScript errors
2. **Check Supabase logs** for database errors
3. **Verify environment variables** in `.env` file
4. **Test database functions manually** in SQL Editor
5. **Check RLS policies** are enabled and correct

**Happy Testing! 🧪🚀**
