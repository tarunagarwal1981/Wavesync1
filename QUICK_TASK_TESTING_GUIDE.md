# 🚀 Quick Task Management Testing Guide

## ⚡ 5-Minute Quick Test

### Prerequisites
- ✅ Application is running (`npm run dev` or deployed)
- ✅ Database tables are set up (`task-management-setup.sql`)
- ✅ You have at least one company user and one seafarer user

---

## Option 1: Automatic Test Data (Recommended)

### Step 1: Run the Test Data Script
1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the contents of `quick-test-tasks.sql`
4. Click **Run** (or press `Ctrl+Enter`)
5. You should see: "Successfully created 7 test tasks!"

This creates:
- 📄 1 Documentation task (High Priority)
- 🎓 1 Training task (Medium Priority)
- 🏥 1 Medical task (High Priority)
- ✅ 1 Compliance task (Low Priority)
- ⚠️ 1 Overdue Safety task (Urgent)
- 🔄 1 In Progress task
- ✅ 1 Completed task

### Step 2: Test as Seafarer
1. **Login as a seafarer user**
2. **Navigate to Tasks:**
   - Click "My Tasks" in the sidebar, OR
   - Click "View Tasks" from the dashboard
3. **You should see 7 tasks with different statuses**

### Step 3: Test Task Completion
1. Find a **Pending** task
2. Click **"Mark as Complete"** button
3. Optionally add completion notes
4. Click **"Complete Task"**
5. ✅ Task should move to "Completed" status
6. 🔔 Check notifications - creator should receive a completion notification

### Step 4: Test Filtering
- Click **"Pending"** filter - see only pending tasks
- Click **"In Progress"** - see in-progress tasks
- Click **"Completed"** - see completed tasks
- Click **"Overdue"** - see overdue tasks (should have 1)

### Step 5: Test as Company User
1. **Logout** and **login as a company user**
2. **Navigate to Task Management** (in sidebar under "Crew Management")
3. **You should see all 7 tasks**

### Step 6: Create a New Task
1. Click **"Create Task"** button
2. Fill in the form:
   - Title: "Upload Passport Copy"
   - Description: "Please upload a clear copy of your passport"
   - Category: **Documentation**
   - Priority: **High**
   - Assigned To: **Select a seafarer**
   - Due Date: **7 days from now**
3. Click **"Create Task"**
4. ✅ Task appears in the list
5. 🔔 Seafarer should receive a notification

### Step 7: Test Edit/Delete
1. Click **"Edit"** on any task
2. Change the priority to **Urgent**
3. Save changes
4. Verify the change is reflected
5. Click **"Delete"** on a test task
6. Confirm deletion
7. Verify task is removed

---

## Option 2: Manual Testing (No Test Data)

### Step 1: Login as Company User
1. Navigate to `/task-management`
2. You should see an empty state with "No tasks found"

### Step 2: Create Your First Task
1. Click **"Create Task"**
2. Fill in:
   ```
   Title: Complete Medical Certificate
   Description: Schedule and complete annual medical examination
   Category: Medical
   Priority: High
   Assigned To: [Select a seafarer]
   Due Date: [7 days from now]
   ```
3. Click **"Create Task"**

### Step 3: Create More Tasks
Create a few more tasks with different:
- Categories (Documentation, Training, Safety, etc.)
- Priorities (Low, Medium, High, Urgent)
- Due dates (past date for overdue testing)

### Step 4: Test as Seafarer
1. Logout and login as the seafarer you assigned tasks to
2. Navigate to `/tasks`
3. View your assigned tasks
4. Try completing one
5. Check notifications

---

## 🎯 What to Test

### ✅ Core Functionality
- [ ] Create task (company user)
- [ ] View tasks (both roles)
- [ ] Edit task (company user)
- [ ] Delete task (company user)
- [ ] Complete task (seafarer)
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Filter by category
- [ ] Search tasks

