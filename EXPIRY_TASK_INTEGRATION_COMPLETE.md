# Document Expiry → Task Creation Integration ✅

## Overview

You can now **create renewal tasks directly from the Document Expiry Dashboard**! This seamless integration allows companies to quickly assign document renewal tasks to seafarers when they see expiring or expired certificates.

## 🎯 Feature Highlights

### **One-Click Task Creation**
- Click the **➕ Plus icon** next to any document in the Expiry Dashboard
- System automatically creates a smart, pre-filled task form
- Task details are intelligently generated based on document status

### **Smart Pre-filling**
The system automatically fills in task details based on the document's expiry status:

| Document Status | Priority | Due Date | Example |
|----------------|----------|----------|---------|
| **Expired** | Urgent | 7 days from now | "Document expired 5 days ago - renew ASAP" |
| **Expiring Urgent** (< 30 days) | Urgent | Document expiry date | "Expires in 15 days" |
| **Expiring Soon** (30-90 days) | High | Document expiry date | "Expires in 60 days" |
| **Valid** (> 90 days) | Medium | 30 days before expiry | "Plan renewal in advance" |

### **Pre-filled Form Fields**
✅ **Title**: `"Renew [Document Type]"` (e.g., "Renew STCW Certificate")
✅ **Description**: Full context including document name, current status, and expiry date
✅ **Category**: Automatically set to "Document Upload"
✅ **Priority**: Smart priority based on urgency
✅ **Due Date**: Calculated automatically based on expiry urgency
✅ **Assigned To**: Auto-assigned to the seafarer who owns the document

### **Editable Before Submission**
- All fields can be edited before creating the task
- Add custom instructions or modify the description
- Adjust priority or due date as needed
- Change category if necessary

## 🖥️ User Interface

### **Expiry Dashboard Table**
Each document row now has **two action buttons**:
1. **➕ Plus Button** (Green hover) - Create renewal task
2. **📄 Document Button** (Blue hover) - View seafarer's documents

### **Task Creation Modal**
Beautiful modal dialog with:
- **Document Information Section**: Shows all relevant document details
  - Seafarer name
  - Document filename
  - Document type
  - Expiry date
  - Current status (e.g., "Expires in 15 days")
- **Task Form**: Editable fields for task details
- **Actions**: Cancel or Create Task buttons

## 📋 Workflow Example

### Scenario: STCW Certificate Expiring in 10 Days

1. **Company user opens Expiry Dashboard**
   - Sees "EXPIRED_STCW_Certificate.pdf" with status "Expiring Urgent"
   - Red/Orange badge indicating urgency

2. **Clicks ➕ Plus icon**
   - Modal opens instantly
   - Shows document details:
     ```
     Seafarer: John Smith
     Document: STCW_Certificate.pdf
     Type: STCW Certificate
     Expiry Date: October 29, 2025
     Status: Expires in 10 days
     ```

3. **Reviews pre-filled task:**
   ```
   Title: Renew STCW Certificate
   Description: Please renew your STCW Certificate document 
                (STCW_Certificate.pdf). This document expires in 10 days.
                
                Current expiry date: 10/29/2025
   Category: Document Upload
   Priority: Urgent
   Due Date: 10/29/2025
   ```

4. **Optionally edits the description:**
   ```
   Please renew your STCW Certificate ASAP. This is required for 
   your upcoming assignment. Visit the training center at 
   123 Maritime St. Contact: training@example.com
   ```

5. **Clicks "Create Task"**
   - Task is created instantly
   - Seafarer receives notification
   - Success toast appears: "Task created successfully - Renewal task assigned to John Smith"
   - Modal closes automatically

6. **Seafarer gets notified**
   - Bell icon shows new notification
   - Task appears in "My Tasks" page
   - Seafarer can view details, upload renewed document, and mark complete

## 🔄 Complete Integration Flow

```
Document Expiry Dashboard
         ↓
   Click ➕ Create Task
         ↓
   Modal Opens (Pre-filled)
         ↓
  Review/Edit Task Details
         ↓
   Click "Create Task"
         ↓
   Task Saved to Database
         ↓
   ┌──────────────────────┬────────────────────┐
   ↓                      ↓                    ↓
Notification          Seafarer          Company
to Seafarer          "My Tasks"     "Task Management"
   ↓                      ↓                    ↓
Seafarer              Views Task          Tracks
Receives              & Details         Completion
Alert                     ↓
                    Uploads New
                     Document
                         ↓
                  Marks Complete
                         ↓
              Company Gets Notified
```

## 💻 Technical Implementation

### Files Modified:
- ✅ `src/components/ExpiryDashboard.tsx` - Added task creation logic
- ✅ `src/components/ExpiryDashboard.module.css` - Added modal styles

### Key Features Added:

#### 1. **State Management**
```typescript
const [showTaskModal, setShowTaskModal] = useState(false);
const [selectedDocument, setSelectedDocument] = useState<ExpiringDocument | null>(null);
const [taskFormData, setTaskFormData] = useState<TaskFormData>({...});
const [creatingTask, setCreatingTask] = useState(false);
```

