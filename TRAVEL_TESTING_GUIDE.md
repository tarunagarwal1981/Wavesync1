# 🧪 Travel Management System - Testing Guide

## Quick Start Testing

### Prerequisites
- ✅ Database tables created (`phase3-travel-management-setup.sql`)
- ✅ Notification triggers set up (`travel-notification-triggers.sql`)
- ✅ Storage bucket configured (`travel-storage-setup.sql`)
- ✅ At least 2 test users: 1 company user, 1 seafarer

---

## 📋 Step-by-Step Testing

### **Step 1: Database Setup** (5 minutes)

1. Open Supabase Dashboard → SQL Editor
2. Run `phase3-travel-management-setup.sql`
3. Wait for success message
4. Run `travel-notification-triggers.sql`
5. Wait for success message
6. Run `travel-storage-setup.sql`
7. Wait for success message

**Expected Result**: All scripts execute without errors

---

### **Step 2: Company User - Create Travel Request** (5 minutes)

1. Login as company user (e.g., `company@wavesync.com`)
2. Navigate to sidebar → **"Travel Planning"**
3. Click **"Create Travel Request"** button
4. Fill in the form:
   - **Seafarer**: Select a seafarer from dropdown
   - **Assignment**: (Optional) Select an assignment
   - **Travel Type**: Sign On
   - **Travel Date**: Select a future date (e.g., 7 days from now)
   - **Return Date**: (Optional) Select a date after travel date
   - **Origin**: Mumbai, India
   - **Destination**: Singapore, Singapore
   - **Priority**: High
   - **Estimated Cost**: 1500
   - **Notes**: Test travel request for integration testing
   - **Special Requirements**: Window seat preferred, vegetarian meal
5. Click **"Save"**

**Expected Result**:
- ✅ Travel request created successfully
- ✅ Toast notification: "Travel request created successfully"
- ✅ New card appears in the travel list
- ✅ Card shows status: "Pending"

---

### **Step 3: Verify Seafarer Notification** (2 minutes)

1. **While still logged in as company user**, click the notification bell 🔔
2. Check for notification: "New Travel Request Created"

**Expected Result**:
- ✅ Notification appears in the notification panel
- ✅ Notification text includes travel details

---

### **Step 4: Seafarer - View Travel Request** (3 minutes)

1. Logout from company user
2. Login as seafarer (the one selected in Step 2)
3. Check notification bell 🔔
4. Navigate to sidebar → **"My Travel"**
5. Check **"Upcoming Travel"** section

**Expected Result**:
- ✅ Notification appears: "New Travel Request Created"
- ✅ Travel card appears in "Upcoming Travel"
- ✅ Card shows correct details (type, destination, dates)
- ✅ Card shows status badge: "Pending"
- ✅ If travel date is within 7 days, urgent banner appears

---

### **Step 5: Seafarer - View Details** (2 minutes)

1. On the travel card, click **"View Details"**
2. Modal opens with travel information

**Expected Result**:
- ✅ Modal displays travel information
- ✅ Flight Details section shows "No flight bookings yet"
- ✅ All dates and locations are correct

---

### **Step 6: Company User - Approve Travel** (3 minutes)

1. Logout and login as company user
2. Navigate to **"Travel Planning"**
3. Find the travel request card
4. Click **"Edit"** button
5. Change **Status** to: **Approved**
6. Click **"Save"**

**Expected Result**:
- ✅ Status updated successfully
- ✅ Card badge changes to "Approved" (green)
- ✅ Seafarer receives notification: "Travel Request Approved"

---

### **Step 7: Company User - Book Travel** (3 minutes)

1. Click **"Edit"** on the same travel request
2. Change **Status** to: **Booked**
3. Click **"Save"**

**Expected Result**:
- ✅ Status updated successfully
- ✅ Card badge changes to "Booked" (blue)
- ✅ Seafarer receives notification: "Travel Arrangements Booked"

---

### **Step 8: Company User - Confirm Travel** (3 minutes)

1. Click **"Edit"** on the same travel request
2. Change **Status** to: **Confirmed**
3. Click **"Save"**

**Expected Result**:
- ✅ Status updated successfully
- ✅ Card badge changes to "Confirmed" (purple)
- ✅ Seafarer receives notification: "Travel Confirmed"

---

### **Step 9: Seafarer - Check All Notifications** (2 minutes)

1. Login as seafarer
2. Click notification bell 🔔
3. Verify notifications for:
   - New Travel Request Created
   - Travel Request Approved
   - Travel Arrangements Booked
   - Travel Confirmed

**Expected Result**:
- ✅ All 4 notifications appear in chronological order
- ✅ Unread badge shows correct count
- ✅ Can mark notifications as read
- ✅ Can delete notifications

---

### **Step 10: Filter and Search** (3 minutes)

#### **Company User Tests**:
1. Login as company user
2. Navigate to **"Travel Planning"**
3. Test search:
   - Type seafarer name in search box
   - Verify filtering works
4. Test filters:
   - Filter by Status: "Confirmed"
   - Verify only confirmed travels show
   - Filter by Type: "Sign On"
   - Verify only sign on travels show
   - Set both filters to "All"

