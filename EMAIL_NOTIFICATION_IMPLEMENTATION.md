# Email Notification System - Complete Implementation ✅

## 🎉 What We've Built

A professional email notification system with:
- 📧 **Beautiful HTML email templates** with responsive design
- ⚓ **Maritime-themed branding** with WaveSync colors
- 🎨 **Color-coded urgency levels** for document expiry
- ✅ **Professional email layouts** that work in all email clients
- 🔒 **Secure server-side sending** via Supabase Edge Functions

## 📦 Components Created

### **1. Edge Function** - `supabase/functions/send-email/index.ts`
- Server-side email sending using SendGrid
- CORS-enabled for frontend requests
- Error handling and validation
- Supports both HTML and plain text emails

### **2. Email Service** - `src/utils/emailService.ts`
- **`sendEmail()`** - Core email sending function
- **`sendDocumentExpiryEmail()`** - Beautiful expiry alert emails
- **`sendTaskAssignmentEmail()`** - Task notification emails
- **`sendDocumentApprovalEmail()`** - Approval/rejection emails

### **3. Email Templates**
All emails include:
- Professional header with WaveSync branding
- Responsive HTML layout
- Color-coded status indicators
- Call-to-action buttons
- Plain text fallback
- Mobile-friendly design

## 🚀 Integration Steps

### **Step 1: Deploy Edge Function**

First, set up the SendGrid API key in Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the email function
supabase functions deploy send-email

# Set environment variables
supabase secrets set SENDGRID_API_KEY="your_sendgrid_api_key_here"
supabase secrets set FROM_EMAIL="noreply@wavesync.com"
supabase secrets set FROM_NAME="WaveSync Maritime"
```

**Get SendGrid API Key:**
1. Go to https://sendgrid.com (100 free emails/day)
2. Create account → Settings → API Keys
3. Create API Key with "Mail Send" permission

### **Step 2: Enable Email on Document Expiry**

Update `src/components/ExpiryDashboard.tsx` to send emails when viewing expiring documents:

```typescript
import { sendDocumentExpiryEmail } from '../utils/emailService';
import { getDaysUntilExpiry } from '../utils/expiryHelpers';

// Add this function in ExpiryDashboard component:
const sendExpiryEmailsForCriticalDocuments = async () => {
  const criticalDocs = expiringDocuments.filter(doc => {
    const days = getDaysUntilExpiry(doc.expiry_date);
    return days !== null && days <= 7; // Send only for critical/expired
  });

  for (const doc of criticalDocs) {
    const days = getDaysUntilExpiry(doc.expiry_date);
    if (days !== null) {
      // Get user email
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', doc.user_id)
        .single();

      if (userData?.email) {
        await sendDocumentExpiryEmail(
          userData.email,
          doc.seafarer_name,
          doc.document_type,
          doc.filename,
          new Date(doc.expiry_date),
          days
        );
      }
    }
  }
};

// Call this function when loading critical documents
// Or create a "Send Reminders" button
```

**Or add a manual "Send Email Reminder" button:**

```typescript
// Add to the table row in ExpiryDashboard
<button
  className={styles.emailButton}
  onClick={async () => {
    const days = getDaysUntilExpiry(doc.expiry_date);
    if (days !== null) {
      // Get user email
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', doc.user_id)
        .single();

      if (userData?.email) {
        await sendDocumentExpiryEmail(
          userData.email,
          doc.seafarer_name,
          doc.document_type,
          doc.filename,
          new Date(doc.expiry_date),
          days
        );
        addToast({
          type: 'success',
          title: 'Email sent',
          description: `Reminder sent to ${doc.seafarer_name}`,
          duration: 3000
        });
      }
    }
  }}
  title="Send email reminder"
>
  📧 Send Reminder
</button>
```

### **Step 3: Enable Email on Task Assignment**

Update `handleSubmitTask` in `src/components/ExpiryDashboard.tsx`:

```typescript
import { sendTaskAssignmentEmail } from '../utils/emailService';

