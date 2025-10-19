# Mandatory Document Upload for Task Completion ✅

## Overview

Seafarers are now **required to upload certificates/documents** when completing certain types of tasks! This ensures compliance and provides proof that the required action has been taken.

## 🎯 Key Feature

### **Document Upload Required**
When a seafarer tries to complete a task in these categories:
- 📄 Document Upload
- 🎓 Training
- 🏥 Medical
- ✅ Compliance

They **MUST** upload the relevant certificate or document before the task can be marked as complete.

## 🚫 Enforcement

### What Happens Without Upload:
1. Seafarer clicks "Mark Complete" without uploading
2. System shows error: **"Document Required"**
3. Task remains incomplete
4. Cannot proceed until document is uploaded

### Required Fields:
- ✅ **Document/Certificate File** (PDF, Images, Word)
- ✅ **Document Type** (STCW, Passport, Medical, etc.)
- ⭐ **Expiry Date** (Optional but recommended)
- ⭐ **Completion Notes** (Optional)

## 📋 Complete Workflow

### Scenario: Renew STCW Certificate

**Step 1: Seafarer Opens Task**
```
Task: "Renew STCW Certificate"
Description: Your STCW certificate expires in 10 days. Please renew it.
Status: Pending
```

**Step 2: Clicks "Complete" Button**
- Modal opens
- ⚠️ **Yellow banner appears**: "Document Upload Required"
- Form shows upload section

**Step 3: Upload Section Displayed**
```
⚠️ Document Upload Required
----------------------------------------
Upload Certificate/Document *
[Choose File] button

Document Type *
[Dropdown] Select document type
  - STCW Certificate
  - Passport
  - Visa
  - Medical Certificate
  - Seaman's Book
  - Training Certificate
  - Safety Certificate
  - Other

Expiry Date (if applicable)
[Date Picker] MM/DD/YYYY

Completion Notes (optional)
[Text area] Add notes...
```

**Step 4: Seafarer Fills Form**
- Selects file: `STCW_Renewed_2025.pdf`
- File preview shows: `📄 STCW_Renewed_2025.pdf (1.23 MB)`
- Selects type: "STCW Certificate"
- Enters expiry: `2030-10-19`
- Adds notes: "Renewed at Maritime Training Center"

**Step 5: Clicks "Mark Complete"**
- File uploads to storage
- Document record created in database
- Task marked as completed
- Notification sent to company
- Success message: "Task completed and document uploaded successfully"

**Step 6: Company Verification**
- Company sees task status: "✅ Task Completed"
- Can view uploaded document in Document Management
- Document automatically linked to task
- Completion notes include: "Document uploaded: STCW_Renewed_2025.pdf"

## ✅ Validation Rules

### File Upload:
- **Maximum size**: 10 MB
- **Allowed types**: 
  - PDF (`.pdf`)
  - Images (`.jpg`, `.jpeg`, `.png`)
  - Word (`.doc`, `.docx`)
- **Validation**: Automatic, shows error if exceeded

### Document Type:
- **Required**: Yes (cannot be empty)
- **Options**: Predefined list of common maritime documents
- **Validation**: Must select from dropdown

### Expiry Date:
- **Required**: No (optional)
- **Format**: Standard date picker
- **Validation**: Cannot be in the past
- **Recommended**: For certificates and documents that expire

## 🎨 UI/UX Features

