"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendLeadNotification } from "@/lib/email-templates"
import { revalidatePath } from "next/cache"

export async function createLead(formData: any) {
  try {
    const supabase = supabaseAdmin

    // Generate lead ID
    const leadId = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create the lead
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        lead_id: leadId,
        name: formData.contactName || formData.companyName || "Unknown",
        contact_name: formData.contactName,
        company_name: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source || "Manual Entry",
        notes: formData.notes,
        priority: formData.priority || "medium",
        status: "new",
        date_entered: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating lead:", error)
      throw new Error("Failed to create lead")
    }

    // Send email notification
    try {
      const emailData = {
        leadId: leadId,
        leadName: formData.contactName || "Unknown Contact",
        leadEmail: formData.email || "no-email@unknown.com",
        leadPhone: formData.phone,
        source: formData.source || "Manual Entry",
        agentName: formData.agentName,
      }

      await sendLeadNotification(emailData)
      console.log("Email notification sent for lead:", leadId)
    } catch (emailError) {
      console.error("Failed to send lead email notification:", emailError)
      // Don't fail the lead creation if email fails
    }

    revalidatePath("/leads")
    return { success: true, leadId }
  } catch (error: any) {
    console.error("Error in createLead:", error)
    return { success: false, error: error?.message || "Failed to create lead" }
  }
}

export async function updateLeadStatus(leadId: string, status: string) {
  try {
    const supabase = supabaseAdmin

    const { error } = await supabase
      .from("leads")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("lead_id", leadId)

    if (error) {
      throw new Error("Failed to update lead status")
    }

    revalidatePath("/leads")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating lead status:", error)
    return { success: false, error: error?.message || "Failed to update lead status" }
  }
}
