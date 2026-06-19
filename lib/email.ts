import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY is not set. Email notifications will fail.')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SubmissionEmailData {
  submissionNumber: string
  clientName: string
  policyType: string
  agentName?: string
  agentEmail?: string
  submissionDate: string
  submissionId: string
  formDetails?: string
  uploadedFiles?: string
  vehicleDetails?: string
  driverDetails?: string
}

export interface DocumentReminderEmailData {
  trackingNumber: string
  clientName: string
  clientEmail?: string
  policyType: string
  documentType: string
  dueDate: string
  daysRemaining: number
  agentName?: string
  agentEmail?: string
  priority: string
}

export async function sendDocumentReminderEmail(data: DocumentReminderEmailData) {
  try {
    const isOverdue = data.daysRemaining < 0
    const urgencyLabel = isOverdue 
      ? `OVERDUE by ${Math.abs(data.daysRemaining)} days` 
      : `${data.daysRemaining} days remaining`

    const emails = []

    // Send email to client if email is provided
    if (data.clientEmail) {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'InsureTrac <noreply@casurance.net>',
        to: data.clientEmail,
        subject: `${isOverdue ? '⚠️ URGENT' : '📋'} Document Required - ${data.documentType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Document Required</h2>
            <p>Dear ${data.clientName},</p>
            <p>This is ${isOverdue ? 'an <strong>urgent</strong>' : 'a'} reminder that we need the following document:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Document Type:</strong> ${data.documentType}</p>
              <p><strong>Policy Type:</strong> ${data.policyType}</p>
              <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
              <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${urgencyLabel}</p>
            </div>
            ${isOverdue 
              ? `<div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                   <p><strong>⚠️ This document is now OVERDUE.</strong> Please submit immediately to avoid Notice of Cancellation (NOC).</p>
                 </div>`
              : `<p>Please submit this document within ${data.daysRemaining} days to avoid cancellation.</p>`
            }
            <p>If you have any questions, please contact your agent.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>Casurance Insurance Agency</strong></p>
          </div>
        `,
      })
      
      if (emailError) {
        console.error(`Failed to send client email to ${data.clientEmail}:`, emailError)
        emails.push({ type: 'client', success: false, error: emailError })
      } else if (emailData?.id) {
        console.log(`✅ Client email sent to ${data.clientEmail} (ID: ${emailData.id})`)
        emails.push({ type: 'client', success: true, emailId: emailData.id })
      }
    }

    // Send email to agent if email is provided
    if (data.agentEmail) {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'InsureTrac <noreply@casurance.net>',
        to: data.agentEmail,
        subject: `${isOverdue ? '⚠️ URGENT' : '📋'} Follow Up Required - ${data.clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Follow Up Required</h2>
            <p>Hi ${data.agentName || 'Agent'},</p>
            <p>Document reminder sent to ${data.clientName}:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Client:</strong> ${data.clientName}</p>
              <p><strong>Document Type:</strong> ${data.documentType}</p>
              <p><strong>Policy Type:</strong> ${data.policyType}</p>
              <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
              <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${urgencyLabel}</p>
              <p><strong>Priority:</strong> ${data.priority.toUpperCase()}</p>
            </div>
            ${isOverdue 
              ? `<div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
                   <p><strong>⚠️ OVERDUE</strong> - This document is past due. Please follow up immediately to avoid NOC.</p>
                 </div>`
              : `<p><strong>Action Required</strong> - Please ensure client submits within ${data.daysRemaining} days.</p>`
            }
            <p style="margin-top: 30px;">Best regards,<br><strong>InsureTrac System</strong></p>
          </div>
        `,
      })
      
      if (emailError) {
        console.error(`Failed to send agent email to ${data.agentEmail}:`, emailError)
        emails.push({ type: 'agent', success: false, error: emailError })
      } else if (emailData?.id) {
        console.log(`✅ Agent email sent to ${data.agentEmail} (ID: ${emailData.id})`)
        emails.push({ type: 'agent', success: true, emailId: emailData.id })
      }
    }

    const successCount = emails.filter(e => e.success).length
    const failureCount = emails.filter(e => !e.success).length
    
    console.log(`📧 Document reminder emails: ${successCount} sent, ${failureCount} failed`)

    // Return success only if at least one email was sent successfully
    const overallSuccess = successCount > 0 || emails.length === 0
    
    return {
      success: overallSuccess,
      emailId: `reminder-${Date.now()}`,
      message: overallSuccess 
        ? `Email reminders sent successfully (${successCount}/${emails.length})` 
        : `Failed to send email reminders`,
      details: {
        clientEmailSent: emails.some(e => e.type === 'client' && e.success),
        agentEmailSent: emails.some(e => e.type === 'agent' && e.success),
        daysRemaining: data.daysRemaining,
        isOverdue,
        emails,
      }
    }
  } catch (error) {
    console.error("Error in sendDocumentReminderEmail:", error)
    throw error
  }
}

