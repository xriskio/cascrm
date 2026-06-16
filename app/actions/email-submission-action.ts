"use server"

import { createClient } from "@/lib/supabase"
import { sendSubmissionNotification } from "@/lib/email-templates"

export async function emailSubmissionDetails(submissionId: string) {
  try {
    const supabase = createClient({ useServiceRole: true })

    // Fetch the submission
    const { data: submission, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("submission_number", submissionId)
      .single()

    if (error || !submission) {
      throw new Error("Submission not found")
    }

    // Extract email safely from form_data
    const getEmailFromFormData = (formData: any): string => {
      if (!formData) return ""

      // Try different possible email field names
      const emailFields = ["email", "contactEmail", "client_email", "insuredEmail", "businessEmail", "companyEmail"]

      for (const field of emailFields) {
        if (formData[field] && typeof formData[field] === "string") {
          return formData[field]
        }
      }

      return ""
    }

    // Extract client name safely
    const getClientNameFromFormData = (formData: any): string => {
      if (!formData) return "Unknown Client"

      // Try different possible name field combinations
      const nameFields = [
        "contactName",
        "clientName",
        "companyName",
        "businessName",
        "insuredName",
        "client_name",
        "contact_name",
        "company_name",
        "business_name",
      ]

      for (const field of nameFields) {
        if (formData[field] && typeof formData[field] === "string") {
          return formData[field]
        }
      }

      // Try combining first and last name
      const firstName = formData.firstName || formData.first_name || ""
      const lastName = formData.lastName || formData.last_name || ""
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim()
      }

      return "Unknown Client"
    }

    // Extract agent information safely
    const getAgentInfo = (formData: any) => {
      if (!formData) return { name: "N/A", email: "N/A" }

      const agentName = formData.agentName || formData.agent_name || "N/A"
      const agentEmail = formData.agentEmail || formData.agent_email || "N/A"

      return { name: agentName, email: agentEmail }
    }

    const clientEmail = getEmailFromFormData(submission.form_data)
    const clientName = getClientNameFromFormData(submission.form_data)
    const agentInfo = getAgentInfo(submission.form_data)

    // Validate that we have a valid email address
    if (!clientEmail || !clientEmail.includes("@")) {
      throw new Error("No valid email address found in submission data")
    }

    // Prepare email data with proper structure
    const emailData = {
      submissionId: submission.submission_number,
      trackingNumber: submission.submission_number,
      clientName: clientName,
      clientEmail: clientEmail,
      submissionType: submission.insurance_type || "Unknown Policy Type",
      agentName: agentInfo.name !== "N/A" ? agentInfo.name : undefined,
      status: submission.status || "Received",
      submissionDate: new Date(submission.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    console.log("Sending email with data:", emailData)

    // Send the email notification
    const result = await sendSubmissionNotification(emailData)

    console.log("Email sent successfully:", result)
    return { success: true, message: "Submission details emailed successfully!" }
  } catch (error) {
    console.error("Error emailing submission:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
