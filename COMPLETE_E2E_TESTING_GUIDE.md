# 🧪 WaveSync Maritime Platform - Complete End-to-End Testing Guide

**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Purpose:** Comprehensive testing guide for QA team covering all features and user roles  
**Test Environment:** Production-like staging environment  

---

## 📋 TABLE OF CONTENTS

1. [Pre-Testing Setup](#1-pre-testing-setup)
2. [Test User Accounts](#2-test-user-accounts)
3. [Admin Testing Workflows](#3-admin-testing-workflows)
4. [Company User Testing Workflows](#4-company-user-testing-workflows)
5. [Seafarer Testing Workflows](#5-seafarer-testing-workflows)
6. [Cross-Role Integration Tests](#6-cross-role-integration-tests)
7. [Non-AI Feature Testing Checklist](#7-non-ai-feature-testing-checklist)
8. [AI Feature Testing (Phase 2)](#8-ai-feature-testing-phase-2)
9. [Regression Testing](#9-regression-testing)
10. [Bug Reporting Template](#10-bug-reporting-template)

---

## 1. PRE-TESTING SETUP

### 1.1 Environment Verification

**Before starting tests, verify:**

- [ ] Application is accessible at the correct URL
- [ ] All database migrations are applied
- [ ] Supabase connection is active
- [ ] Test data is populated (if needed)
- [ ] Browser console shows no critical errors on load

**Recommended Browsers:**
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest - macOS only)

**Screen Resolutions to Test:**
- Desktop: 1920x1080, 1366x768
- Tablet: 768x1024
- Mobile: 375x667 (iPhone), 360x640 (Android)

### 1.2 Test Data Requirements

**Required Test Data:**
- At least 2 companies
- At least 3 admin users
- At least 5 company users (across different companies)
- At least 10 seafarers (with varying ranks and experience)
- At least 5 vessels
- Sample documents with various expiry dates
- Sample assignments in different statuses

---

## 2. TEST USER ACCOUNTS

### 2.1 Admin Users

| Username | Email | Password | Role | Purpose |
|----------|-------|----------|------|---------|
| Admin Master | admin@wavesync.com | [provided] | Super Admin | Full system access |
| Admin Test1 | admin1@wavesync.com | [provided] | Admin | User management |
| Admin Test2 | admin2@wavesync.com | [provided] | Admin | Company management |

### 2.2 Company Users

| Username | Email | Password | Company | Purpose |
|----------|-------|----------|---------|---------|
| Company User 1 | company1@maritime.com | [provided] | Maritime Co. | Assignment creation |
| Company User 2 | company2@maritime.com | [provided] | Maritime Co. | Document verification |
| Company User 3 | company3@shipping.com | [provided] | Shipping Ltd. | Travel management |

### 2.3 Seafarer Users

| Username | Email | Password | Rank | Status |
|----------|-------|----------|------|--------|
| Seafarer 1 | seafarer1@test.com | [provided] | Captain | Available |
| Seafarer 2 | seafarer2@test.com | [provided] | Chief Engineer | Available |
| Seafarer 3 | seafarer3@test.com | [provided] | 2nd Officer | On Assignment |
| Seafarer 4 | seafarer4@test.com | [provided] | AB Seaman | Available |
| Seafarer 5 | seafarer5@test.com | [provided] | Electrician | On Leave |

---

## 3. ADMIN TESTING WORKFLOWS

### 3.1 User Management Module

#### TEST CASE A1: Create New Company

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Login as Admin (`admin@wavesync.com`)
2. Navigate to **Admin > Company Management**
3. Click **"Create Company"** button
4. Fill in company details:
   - Company Name: "Test Shipping Inc."
   - Contact Email: "contact@testshipping.com"
   - Phone: "+1234567890"
   - Address: "123 Port Street, Harbor City"
5. Click **"Save"** button
6. Verify success message appears
7. Verify company appears in the company list

**Expected Results:**
- ✅ Form validation works (required fields)
- ✅ Company is created successfully
- ✅ Company appears in list with correct details
- ✅ Company ID is generated automatically
- ✅ Timestamps are recorded (created_at, updated_at)

**Test Data to Verify in Database:**
```sql
SELECT * FROM companies WHERE name = 'Test Shipping Inc.';
```

---

#### TEST CASE A2: Create Company User

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Login as Admin
2. Navigate to **Admin > User Management**
3. Click **"Create User"** button
4. Fill in user details:
   - Full Name: "John Shore"
   - Email: "john.shore@testshipping.com"
   - User Type: "Company User"
   - Company: Select "Test Shipping Inc." (from dropdown)
   - Phone: "+1234567891"
5. Click **"Create User"**
6. Verify success message
7. Verify user appears in user list
8. Copy the generated password (if shown)

**Expected Results:**
- ✅ Email validation works
- ✅ Company dropdown shows all companies
- ✅ User is created with correct role
- ✅ User appears in user list
- ✅ User can login with provided credentials

**Additional Verification:**
1. Logout as Admin
2. Login as newly created user (`john.shore@testshipping.com`)
3. Verify redirected to Company User dashboard
4. Verify user has appropriate menu items

---

#### TEST CASE A3: Create Seafarer User

**Priority:** High  
**Estimated Time:** 7 minutes

**Steps:**
1. Login as Admin
2. Navigate to **Admin > User Management**
3. Click **"Create User"**
4. Fill in basic user details:
   - Full Name: "Mike Sailor"
   - Email: "mike.sailor@test.com"
   - User Type: "Seafarer"
   - Phone: "+1234567892"
5. Click **"Create User"**
6. Note the generated user ID
7. Go to **Crew Directory**
8. Find "Mike Sailor" in the list
9. Click **"Edit"** on Mike's profile
10. Fill in seafarer-specific details:
    - Rank: "2nd Officer"
    - Department: "Deck"
    - Years of Experience: 5
    - Availability Status: "Available"
    - Date of Birth: "01/15/1990"
    - Nationality: "USA"
11. Click **"Save"**

**Expected Results:**
- ✅ User is created successfully
- ✅ Seafarer profile is linked to user
- ✅ All seafarer fields are saved correctly
- ✅ User appears in Crew Directory
- ✅ User can login and see Seafarer dashboard

---

#### TEST CASE A4: Edit User Details

**Priority:** Medium  
**Estimated Time:** 3 minutes

**Steps:**
1. Login as Admin
2. Navigate to **Admin > User Management**
3. Find any existing user
4. Click **"Edit"** button
5. Modify user details:
   - Change phone number
   - Update email (if possible)
   - Change user type (if applicable)
6. Click **"Save"**
7. Verify changes are reflected
8. Check user can still login with updated details

**Expected Results:**
- ✅ Form pre-fills with existing data
- ✅ Changes are saved successfully
- ✅ Updated information displays correctly
- ✅ Audit trail is maintained

---

#### TEST CASE A5: Delete User

**Priority:** Medium  
**Estimated Time:** 3 minutes

**Steps:**
1. Create a test user (use A2 or A3)
2. Navigate to **Admin > User Management**
3. Find the test user
4. Click **"Delete"** button
5. Confirm deletion in modal
6. Verify success message
7. Verify user is removed from list
8. Try to login as deleted user
9. Verify login fails

**Expected Results:**
- ✅ Confirmation modal appears before deletion
- ✅ User is soft-deleted or hard-deleted (per spec)
- ✅ Related data is handled correctly (assignments, tasks)
- ✅ User cannot login after deletion
- ✅ No broken references in database

---

### 3.2 Vessel Management Module

#### TEST CASE A6: Create New Vessel

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Login as Admin
2. Navigate to **Admin > Vessels**
3. Click **"Add Vessel"** button
4. Fill in vessel details:
   - Vessel Name: "MV Test Voyager"
   - IMO Number: "1234567"
   - Vessel Type: "Container Ship"
   - Flag State: "Panama"
   - Gross Tonnage: 25000
   - Year Built: 2015
   - Crew Capacity: 25
   - Status: "Active"
   - Company: Select "Test Shipping Inc."
5. Click **"Save"**
6. Verify vessel appears in fleet list

**Expected Results:**
- ✅ All fields validate correctly
- ✅ IMO number format is validated (7 digits)
- ✅ Vessel is created successfully
- ✅ Vessel appears in fleet with correct details
- ✅ Company association is correct

---

#### TEST CASE A7: Edit Vessel Details

**Priority:** Medium  
**Estimated Time:** 3 minutes

**Steps:**
1. Navigate to **Admin > Vessels**
2. Find "MV Test Voyager"
3. Click **"Edit"**
4. Update vessel status to "Maintenance"
5. Update crew capacity to 28
6. Click **"Save"**
7. Verify changes are reflected

**Expected Results:**
- ✅ Changes save successfully
- ✅ Status change is reflected in fleet list
- ✅ Capacity update is shown correctly

---

### 3.3 System Analytics

#### TEST CASE A8: View System Analytics

**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Login as Admin
2. Navigate to **Admin > Analytics**
3. Review dashboard showing:
   - Total users by type
   - Total companies
   - Total vessels
   - Assignment statistics
   - Document compliance rates
   - Task completion rates
4. Click on various filters (date ranges, companies)
5. Export analytics report (PDF/CSV)

**Expected Results:**
- ✅ All metrics display correctly
- ✅ Charts render properly
- ✅ Filters work as expected
- ✅ Export functionality works
- ✅ Data is accurate and up-to-date

---

## 4. COMPANY USER TESTING WORKFLOWS

### 4.1 Assignment Management

#### TEST CASE C1: Create Manual Assignment

**Priority:** Critical  
**Estimated Time:** 10 minutes

**Steps:**
1. Login as Company User (`company1@maritime.com`)
2. Navigate to **Assignment Management**
3. Click **"Create Assignment"** button
4. Fill in assignment details:
   - Vessel: Select "MV Test Voyager"
   - Position: "2nd Officer"
   - Rank Required: "Officer"
   - Department: "Deck"
   - Contract Start Date: [Today + 30 days]
   - Contract End Date: [Today + 210 days]
   - Joining Port: "Singapore"
   - Salary: 4500 USD/month
   - Benefits: "Full insurance, leave pay"
5. In **Seafarer Selection** section:
   - Click **"Search Seafarers"**
   - Apply filters: Rank = "2nd Officer", Status = "Available"
   - Review matching seafarers
   - Select "Mike Sailor"
6. Click **"Create Assignment"**
7. Verify success message
8. Verify assignment appears in list with status "Pending"

**Expected Results:**
- ✅ Form validation works for all required fields
- ✅ Date validation ensures end date > start date
- ✅ Seafarer search filters work correctly
- ✅ Only available seafarers are shown
- ✅ Assignment is created successfully
- ✅ Status is set to "Pending" (awaiting seafarer response)
- ✅ Notification is sent to seafarer

**Database Verification:**
```sql
SELECT * FROM assignments WHERE vessel_id = [vessel_id] ORDER BY created_at DESC LIMIT 1;
```

---

#### TEST CASE C2: View Assignment Details

**Priority:** High  
**Estimated Time:** 3 minutes

**Steps:**
1. From Assignment Management page
2. Find the assignment created in C1
3. Click on assignment card or **"View Details"**
4. Review all assignment information:
   - Vessel details
   - Position and rank
   - Contract dates and duration
   - Salary and benefits
   - Seafarer details
   - Assignment status
   - Timeline/history

**Expected Results:**
- ✅ All details display correctly
- ✅ Dates are formatted properly
- ✅ Salary shows correct currency
- ✅ Seafarer profile link works
- ✅ Vessel link works

---

#### TEST CASE C3: Edit Assignment (Before Acceptance)

**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to Assignment Management
2. Find a "Pending" assignment
3. Click **"Edit"**
4. Modify assignment details:
   - Change joining port to "Dubai"
   - Update salary to 4800 USD/month
   - Change joining date
5. Click **"Save Changes"**
6. Verify updates are reflected
7. Verify notification is sent to seafarer about changes

**Expected Results:**
- ✅ Only editable fields are available (status-dependent)
- ✅ Changes save successfully
- ✅ Seafarer receives update notification
- ✅ Assignment history shows changes

---

#### TEST CASE C4: Cancel Assignment

**Priority:** Medium  
**Estimated Time:** 3 minutes

**Steps:**
1. Create a test assignment (or use existing pending one)
2. Click **"Cancel Assignment"** button
3. Enter cancellation reason: "Position filled by another seafarer"
4. Click **"Confirm Cancellation"**
5. Verify assignment status changes to "Cancelled"
6. Verify seafarer receives cancellation notification
7. Verify seafarer's status returns to "Available"

**Expected Results:**
- ✅ Cancellation requires reason
- ✅ Confirmation modal appears
- ✅ Status updates correctly
- ✅ Notifications are sent
- ✅ Seafarer availability updates

---

### 4.2 Crew Directory & Management

#### TEST CASE C5: Search and Filter Crew

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Login as Company User
2. Navigate to **Crew Directory**
3. Test search functionality:
   - Search by name: "Mike"
   - Verify results show matching seafarers
4. Test filters:
   - Filter by Rank: "2nd Officer"
   - Filter by Status: "Available"
   - Filter by Department: "Deck"
   - Filter by Experience: "> 5 years"
5. Apply multiple filters simultaneously
6. Clear filters and verify all crew shown again
7. Test sorting:
   - Sort by Name (A-Z, Z-A)
   - Sort by Rank
   - Sort by Experience
   - Sort by Availability

**Expected Results:**
- ✅ Search returns correct results
- ✅ Filters work independently and combined
- ✅ Sorting works for all columns
- ✅ Results update in real-time
- ✅ No errors in console
- ✅ Pagination works (if applicable)

---

#### TEST CASE C6: View Seafarer Profile

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. From Crew Directory
2. Click on any seafarer card
3. Review complete profile information:
   - Personal details (name, DOB, nationality, contact)
   - Professional details (rank, department, experience)
   - Current status and availability
   - Assignment history
   - Documents and certifications
   - Training records
   - Performance ratings (if available)
4. Check all tabs/sections work
5. Verify all links are functional

**Expected Results:**
- ✅ Profile loads completely
- ✅ All information displays correctly
- ✅ Photos/avatars load properly
- ✅ Assignment history shows chronologically
- ✅ Document status indicators are accurate
- ✅ Navigation within profile works

---

#### TEST CASE C7: Export Crew Data

**Priority:** Low  
**Estimated Time:** 3 minutes

**Steps:**
1. Navigate to Crew Directory
2. Apply filters to select specific crew (e.g., Available seafarers)
3. Click **"Export"** button
4. Select export format (CSV or PDF)
5. Download file
6. Open and verify content
7. Check all expected fields are present
8. Verify data accuracy

**Expected Results:**
- ✅ Export generates successfully
- ✅ File downloads correctly
- ✅ All filtered data is included
- ✅ Format is correct and readable
- ✅ Data matches what's shown on screen

---

### 4.3 Document Management & Verification

#### TEST CASE C8: View Document Dashboard

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Login as Company User
2. Navigate to **Document Management** or **Expiry Dashboard**
3. Review document overview:
   - Total documents
   - Documents pending approval
   - Expired documents
   - Expiring soon (< 30 days)
   - Valid documents
4. Click on each status category
5. Verify document lists update accordingly

**Expected Results:**
- ✅ Dashboard loads with statistics
- ✅ Counts are accurate
- ✅ Color coding is correct (Red=Expired, Orange=Urgent, Yellow=Soon, Green=Valid)
- ✅ Clicking categories filters list
- ✅ No duplicate documents shown

---

#### TEST CASE C9: Review and Approve Document

**Priority:** Critical  
**Estimated Time:** 7 minutes

**Steps:**
1. Navigate to **Document Management**
2. Filter by Status: "Pending Approval"
3. Select a document to review
4. Click **"View Document"**
5. Review document details:
   - Document type
   - Seafarer name
   - Upload date
   - Expiry date
   - File preview/download
6. Click **"Approve"** button
7. Add approval comments: "Certificate verified - valid until [date]"
8. Click **"Submit Approval"**
9. Verify document status changes to "Approved"
10. Verify seafarer receives approval notification

**Expected Results:**
- ✅ Document preview works (images, PDFs)
- ✅ All metadata displays correctly
- ✅ Approval requires confirmation
- ✅ Comments are mandatory/optional (per spec)
- ✅ Status updates immediately
- ✅ Notification is sent to seafarer
- ✅ Approval timestamp is recorded
- ✅ Approver name is logged

**Database Verification:**
```sql
SELECT * FROM documents WHERE id = [document_id];
-- Verify status = 'approved', approved_by = [user_id], approved_at is set
```

---

#### TEST CASE C10: Reject Document

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to Document Management
2. Select a pending document
3. Click **"Reject"** button
4. Enter rejection reason: "Document is unclear - please upload higher quality scan"
5. Click **"Submit Rejection"**
6. Verify document status changes to "Rejected"
7. Verify seafarer receives rejection notification with reason
8. Verify document remains in system but marked as rejected

**Expected Results:**
- ✅ Rejection requires reason (mandatory)
- ✅ Reason is sent to seafarer
- ✅ Status updates correctly
- ✅ Document is not deleted
- ✅ Seafarer can re-upload

---

#### TEST CASE C11: Monitor Expiring Documents

**Priority:** Critical  
**Estimated Time:** 10 minutes

**Steps:**
1. Navigate to **Expiry Dashboard**
2. Review expiry summary:
   - Expired (red)
   - Expiring Urgent < 30 days (orange)
   - Expiring Soon < 90 days (yellow)
   - Valid (green)
3. Click **"Expiring Urgent"** filter
4. Select an expiring document
5. Click **"Create Task"** button
6. Verify pre-filled task details:
   - Title: "Renew [Document Type]"
   - Category: "Documentation"
   - Priority: "Urgent" (for < 30 days)
   - Assigned to: [Seafarer]
   - Due date: [Before expiry date]
7. Add additional task notes if needed
8. Click **"Create Task"**
9. Verify task is created and linked to document
10. Verify seafarer receives task notification
11. Return to Expiry Dashboard
12. Verify document now shows "Task Created" status

**Expected Results:**
- ✅ Color coding is accurate based on days until expiry
- ✅ Counts match actual documents
- ✅ Task creation pre-fills correctly
- ✅ Priority auto-sets based on urgency
- ✅ Task is linked to document
- ✅ Status updates after task creation
- ✅ Notification is sent
- ✅ Can't create duplicate tasks for same document

---

### 4.4 Task Management

#### TEST CASE C12: Create Task for Seafarer

**Priority:** High  
**Estimated Time:** 7 minutes

**Steps:**
1. Navigate to **Task Management**
2. Click **"Create Task"** button
3. Fill in task details:
   - Title: "Complete Pre-Joining Medical Examination"
   - Description: "Visit approved clinic for full medical checkup before joining"
   - Category: "Medical"
   - Priority: "High"
   - Assigned To: Select "Mike Sailor"
   - Assignment: Link to relevant assignment (optional)
   - Vessel: Select vessel (optional)
   - Due Date: [Today + 14 days]
4. Click **"Create Task"**
5. Verify task appears in task list
6. Verify task statistics update (Total, Pending counts)
7. Check seafarer receives notification

**Expected Results:**
- ✅ All fields validate correctly
- ✅ Due date must be future date
- ✅ Assigned To dropdown shows only seafarers
- ✅ Task is created successfully
- ✅ Statistics update in real-time
- ✅ Notification is sent to seafarer
- ✅ Task appears with correct priority/category badges

---

#### TEST CASE C13: Edit Existing Task

**Priority:** Medium  
**Estimated Time:** 4 minutes

**Steps:**
1. From Task Management page
2. Find task created in C12
3. Click **"Edit"** button
4. Modify task:
   - Change priority to "Urgent"
   - Update due date to [Today + 7 days]
   - Add to description: "Urgent - joining date moved up"
5. Click **"Save Changes"**
6. Verify changes are reflected
7. Verify seafarer receives update notification

**Expected Results:**
- ✅ Form pre-fills with existing data
- ✅ Changes save successfully
- ✅ Update notification is sent
- ✅ Task history shows modifications

---

#### TEST CASE C14: Delete Task

**Priority:** Medium  
**Estimated Time:** 3 minutes

**Steps:**
1. Create a test task (or use existing)
2. Click **"Delete"** button on task card
3. Confirm deletion in modal
4. Verify task is removed from list
5. Verify statistics update
6. Verify task no longer appears in seafarer's task list

**Expected Results:**
- ✅ Confirmation required before deletion
- ✅ Task is removed successfully
- ✅ Statistics recalculate
- ✅ No broken references remain

---

#### TEST CASE C15: Filter and Search Tasks

**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to Task Management
2. Test filters:
   - Filter by Status: "Pending"
   - Filter by Priority: "High"
   - Filter by Category: "Medical"
   - Combine multiple filters
3. Test search:
   - Search by task title
   - Search by seafarer name
4. Clear all filters
5. Verify results update correctly

**Expected Results:**
- ✅ Filters work correctly
- ✅ Multiple filters can be combined
- ✅ Search returns relevant results
- ✅ Clear filters resets view
- ✅ Result count updates

---

### 4.5 Travel Management

#### TEST CASE C16: Create Travel Arrangement

**Priority:** High  
**Estimated Time:** 10 minutes

**Steps:**
1. Navigate to **Travel Management**
2. Click **"New Travel Arrangement"**
3. Fill in travel details:
   - Assignment: Select assignment for "Mike Sailor"
   - Seafarer: Auto-filled from assignment
   - Travel Type: "Joining"
   - Departure Location: "New York, USA"
   - Arrival Location: "Singapore"
   - Departure Date: [Assignment start - 2 days]
   - Arrival Date: [Assignment start - 1 day]
4. Add **Flight Details**:
   - Flight Number: "SQ25"
   - Airline: "Singapore Airlines"
   - Departure Airport: "JFK"
   - Arrival Airport: "SIN"
   - Departure Time: "23:30"
   - Arrival Time: "05:45 (+1 day)"
5. Add **Accommodation Details**:
   - Hotel Name: "Marina Bay Hotel"
   - Check-in: [Arrival date]
   - Check-out: [Assignment start date]
   - Booking Reference: "MB123456"
6. Add **Transportation Details**:
   - Type: "Airport Transfer"
   - From: "SIN Airport"
   - To: "Marina Bay Hotel"
   - Date/Time: [Upon arrival]
7. Click **"Create Travel Arrangement"**
8. Verify travel arrangement is created
9. Verify status is "Planned"

**Expected Results:**
- ✅ Form validates all required fields
- ✅ Date/time logic validation works
- ✅ Assignment links correctly
- ✅ All details save successfully
- ✅ Travel arrangement appears in list
- ✅ Seafarer can view arrangement in their portal

---

#### TEST CASE C17: Upload Travel Documents

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. From Travel Management, open travel arrangement created in C16
2. Click **"Upload Documents"** tab/section
3. Upload documents:
   - Flight Ticket (PDF)
   - Hotel Confirmation (PDF)
   - Visa (if applicable)
   - Travel Insurance
4. Add document descriptions
5. Click **"Save"**
6. Verify documents are attached
7. Verify seafarer can download documents

**Expected Results:**
- ✅ Multiple file upload works
- ✅ PDF files are accepted
- ✅ File size limits are enforced
- ✅ Documents save successfully
- ✅ Seafarer can access documents
- ✅ Download links work

---

#### TEST CASE C18: Update Travel Status

**Priority:** Medium  
**Estimated Time:** 3 minutes

**Steps:**
1. Open an existing travel arrangement
2. Update status from "Planned" to "In Progress"
3. Add notes: "Seafarer departed New York"
4. Save changes
5. Later, update status to "Completed"
6. Add completion notes: "Seafarer arrived Singapore, checked into hotel"
7. Save changes

**Expected Results:**
- ✅ Status transitions follow logical flow
- ✅ Timestamps are recorded
- ✅ Notes are saved
- ✅ Status history is maintained
- ✅ Notifications sent at key status changes

---

### 4.6 Analytics & Reporting

#### TEST CASE C19: View Company Analytics Dashboard

**Priority:** Medium  
**Estimated Time:** 10 minutes

**Steps:**
1. Navigate to **Analytics & Reports**
2. Review dashboard sections:
   - **Crew Statistics**: Total crew, availability breakdown, by rank
   - **Document Compliance**: Compliance rate, expired, expiring, valid
   - **Task Analytics**: Completion rate, overdue tasks, by category
   - **Assignment Metrics**: Acceptance rate, active assignments, by vessel
3. Test date range filters (Last 30 days, Last 90 days, Custom range)
4. Test company filter (if multi-company access)
5. Click on chart segments to drill down
6. Test **Export Report** functionality:
   - Export as PDF
   - Export as CSV
7. Open exported files and verify data

**Expected Results:**
- ✅ All charts render correctly
- ✅ Data is accurate and matches database
- ✅ Filters update charts/data
- ✅ Charts are interactive
- ✅ Export generates valid files
- ✅ PDF is formatted professionally
- ✅ CSV contains all expected data
- ✅ No performance issues with large datasets

---

### 4.7 Messaging System

#### TEST CASE C20: Send Message to Seafarer

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to **Messages**
2. Find seafarer "Mike Sailor" in contacts/list
3. Click to open conversation (or start new conversation)
4. Type message: "Hi Mike, please confirm your travel documents are ready."
5. Press Enter or click Send
6. Verify message appears immediately
7. Verify timestamp is shown
8. Verify message status shows "Sent"
9. Wait for seafarer to read (next test)

**Expected Results:**
- ✅ Conversation loads correctly
- ✅ Message sends instantly
- ✅ Message appears in chat with correct styling
- ✅ Timestamp is accurate
- ✅ No errors in console
- ✅ Message is saved to database

---

#### TEST CASE C21: Real-time Message Delivery

**Priority:** High  
**Estimated Time:** 10 minutes  
**Prerequisites:** Two devices or browsers

**Steps:**
1. **Device A**: Login as Company User
2. **Device B**: Login as Seafarer (Mike Sailor)
3. **Device A**: Open Messages, start conversation with Mike
4. **Device B**: Navigate to Messages
5. **Device A**: Send message: "Are you ready for your assignment?"
6. **Device B**: Verify message appears instantly without refresh
7. **Device B**: Type reply: "Yes, all documents ready"
8. **Device B**: Send message
9. **Device A**: Verify reply appears instantly
10. **Device B**: Check if "Read" status appears for own message
11. **Device A**: Verify online status indicator shows green for Mike

**Expected Results:**
- ✅ Messages appear instantly on both sides
- ✅ No page refresh needed
- ✅ Read receipts work correctly
- ✅ Online status updates in real-time
- ✅ Message order is preserved
- ✅ Timestamps are synchronized
- ✅ No message duplication
- ✅ Unread count updates correctly

---

#### TEST CASE C22: Message Search and History

**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to Messages
2. Test search functionality:
   - Search for specific word in messages
   - Verify results highlight matching conversations
3. Open a conversation with message history
4. Scroll up to view older messages
5. Verify all messages load correctly
6. Test conversation list sorting (most recent first)
7. Check unread badge counts

**Expected Results:**
- ✅ Search returns relevant conversations
- ✅ Message history loads completely
- ✅ Scrolling doesn't break layout
- ✅ Conversations sort by last message time
- ✅ Unread badges are accurate

---

### 4.8 Notifications

#### TEST CASE C23: Receive and Manage Notifications

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Perform various actions that trigger notifications:
   - Seafarer accepts an assignment
   - Seafarer completes a task
   - Seafarer uploads a document
   - Document is expiring soon
2. Click **Notification Bell** icon in header
3. Review notification list
4. Click on a notification
5. Verify it navigates to relevant page
6. Mark notification as read
7. Verify unread count decreases
8. Click **"Mark All as Read"**
9. Verify all notifications marked as read

**Expected Results:**
- ✅ Notifications appear in real-time
- ✅ Notification bell badge shows unread count
- ✅ Notification panel opens smoothly
- ✅ Notifications are properly formatted
- ✅ Links navigate correctly
- ✅ Mark as read functionality works
- ✅ Timestamps are shown
- ✅ Notification types are color-coded

---

## 5. SEAFARER TESTING WORKFLOWS

### 5.1 Assignment Management (Seafarer View)

#### TEST CASE S1: View Assignments

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Login as Seafarer (`mike.sailor@test.com`)
2. Navigate to **My Assignments**
3. Review assignment list showing:
   - Pending assignments (awaiting response)
   - Accepted assignments
   - Current assignment
   - Past assignments
4. Click on each assignment to view details
5. Verify all information is displayed correctly

**Expected Results:**
- ✅ All assigned assignments are visible
- ✅ Status badges are accurate
- ✅ Assignment details are complete
- ✅ Vessel information is shown
- ✅ Contract dates and salary are visible
- ✅ Company details are available

---

#### TEST CASE S2: Accept Assignment

**Priority:** Critical  
**Estimated Time:** 7 minutes

**Steps:**
1. From My Assignments, find a "Pending" assignment
2. Click **"View Details"**
3. Review all assignment information:
   - Vessel details
   - Position and rank
   - Contract duration and dates
   - Salary and benefits
   - Joining port and date
   - Required documents
4. Click **"Accept Assignment"** button
5. Read acceptance confirmation message
6. Add optional note: "Happy to join. Ready for all preparations."
7. Click **"Confirm Acceptance"**
8. Verify success message
9. Verify assignment status changes to "Accepted"
10. Verify own availability status updates to "On Assignment"
11. Verify company user receives acceptance notification

**Expected Results:**
- ✅ All assignment details are viewable before acceptance
- ✅ Confirmation modal appears
- ✅ Optional note field works
- ✅ Acceptance is recorded with timestamp
- ✅ Status updates correctly
- ✅ Notification sent to company
- ✅ Seafarer can't accept multiple overlapping assignments
- ✅ Next steps/tasks are shown after acceptance

**Database Verification:**
```sql
SELECT status, accepted_at FROM assignments WHERE id = [assignment_id];
SELECT availability_status FROM seafarer_profile WHERE user_id = [user_id];
```

---

#### TEST CASE S3: Reject Assignment

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. From My Assignments, find another "Pending" assignment
2. Click **"View Details"**
3. Click **"Decline Assignment"** button
4. Enter rejection reason: "Family commitments prevent travel at this time"
5. Click **"Confirm Rejection"**
6. Verify assignment status changes to "Rejected"
7. Verify own availability remains "Available"
8. Verify company user receives rejection notification with reason

**Expected Results:**
- ✅ Rejection requires reason (mandatory)
- ✅ Reason is recorded and sent to company
- ✅ Status updates correctly
- ✅ Seafarer remains available for other assignments
- ✅ Notification sent to company
- ✅ Rejection is reversible (company can re-offer)

---

#### TEST CASE S4: View Active Assignment Details

**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to **My Assignments**
2. Find "Accepted" or "Active" assignment
3. Click to view full details
4. Review tabs/sections:
   - **Overview**: Basic assignment info
   - **Tasks**: Related tasks for this assignment
   - **Documents**: Required and uploaded documents
   - **Travel**: Travel arrangements
   - **Timeline**: Assignment milestones
5. Click through each section
6. Verify all information is accessible

**Expected Results:**
- ✅ All sections load correctly
- ✅ Related tasks are shown
- ✅ Document checklist is visible
- ✅ Travel details are accessible
- ✅ Timeline shows progress
- ✅ Navigation between tabs works smoothly

---

### 5.2 Task Management (Seafarer View)

#### TEST CASE S5: View Assigned Tasks

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to **Tasks** or **My Tasks**
2. Review task list showing:
   - Pending tasks
   - In Progress tasks
   - Completed tasks
   - Overdue tasks (if any)
3. Check task cards display:
   - Task title
   - Description
   - Category (with icon)
   - Priority (color-coded)
   - Due date
   - Status
   - Assignment link (if applicable)
4. Test filters:
   - Filter by Status
   - Filter by Priority
   - Filter by Category
5. Test search functionality

**Expected Results:**
- ✅ All assigned tasks are visible
- ✅ Tasks are sorted by due date (earliest first)
- ✅ Overdue tasks are highlighted
- ✅ Priority badges are color-coded correctly
- ✅ Category icons match task type
- ✅ Filters work correctly
- ✅ Search returns relevant results

---

#### TEST CASE S6: Complete Task

**Priority:** Critical  
**Estimated Time:** 7 minutes

**Steps:**
1. From task list, select a "Pending" task
2. Click **"View Task"** or open task details
3. Read task description and requirements
4. If task requires document upload (e.g., "Upload Certificate"):
   - Click **"Upload Document"**
   - Select file
   - Add document type and expiry date
   - Click **"Upload"**
   - Verify document is uploaded
5. Click **"Mark as Complete"** button
6. Add completion notes: "Certificate uploaded and renewed until 2026"
7. Click **"Confirm Completion"**
8. Verify task status changes to "Completed"
9. Verify completion timestamp is shown
10. Verify company user receives completion notification

**Expected Results:**
- ✅ Task details are clear and complete
- ✅ Document upload is required if task category is "Documentation"
- ✅ Can't mark complete without uploading required documents
- ✅ Completion notes are saved
- ✅ Status updates immediately
- ✅ Notification sent to task creator
- ✅ Task moves to "Completed" section
- ✅ Statistics update (task count)

---

#### TEST CASE S7: View Task History

**Priority:** Low  
**Estimated Time:** 3 minutes

**Steps:**
1. Navigate to Tasks
2. Switch to **"Completed"** tab/filter
3. Review completed tasks
4. Click on a completed task
5. View completion details:
   - Completed date/time
   - Completion notes
   - Uploaded documents (if any)
   - Time taken to complete

**Expected Results:**
- ✅ Completed tasks are accessible
- ✅ All completion details are shown
- ✅ Cannot modify completed tasks
- ✅ History is maintained

---

### 5.3 Document Management (Seafarer View)

#### TEST CASE S8: Upload Document

**Priority:** High  
**Estimated Time:** 7 minutes

**Steps:**
1. Navigate to **My Documents**
2. Click **"Upload Document"** button
3. Fill in document details:
   - Document Type: "STCW Certificate"
   - Document Number: "STCW123456"
   - Issue Date: "01/01/2023"
   - Expiry Date: "01/01/2028"
   - Issuing Authority: "Maritime Authority"
4. Click **"Choose File"**
5. Select a PDF file (< 10MB)
6. Click **"Upload"**
7. Verify upload progress indicator
8. Verify success message
9. Verify document appears in document list with status "Pending Approval"

**Expected Results:**
- ✅ Form validates all required fields
- ✅ File type validation (PDF, JPEG, PNG accepted)
- ✅ File size validation (max 10MB)
- ✅ Upload progress shown
- ✅ Document is uploaded successfully
- ✅ Status is "Pending Approval"
- ✅ Document appears in personal document list
- ✅ Company user receives notification for approval

**Test with different file types:**
- ✅ PDF (should work)
- ✅ JPEG/PNG (should work for photos)
- ❌ DOCX (should reject or convert)
- ❌ Files > 10MB (should reject)

---

#### TEST CASE S9: View Document Status

**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to My Documents
2. Review document list showing:
   - Pending approval documents
   - Approved documents
   - Rejected documents
   - Expired documents
3. Check status badges for each:
   - 🟡 Pending (yellow)
   - ✅ Approved (green)
   - ❌ Rejected (red)
   - ⚠️ Expired (red)
4. Click on each document to view details
5. For approved documents, verify approval date and approver
6. For rejected documents, verify rejection reason is shown

**Expected Results:**
- ✅ All documents are listed
- ✅ Status badges are accurate
- ✅ Color coding is correct
- ✅ Approved documents show approver and date
- ✅ Rejected documents show reason
- ✅ Can download own uploaded documents

---

#### TEST CASE S10: Reupload Rejected Document

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Find a document with status "Rejected"
2. Read rejection reason (e.g., "Image quality too low")
3. Click **"Reupload"** or **"Upload New Version"**
4. Upload a better quality file
5. Add note: "Reuploaded with better quality scan"
6. Submit
7. Verify new version is uploaded
8. Verify status resets to "Pending Approval"
9. Verify company receives new approval request

**Expected Results:**
- ✅ Can reupload rejected documents
- ✅ Old version is preserved (version history)
- ✅ New version status is "Pending"
- ✅ Notification sent for new approval
- ✅ Notes are attached

---

#### TEST CASE S11: View Document Expiry Alerts

**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to Dashboard or Documents page
2. Check for expiry alerts/warnings:
   - Documents expiring in < 30 days (urgent)
   - Documents expiring in < 90 days (soon)
   - Expired documents
3. Click on expiry alert
4. Verify it shows document details and expiry date
5. Click **"Renew Document"** action
6. Verify redirected to upload page with pre-filled details

**Expected Results:**
- ✅ Expiry alerts are prominently displayed
- ✅ Color coding by urgency
- ✅ Counts are accurate
- ✅ Links navigate correctly
- ✅ Renewal process is clear

---

### 5.4 Travel Management (Seafarer View)

#### TEST CASE S12: View Travel Arrangements

**Priority:** High  
**Estimated Time:** 7 minutes

**Steps:**
1. Navigate to **My Travel**
2. Review travel arrangements list
3. Click on a travel arrangement
4. Review all travel details:
   - **Flight Information**:
     - Flight number, airline
     - Departure/arrival airports
     - Departure/arrival dates and times
     - Seat number, booking reference
   - **Accommodation**:
     - Hotel name and address
     - Check-in/check-out dates
     - Booking reference
   - **Transportation**:
     - Airport transfers
     - Pick-up times and locations
   - **Documents**:
     - Travel tickets
     - Hotel confirmations
     - Visa documents
     - Insurance
5. Download each document
6. Verify all downloads work

**Expected Results:**
- ✅ All travel arrangements are visible
- ✅ All details are complete and accurate
- ✅ Dates and times are formatted correctly
- ✅ Documents are accessible
- ✅ Downloads work for all files
- ✅ Contact information is provided
- ✅ Layout is clear and easy to read

---

#### TEST CASE S13: Download Travel Documents

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. From travel arrangement details
2. Navigate to **Documents** section
3. Download each document:
   - Flight ticket
   - Hotel confirmation
   - Visa (if applicable)
   - Travel insurance
   - Travel itinerary
4. Open each downloaded file
5. Verify content is correct and readable
6. Test **"Download All"** button (if available)
7. Verify ZIP file contains all documents

**Expected Results:**
- ✅ All documents download successfully
- ✅ Files open correctly
- ✅ Content is as expected
- ✅ Download all creates complete package
- ✅ No corrupted files

---

#### TEST CASE S14: Update Travel Status

**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Open travel arrangement
2. Update travel status:
   - When departing: Set status to "In Transit"
   - Add note: "Departed from New York JFK"
3. Upon arrival:
   - Update status to "Arrived"
   - Add note: "Arrived Singapore, checked into hotel"
4. After joining vessel:
   - Update status to "Completed"
5. Verify each status change is recorded with timestamp
6. Verify company receives status updates

**Expected Results:**
- ✅ Can update status at appropriate times
- ✅ Notes are saved
- ✅ Timestamps recorded
- ✅ Company notified of status changes
- ✅ Status history maintained

---

### 5.5 Profile Management

#### TEST CASE S15: Update Personal Profile

**Priority:** Medium  
**Estimated Time:** 7 minutes

**Steps:**
1. Navigate to **Profile**
2. Click **"Edit Profile"**
3. Update personal information:
   - Phone number
   - Email (if editable)
   - Address
   - Emergency contact name
   - Emergency contact phone
   - Next of kin details
4. Click **"Save Changes"**
5. Verify success message
6. Verify changes are reflected
7. Logout and login again
8. Verify changes persisted

**Expected Results:**
- ✅ Form pre-fills with current data
- ✅ Validation works for all fields
- ✅ Changes save successfully
- ✅ Data persists after logout/login
- ✅ Profile completion percentage updates (if shown)

---

#### TEST CASE S16: Update Professional Information

**Priority:** Medium  
**Estimated Time:** 7 minutes

**Steps:**
1. Navigate to Profile
2. Go to **Professional Details** section
3. Update information:
   - Years of experience
   - Skills (add new skills)
   - Languages spoken
   - Previous vessels (add vessel name)
   - Training completed
4. Upload profile photo (if not done)
5. Save changes
6. Verify updates appear in crew directory (visible to company)

**Expected Results:**
- ✅ All fields update correctly
- ✅ Skills can be added/removed
- ✅ Photo upload works
- ✅ Changes visible to company users
- ✅ Profile looks complete

---

#### TEST CASE S17: Update Availability Status

**Priority:** High  
**Estimated Time:** 3 minutes

**Steps:**
1. Navigate to Profile or Dashboard
2. Find **Availability Status** field
3. Change status to "On Leave"
4. Add reason/dates: "Annual leave from [date] to [date]"
5. Save
6. Verify status updates
7. Verify status badge changes color
8. Change back to "Available" after leave
9. Verify company can see availability status

**Expected Results:**
- ✅ Status can be updated by seafarer
- ✅ Reason/dates can be added
- ✅ Status immediately reflected
- ✅ Company users see updated status
- ✅ Can't be assigned while "On Leave"

---

### 5.6 Notifications (Seafarer)

#### TEST CASE S18: Receive Various Notifications

**Priority:** High  
**Estimated Time:** 10 minutes

**Prerequisites:** Have company user perform actions that trigger notifications

**Steps:**
1. Have company user:
   - Create a new assignment for this seafarer
   - Create a new task for this seafarer
   - Approve a document
   - Create travel arrangement
2. As seafarer, click notification bell
3. Verify notifications received for:
   - ✉️ New assignment offer
   - 📋 New task assigned
   - ✅ Document approved
   - ✈️ Travel arrangement created
4. Click on each notification
5. Verify each navigates to correct page
6. Mark individual notifications as read
7. Verify unread count decreases
8. Mark all as read
9. Verify badge clears

**Expected Results:**
- ✅ All notification types are received
- ✅ Notifications appear in real-time
- ✅ Badge count is accurate
- ✅ Clicking navigates correctly
- ✅ Mark as read works
- ✅ Notification content is clear and informative

---

### 5.7 Messaging (Seafarer)

#### TEST CASE S19: Send Message to Company

**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to **Messages**
2. Find company user in contacts
3. Click to open conversation
4. Send message: "I have a question about my travel arrangements"
5. Wait for response from company user
6. Continue conversation with follow-up questions
7. Verify message history is maintained

**Expected Results:**
- ✅ Can initiate conversation with company
- ✅ Messages send successfully
- ✅ Responses appear in real-time
- ✅ Conversation flow is natural
- ✅ History is preserved

---

## 6. CROSS-ROLE INTEGRATION TESTS

### 6.1 Complete Assignment Workflow

#### TEST CASE I1: End-to-End Assignment Creation to Acceptance

**Priority:** Critical  
**Estimated Time:** 25 minutes  
**Participants:** Admin, Company User, Seafarer

**Steps:**

**Phase 1: Setup (Admin - 5 min)**
1. Login as Admin
2. Verify company exists: "Test Shipping Inc."
3. Verify vessel exists: "MV Test Voyager"
4. Verify seafarer exists: "Mike Sailor" (Status: Available)
5. Verify company user exists: "John Shore"

**Phase 2: Assignment Creation (Company User - 10 min)**
6. Login as Company User (john.shore@testshipping.com)
7. Navigate to Assignment Management
8. Create new assignment:
   - Vessel: MV Test Voyager
   - Position: 2nd Officer
   - Start: [30 days from now]
   - Duration: 6 months
   - Joining Port: Singapore
   - Salary: $4500/month
9. Search for seafarer: Filter by Rank "2nd Officer", Status "Available"
10. Select "Mike Sailor"
11. Create assignment
12. Verify assignment created with status "Pending"
13. Verify notification sent to Mike

**Phase 3: Seafarer Response (Seafarer - 10 min)**
14. Login as Seafarer (mike.sailor@test.com)
15. Check notifications - verify assignment notification received
16. Navigate to My Assignments
17. Find new assignment (status: Pending)
18. Click to view details
19. Review all assignment information
20. Accept assignment with note
21. Verify status changes to "Accepted"
22. Verify availability status changes to "On Assignment"

**Phase 4: Verification (Company User)**
23. Switch back to Company User
24. Check notifications - verify acceptance notification
25. Navigate to Assignment Management
26. Find assignment - verify status "Accepted"
27. View seafarer profile - verify status "On Assignment"

**Expected Results:**
- ✅ Complete workflow executes smoothly
- ✅ All status transitions occur correctly
- ✅ Notifications sent at each step
- ✅ Data consistency across all views
- ✅ No errors at any stage
- ✅ Timestamps recorded accurately

---

### 6.2 Complete Task Workflow

#### TEST CASE I2: Task Creation to Completion with Document Upload

**Priority:** Critical  
**Estimated Time:** 20 minutes  
**Participants:** Company User, Seafarer

**Steps:**

**Phase 1: Task Creation (Company User - 5 min)**
1. Login as Company User
2. Navigate to Task Management
3. Create task:
   - Title: "Upload Renewed Medical Certificate"
   - Category: Documentation
   - Priority: High
   - Assigned to: Mike Sailor
   - Due date: [7 days from now]
   - Description: "Please upload your renewed medical certificate before joining"
4. Create task
5. Verify task appears with status "Pending"

**Phase 2: Task Completion (Seafarer - 10 min)**
6. Login as Seafarer
7. Check notification for new task
8. Navigate to My Tasks
9. Find task "Upload Renewed Medical Certificate"
10. Click to view task details
11. Click "Upload Document" (required for this task)
12. Upload medical certificate:
    - Type: Medical Certificate
    - Issue Date: [recent date]
    - Expiry Date: [1 year from issue]
    - Upload PDF file
13. Verify document uploaded
14. Click "Mark as Complete"
15. Add note: "Certificate renewed and uploaded"
16. Submit completion
17. Verify task status changes to "Completed"

**Phase 3: Verification (Company User - 5 min)**
18. Switch to Company User
19. Check notification for task completion
20. Navigate to Task Management
21. Verify task shows as "Completed"
22. Navigate to Document Management
23. Find newly uploaded medical certificate
24. Verify status "Pending Approval"
25. Approve document
26. Verify seafarer receives approval notification

**Expected Results:**
- ✅ Task workflow completes successfully
- ✅ Mandatory document upload enforced
- ✅ Document links to task
- ✅ All notifications sent correctly
- ✅ Status updates happen in real-time
- ✅ Document approval workflow triggers

---

### 6.3 Document Expiry to Task Creation Workflow

#### TEST CASE I3: Expiring Document Detection and Task Assignment

**Priority:** High  
**Estimated Time:** 15 minutes  
**Participants:** System (automated), Company User, Seafarer

**Prerequisites:** Have a document expiring in < 30 days

**Steps:**

**Phase 1: Expiry Detection (Company User - 5 min)**
1. Login as Company User
2. Navigate to **Expiry Dashboard**
3. Review expiry summary
4. Click on **"Expiring Urgent"** (< 30 days)
5. Find document expiring soon
6. Review document details

**Phase 2: Task Creation from Expiry (Company User - 5 min)**
7. Click **"Create Task"** button on expiring document
8. Verify task form pre-fills:
   - Title: "Renew [Document Type]"
   - Category: Documentation
   - Priority: Urgent
   - Assigned to: [Document owner]
   - Due date: [Before expiry date]
9. Add additional instructions
10. Create task
11. Verify task created and linked to document
12. Verify document shows "Task Created" status

**Phase 3: Task Completion (Seafarer - 5 min)**
13. Login as Seafarer (document owner)
14. Check notification for urgent task
15. Navigate to My Tasks
16. Find renewal task (Priority: Urgent)
17. Upload renewed document
18. Complete task
19. Verify new document submitted for approval
20. Wait for company approval

**Phase 4: Approval (Company User)**
21. Switch to Company User
22. Approve new document
23. Verify old document status updated
24. Verify expiry dashboard no longer shows urgent alert for this document

**Expected Results:**
- ✅ Expiry detection works accurately
- ✅ Task creation from expiry dashboard functional
- ✅ Pre-filled task details correct
- ✅ Task-document linking maintained
- ✅ Renewal workflow completes
- ✅ Expiry status updates after renewal

---

### 6.4 Complete Travel Workflow

#### TEST CASE I4: Travel Arrangement Creation to Journey Completion

**Priority:** High  
**Estimated Time:** 20 minutes  
**Participants:** Company User, Seafarer

**Steps:**

**Phase 1: Travel Booking (Company User - 10 min)**
1. Login as Company User
2. Navigate to Travel Management
3. Create travel arrangement for accepted assignment
4. Add flight details
5. Add hotel booking
6. Add airport transfer
7. Upload travel documents (ticket, hotel confirmation)
8. Save arrangement with status "Planned"
9. Verify seafarer receives notification

**Phase 2: Pre-Travel (Seafarer - 5 min)**
10. Login as Seafarer
11. Check travel notification
12. Navigate to My Travel
13. Review all travel details
14. Download all travel documents
15. Verify all details are correct
16. Confirm ready to travel (if option available)

**Phase 3: Travel Execution (Seafarer - 5 min)**
17. On departure day, update status to "In Transit"
18. Add note with departure details
19. On arrival, update status to "Arrived"
20. Add note with arrival details
21. After hotel check-in, confirm accommodation
22. After joining vessel, update to "Completed"
23. Verify company receives all status updates

**Expected Results:**
- ✅ Travel arrangement created with all details
- ✅ Documents accessible to seafarer
- ✅ Status updates work throughout journey
- ✅ Company receives real-time updates
- ✅ Complete travel history maintained
- ✅ No issues with document downloads

---

### 6.5 Messaging Integration Test

#### TEST CASE I5: Multi-Party Real-Time Communication

**Priority:** High  
**Estimated Time:** 15 minutes  
**Participants:** 2 Company Users, 2 Seafarers  
**Prerequisites:** 4 browsers/devices

**Steps:**

**Phase 1: Setup**
1. Device A: Login as Company User 1
2. Device B: Login as Company User 2
3. Device C: Login as Seafarer 1
4. Device D: Login as Seafarer 2
5. All navigate to Messages

**Phase 2: Simultaneous Messaging**
6. Device A (Company 1) → Send message to Seafarer 1
7. Device C (Seafarer 1) → Verify receives instantly
8. Device C (Seafarer 1) → Reply to Company 1
9. Device A (Company 1) → Verify reply received
10. Device B (Company 2) → Send message to Seafarer 2
11. Device D (Seafarer 2) → Verify receives instantly
12. Repeat back-and-forth messages

**Phase 3: Cross-Conversation**
13. Device A → Send to both Seafarer 1 and Seafarer 2 (separate conversations)
14. Verify both receive correct messages
15. Both seafarers reply
16. Verify Company 1 receives both in correct conversations

**Phase 4: Read Receipts & Status**
17. Check read receipts update correctly
18. Check online status indicators
19. Check unread counts
20. Mark some as read
21. Verify counts update

**Expected Results:**
- ✅ All messages deliver instantly
- ✅ No messages mixed between conversations
- ✅ Read receipts accurate
- ✅ Online status updates
- ✅ Unread counts correct
- ✅ No performance degradation with multiple active chats

---

## 7. NON-AI FEATURE TESTING CHECKLIST

### 7.1 Core Features (Must Test Before AI)

#### User Management
- [ ] Create Admin user
- [ ] Create Company user
- [ ] Create Seafarer user
- [ ] Edit user details
- [ ] Deactivate/delete user
- [ ] User login/logout
- [ ] Password reset
- [ ] Role-based access control

#### Company Management
- [ ] Create company
- [ ] Edit company details
- [ ] View company list
- [ ] Link users to companies
- [ ] Company-specific data isolation

#### Vessel Management
- [ ] Add new vessel
- [ ] Edit vessel details
- [ ] Update vessel status
- [ ] Link vessel to company
- [ ] View fleet list
- [ ] Search/filter vessels

#### Crew Directory
- [ ] View all seafarers
- [ ] Search seafarers
- [ ] Filter by rank/status/experience
- [ ] Sort seafarer list
- [ ] View seafarer profile
- [ ] Edit seafarer details
- [ ] Export crew data

#### Assignment Management (Manual)
- [ ] Create assignment manually
- [ ] Select seafarer for assignment
- [ ] Edit assignment details
- [ ] Cancel assignment
- [ ] Seafarer accepts assignment
- [ ] Seafarer rejects assignment
- [ ] View assignment history
- [ ] Assignment status tracking

#### Task Management
- [ ] Create task
- [ ] Assign task to seafarer
- [ ] Edit task
- [ ] Delete task
- [ ] Seafarer marks task complete
- [ ] Task with mandatory document upload
- [ ] Filter tasks by status/priority/category
- [ ] Search tasks
- [ ] View task statistics

#### Document Management
- [ ] Upload document (seafarer)
- [ ] Review document (company)
- [ ] Approve document
- [ ] Reject document with reason
- [ ] View document expiry status
- [ ] Download document
- [ ] Delete document
- [ ] Document version control

#### Document Expiry System
- [ ] View expiry dashboard
- [ ] Filter by urgency level
- [ ] Create task from expiring document
- [ ] Expiry status calculation (Expired/Urgent/Soon/Valid)
- [ ] Expiry summary statistics
- [ ] Sort by expiry date

#### Travel Management
- [ ] Create travel arrangement
- [ ] Add flight details
- [ ] Add accommodation details
- [ ] Add transportation details
- [ ] Upload travel documents
- [ ] Seafarer views travel details
- [ ] Seafarer downloads documents
- [ ] Update travel status
- [ ] Complete travel journey

#### Notification System
- [ ] Receive assignment notification
- [ ] Receive task notification
- [ ] Receive document approval notification
- [ ] Receive travel notification
- [ ] Mark notification as read
- [ ] Mark all as read
- [ ] Unread badge count
- [ ] Notification navigation links

#### Messaging System
- [ ] Start conversation
- [ ] Send message
- [ ] Receive message in real-time
- [ ] Read receipts
- [ ] Online/offline status
- [ ] Search conversations
- [ ] View message history
- [ ] Unread message count
- [ ] Multiple simultaneous conversations

#### Analytics & Reporting
- [ ] View crew statistics
- [ ] View document compliance metrics
- [ ] View task completion analytics
- [ ] View assignment metrics
- [ ] Filter by date range
- [ ] Filter by company
- [ ] Export report as PDF
- [ ] Export data as CSV
- [ ] Charts render correctly

---

### 7.2 UI/UX Testing

#### Responsive Design
- [ ] Desktop view (1920x1080)
- [ ] Desktop view (1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Navigation menu adapts to screen size
- [ ] Tables are responsive
- [ ] Forms work on all screen sizes

#### Navigation
- [ ] Sidebar navigation works
- [ ] Role-based menu items show correctly
- [ ] Active page highlighted
- [ ] Breadcrumbs work (if present)
- [ ] Links navigate correctly
- [ ] Back button works
- [ ] Deep links work

#### Forms
- [ ] Required field validation
- [ ] Email format validation
- [ ] Date validation
- [ ] Number validation
- [ ] Character limits enforced
- [ ] Error messages clear
- [ ] Success messages appear
- [ ] Form reset works

#### Performance
- [ ] Pages load within 2 seconds
- [ ] Large lists load/paginate smoothly
- [ ] Search results appear quickly
- [ ] File uploads show progress
- [ ] No memory leaks during extended use
- [ ] Real-time features don't slow down app

#### Accessibility
- [ ] Tab navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast sufficient
- [ ] Alt text on images
- [ ] Error messages are clear
- [ ] Forms have proper labels

---

### 7.3 Security Testing

#### Authentication
- [ ] Cannot access app without login
- [ ] Invalid credentials rejected
- [ ] Session timeout works
- [ ] Logout clears session
- [ ] Cannot access other user's data

#### Authorization
- [ ] Seafarers can't access admin features
- [ ] Company users can't access other companies' data
- [ ] Admins have full access
- [ ] Role-based pages protected
- [ ] API endpoints protected

#### Data Security
- [ ] Passwords are encrypted
- [ ] Sensitive data not visible in URLs
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] CSRF protection enabled
- [ ] File upload validation (type, size)

---

### 7.4 Data Integrity Testing

#### Database
- [ ] Foreign key constraints work
- [ ] Cascade deletes work correctly
- [ ] Unique constraints enforced
- [ ] Timestamps auto-update
- [ ] Soft deletes work (if used)

#### Notifications
- [ ] Notifications created for all trigger events
- [ ] No duplicate notifications
- [ ] Notification recipients correct
- [ ] Notification content accurate

#### Status Transitions
- [ ] Assignment status transitions valid
- [ ] Task status transitions valid
- [ ] Document status transitions valid
- [ ] Seafarer availability updates correctly

---

## 8. AI FEATURE TESTING (PHASE 2)

**Note:** Test AI features only after all non-AI features are fully tested and working.

### 8.1 AI Configuration

#### TEST CASE AI1: Enable AI for Company

**Priority:** High  
**Estimated Time:** 10 minutes

**Steps:**
1. Login as Admin
2. Navigate to **Admin > AI Agent Settings**
3. Find "Test Shipping Inc." company
4. Toggle **"Enable AI Agent"** to ON
5. Configure AI settings:
   - Autonomy Level: "Semi-Autonomous"
   - Min Match Score: 85
   - Advance Planning Days: 30
   - Auto-Approve Threshold: $500
6. Enable features:
   - ☑ Crew Planning
   - ☑ Task Generation
   - ☐ Document Analysis (Phase 2)
   - ☐ Compliance Monitoring (Phase 2)
7. Save configuration
8. Verify AI status shows "Active"

**Expected Results:**
- ✅ AI can be enabled per company
- ✅ Configuration saves successfully
- ✅ Only enabled companies see AI features
- ✅ Settings are applied correctly

---

#### TEST CASE AI2: AI Assignment Generation

**Priority:** Critical  
**Estimated Time:** 30 minutes

**Prerequisites:**
- AI enabled for company
- Vessel needs crew relief (assignment ending soon)
- Available seafarers exist

**Steps:**

**Phase 1: Trigger AI Analysis**
1. Wait for scheduled cron job (daily at 6 AM) OR trigger manually
2. AI analyzes assignments ending in next 30 days
3. AI identifies crew needing relief

**Phase 2: AI Matching Process**
4. AI searches for suitable seafarer candidates
5. AI evaluates each candidate:
   - Rank compatibility
   - Experience level
   - Availability status
   - Previous performance
   - Document validity
   - Preferences (if learned)
6. AI generates match score (0-100) for each candidate
7. AI selects best match (highest score)

**Phase 3: AI Assignment Creation**
8. AI creates draft assignment
9. AI generates reasoning/explanation
10. AI logs decision and alternatives
11. Assignment created with status "AI Pending Review"

**Phase 4: Company Review**
12. Login as Company User
13. Navigate to **AI Assignment Queue**
14. Find new AI-generated assignment
15. Review assignment details
16. Review AI reasoning:
    - Why this seafarer was selected
    - Match score and factors
    - Alternative candidates considered
    - Risk factors identified
17. Review candidate comparison table

**Phase 5: Company Decision**
18. Option A: **Approve** assignment
    - Click "Approve"
    - Add feedback (optional)
    - Submit
    - Verify assignment status changes to "Pending" (sent to seafarer)
    - Verify seafarer receives assignment notification
19. Option B: **Reject** assignment
    - Click "Reject"
    - Enter reason: "Prefer more experienced candidate"
    - Submit
    - Verify assignment cancelled
    - Verify AI logs rejection for learning
20. Option C: **Modify** assignment
    - Click "Modify"
    - Change details (salary, dates, etc.)
    - Save changes
    - Approve modified assignment

**Expected Results:**
- ✅ AI identifies relief needs accurately
- ✅ AI matches appropriate seafarers
- ✅ Match scores are reasonable (>70%)
- ✅ AI reasoning is clear and logical
- ✅ Assignment details are complete
- ✅ Company can review before seafarer sees
- ✅ Approval/rejection workflow works
- ✅ AI learns from feedback
- ✅ All AI actions are logged

**Database Verification:**
```sql
-- Check AI assignment
SELECT * FROM ai_generated_assignments ORDER BY created_at DESC LIMIT 1;

-- Check AI reasoning
SELECT ai_reasoning FROM ai_generated_assignments WHERE id = [ai_assignment_id];

-- Check AI logs
SELECT * FROM ai_action_logs WHERE related_assignment_id = [assignment_id] ORDER BY created_at DESC;
```

---

#### TEST CASE AI3: AI Performance Metrics

**Priority:** Medium  
**Estimated Time:** 10 minutes

**Steps:**
1. Login as Company User
2. Navigate to **AI Performance Dashboard**
3. Review metrics:
   - Total AI assignments created
   - Approval rate (%)
   - Rejection rate (%)
   - Average match score
   - Time saved (hours)
   - Cost savings ($)
4. Review charts:
   - AI assignments over time
   - Approval/rejection breakdown
   - Match score distribution
5. Filter by date range (Last 30 days, Last 90 days)
6. Export AI performance report

**Expected Results:**
- ✅ Metrics display accurately
- ✅ Approval rate is reasonable (>60%)
- ✅ Charts render correctly
- ✅ Filters work
- ✅ Export generates report
- ✅ Performance improves over time (as AI learns)

---

#### TEST CASE AI4: AI Task Generation

**Priority:** Medium  
**Estimated Time:** 15 minutes

**Prerequisites:** AI task generation enabled

**Steps:**
1. Trigger AI task generation (cron or manual)
2. AI analyzes scenarios:
   - Seafarer accepted assignment → Generate onboarding tasks
   - Document expiring soon → Generate renewal task
   - Assignment starting soon → Generate pre-joining tasks
3. AI creates appropriate tasks
4. Login as Company User
5. Navigate to Task Management
6. Find AI-generated tasks (marked with AI badge)
7. Review task details and AI reasoning
8. Verify tasks are relevant and properly assigned
9. Edit or delete if needed

**Expected Results:**
- ✅ AI generates contextually appropriate tasks
- ✅ Tasks have correct priority/category
- ✅ Due dates are logical
- ✅ Tasks are assigned to correct seafarers
- ✅ Can distinguish AI tasks from manual tasks
- ✅ Company can edit/delete AI tasks

---

#### TEST CASE AI5: AI Learning from Feedback

**Priority:** Medium  
**Estimated Time:** 20 minutes

**Test AI improvement over multiple iterations:**

**Steps:**
1. Create 5 AI assignments and reject 3 with specific feedback
2. Note common rejection reasons (e.g., "prefer more experienced")
3. Wait for AI to process feedback
4. Trigger new AI assignment generation
5. Review new AI suggestions
6. Verify AI considers previous feedback:
   - Prioritizes more experienced seafarers
   - Avoids previously rejected combinations
   - Adjusts match scoring
7. Check AI confidence scores improve
8. Review AI action logs for learning indicators

**Expected Results:**
- ✅ AI adjusts recommendations based on feedback
- ✅ Approval rate improves over time
- ✅ Match scores more accurate
- ✅ AI avoids repeating rejected patterns
- ✅ Learning is logged

---

### 8.2 AI Edge Cases

#### TEST CASE AI6: No Suitable Candidates

**Steps:**
1. Create scenario where no seafarers match requirements
2. Trigger AI assignment generation
3. Verify AI handles gracefully:
   - Logs "no suitable candidates found"
   - Notifies company
   - Does not create invalid assignment
   - Suggests alternatives or manual assignment

**Expected Results:**
- ✅ AI doesn't force bad matches
- ✅ Company is notified
- ✅ Fallback to manual process

---

#### TEST CASE AI7: Multiple Equally Qualified Candidates

**Steps:**
1. Create scenario with 3+ seafarers with similar qualifications
2. Trigger AI
3. Verify AI selection logic:
   - Uses tie-breaker criteria
   - Shows all candidates with similar scores
   - Explains selection reasoning
4. Company can see alternatives

**Expected Results:**
- ✅ AI makes consistent decision
- ✅ Reasoning is clear
- ✅ Alternatives are visible

---

#### TEST CASE AI8: AI Service Failure Handling

**Steps:**
1. Temporarily disable AI service (simulate failure)
2. Trigger AI assignment generation
3. Verify system:
   - Logs error
   - Notifies admin
   - Falls back to manual workflow
   - App remains functional
4. Re-enable AI service
5. Verify recovery

**Expected Results:**
- ✅ App doesn't crash
- ✅ Error logged
- ✅ Graceful degradation
- ✅ Recovery works

---

## 9. REGRESSION TESTING

### 9.1 Regression Test Suite

**Run these tests after any major update/deployment:**

#### Critical Path Tests (30 min)
- [ ] User login
- [ ] Create company
- [ ] Create users (all types)
- [ ] Create assignment
- [ ] Seafarer accepts assignment
- [ ] Create task
- [ ] Seafarer completes task
- [ ] Upload document
- [ ] Approve document
- [ ] Send message

#### Full Regression (2-3 hours)
- [ ] All TEST CASES from sections 3-5
- [ ] All integration tests from section 6
- [ ] All UI/UX checks from section 7.2
- [ ] All security checks from section 7.3

### 9.2 Smoke Tests (Quick Verification)

**Run after every deployment (15 min):**
- [ ] App loads without errors
- [ ] Login works
- [ ] Dashboard displays
- [ ] Navigation works
- [ ] Database connection active
- [ ] Real-time features working
- [ ] No console errors

---

## 10. BUG REPORTING TEMPLATE

### Bug Report Format

**Title:** [Brief description of the issue]

**Bug ID:** [Unique identifier]

**Reported By:** [Tester name]

**Date:** [Date found]

**Environment:** [Staging/Production/Local]

**Severity:**
- 🔴 Critical: App crash, data loss, security breach
- 🟠 High: Major feature broken, no workaround
- 🟡 Medium: Feature partially works, workaround exists
- 🟢 Low: Minor issue, cosmetic, enhancement

**Priority:**
- P1: Fix immediately
- P2: Fix before next release
- P3: Fix when possible
- P4: Backlog

**Module:** [e.g., Assignment Management, Task System]

**User Role:** [Admin/Company/Seafarer]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots/Video:**
[Attach visual evidence]

**Console Errors:**
```
[Paste any console errors]
```

**Database State (if applicable):**
```sql
[Relevant database queries/state]
```

**Additional Notes:**
[Any other relevant information]

---

### Example Bug Report

**Title:** Cannot upload documents larger than 5MB despite 10MB limit

**Bug ID:** BUG-2025-001

**Reported By:** QA Tester John

**Date:** October 19, 2025

**Environment:** Staging

**Severity:** 🟠 High

**Priority:** P2

**Module:** Document Management

**User Role:** Seafarer

**Steps to Reproduce:**
1. Login as seafarer
2. Navigate to My Documents
3. Click "Upload Document"
4. Select a PDF file sized 7MB
5. Fill in document details
6. Click "Upload"

**Expected Result:**
File uploads successfully (as limit is 10MB per spec)

**Actual Result:**
Error message appears: "File too large. Maximum size is 5MB."
Upload fails.

**Screenshots:**
[Attached: error-message.png]

**Console Errors:**
```
Error: File size exceeds limit
at FileValidator.js:45
```

**Database State:**
N/A - upload doesn't reach database

**Additional Notes:**
- Issue occurs for all file types
- Files under 5MB upload fine
- Possible mismatch between frontend and backend validation
- Need to check Supabase storage bucket settings

---

## 📊 TEST EXECUTION TRACKING

### Test Progress Dashboard

| Category | Total Tests | Passed | Failed | Blocked | Progress |
|----------|-------------|--------|--------|---------|----------|
| Admin Tests | 8 | 0 | 0 | 0 | 0% |
| Company Tests | 23 | 0 | 0 | 0 | 0% |
| Seafarer Tests | 19 | 0 | 0 | 0 | 0% |
| Integration Tests | 5 | 0 | 0 | 0 | 0% |
| Non-AI Checklist | 100+ | 0 | 0 | 0 | 0% |
| AI Tests | 8 | 0 | 0 | 0 | 0% |
| **TOTAL** | **163+** | **0** | **0** | **0** | **0%** |

### Daily Test Report Template

**Date:** [Date]  
**Tester:** [Name]  
**Hours:** [Hours spent]  
**Environment:** [Environment tested]

**Tests Executed Today:**
- [ ] TEST CASE ID - Result (Pass/Fail)
- [ ] TEST CASE ID - Result (Pass/Fail)

**Bugs Found:** [Count]
- BUG-ID-001: Brief description (Severity)
- BUG-ID-002: Brief description (Severity)

**Tests Blocked:** [Count]
- TEST CASE ID - Reason

**Notes:**
[Any observations, suggestions, or issues]

---

## 📝 FINAL CHECKLIST BEFORE PRODUCTION

### Pre-Production Checklist

**Functionality:**
- [ ] All critical features tested
- [ ] All high priority features tested
- [ ] All integrations working
- [ ] No P1 or P2 bugs remain
- [ ] AI features working (if enabled)

**Performance:**
- [ ] App loads in < 2 seconds
- [ ] No memory leaks
- [ ] Real-time features responsive
- [ ] Large datasets handled well

**Security:**
- [ ] All security tests passed
- [ ] No vulnerabilities found
- [ ] Access controls verified
- [ ] Data encryption confirmed

**Data:**
- [ ] Database backed up
- [ ] Test data cleaned/prepared
- [ ] Production data migration tested
- [ ] Rollback plan ready

**Documentation:**
- [ ] User guides updated
- [ ] API documentation current
- [ ] Deployment guide ready
- [ ] Bug reports compiled

**Monitoring:**
- [ ] Error logging active
- [ ] Performance monitoring set up
- [ ] Alert system configured
- [ ] Backup system verified

---

## 📞 SUPPORT & CONTACTS

**Development Team Lead:**  
[Name] - [Email] - [Phone]

**QA Team Lead:**  
[Name] - [Email] - [Phone]

**DevOps/Infrastructure:**  
[Name] - [Email] - [Phone]

**Product Owner:**  
[Name] - [Email] - [Phone]

**Emergency Contact (Production Issues):**  
[Name] - [Phone] - Available 24/7

---

## 🎯 TESTING SUMMARY

This comprehensive E2E testing guide covers:

✅ **163+ test cases** across all features and user roles  
✅ **Step-by-step instructions** with expected results  
✅ **Cross-role integration tests** for complete workflows  
✅ **Non-AI feature testing** before AI implementation  
✅ **AI feature testing** for Phase 2  
✅ **Regression testing** protocols  
✅ **Bug reporting** templates and processes  

**Estimated Total Testing Time:** 40-50 hours for complete coverage

**Recommended Testing Approach:**
1. **Week 1:** Admin tests + Company core features (15 hours)
2. **Week 2:** Seafarer tests + Integration tests (15 hours)
3. **Week 3:** Complete non-AI checklist + Regression (10 hours)
4. **Week 4:** AI features (if applicable) + Final verification (10 hours)

**After completing all tests:**
- Compile bug report
- Generate test execution report
- Document known issues
- Provide go/no-go recommendation for production

---

**Document Version:** 1.0  
**Last Updated:** October 19, 2025  
**Maintained By:** QA Team  

**Next Review Date:** [Set appropriate date]

---

**Happy Testing! 🧪✨**

For questions or clarifications, contact the QA Team Lead.