### **Visual Indicators:**
1. **Yellow Warning Banner**
   - ⚠️ Icon + "Document Upload Required"
   - Yellow background (#fef3c7)
   - Dashed border (#f59e0b)

2. **File Preview**
   - 📄 Document icon
   - Filename display
   - File size in MB
   - White background with border

3. **Required Fields**
   - Marked with asterisk (*)
   - Cannot submit without them
   - Clear error messages

### **User-Friendly Design:**
- Large, clear file upload button
- Dropdown with common document types
- Optional expiry date (not forced if N/A)
- Completion notes remain optional
- Cancel button always available

## 💻 Technical Implementation

### Categories Requiring Upload:
```typescript
const requiresDocumentUpload = (category: string): boolean => {
  return ['document_upload', 'training', 'medical', 'compliance'].includes(category);
};
```

### Validation Before Submission:
```typescript
// Check if document upload is required but not provided
if (requiresDocumentUpload(selectedTask.category) && !uploadedFile) {
  addToast({
    title: 'Document Required',
    description: 'Please upload the required certificate/document',
    type: 'error'
  });
  return; // Prevents completion
}
```

### Upload Process:
```typescript
1. Upload file to Supabase Storage
   └─> documents/{user_id}/{timestamp}.{ext}
   
2. Create document record in database
   └─> documents table with metadata
   
3. Complete the task
   └─> Call complete_task RPC function
   
4. Link document to task
   └─> Update task completion_notes
   
5. Send notifications
   └─> Notify company of completion
```

### Database Integration:
```sql
-- Document record created
INSERT INTO documents (
  user_id,
  filename,
  file_url,
  file_type,
  file_size,
  document_type,
  expiry_date,
  status,
  uploaded_at
) VALUES (...);

-- Task updated with link
UPDATE tasks
SET completion_notes = 'Document uploaded: filename.pdf'
WHERE id = task_id;
```

## 📊 Benefits

### For Companies:
1. ✅ **Proof of Completion** - Physical evidence uploaded
2. ✅ **Compliance Assurance** - Cannot skip without document
3. ✅ **Automatic Documentation** - No separate upload needed
4. ✅ **Audit Trail** - Document linked to task
5. ✅ **Expiry Tracking** - Dates captured automatically

### For Seafarers:
1. ✅ **Clear Requirements** - Know exactly what's needed
2. ✅ **One-Step Process** - Upload while completing task
3. ✅ **No Ambiguity** - Cannot forget to upload
4. ✅ **Immediate Confirmation** - Success message shown
5. ✅ **Central Storage** - All documents in one place

### For System:
1. ✅ **Data Integrity** - Tasks have supporting evidence
2. ✅ **Compliance** - Meets maritime regulations
3. ✅ **Traceability** - Complete workflow documented
4. ✅ **Automation** - Links created automatically
5. ✅ **Quality Control** - File validation built-in

## 🔔 Notifications

### When Task is Completed with Upload:
1. **Seafarer sees**: "Task completed and document uploaded successfully"
2. **Company receives**: "Seafarer [Name] has completed the task: [Task Title]"
3. **Task Status**: Changes to "✅ Completed"
4. **Document Status**: Set to "Pending" (awaits company approval)

## 📱 Mobile Responsive

The upload modal is fully responsive:
- File picker works on mobile devices
- Camera integration for photos
- Touch-friendly dropdowns
- Scrollable content
- Large touch targets

## 🎬 Demo Scenario

**Try This:**

1. **Login as Seafarer**
2. **Go to "My Tasks"**
3. **Find a task** with category:
   - Document Upload
   - Training
   - Medical  
   - Compliance

4. **Click "Complete" button**
   - See yellow "Document Upload Required" banner
   - Upload section is visible

5. **Try to submit without upload**
   - Click "Mark Complete"
   - Error: "Document Required"
   - Cannot proceed

6. **Upload a document**
   - Choose file (PDF or image)
   - See file preview
   - Select document type
   - Enter expiry date (optional)

7. **Submit successfully**
   - File uploads
   - Success message appears
   - Task marked complete
   - Document appears in Documents page

8. **Verify as Company**
   - See task completed
   - View uploaded document
   - Document status: "Pending"
   - Can approve/reject

## 🆘 Troubleshooting

### "File too large" error
**Solution**: File must be under 10 MB. Compress PDF or reduce image size.

### "Invalid file type" error
**Solution**: Only PDF, images (.jpg, .jpeg, .png), and Word documents (.doc, .docx) are allowed.

### Can't complete task
**Solution**: Ensure you've:
- Selected a file
- Chosen document type from dropdown
- File is valid format and size

### Document not appearing
**Solution**:
- Refresh the Documents page
- Check that upload succeeded (success message)
- Document may be pending approval

## 📚 Related Features

This feature integrates with:
- **Task Management** - Enforces completion requirements
- **Document Management** - Stores uploaded files
- **Notification System** - Alerts on completion
- **Expiry Tracking** - Monitors certificate expiration
- **Compliance Dashboard** - Tracks document status

## 📁 Files Modified

- ✅ `src/components/MyTasks.tsx` - Added upload requirements
- ✅ `src/components/MyTasks.module.css` - Added upload section styles
- ✅ Build successful with zero errors

## ✅ Task Categories with Mandatory Upload

| Category | Upload Required | Document Types |
|----------|----------------|---------------|
| **document_upload** | ✅ Yes | Any certificate/document |
| **training** | ✅ Yes | Training certificates |
| **medical** | ✅ Yes | Medical certificates |
| **compliance** | ✅ Yes | Compliance documents |
| **onboarding** | ❌ No | Not required |
| **other** | ❌ No | Not required |

## 🎊 Production Ready!

The mandatory document upload feature is complete and enforced!

**Key Achievements:**
1. ✅ Document upload required for 4 task categories
2. ✅ Cannot complete without uploading
3. ✅ File validation (size, type)
4. ✅ Metadata capture (type, expiry)
5. ✅ Automatic linking to task
6. ✅ Success/error notifications
7. ✅ Mobile responsive design
8. ✅ Zero linter errors

---

**Status**: Complete & Production Ready  
**Date**: October 19, 2025
**Version**: 1.0.0 (Mandatory Upload Enforcement)

## 🚢 Compliance Achieved!

No more completed tasks without proof of action taken! 🎉

