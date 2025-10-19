# Email Notification System - Setup Guide 📧

## Overview

The email notification system sends professional HTML emails for important events:
- 📄 Document expiring/expired alerts
- ✅ Task assignments
- 👍 Document approvals/rejections
- ⏰ Daily/weekly digest emails

## 🚀 Quick Setup

### **Step 1: Choose Email Service**

You can use any of these services:
- **SendGrid** (Recommended) - 100 free emails/day
- **Mailgun** - 5,000 free emails/month
- **AWS SES** - Pay as you go, very cheap
- **Resend** - Modern, developer-friendly

### **Step 2: Get API Key**

**For SendGrid:**
1. Go to https://sendgrid.com
2. Create free account
3. Navigate to Settings → API Keys
4. Create API Key with "Mail Send" permissions
5. Copy the API key

### **Step 3: Configure Supabase**

1. **Deploy Edge Function:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Deploy the email function
supabase functions deploy send-email

# Set secrets
supabase secrets set SENDGRID_API_KEY=your_api_key_here
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set FROM_NAME="WaveSync Maritime"
```

2. **Alternative: Set via Dashboard:**
- Go to Supabase Dashboard → Project Settings → Edge Functions
- Add environment variables:
  - `SENDGRID_API_KEY`: Your SendGrid API key
  - `FROM_EMAIL`: noreply@wavesync.com
  - `FROM_NAME`: WaveSync Maritime

### **Step 4: Verify Email Domain (Optional but Recommended)**

For professional emails, verify your domain in SendGrid:
1. SendGrid → Settings → Sender Authentication
2. Follow domain verification steps
3. Add DNS records to your domain
4. Use your verified email (e.g., notifications@yourdomain.com)

## 📝 Integration Guide

### **1. Automatic Email on Document Expiry**

Modify the `check_expiring_documents` function to send emails:

```sql
-- Add to document-expiry-system.sql

-- At the end of check_expiring_documents function, add:

-- Call Edge Function to send email
PERFORM net.http_post(
  url := 'https://your-project.supabase.co/functions/v1/send-email',
  headers := jsonb_build_object(
    'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
    'Content-Type', 'application/json'
  ),
  body := jsonb_build_object(
    'to', up.email,
    'subject', notification_title,
    'htmlContent', notification_html,
    'textContent', notification_message
  )
);
```

### **2. Email on Task Assignment**

Update the task creation in `ExpiryDashboard.tsx`:

```typescript
// After creating task
import { sendTaskAssignmentEmail } from '../utils/emailService';

// Get seafarer email
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
    new Date(taskFormData.due_date),
    profile.full_name || 'Company Administrator'
  );
}
```

### **3. Email on Document Approval/Rejection**

Update `handleApprovalSubmit` in `DocumentManagement.tsx`:

```typescript
import { sendDocumentApprovalEmail } from '../utils/emailService';

// After updating document status
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
```

## 🎨 Email Templates

The system includes beautiful, responsive HTML email templates:

### **1. Document Expiry Email**
- Color-coded urgency levels (Red=Expired, Orange=Critical, Yellow=Urgent)
- Document details table
- Call-to-action button
- Professional branding

### **2. Task Assignment Email**
- Priority badge
- Task description card
- Due date display
- Direct link to task

### **3. Document Approval Email**
- Approval/rejection status
- Comments/feedback
- Action required notice (for rejections)
- Link to upload corrected document

## 🔧 Configuration Options

### **Customize Email Settings**

Edit `src/utils/emailService.ts`:

```typescript
// Change base URL
const BASE_URL = 'https://yourdomain.com';

// Customize colors
const BRAND_COLOR = '#667eea';
const ERROR_COLOR = '#DC2626';
const SUCCESS_COLOR = '#10B981';

// Add company logo
const LOGO_URL = 'https://yourdomain.com/logo.png';
```

### **Email Frequency Control**

To avoid spam, implement cooldown periods:

```sql
-- In check_expiring_documents, add:
AND NOT EXISTS (
  SELECT 1 FROM email_log
  WHERE user_id = up.id
    AND email_type = 'document_expiry'
    AND document_id = d.id
    AND sent_at > NOW() - INTERVAL '24 hours'
)
```

## 📊 Email Types & Triggers

| Event | Email Type | Trigger | Frequency |
|-------|-----------|---------|-----------|
| Document Expired | Critical Alert | Daily check | Once per day |
| Document Expiring (< 7 days) | Urgent Warning | Daily check | Once per day |
| Document Expiring (< 30 days) | Warning | Weekly check | Once per week |
| Document Expiring (< 90 days) | Reminder | Monthly check | Once per month |
| Task Assigned | Notification | Immediate | Instant |
| Task Completed | Notification | Immediate | Instant |
| Document Approved | Notification | Immediate | Instant |
| Document Rejected | Notification | Immediate | Instant |

## 🧪 Testing

### **Test Email Function Manually:**

```bash
# Test via curl
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "htmlContent": "<h1>Hello from WaveSync!</h1>",
    "textContent": "Hello from WaveSync!"
  }'
```

### **Test via Code:**

```typescript
import { sendEmail } from '../utils/emailService';

// Test basic email
await sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Notification',
  htmlContent: '<h1>Test</h1><p>This is a test email.</p>',
});
```

## 📈 Email Tracking & Analytics

### **Add Email Logging:**

Create a table to track sent emails:

```sql
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  document_id UUID,
  task_id UUID,
  status TEXT DEFAULT 'sent',
  error_message TEXT
);
```

### **Monitor Email Performance:**

```sql
-- View email statistics
SELECT 
  email_type,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM email_log
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY email_type;
```

## 🔒 Security Best Practices

1. **Never expose API keys** in frontend code
2. **Use Edge Functions** for server-side email sending
3. **Validate email addresses** before sending
4. **Rate limit** email sending to prevent abuse
5. **Verify sender domain** for better deliverability
6. **Include unsubscribe link** (optional, for compliance)

## 🎯 Next Steps

After basic setup:

1. ✅ **Deploy Edge Function** - Get emails working
2. 📧 **Test with real emails** - Verify delivery
3. 🎨 **Customize templates** - Match your branding
4. 📊 **Add email logging** - Track performance
5. ⏰ **Schedule daily digest** - Batch notifications
6. 📱 **Add SMS notifications** (optional) - For critical alerts

## 🆘 Troubleshooting

### **Emails not sending:**
- Check SendGrid API key is correct
- Verify Edge Function is deployed
- Check Supabase logs for errors
- Ensure email addresses are valid

### **Emails going to spam:**
- Verify sender domain in SendGrid
- Add SPF and DKIM records
- Avoid spam trigger words
- Include unsubscribe link

### **Rate limits exceeded:**
- Implement email batching
- Add cooldown periods
- Upgrade SendGrid plan

## 💡 Tips

- **Start simple** - Get basic emails working first
- **Test thoroughly** - Send to yourself before production
- **Monitor closely** - Watch for bounces and spam reports
- **Iterate** - Improve templates based on user feedback
- **Be respectful** - Don't spam users

---

**Ready to send your first email!** 📧✨

Follow the Quick Setup steps and you'll be notifying seafarers in no time!