### 📊 UI Elements
- [ ] Task statistics cards show correct counts
- [ ] Overdue tasks are highlighted in red
- [ ] Priority badges show correct colors
- [ ] Status badges show correct colors
- [ ] Category icons display correctly
- [ ] Due dates format correctly
- [ ] Empty states display when no tasks

### 🔔 Notifications
- [ ] Seafarer receives notification when task is assigned
- [ ] Company user receives notification when task is completed
- [ ] Notification includes task details
- [ ] Notification links work

### 🔐 Permissions
- [ ] Seafarer can only see their own tasks
- [ ] Seafarer cannot create/edit/delete tasks
- [ ] Company user can see all tasks
- [ ] Company user can create/edit/delete tasks

---

## 🐛 Common Issues & Solutions

### Issue: "No tasks found"
**Solution:** Make sure you've run the test data script OR created tasks manually

### Issue: "Failed to load tasks"
**Solutions:**
- Check that `task-management-setup.sql` was executed
- Verify RLS policies are enabled
- Check browser console for errors
- Verify user is logged in

### Issue: Can't create tasks
**Solutions:**
- Ensure you're logged in as a company user (not seafarer)
- Check that there are seafarers to assign tasks to
- Verify the form is filled out completely

### Issue: Notifications not working
**Solutions:**
- Ensure `task-notification-triggers.sql` was executed
- Check the `notifications` table in database
- Verify trigger is active: `SELECT * FROM information_schema.triggers WHERE event_object_table = 'tasks';`

### Issue: RPC function error
**Solutions:**
- Verify the `complete_task` function exists in database
- Check function permissions
- Look at Supabase logs for specific error

---

## 📊 Verify Database Directly

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check tasks exist
SELECT COUNT(*) as total_tasks FROM tasks;

-- Check task distribution by status
SELECT status, COUNT(*) 
FROM tasks 
GROUP BY status;

-- Check task assignments
SELECT 
    t.title,
    up_assigned.full_name as assigned_to,
    up_creator.full_name as created_by
FROM tasks t
LEFT JOIN user_profiles up_assigned ON t.assigned_to = up_assigned.id
LEFT JOIN user_profiles up_creator ON t.assigned_by = up_creator.id
LIMIT 10;

-- Check notifications
SELECT type, title, created_at 
FROM notifications 
WHERE type IN ('task_assigned', 'task_completed')
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🎬 Quick Demo Flow (2 minutes)

**Perfect for showcasing the feature:**

1. **Login as company user** → Go to Task Management
2. **Show statistics** → Point out task counts
3. **Click "Create Task"** → Fill form quickly
4. **Show filters** → Click through status filters
5. **Logout → Login as seafarer** → Go to My Tasks
6. **Mark a task complete** → Show completion flow
7. **Check notifications** → Show task notification received

---

## 📝 Test Data Cleanup

To remove all test tasks and start fresh:

```sql
-- Delete all tasks created in the last hour
DELETE FROM tasks WHERE created_at > NOW() - INTERVAL '1 hour';

-- Delete related notifications
DELETE FROM notifications 
WHERE type IN ('task_assigned', 'task_updated', 'task_completed') 
AND created_at > NOW() - INTERVAL '1 hour';
```

Or delete ALL tasks (use with caution!):

```sql
-- Delete ALL tasks
TRUNCATE TABLE tasks CASCADE;
```

---

## 🚀 Next Steps After Testing

Once testing is successful:

1. ✅ Mark all test items as verified
2. 📝 Document any bugs or issues found
3. 💡 Collect user feedback on UI/UX
4. 🔄 Iterate on improvements
5. 🎨 Consider implementing:
   - File attachments
   - Task comments
   - Recurring tasks
   - Task templates
   - Analytics dashboard

---

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify all SQL scripts were executed successfully
4. Check that RLS policies are working correctly
5. Verify user roles and permissions

---

**Happy Testing! 🎉**

*Remember: This is a production-ready feature, but feedback is valuable for improvements!*

