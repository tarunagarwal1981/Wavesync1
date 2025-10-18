# 🚢 Maritime Crew Management - Pending Features Implementation Plan

## 📊 Current Status Overview

### ✅ **Completed Features (Phases 1-3 Sprint 1):**

#### **Phase 1: User Onboarding & Management** ✅
- User authentication (Supabase)
- Company management (CRUD)
- User management (Admin, Company, Seafarer)
- Seafarer profile completion
- Row Level Security (RLS)
- Storage for avatars, logos

#### **Phase 2: Assignment & Documents** ✅
- Vessel management (CRUD)
- Assignment management (basic CRUD)
- Crew directory (with real data)
- Document management (upload, track, expiry alerts)
- Notification system (in-app)
- Dashboard analytics (real-time stats)

#### **Phase 3 Sprint 1: Travel Management** ✅
- Travel request management (CRUD)
- Travel status workflow
- My Travel (seafarer view)
- Travel notifications
- Storage bucket for travel documents

---

## 🔴 **PENDING CRITICAL FEATURES**

Based on the original workflow, here's what's missing:

---

## 1️⃣ **TRAVEL DOCUMENT UPLOAD SYSTEM** 🎫

### **Priority: HIGH** ⚡
**Why:** Company needs to upload tickets, boarding passes, hotel confirmations for seafarers

### **What's Needed:**

#### **A. Add Document Upload to TravelManagement Component**

**Features:**
- Upload e-tickets for flights
- Upload boarding passes
- Upload hotel confirmations
- Upload travel insurance
- Upload visa documents
- Link documents to specific travel request
- Seafarers can download/view documents

**Implementation:**
```typescript
// Add to TravelManagement.tsx
- Document upload section in travel details
- File picker for multiple document types
- Upload to 'travel-documents' storage bucket
- Insert records into 'travel_documents' table
- Link to travel_request_id
```

#### **B. Add Document Viewer to MyTravel Component**

**Features:**
- View all documents for a travel request
- Download documents
- See document type (e-ticket, boarding pass, etc.)
- Notification when new document is uploaded

**UI Location:**
- In the "View Details" modal
- New tab: "Travel Documents"
- List all uploaded documents with download buttons

---

## 2️⃣ **ASSIGNMENT ACCEPT/REJECT WORKFLOW** 🎯

### **Priority: HIGH** ⚡
**Why:** Core workflow - seafarers need to accept/reject assignments

### **What's Needed:**

#### **A. Update Assignments Table Schema**
```sql
ALTER TABLE assignments ADD COLUMN response_status VARCHAR(20);
ALTER TABLE assignments ADD COLUMN response_date TIMESTAMP;
ALTER TABLE assignments ADD COLUMN response_notes TEXT;

-- Values: 'pending_response', 'accepted', 'rejected', 'expired'
```

#### **B. Create AcceptRejectAssignment Component**

**Features:**
- Seafarer sees assignment details
- Accept button (with optional notes)
- Reject button (with required reason)
- Confirmation dialog for both actions
- Updates assignment status
- Sends notification to company

**UI Location:**
- `/my-assignments` page
- Card-based view with action buttons
- Modal with full details and accept/reject options

#### **C. Add Notifications**
- Notify company when seafarer accepts
- Notify company when seafarer rejects (with reason)
- Notify seafarer of assignment expiry (if no response in X days)

---

## 3️⃣ **TASK MANAGEMENT SYSTEM** ✅

### **Priority: MEDIUM** 📋
**Why:** Track onboarding tasks, document submissions, training requirements

### **What's Needed:**

#### **A. Database Schema**
```sql
-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  task_type (enum: document_submission, medical_check, training, briefing, other),
  assigned_to UUID (seafarer),
  assigned_by UUID (company user),
  assignment_id UUID (optional link),
  due_date DATE,
  status (enum: pending, in_progress, completed, overdue),
  priority (enum: low, normal, high, urgent),
  completion_date TIMESTAMP,
  completion_notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### **B. TaskManagement Component (Company)**

**Features:**
- Create tasks for seafarers
- Link tasks to assignments (optional)
- Set due dates and priority
- Track task completion
- Send reminders for overdue tasks
- Bulk task creation (e.g., "Sign-on checklist")

#### **C. MyTasks Component (Seafarer)**

**Features:**
- View all assigned tasks
- Filter by status (pending, completed, overdue)
- Mark tasks as complete (with notes)
- Upload supporting documents
- See task deadlines
- Get reminders for due tasks

---

## 4️⃣ **CERTIFICATE & DOCUMENT EXPIRY ALERTS** 📅

### **Priority: MEDIUM** ⚠️
**Why:** Prevent seafarers from sailing with expired certificates

### **What's Needed:**

#### **A. Automated Expiry Checking**
```sql
-- Function to check expiring documents
CREATE FUNCTION check_expiring_documents()
RETURNS void AS $$
BEGIN
  -- Find documents expiring in 30, 60, 90 days
  -- Send notifications to seafarer and company
