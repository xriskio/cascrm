// Base email template for consistent branding (kept for reference)
const getEmailTemplate = (title: string, content: string, actionButton?: { text: string; url: string }) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
      .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316; }
      .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
      .label { font-weight: bold; color: #374151; }
      .value { color: #6b7280; }
      .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      .action-button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 20px 0; }
      .warning-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
      .success-box { background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0; }
      .status-change { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🛡️ InsureTrac by Casurance</div>
        <div>${title}</div>
      </div>
      
      <div class="content">
        ${content}
        
        ${
          actionButton
            ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionButton.url}" class="action-button">${actionButton.text}</a>
        </div>
        `
            : ""
        }
      </div>
      
      <div class="footer">
        <p>This is an automated notification from InsureTrac by Casurance.</p>
        <p>Please do not reply to this email. For support, contact your system administrator.</p>
        <p>Casurance Insurance Agency | www.casurance.net | 1-888-254-0089</p>
      </div>
    </div>
  </body>
</html>
`

export async function sendSubmissionNotification(data: {
  submissionId: string
  trackingNumber: string
  clientName: string
  clientEmail: string
  submissionType: string
  agentName?: string
  status?: string
  submissionDate?: string
}) {
  // Validate email address
  if (!data.clientEmail || typeof data.clientEmail !== "string" || !data.clientEmail.includes("@")) {
    throw new Error("Invalid email address provided")
  }

  console.log(`[PLACEHOLDER] Would send submission notification to ${data.clientEmail}:`, data)

  return {
    id: `placeholder-${Date.now()}`,
    message: "Email functionality disabled - would have sent submission notification",
  }
}

export async function sendRenewalNotification(data: {
  renewalId: string
  trackingNumber: string
  clientName: string
  clientEmail: string
  policyType: string
  expirationDate: string
  agentName?: string
  statusUpdate?: {
    oldStatus: string
    newStatus: string
    notes?: string
  }
}) {
  console.log(`[PLACEHOLDER] Would send renewal notification to ${data.clientEmail}:`, data)

  return {
    id: `placeholder-${Date.now()}`,
    message: "Email functionality disabled - would have sent renewal notification",
  }
}

export async function sendRenewalAssignmentEmail(data: {
  agentEmail: string
  agentName: string
  renewalId: string
  trackingNumber: string
  clientName: string
  policyType: string
  expirationDate: string
  assignedBy: string
}) {
  console.log(`[PLACEHOLDER] Would send renewal assignment email to ${data.agentEmail}:`, data)

  return {
    id: `placeholder-${Date.now()}`,
    message: "Email functionality disabled - would have sent assignment email",
  }
}

export async function sendLeadNotification(data: {
  leadId: string
  leadName: string
  leadEmail: string
  leadPhone?: string
  source: string
  agentName?: string
}) {
  console.log(`[PLACEHOLDER] Would send lead notification to ${data.leadEmail}:`, data)

  return {
    id: `placeholder-${Date.now()}`,
    message: "Email functionality disabled - would have sent lead notification",
  }
}

export async function sendTaskAssignmentNotification(data: {
  taskId: string
  taskTitle: string
  assignedToEmail: string
  assignedToName: string
  assignedByName: string
  dueDate?: string
  priority?: string
  description?: string
}) {
  console.log(`[PLACEHOLDER] Would send task assignment notification to ${data.assignedToEmail}:`, data)

  return {
    id: `placeholder-${Date.now()}`,
    message: "Email functionality disabled - would have sent task assignment notification",
  }
}

export async function sendServiceRequestNotification(data: {
  serviceRequestId: string
  trackingNumber: string
  clientName: string
  clientEmail: string
  requestType: string
  status?: string
  agentName?: string
}) {
  console.log(`[PLACEHOLDER] Would send service request notification to ${data.clientEmail}:`, data)

  return {
    id: `placeholder-${Date.now()}`,
    message: "Email functionality disabled - would have sent service request notification",
  }
}

export async function sendDailySummaryNotification(data: {
  recipientEmail: string
  recipientName: string
  date: string
  summary: {
    newSubmissions: number
    newLeads: number
    pendingRenewals: number
    completedTasks: number
    totalRevenue?: number
  }
}) {
  console.log(`[PLACEHOLDER] Would send daily summary notification to ${data.recipientEmail}:`, data)

  return {
    id: `placeholder-${Date.now()}`,
    message: "Email functionality disabled - would have sent daily summary notification",
  }
}
