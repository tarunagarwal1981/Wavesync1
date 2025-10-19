// Email service utility for sending notifications
import { supabase } from '../lib/supabase';

export interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Send an email using Supabase Edge Function
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: options.to,
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent,
      },
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error invoking email function:', error);
    return false;
  }
}

/**
 * Send document expiry notification email
 */
export async function sendDocumentExpiryEmail(
  userEmail: string,
  userName: string,
  documentType: string,
  documentName: string,
  expiryDate: Date,
  daysUntilExpiry: number
): Promise<boolean> {
  const urgencyLevel = daysUntilExpiry <= 0 
    ? 'EXPIRED' 
    : daysUntilExpiry <= 7 
    ? 'CRITICAL' 
    : daysUntilExpiry <= 30 
    ? 'URGENT' 
    : 'SOON';

  const urgencyColor = daysUntilExpiry <= 0 
    ? '#DC2626' 
    : daysUntilExpiry <= 7 
    ? '#EA580C' 
    : daysUntilExpiry <= 30 
    ? '#F59E0B' 
    : '#EAB308';

  const statusText = daysUntilExpiry <= 0
    ? `expired ${Math.abs(daysUntilExpiry)} days ago`
    : daysUntilExpiry === 0
    ? 'expires today'
    : daysUntilExpiry === 1
    ? 'expires tomorrow'
    : `expires in ${daysUntilExpiry} days`;

  const subject = `${urgencyLevel}: Your ${documentType} ${statusText}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚓ WaveSync Maritime</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Crew Management System</p>
  </div>

  <!-- Main Content -->
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <!-- Urgency Badge -->
    <div style="background: ${urgencyColor}; color: white; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
      ⚠️ ${urgencyLevel} - Document ${statusText.toUpperCase()}
    </div>

    <p style="font-size: 16px; color: #111827; margin-bottom: 10px;">
      Hello <strong>${userName}</strong>,
    </p>

    <p style="font-size: 16px; color: #374151; line-height: 1.8;">
      This is an important notification regarding your maritime document:
    </p>

    <!-- Document Details Card -->
    <div style="background: #f9fafb; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Document Type:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 700;">${documentType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">File Name:</td>
          <td style="padding: 8px 0; color: #111827;">${documentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Expiry Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 700;">${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
          <td style="padding: 8px 0; color: ${urgencyColor}; font-weight: 700; text-transform: uppercase;">${statusText}</td>
        </tr>
      </table>
    </div>

    <!-- Action Required -->
    ${daysUntilExpiry <= 0 ? `
      <div style="background: #FEE2E2; border: 2px solid #DC2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #991B1B; margin: 0; font-weight: 600;">
          🚨 <strong>IMMEDIATE ACTION REQUIRED</strong>
        </p>
        <p style="color: #991B1B; margin: 10px 0 0 0;">
          This document has expired and must be renewed immediately to maintain your maritime compliance status.
        </p>
      </div>
    ` : daysUntilExpiry <= 7 ? `
      <div style="background: #FED7AA; border: 2px solid #EA580C; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #9A3412; margin: 0; font-weight: 600;">
          ⏰ <strong>URGENT: EXPIRES VERY SOON</strong>
        </p>
        <p style="color: #9A3412; margin: 10px 0 0 0;">
          Please renew this document within the next ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} to avoid compliance issues.
        </p>
      </div>
    ` : `
      <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #78350F; margin: 0; font-weight: 600;">
          📋 <strong>ACTION NEEDED</strong>
        </p>
        <p style="color: #78350F; margin: 10px 0 0 0;">
          Please plan to renew this document before it expires in ${daysUntilExpiry} days.
        </p>
      </div>
    `}

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://wavesync.com'}/documents" 
         style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
        📄 View My Documents
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      If you have any questions or need assistance, please contact your company administrator or reach out to our support team.
    </p>

  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">
      This is an automated notification from WaveSync Maritime Platform
    </p>
    <p style="margin: 5px 0;">
      © 2025 WaveSync. All rights reserved.
    </p>
  </div>

</body>
</html>
  `;

  const textContent = `
Hello ${userName},

${urgencyLevel}: Your ${documentType} ${statusText}

Document Details:
- Type: ${documentType}
- File: ${documentName}
- Expiry Date: ${expiryDate.toLocaleDateString()}
- Status: ${statusText}

${daysUntilExpiry <= 0 
  ? 'IMMEDIATE ACTION REQUIRED: This document has expired and must be renewed immediately.'
  : `Please renew this document before it expires in ${daysUntilExpiry} days.`
}

Login to WaveSync to view your documents and take action.

Best regards,
WaveSync Maritime Team
  `;

  return sendEmail({
    to: userEmail,
    subject,
    htmlContent,
    textContent,
  });
}

/**
 * Send task assignment notification email
 */