END;
$$ LANGUAGE plpgsql;
```

#### **B. Expiry Dashboard Widget**

**Features:**
- Show documents expiring soon
- Color-coded alerts (30 days = red, 60 days = yellow)
- Quick action to upload renewed document
- Email reminders

#### **C. Company Compliance Dashboard**

**Features:**
- See all seafarers with expiring certificates
- Filter by company, vessel, expiry date
- Export compliance report
- Bulk notification to seafarers

---

## 5️⃣ **VESSEL ASSIGNMENT TIMELINE** 🚢

### **Priority: LOW** 📊
**Why:** Visual representation of vessel crew assignments

### **What's Needed:**

#### **A. Timeline View Component**

**Features:**
- See crew on vessel by date range
- Visual timeline of sign-on/sign-off
- Identify gaps in coverage
- Plan crew rotation
- Drag-and-drop to reschedule (advanced)

---

## 6️⃣ **COMMUNICATION & MESSAGING** 💬

### **Priority: LOW** 📧
**Why:** Direct communication between company and seafarers

### **What's Needed:**

#### **A. Basic Messaging System**

**Features:**
- Send messages to seafarers
- Seafarers reply to company
- Thread-based conversations
- Link messages to assignments/travel
- Mark as read/unread
- Email notification for new messages

---

## 7️⃣ **REPORTING & ANALYTICS** 📈

### **Priority: LOW** 📊
**Why:** Business intelligence and compliance reporting

### **What's Needed:**

#### **A. Reports Dashboard**

**Features:**
- Crew deployment report
- Document compliance report
- Travel expenses report
- Assignment history report
- Export to PDF/Excel

---

## 🎯 **RECOMMENDED IMPLEMENTATION ORDER**

### **Sprint 1: Travel Documents & Assignment Actions** (2-3 days)
**Priority: HIGH - Completes core workflow**

1. ✅ **Travel Document Upload System**
   - Add upload UI to TravelManagement
   - Add document viewer to MyTravel
   - Test end-to-end flow
   - **Estimated time:** 1 day

2. ✅ **Assignment Accept/Reject**
   - Update database schema
   - Create accept/reject UI
   - Add notifications
   - Test workflow
   - **Estimated time:** 1 day

3. ✅ **Testing & Polish**
   - Test complete workflow
   - Fix any issues
   - **Estimated time:** 0.5 day

---

### **Sprint 2: Task Management System** (2-3 days)
**Priority: MEDIUM - Adds operational value**

1. ✅ **Database & Backend**
   - Create tasks table
   - RLS policies
   - Notification triggers
   - **Estimated time:** 0.5 day

2. ✅ **Company UI (TaskManagement)**
   - Create/assign tasks
   - Track completion
   - Task templates
   - **Estimated time:** 1 day

3. ✅ **Seafarer UI (MyTasks)**
   - View tasks
   - Complete tasks
   - Upload documents
   - **Estimated time:** 1 day

4. ✅ **Testing**
   - **Estimated time:** 0.5 day

---

### **Sprint 3: Document Expiry & Compliance** (1-2 days)
**Priority: MEDIUM - Important for compliance**

1. ✅ **Expiry Checking Function**
   - Database function
   - Scheduled job setup
   - **Estimated time:** 0.5 day

2. ✅ **Expiry Alerts UI**
   - Dashboard widgets
   - Company compliance view
   - **Estimated time:** 1 day

3. ✅ **Email Notifications**
   - Email templates
   - Email sending setup
   - **Estimated time:** 0.5 day

---

### **Future Sprints:**
- Timeline view (nice to have)
- Messaging system (can use external tool initially)
- Advanced reporting (can use database queries initially)
- Email notifications (can use basic alerts for now)

---

## 📋 **DETAILED BREAKDOWN - SPRINT 1**

Let me detail what we should implement first:

---

## 🎫 **Feature 1: Travel Document Upload**

### **Database (Already Created)** ✅
```sql
-- travel_documents table exists
-- Columns: id, travel_request_id, seafarer_id, document_type,
--          document_name, file_path, file_size, uploaded_by
```

### **Storage (Already Created)** ✅
```sql
-- 'travel-documents' bucket exists
-- RLS policies in place
```

### **UI Components to Add:**

#### **1.1 TravelManagement - Add Document Upload Section**

**Location:** After travel request details

**UI Structure:**
```
┌─────────────────────────────────────────┐
│ Travel Request Details                   │
│ Status: Confirmed                        │
│ Seafarer: John Doe                       │
│ Destination: Singapore                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📎 Travel Documents (3)                 │
│ ┌─────────────────────────────────────┐ │
│ │ ✈️ E-Ticket                         │ │
│ │ flight-ticket.pdf • 245 KB          │ │
│ │ Uploaded: Oct 15, 2025              │ │
│ │ [View] [Delete]                     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [+ Upload Document]                      │
└─────────────────────────────────────────┘
```

**Features:**
- Upload button opens file picker
- Select document type (dropdown)
- Upload to storage
- Insert record in database
- Show in list immediately
- Delete option (company only)

#### **1.2 MyTravel - Add Document Viewer**

**Location:** In the "View Details" modal, new section

**UI Structure:**
```
Modal:
┌─────────────────────────────────────────┐
│ Travel Details                  [Close] │
├─────────────────────────────────────────┤
│ [Information] [Flight] [Documents]      │
├─────────────────────────────────────────┤
│ 📄 Travel Documents                     │
│                                          │
│ ✈️ E-Ticket - flight-SQ123.pdf         │
│    [Download]                            │
│                                          │
│ 🏨 Hotel Confirmation - hotel.pdf       │
│    [Download]                            │
│                                          │
│ 🛂 Visa - visa-singapore.pdf           │
│    [Download]                            │
└─────────────────────────────────────────┘
```

**Features:**
- View all documents
- Download button (opens file)
- Document icons by type
- Notification when new document uploaded

---

## ✅ **Feature 2: Assignment Accept/Reject**

### **Database Updates Needed:**

```sql
-- Add new columns to assignments table
ALTER TABLE assignments 
  ADD COLUMN response_status VARCHAR(20) DEFAULT 'pending_response',
  ADD COLUMN response_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN response_notes TEXT,
  ADD COLUMN response_deadline DATE;