#### 2. **Smart Pre-filling Logic**
```typescript
const handleCreateTask = (document: ExpiringDocument) => {
  // Calculates priority based on days until expiry
  // Sets appropriate due date
  // Pre-fills title and description with context
  // Opens modal with intelligent defaults
};
```

#### 3. **Task Submission**
```typescript
const handleSubmitTask = async (e: React.FormEvent) => {
  // Inserts task into database
  // Auto-assigns to seafarer
  // Creates notification
  // Shows success message
};
```

#### 4. **Database Integration**
```sql
INSERT INTO tasks (
  title, description, category, priority, status,
  assigned_to, assigned_by, company_id, due_date
) VALUES (...);
```

### Modal UI Components:
- **Document Info Panel** - Displays context
- **Task Form** - Editable fields
- **Smart Validation** - Required fields enforced
- **Loading States** - Prevents double submission
- **Responsive Design** - Mobile-friendly

## 🎨 UI/UX Highlights

### **Visual Indicators**
- ➕ **Green hover** on Plus button = Create action
- 📄 **Blue hover** on Document button = View action
- **Smooth animations** for modal open/close
- **Loading spinner** while creating task

### **User Feedback**
- ✅ **Success toast**: "Task created successfully"
- ❌ **Error toast**: "Failed to create task"
- 🔄 **Button states**: "Creating Task..." when submitting
- 🚫 **Disabled buttons**: Prevents double-submission

### **Accessibility**
- Keyboard navigation supported
- Click outside modal to close
- ESC key to close (via close button)
- Focus management
- Clear button labels and titles

## 📊 Benefits

### **For Companies:**
1. **Faster Response** - Create tasks in seconds, not minutes
2. **No Context Switching** - Stay in expiry dashboard
3. **Consistency** - Standardized task creation
4. **Audit Trail** - All tasks linked to documents
5. **Proactive Management** - Act before documents expire

### **For Seafarers:**
1. **Clear Instructions** - Detailed task descriptions
2. **Context Aware** - Know which document needs renewal
3. **Proper Prioritization** - Urgent tasks marked clearly
4. **Deadline Tracking** - Due dates aligned with expiry

### **For System:**
1. **Integration** - Two systems working together
2. **Automation** - Less manual data entry
3. **Data Quality** - Pre-filled = fewer errors
4. **Traceability** - Document → Task → Completion

## 🚀 Usage Instructions

### Step 1: Navigate to Expiry Dashboard
- Login as **Company User**
- Click "**Document Expiry**" in sidebar (⚠️ icon)

### Step 2: Find Expiring Documents
- Use filters: All, Expired, Urgent, Expiring Soon
- Review the document list
- Look for documents needing renewal

### Step 3: Create Task
- Click the **➕ Plus button** in the Actions column
- Review the pre-filled task information
- Edit any fields as needed
- Click "**Create Task**"

### Step 4: Track Progress
- Navigate to "**Task Management**" to see all tasks
- Filter by status, priority, or assignee
- Monitor seafarer completion

## 📝 Task Categories Available

- **Document Upload** (Default for renewals)
- **Training**
- **Medical**
- **Compliance**
- **Onboarding**

## 🎯 Priority Levels

- **Urgent** - Immediate action required (red)
- **High** - Important, act soon (orange)
- **Medium** - Standard priority (yellow)
- **Low** - Can wait (blue)

## 🔔 Notifications

When a task is created:
1. **Seafarer receives notification**: "New Task: Renew STCW Certificate"
2. **Task appears in "My Tasks"** page
3. **Due date reminders** trigger automatically
4. **Company tracks** via Task Management dashboard

## 🎬 Demo Scenario

Try this to see the feature in action:

1. Run `test-document-expiry.sql` to create sample expiring documents
2. Login as **company1@wavesync.com**
3. Go to **Document Expiry** dashboard
4. Click ➕ on any expired or expiring document
5. See the pre-filled modal
6. Click "Create Task"
7. Check **Task Management** to see the new task
8. Login as a seafarer to see the task in "My Tasks"

## 🏆 Success Metrics

- ✅ **Zero Linter Errors**
- ✅ **Fully Responsive Design**
- ✅ **Smart Pre-filling Logic**
- ✅ **Database Integration Working**
- ✅ **Notification System Connected**
- ✅ **Beautiful UI/UX**
- ✅ **Production Ready**

## 📚 Related Documentation

- `DOCUMENT_EXPIRY_COMPLETE.md` - Full expiry system documentation
- `TASK_MANAGEMENT_COMPLETE.md` - Task management system docs
- `DOCUMENT_EXPIRY_TESTING_GUIDE.md` - Testing instructions

---

## ✅ Status: COMPLETE & PRODUCTION READY

This feature seamlessly integrates the Document Expiry System with the Task Management System, creating a powerful workflow for managing certificate renewals!

**Date**: October 19, 2025
**Version**: 1.0.0