export async function sendTaskAssignmentEmail(
  userEmail: string,
  userName: string,
  taskTitle: string,
  taskDescription: string,
  priority: string,
  dueDate: Date | null,
  assignedByName: string
): Promise<boolean> {
  const priorityColor = priority === 'urgent' 
    ? '#DC2626' 
    : priority === 'high' 
    ? '#F59E0B' 
    : priority === 'medium' 
    ? '#3B82F6' 
    : '#10B981';

  const subject = `New Task Assigned: ${taskTitle}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚓ WaveSync Maritime</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">New Task Assignment</p>
  </div>

  <!-- Main Content -->
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; color: #111827; margin-bottom: 10px;">
      Hello <strong>${userName}</strong>,
    </p>

    <p style="font-size: 16px; color: #374151; line-height: 1.8;">
      You have been assigned a new task by <strong>${assignedByName}</strong>:
    </p>

    <!-- Task Card -->
    <div style="background: #f9fafb; border-left: 4px solid ${priorityColor}; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <h2 style="color: #111827; margin: 0 0 15px 0; font-size: 20px;">
        📋 ${taskTitle}
      </h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Priority:</td>
          <td style="padding: 8px 0;">
            <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
              ${priority}
            </span>
          </td>
        </tr>
        ${dueDate ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Due Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 700;">
            ${dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Assigned by:</td>
          <td style="padding: 8px 0; color: #111827;">${assignedByName}</td>
        </tr>
      </table>

      <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; font-weight: 600; text-transform: uppercase;">Description:</p>
        <p style="color: #374151; margin: 0; white-space: pre-wrap;">${taskDescription}</p>
      </div>
    </div>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://wavesync.com'}/my-tasks" 
         style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
        ✅ View Task Details
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Please log in to the WaveSync platform to view full task details and complete the required actions.
    </p>

  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">
      This is an automated notification from WaveSync Maritime Platform
    </p>
    <p style="margin: 5px 0;">
      © 2025 WaveSync. All rights reserved.
    </p>
  </div>

</body>
</html>
  `;

  const textContent = `
Hello ${userName},

You have been assigned a new task by ${assignedByName}:

Task: ${taskTitle}
Priority: ${priority.toUpperCase()}
${dueDate ? `Due Date: ${dueDate.toLocaleDateString()}` : ''}

Description:
${taskDescription}

Please log in to WaveSync to view full task details and complete the required actions.

Best regards,
WaveSync Maritime Team
  `;

  return sendEmail({
    to: userEmail,
    subject,
    htmlContent,
    textContent,
  });
}

/**
 * Send document approval/rejection notification email
 */
export async function sendDocumentApprovalEmail(
  userEmail: string,
  userName: string,
  documentName: string,
  documentType: string,
  isApproved: boolean,
  comments?: string,
  approvedByName?: string
): Promise<boolean> {
  const subject = isApproved 
    ? `✅ Document Approved: ${documentType}`
    : `❌ Document Rejected: ${documentType}`;

  const statusColor = isApproved ? '#10B981' : '#DC2626';
  const statusBg = isApproved ? '#D1FAE5' : '#FEE2E2';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚓ WaveSync Maritime</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Document Review Complete</p>
  </div>

  <!-- Main Content -->
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <!-- Status Badge -->
    <div style="background: ${statusBg}; border: 2px solid ${statusColor}; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
      <p style="color: ${statusColor}; margin: 0; font-weight: 700; font-size: 20px;">
        ${isApproved ? '✅ DOCUMENT APPROVED' : '❌ DOCUMENT REJECTED'}
      </p>
    </div>

    <p style="font-size: 16px; color: #111827; margin-bottom: 10px;">
      Hello <strong>${userName}</strong>,
    </p>

    <p style="font-size: 16px; color: #374151; line-height: 1.8;">
      Your document has been reviewed${approvedByName ? ` by ${approvedByName}` : ''} and has been <strong>${isApproved ? 'approved' : 'rejected'}</strong>.
    </p>

    <!-- Document Details -->
    <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Document:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 700;">${documentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Type:</td>
          <td style="padding: 8px 0; color: #111827;">${documentType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
          <td style="padding: 8px 0; color: ${statusColor}; font-weight: 700; text-transform: uppercase;">
            ${isApproved ? 'Approved' : 'Rejected'}
          </td>
        </tr>
      </table>
    </div>

    ${comments ? `
    <!-- Comments -->
    <div style="background: ${isApproved ? '#F0FDF4' : '#FEF2F2'}; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 8px;">
      <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase;">
        ${isApproved ? 'Approval Notes:' : 'Reason for Rejection:'}
      </p>
      <p style="color: #374151; margin: 0; white-space: pre-wrap;">${comments}</p>
    </div>
    ` : ''}

    ${!isApproved ? `
    <!-- Action Required -->
    <div style="background: #FEE2E2; border: 2px solid #DC2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #991B1B; margin: 0; font-weight: 600;">
        📤 <strong>ACTION REQUIRED</strong>
      </p>
      <p style="color: #991B1B; margin: 10px 0 0 0;">
        Please review the rejection reason above and upload a corrected version of the document.
      </p>
    </div>
    ` : ''}

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://wavesync.com'}/documents" 
         style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
        📄 ${isApproved ? 'View My Documents' : 'Upload Corrected Document'}
      </a>
    </div>

  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">
      This is an automated notification from WaveSync Maritime Platform
    </p>
    <p style="margin: 5px 0;">
      © 2025 WaveSync. All rights reserved.
    </p>
  </div>

</body>
</html>
  `;

  const textContent = `
Hello ${userName},

Your document has been reviewed and has been ${isApproved ? 'APPROVED' : 'REJECTED'}.

Document: ${documentName}
Type: ${documentType}
Status: ${isApproved ? 'APPROVED' : 'REJECTED'}

${comments ? `${isApproved ? 'Approval Notes' : 'Reason for Rejection'}:\n${comments}\n` : ''}

${!isApproved ? 'Please review the rejection reason and upload a corrected version of the document.' : ''}

Log in to WaveSync to view your documents.

Best regards,
WaveSync Maritime Team
  `;

  return sendEmail({
    to: userEmail,
    subject,
    htmlContent,
    textContent,
  });
}