-- Update existing assignments
UPDATE assignments 
SET response_status = 'pending_response' 
WHERE status = 'pending';
```

### **UI Components to Create:**

#### **2.1 Update My Assignments Page**

**Current:** Just shows assignment list  
**New:** Add action buttons

**UI Structure:**
```
┌─────────────────────────────────────────┐
│ Assignment: Chief Engineer              │
│ Vessel: MV Ocean Pioneer                │
│ Period: Nov 1 - Feb 28, 2026            │
│ Status: Pending Your Response           │
│                                          │
│ Response Deadline: Oct 25, 2025         │
│ (5 days remaining)                       │
│                                          │
│ [✓ Accept Assignment] [✗ Reject]        │
└─────────────────────────────────────────┘
```

**Modal for Accept:**
```
┌─────────────────────────────────────────┐
│ Accept Assignment?                       │
├─────────────────────────────────────────┤
│ Are you sure you want to accept this    │
│ assignment?                              │
│                                          │
│ Vessel: MV Ocean Pioneer                │
│ Position: Chief Engineer                │
│ Sign-on: Nov 1, 2025                    │
│                                          │
│ Additional Notes (optional):            │
│ [                                    ]   │
│                                          │
│ [Cancel] [✓ Confirm Accept]             │
└─────────────────────────────────────────┘
```

**Modal for Reject:**
```
┌─────────────────────────────────────────┐
│ Reject Assignment?                       │
├─────────────────────────────────────────┤
│ Please provide a reason for rejection:  │
│                                          │
│ [                                    ]   │
│ [                                    ]   │
│ [                                    ]   │
│                                          │
│ This will notify the company.            │
│                                          │
│ [Cancel] [✗ Confirm Reject]             │
└─────────────────────────────────────────┘
```

#### **2.2 Add Notifications**

**Triggers:**
- When seafarer accepts → Notify company
- When seafarer rejects → Notify company (with reason)
- When deadline approaching → Remind seafarer
- When assignment expired (no response) → Notify both

---

## 📊 **Sprint 1 Summary**

### **Files to Create/Modify:**

#### **SQL Scripts:**
1. `add-travel-document-management.sql` - (optional, tables exist)
2. `add-assignment-response-system.sql` - Add columns, triggers

#### **React Components:**
1. Modify: `src/components/TravelManagement.tsx` - Add document upload
2. Modify: `src/components/MyTravel.tsx` - Add document viewer
3. Modify: `src/pages/Assignments.tsx` - Add accept/reject buttons
4. Create: `src/components/AssignmentResponseModal.tsx` - Accept/reject dialog

#### **Estimated Lines of Code:**
- SQL: ~200 lines
- TypeScript: ~800 lines
- CSS: ~300 lines
- **Total: ~1,300 lines**

---

## 🎯 **Decision Time**

**What should we implement first?**

### **Option A: Travel Document Upload** (Recommended)
- ✅ Completes travel workflow
- ✅ High business value
- ✅ Relatively straightforward
- ⏱️ 4-6 hours implementation

### **Option B: Assignment Accept/Reject** (Also Important)
- ✅ Core workflow feature
- ✅ High business value
- ✅ Medium complexity
- ⏱️ 4-6 hours implementation

### **Option C: Both in Sprint 1** (Best Value)
- ✅ Completes two major workflows
- ✅ Maximum value delivery
- ⏱️ 8-12 hours total

---

## 🤔 **Your Input Needed:**

1. **Which feature should we prioritize first?**
   - A) Travel Document Upload
   - B) Assignment Accept/Reject
   - C) Both (Sprint 1 as planned)

2. **Any other critical features from the original workflow?**

3. **Should we add email notifications now or later?**

---

**I recommend starting with Option C** - implementing both features in Sprint 1 to deliver maximum value and complete two core workflows. This would take approximately 8-12 hours of implementation time.

**What would you like to do?** 🚀