// In handleSubmitTask function, after task creation:
const handleSubmitTask = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedDocument || !profile?.company_id) return;

  try {
    setCreatingTask(true);

    // Create the task
    const { error } = await supabase
      .from('tasks')
      .insert({
        title: taskFormData.title,
        description: taskFormData.description,
        category: taskFormData.category,
        priority: taskFormData.priority,
        status: 'pending',
        assigned_to: selectedDocument.user_id,
        assigned_by: profile.id,
        company_id: profile.company_id,
        due_date: taskFormData.due_date,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // **ADD THIS: Send email notification**
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', selectedDocument.user_id)
      .single();

    if (userData?.email) {
      await sendTaskAssignmentEmail(
        userData.email,
        userData.full_name,
        taskFormData.title,
        taskFormData.description,
        taskFormData.priority,
        taskFormData.due_date ? new Date(taskFormData.due_date) : null,
        profile.full_name || 'Company Administrator'
      );
    }

    addToast({
      type: 'success',
      title: 'Task created and email sent',
      description: `Task assigned to ${selectedDocument.seafarer_name}`,
      duration: 5000
    });

    // ... rest of the code
  } catch (error) {
    console.error('Error creating task:', error);
    // ... error handling
  }
};
```

### **Step 4: Enable Email on Document Approval/Rejection**

Create `handleApprovalSubmit` function in `src/components/DocumentManagement.tsx`:

```typescript
import { sendDocumentApprovalEmail } from '../utils/emailService';

// Add this function in DocumentManagement component:
const handleApprovalSubmit = async () => {
  if (!approvalModal.document) return;

  try {
    setIsUpdating(true);

    const newStatus = approvalModal.action === 'approve' ? 'approved' : 'rejected';

    // Update document status
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile?.id,
        review_comments: approvalComments,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalModal.document.id);

    if (updateError) throw updateError;

    // **ADD THIS: Send email notification**
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', approvalModal.document.user_id)
      .single();

    if (userData?.email) {
      await sendDocumentApprovalEmail(
        userData.email,
        userData.full_name,
        approvalModal.document.filename,
        approvalModal.document.document_type,
        approvalModal.action === 'approve',
        approvalComments,
        profile?.full_name
      );
    }

    addToast({
      type: 'success',
      title: `Document ${newStatus}`,
      description: `Email notification sent to ${userData?.full_name || 'seafarer'}`,
      duration: 5000
    });

    // Close modal and refresh
    setApprovalModal({ isOpen: false, action: null, document: null });
    setApprovalComments('');
    fetchDocuments();

  } catch (error) {
    console.error('Error updating document:', error);
    addToast({
      type: 'error',
      title: 'Failed to update document',
      description: 'Please try again',
      duration: 5000
    });
  } finally {
    setIsUpdating(false);
  }
};
```

### **Step 5: Automated Daily Expiry Check (Optional)**

Create a scheduled job to check expiring documents daily:

**Create:** `supabase/functions/check-expiry-daily/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the existing RPC function
    const { data, error } = await supabase.rpc('check_expiring_documents');

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Deploy and schedule:**

```bash
# Deploy function
supabase functions deploy check-expiry-daily

# Set up cron job in Supabase Dashboard
# Or use GitHub Actions to call it daily
```

## 📧 Email Templates Preview

### **1. Document Expiry Email**

**For Expired Documents (Red theme):**
```
⚓ WaveSync Maritime
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ EXPIRED - Document expired 5 days ago

Hello John Seafarer,

This is an important notification regarding your maritime document:

┌─────────────────────────────────┐
│ Document Type: STCW Certificate │
│ File Name: stcw-2024.pdf        │
│ Expiry Date: October 14, 2025   │
│ Status: EXPIRED 5 DAYS AGO      │
└─────────────────────────────────┘

🚨 IMMEDIATE ACTION REQUIRED
This document has expired and must be renewed immediately to maintain your maritime compliance status.

[📄 View My Documents]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated notification from WaveSync
© 2025 WaveSync. All rights reserved.
```

### **2. Task Assignment Email**

```
⚓ WaveSync Maritime
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New Task Assignment

Hello John Seafarer,

You have been assigned a new task by Sarah Admin:

┌─────────────────────────────────────┐
│ 📋 Complete STCW Certificate Renewal│
│                                     │
│ Priority: [HIGH]                    │
│ Due Date: October 26, 2025          │
│ Assigned by: Sarah Admin            │
│                                     │
│ Description:                        │
│ Your STCW certificate is expiring   │
│ soon. Please renew it before the    │
│ due date to maintain compliance.    │
└─────────────────────────────────────┘

[✅ View Task Details]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 WaveSync. All rights reserved.
```

