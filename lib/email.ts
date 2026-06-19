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

export interface RenewalNotificationData {
  workflowId: string
  notificationType: 'kickoff_120' | 'phase2_90' | 'quotes_ready' | 'proposal_30' | 'bound_confirmation' | 'post_renewal_debrief'
  clientName: string
  clientEmail?: string
  agentName?: string
  agentEmail?: string
  policyType: string
  policyNumber?: string
  expirationDate: string
  expiringPremium?: number
  quotedPremium?: number
  boundPremium?: number
  customMessage?: string
}

type NotificationConfig = {
  subject: (data: RenewalNotificationData) => string
  daysOut: number
  phaseLabel: string
  clientBody: (data: RenewalNotificationData) => string
}

const RENEWAL_EMAIL_CONFIGS: Record<string, NotificationConfig> = {
  kickoff_120: {
    subject: (d) => `Your Commercial Insurance Renewal Has Started – ${d.policyType}`,
    daysOut: 120,
    phaseLabel: 'Phase 1: Planning & Preparation (120 Days Out)',
    clientBody: (d) => `
      <p>Dear ${d.clientName},</p>
      <p>We are beginning the renewal process for your <strong>${d.policyType}</strong> policy${d.policyNumber ? ` (${d.policyNumber})` : ''}, which expires on <strong>${new Date(d.expirationDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</strong>.</p>
      <div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:16px;margin:20px 0;border-radius:4px;">
        <strong>What happens next:</strong>
        <ul style="margin:10px 0 0 0;padding-left:20px;">
          <li>Your agent will schedule a strategy meeting to discuss any business changes</li>
          <li>We'll need updated financials, payroll figures, and asset lists</li>
          <li>We'll review your current limits and identify any coverage gaps</li>
        </ul>
      </div>
      <p>Your agent, <strong>${d.agentName || 'your Casurance agent'}</strong>, will be in touch shortly to schedule your renewal strategy meeting.</p>
    `,
  },
  phase2_90: {
    subject: (d) => `Renewal Update: Applications Submitted to Market – ${d.policyType}`,
    daysOut: 90,
    phaseLabel: 'Phase 2: Market Strategy (90 Days Out)',
    clientBody: (d) => `
      <p>Dear ${d.clientName},</p>
      <p>We have submitted your renewal application to the market for your <strong>${d.policyType}</strong> policy expiring <strong>${new Date(d.expirationDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</strong>.</p>
      <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;margin:20px 0;border-radius:4px;">
        <strong>What's happening now:</strong>
        <ul style="margin:10px 0 0 0;padding-left:20px;">
          <li>Applications submitted to carriers and underwriters</li>
          <li>We are evaluating current market conditions and carrier appetite</li>
          <li>Quotes typically arrive within 2–3 weeks</li>
        </ul>
      </div>
      <p>No action is needed from you at this time. We'll reach out as soon as quotes arrive.</p>
    `,
  },
  quotes_ready: {
    subject: (d) => `Your Renewal Quotes Are Ready for Review – ${d.policyType}`,
    daysOut: 60,
    phaseLabel: 'Phase 2: Quote Review',
    clientBody: (d) => `
      <p>Dear ${d.clientName},</p>
      <p>We have received quotes for your <strong>${d.policyType}</strong> renewal and are ready to review your options.</p>
      ${d.quotedPremium ? `
      <div style="background:#fffbeb;border-left:4px solid #d97706;padding:16px;margin:20px 0;border-radius:4px;">
        <strong>Quote Summary</strong><br/>
        <span style="font-size:18px;font-weight:bold;color:#d97706;">$${d.quotedPremium.toLocaleString()}</span> estimated renewal premium
        ${d.expiringPremium ? `<br/><small style="color:#666;">vs. expiring premium of $${d.expiringPremium.toLocaleString()}</small>` : ''}
      </div>` : ''}
      <p>Your agent will reach out to schedule a proposal review call. We evaluate not just premium, but carrier financial strength, exclusions, and total cost of risk.</p>
    `,
  },
  proposal_30: {
    subject: (d) => `ACTION REQUIRED: Final Renewal Proposal Ready – Expires in 30 Days`,
    daysOut: 30,
    phaseLabel: 'Phase 3: Finalization (30 Days Out)',
    clientBody: (d) => `
      <p>Dear ${d.clientName},</p>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin:20px 0;border-radius:4px;">
        <strong>⏰ Action Required — 30 Days to Expiration</strong><br/>
        Your <strong>${d.policyType}</strong> policy expires on <strong>${new Date(d.expirationDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</strong>.
      </div>
      <p>Your final renewal proposal is ready. Please contact <strong>${d.agentName || 'your agent'}</strong> to:</p>
      <ol style="padding-left:20px;">
        <li>Review the recommended coverage and premium</li>
        <li>Confirm any changes to limits or endorsements</li>
        <li>Authorize binding of the policy before expiration</li>
      </ol>
      <p><strong>Important:</strong> To avoid any lapse in coverage, please respond within 15 days.</p>
    `,
  },
  bound_confirmation: {
    subject: (d) => `✅ Coverage Confirmed – Your ${d.policyType} Policy Has Been Bound`,
    daysOut: 0,
    phaseLabel: 'Policy Bound',
    clientBody: (d) => `
      <p>Dear ${d.clientName},</p>
      <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;margin:20px 0;border-radius:4px;">
        <strong>Your coverage is confirmed.</strong><br/>
        Your <strong>${d.policyType}</strong> policy has been successfully renewed effective <strong>${new Date(d.expirationDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</strong>.
      </div>
      ${d.boundPremium ? `<p><strong>Bound Annual Premium:</strong> $${d.boundPremium.toLocaleString()}</p>` : ''}
      <p>What to expect next:</p>
      <ul style="padding-left:20px;">
        <li>Policy documents emailed within 3–5 business days</li>
        <li>Updated certificates of insurance issued to lenders/partners</li>
        <li>Your agent will schedule a post-renewal debrief</li>
      </ul>
    `,
  },
  post_renewal_debrief: {
    subject: (d) => `Post-Renewal Debrief – Let's Review Your ${d.policyType} Coverage`,
    daysOut: -14,
    phaseLabel: 'Post-Renewal Planning',
    clientBody: (d) => `
      <p>Dear ${d.clientName},</p>
      <p>Now that your <strong>${d.policyType}</strong> renewal is complete, we'd like to schedule a brief debrief to:</p>
      <ul style="padding-left:20px;">
        <li>Review final coverage terms and changes from last year</li>
        <li>Set up your preferred payment strategy (monthly, Pay-as-You-Go, etc.)</li>
        <li>Update certificates of insurance for lenders and contract partners</li>
        <li>Begin planning for your next renewal cycle</li>
      </ul>
      <p>Please reply to this email to schedule a 20-minute call with <strong>${d.agentName || 'your agent'}</strong>.</p>
    `,
  },
}