export interface RenewalProgressEmailData {
  clientName: string
  clientEmail: string
  policyNumber?: string | null
  policyType?: string | null
  carrier?: string | null
  expirationDate?: string | null
  phaseTitle: string
  progressPct: number
  completedSteps: string[]
  nextSteps: string[]
  agencyName?: string
}

export async function sendRenewalProgressEmail(data: RenewalProgressEmailData) {
  const exp = data.expirationDate ? new Date(data.expirationDate).toLocaleDateString() : "TBD"
  const completed = data.completedSteps.length
    ? data.completedSteps.map((s) => `<li style="margin:4px 0;">✅ ${s}</li>`).join("")
    : `<li style="margin:4px 0;color:#666;">Getting started</li>`
  const next = data.nextSteps.length
    ? data.nextSteps.map((s) => `<li style="margin:4px 0;">🔜 ${s}</li>`).join("")
    : `<li style="margin:4px 0;color:#666;">Finalizing your renewal</li>`

  const subject = `Your policy renewal is in progress${data.policyNumber ? ` — ${data.policyNumber}` : ""}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background:#0066cc;color:#fff;padding:20px;border-radius:5px 5px 0 0;">
        <h1 style="margin:0;font-size:22px;">Renewal Progress Update</h1>
      </div>
      <div style="background:#f9f9f9;padding:20px;border:1px solid #ddd;border-top:none;">
        <p>Dear ${data.clientName},</p>
        <p>Here is an update on the renewal of your policy. Our team is actively managing your renewal to ensure continuous coverage and the best possible terms.</p>
        <div style="background:#fff;padding:15px;border-radius:5px;margin:18px 0;">
          ${data.policyNumber ? `<p style="margin:6px 0;"><strong>Policy:</strong> ${data.policyNumber}</p>` : ""}
          ${data.policyType ? `<p style="margin:6px 0;"><strong>Line of business:</strong> ${data.policyType}</p>` : ""}
          ${data.carrier ? `<p style="margin:6px 0;"><strong>Carrier:</strong> ${data.carrier}</p>` : ""}
          <p style="margin:6px 0;"><strong>Expiration:</strong> ${exp}</p>
          <p style="margin:6px 0;"><strong>Current stage:</strong> ${data.phaseTitle}</p>
        </div>
        <div style="background:#e7f3ff;border-left:4px solid #0066cc;padding:12px 15px;border-radius:3px;margin:18px 0;">
          <strong>Overall progress: ${data.progressPct}% complete</strong>
          <div style="height:10px;background:#d6e4f5;border-radius:6px;margin-top:8px;overflow:hidden;">
            <div style="height:10px;width:${data.progressPct}%;background:#0066cc;"></div>
          </div>
        </div>
        <h3 style="color:#333;margin:18px 0 6px;">Completed</h3>
        <ul style="padding-left:18px;margin:0;">${completed}</ul>
        <h3 style="color:#333;margin:18px 0 6px;">What's next</h3>
        <ul style="padding-left:18px;margin:0;">${next}</ul>
        <p style="margin-top:24px;">If you have any questions or updates to share, simply reply to this email or contact your account manager.</p>
        <p style="margin-top:24px;">Best regards,<br><strong>${data.agencyName || "Casurance Insurance Agency"}</strong></p>
      </div>
      <div style="background:#333;color:#999;padding:12px;text-align:center;border-radius:0 0 5px 5px;font-size:12px;">
        Automated renewal update from InsureTrac by Casurance Insurance Agency
      </div>
    </div>`

  const { data: emailData, error } = await resend.emails.send({
    from: "InsureTrac <noreply@casurance.net>",
    to: data.clientEmail,
    subject,
    html,
  })

  if (error) {
    return { success: false, error: (error as any)?.message || "Failed to send email", subject }
  }
  return { success: true, emailId: emailData?.id, subject }
}