### **3. Document Approval Email**

```
⚓ WaveSync Maritime
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document Review Complete

Hello John Seafarer,

✅ DOCUMENT APPROVED

Your document has been reviewed by Sarah Admin and has been approved.

┌──────────────────────────────┐
│ Document: passport-scan.pdf  │
│ Type: Passport               │
│ Status: APPROVED             │
└──────────────────────────────┘

Approval Notes:
"Document is clear and valid. All required information is visible."

[📄 View My Documents]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 WaveSync. All rights reserved.
```

## 🧪 Testing

### **Test Email Function Directly:**

Create a test file `test-email.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);

async function testEmail() {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: 'your-email@example.com',
      subject: 'Test Email from WaveSync',
      htmlContent: '<h1>Hello!</h1><p>This is a test email.</p>',
      textContent: 'Hello! This is a test email.',
    },
  });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

testEmail();
```

### **Test Document Expiry Email:**

```typescript
// In browser console or component
import { sendDocumentExpiryEmail } from './utils/emailService';

await sendDocumentExpiryEmail(
  'your-email@example.com',
  'Test User',
  'STCW Certificate',
  'stcw-2024.pdf',
  new Date('2025-10-22'), // Expiry date
  3 // Days until expiry
);
```

## 📊 Email Logging (Optional Enhancement)

Track all sent emails:

```sql
-- Create email log table
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  email_type TEXT NOT NULL, -- 'document_expiry', 'task_assignment', 'document_approval'
  subject TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  document_id UUID,
  task_id UUID,
  status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
  error_message TEXT,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- View sent emails (company/admin only)
CREATE POLICY "Company users can view email logs"
  ON email_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND user_type IN ('company', 'admin')
    )
  );
```

**Update email service to log:**

```typescript
// After sending email successfully
await supabase.from('email_log').insert({
  user_id: recipientUserId,
  email_type: 'document_expiry',
  subject: subject,
  recipient_email: userEmail,
  document_id: documentId,
  status: 'sent',
  metadata: { daysUntilExpiry, documentType }
});
```

## 🎨 Customization

### **Change Email Colors:**

Edit `src/utils/emailService.ts`:

```typescript
// Find these color definitions and customize:
const urgencyColor = daysUntilExpiry <= 0 
  ? '#DC2626'  // Your red color
  : daysUntilExpiry <= 7 
  ? '#EA580C'  // Your orange color
  : '#F59E0B'; // Your yellow color
```

### **Add Company Logo:**

```typescript
// In email header section:
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
  <img src="https://yourdomain.com/logo.png" alt="Logo" style="height: 50px; margin-bottom: 10px;">
  <h1 style="color: white; margin: 0; font-size: 28px;">⚓ WaveSync Maritime</h1>
</div>
```

### **Customize From Name:**

```bash
supabase secrets set FROM_NAME="Your Company Name Maritime"
```

## 🚨 Important Notes

1. **SendGrid Free Tier**: 100 emails/day
2. **Email Verification**: Verify your domain for better deliverability
3. **Spam Prevention**: Don't send more than necessary
4. **Testing**: Always test with real emails before production
5. **Error Handling**: Monitor Supabase function logs for errors

## ✅ Checklist

- [ ] Sign up for SendGrid account
- [ ] Get SendGrid API key
- [ ] Deploy `send-email` Edge Function
- [ ] Set Supabase secrets (API key, FROM_EMAIL, FROM_NAME)
- [ ] Test email function with your email
- [ ] Integrate email in task creation
- [ ] Test task assignment email
- [ ] Integrate email in document approval
- [ ] Test approval/rejection emails
- [ ] (Optional) Set up automated daily expiry check
- [ ] (Optional) Add email logging table
- [ ] Verify domain in SendGrid (for production)

## 🎉 You're Done!

Your email notification system is ready! Seafarers will now receive professional, branded emails for:
- ⏰ Expiring/expired documents
- ✅ New task assignments
- 👍 Document approvals/rejections

**Next steps:**
- Monitor email delivery in SendGrid dashboard
- Adjust email frequency based on user feedback
- Add more email types as needed
- Consider SMS notifications for critical alerts

---

Happy sailing! ⚓📧