function buildRenewalEmailHtml(data: RenewalNotificationData, bodyHtml: string, phaseLabel: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;">
      <div style="background:#1e3a5f;padding:24px 28px;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;">Casurance Insurance Agency</h1>
        <p style="margin:6px 0 0;color:#93c5fd;font-size:13px;">${phaseLabel}</p>
      </div>
      <div style="padding:28px;border:1px solid #e5e7eb;border-top:none;">
        ${bodyHtml}
        ${data.customMessage ? `<div style="background:#f9fafb;border-radius:6px;padding:14px;margin:20px 0;font-style:italic;color:#374151;">${data.customMessage}</div>` : ''}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;"/>
        <p style="color:#6b7280;font-size:13px;">Questions? Contact your agent at <a href="mailto:${data.agentEmail || 'info@casurance.net'}" style="color:#2563eb;">${data.agentEmail || 'info@casurance.net'}</a></p>
        <p style="margin-top:20px;">Best regards,<br/><strong>${data.agentName || 'Your Casurance Agent'}</strong><br/><span style="color:#6b7280;">Casurance Insurance Agency</span></p>
      </div>
      <div style="background:#f3f4f6;padding:12px 28px;text-align:center;border-radius:0 0 8px 8px;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">InsureTrac · Casurance Insurance Agency · noreply@casurance.net</p>
      </div>
    </div>
  `
}

export async function sendRenewalNotification(data: RenewalNotificationData): Promise<{
  success: boolean
  emailId?: string
  error?: string
}> {
  try {
    const config = RENEWAL_EMAIL_CONFIGS[data.notificationType]
    if (!config) return { success: false, error: `Unknown notification type: ${data.notificationType}` }

    if (!data.clientEmail) return { success: false, error: 'No client email provided' }

    const subject = config.subject(data)
    const bodyHtml = config.clientBody(data)
    const fullHtml = buildRenewalEmailHtml(data, bodyHtml, config.phaseLabel)

    const { data: emailData, error } = await resend.emails.send({
      from: 'Casurance Insurance <noreply@casurance.net>',
      to: data.clientEmail,
      subject,
      html: fullHtml,
    })

    if (error) {
      console.error('Renewal notification email failed:', error)
      return { success: false, error: error.message }
    }

    // CC agent
    if (data.agentEmail && data.agentEmail !== data.clientEmail) {
      await resend.emails.send({
        from: 'Casurance Insurance <noreply@casurance.net>',
        to: data.agentEmail,
        subject: `[FYI – Sent to Client] ${subject}`,
        html: fullHtml,
      })
    }

    return { success: true, emailId: emailData?.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
