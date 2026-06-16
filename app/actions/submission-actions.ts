"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendSubmissionNotification } from "@/lib/email-templates"
import { revalidatePath } from "next/cache"

export async function createSubmission(formData: any, insuranceType: string) {
  try {

    // Generate submission number
    const submissionNumber = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create the submission
    const { data: submission, error } = await supabaseAdmin
      .from("submissions")
      .insert({
        submission_number: submissionNumber,
        insurance_type: insuranceType,
        form_data: formData,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating submission:", error)
      throw new Error("Failed to create submission")
    }

    // Send email notification
    try {
      const emailData = {
        submissionId: submission.id || submissionNumber,
        trackingNumber: submissionNumber,
        clientName: formData.companyName || formData.contactName || "Unknown Client",
        clientEmail: formData.email || formData.contactEmail || "no-email@example.com",
        submissionType: insuranceType,
        agentName: formData.agentName || "N/A",
        status: "pending",
        submissionDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      await sendSubmissionNotification(emailData)
      console.log("Email notification sent for submission:", submissionNumber)
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
      // Don't fail the submission creation if email fails
    }

    revalidatePath("/submissions")
    return { success: true, submissionNumber }
  } catch (error) {
    console.error("Error in createSubmission:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function updateSubmissionStatus(submissionId: string, status: string) {
  try {
    const { error } = await supabaseAdmin
      .from("submissions")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("submission_number", submissionId)

    if (error) {
      throw new Error("Failed to update submission status")
    }

    revalidatePath("/submissions")
    revalidatePath(`/submissions/view/${submissionId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating submission status:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