export async function sendSubmissionNotification(data: SubmissionEmailData) {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0066cc; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">New Insurance Submission</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Submission Details</h2>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Submission Number:</strong> ${data.submissionNumber}</p>
            <p style="margin: 10px 0;"><strong>Client Name:</strong> ${data.clientName}</p>
            <p style="margin: 10px 0;"><strong>Policy Type:</strong> ${data.policyType}</p>
            <p style="margin: 10px 0;"><strong>Submission Date:</strong> ${data.submissionDate}</p>
            ${data.agentName ? `<p style="margin: 10px 0;"><strong>Agent:</strong> ${data.agentName}</p>` : ''}
          </div>

          ${data.formDetails ? `
            <h3 style="color: #333; margin-top: 25px;">Application Details</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; white-space: pre-line; font-size: 14px;">
              ${data.formDetails}
            </div>
          ` : ''}

          ${data.vehicleDetails ? `
            <h3 style="color: #333; margin-top: 25px;">Vehicle Information</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; white-space: pre-line; font-size: 14px;">
              ${data.vehicleDetails}
            </div>
          ` : ''}

          ${data.driverDetails ? `
            <h3 style="color: #333; margin-top: 25px;">Driver Information</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; white-space: pre-line; font-size: 14px;">
              ${data.driverDetails}
            </div>
          ` : ''}

          ${data.uploadedFiles ? `
            <h3 style="color: #333; margin-top: 25px;">Uploaded Files</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; white-space: pre-line; font-size: 14px;">
              ${data.uploadedFiles}
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #0066cc; border-radius: 3px;">
            <p style="margin: 0;"><strong>Next Steps:</strong> Review this submission in your InsureTrac dashboard and contact the client to proceed with underwriting.</p>
          </div>
        </div>
        
        <div style="background-color: #333; color: #999; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 12px;">
          <p style="margin: 0;">This is an automated notification from InsureTrac by Casurance Insurance Agency</p>
        </div>
      </div>
    `

    // Send to agent or default email
    const recipientEmail = data.agentEmail || 'admin@casurance.net'
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'InsureTrac <noreply@casurance.net>',
      to: recipientEmail,
      subject: `New ${data.policyType} Submission - ${data.clientName}`,
      html: emailHtml,
    })

    if (emailError) {
      console.error(`❌ Failed to send submission notification to ${recipientEmail}:`, emailError)
      throw new Error(`Failed to send email: ${emailError.message || 'Unknown error'}`)
    }

    if (!emailData?.id) {
      console.error(`❌ No email ID returned from Resend for ${recipientEmail}`)
      throw new Error('Email send returned no confirmation ID')
    }

    console.log(`✅ Submission notification email sent to ${recipientEmail} (ID: ${emailData.id})`)

    return {
      success: true,
      emailId: emailData.id,
      message: `Submission notification sent to ${recipientEmail}`,
      recipient: recipientEmail,
    }
  } catch (error) {
    console.error("Error in sendSubmissionNotification:", error)
    throw error
  }
}