#### **Seafarer Tests**:
1. Login as seafarer
2. Navigate to **"My Travel"**
3. Test filters:
   - Filter by Status: "Confirmed"
   - Filter by Type: "Sign On"
   - Reset filters to "All"

**Expected Result**:
- ✅ Search works in real-time
- ✅ Filters update the list correctly
- ✅ Empty state shows when no results

---

### **Step 11: Test Travel Reminders** (2 minutes)

1. Open Supabase Dashboard → SQL Editor
2. Run the following SQL:
   ```sql
   SELECT send_travel_reminders();
   ```
3. Check notifications for seafarers with upcoming travel

**Expected Result**:
- ✅ If travel is 7 days away: "Travel Reminder - 7 Days" notification
- ✅ If travel is 1 day away: "Travel Reminder - Tomorrow" notification
- ✅ If travel is today: "Travel Today" notification

---

### **Step 12: Storage Verification** (3 minutes)

1. Open Supabase Dashboard → Storage
2. Check for **"travel-documents"** bucket

**Expected Result**:
- ✅ Bucket exists
- ✅ Bucket is private
- ✅ File size limit: 10MB
- ✅ Allowed types include PDF, images

---

### **Step 13: Delete Travel Request** (2 minutes)

1. Login as company user
2. Navigate to **"Travel Planning"**
3. Click **"Delete"** on a travel request
4. Confirm deletion

**Expected Result**:
- ✅ Confirmation dialog appears
- ✅ Travel request deleted successfully
- ✅ Card removed from list
- ✅ Toast notification: "Travel request deleted successfully"

---

## 🐛 Common Issues & Fixes

### **Issue 1: No travel requests showing up**
**Fix**: 
- Check RLS policies are enabled
- Verify company_id matches between user and travel request
- Check browser console for errors

### **Issue 2: Notifications not appearing**
**Fix**:
- Run `travel-notification-triggers.sql` again
- Check if triggers are active: `SELECT * FROM pg_trigger WHERE tgname LIKE '%travel%';`
- Verify notification functions exist

### **Issue 3: Status change not working**
**Fix**:
- Check RLS policies allow UPDATE
- Verify user has permission (company user only)
- Check browser console for errors

### **Issue 4: Seafarer can't see travel**
**Fix**:
- Verify travel request has correct seafarer_id
- Check RLS policies for seafarer SELECT
- Ensure user is logged in as the correct seafarer

---

## ✅ Testing Checklist

### **Database**:
- [ ] All tables created without errors
- [ ] All RLS policies active
- [ ] All triggers created
- [ ] All notification templates inserted
- [ ] Storage bucket created

### **Company User UI**:
- [ ] Can access Travel Planning page
- [ ] Can create travel request
- [ ] Can edit travel request
- [ ] Can delete travel request
- [ ] Can search by seafarer
- [ ] Can filter by status
- [ ] Can filter by travel type
- [ ] Can change travel status
- [ ] Receives notifications

### **Seafarer UI**:
- [ ] Can access My Travel page
- [ ] Can see upcoming travel
- [ ] Can see past travel
- [ ] Can view travel details
- [ ] Can see urgent banners (7 days)
- [ ] Can filter by status
- [ ] Can filter by travel type
- [ ] Receives notifications

### **Notifications**:
- [ ] Travel request created notification
- [ ] Travel approved notification
- [ ] Travel booked notification
- [ ] Travel confirmed notification
- [ ] Travel cancelled notification
- [ ] Travel reminder (manual test)

### **Responsive Design**:
- [ ] Desktop view (1920px)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px)

---

## 🎯 Performance Benchmarks

### **Expected Load Times**:
- Travel Planning page load: < 1 second
- My Travel page load: < 1 second
- Travel details modal: < 500ms
- Search/filter response: < 200ms

### **Expected Database Queries**:
- Fetch travel requests: 1 query
- Fetch seafarers for dropdown: 1 query
- Fetch assignments for dropdown: 1 query
- Create notification: 1 query

---

## 🎉 Success Criteria

The Travel Management system is working correctly if:

1. ✅ Company users can create and manage travel requests
2. ✅ Seafarers can view their travel arrangements
3. ✅ Status workflow functions correctly
4. ✅ Notifications are sent for all status changes
5. ✅ RLS enforces company-scoped data isolation
6. ✅ Search and filters work correctly
7. ✅ UI is responsive on all devices
8. ✅ No console errors during normal operation

---

## 📊 Test Results Template

```
Test Date: _______________
Tester: _______________

Database Setup: [ ] Pass [ ] Fail
Company UI: [ ] Pass [ ] Fail
Seafarer UI: [ ] Pass [ ] Fail
Notifications: [ ] Pass [ ] Fail
Storage: [ ] Pass [ ] Fail
Responsive: [ ] Pass [ ] Fail

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Status: [ ] Pass [ ] Fail

Notes:
_____________________
_____________________
_____________________
```

---

*Estimated Total Testing Time: 40-50 minutes*
*Last Updated: October 18, 2025*

