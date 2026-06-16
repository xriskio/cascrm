"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createDocumentRequest(data: {
  clientName: string
  clientEmail?: string
  agentName?: string
  agentEmail?: string
  policyType: string
  documentType: string
  dueDate: string
  priority?: string
  notes?: string
}) {
  try {
    const supabase = createClient({ useServiceRole: true })

    // Generate tracking number
    const trackingNumber = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const { data: insertedData, error } = await supabase
      .from("document_requests")
      .insert({
        tracking_number: trackingNumber,
        client_name: data.clientName,
        client_email: data.clientEmail || null,
        agent_name: data.agentName || null,
        agent_email: data.agentEmail || null,
        policy_type: data.policyType,
        document_type: data.documentType,
        due_date: data.dueDate,
        priority: data.priority || "normal",
        notes: data.notes,
        status: "pending",
        date_requested: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating document request:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/missing-documents")
    return { success: true, id: insertedData.id, trackingNumber }
  } catch (err) {
    console.error("Unexpected error creating document request:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getDocumentRequests() {
  try {
    const supabase = createClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from("document_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching document requests:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (err) {
    console.error("Unexpected error fetching document requests:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getDocumentStats() {
  try {
    const supabase = createClient({ useServiceRole: true })

    const { data: allRequests } = await supabase
      .from("document_requests")
      .select("status, due_date, date_received")

    if (!allRequests) {
      return {
        success: true,
        stats: { outstanding: 0, overdue: 0, receivedToday: 0, pendingReview: 0 },
      }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const outstanding = allRequests.filter((r) => r.status === "pending" || r.status === "overdue").length
    const overdue = allRequests.filter((r) => {
      if (r.status === "received") return false
      const dueDate = new Date(r.due_date)
      return dueDate < now
    }).length

    const receivedToday = allRequests.filter((r) => {
      if (!r.date_received) return false
      const receivedDate = new Date(r.date_received)
      return (
        receivedDate.getFullYear() === today.getFullYear() &&
        receivedDate.getMonth() === today.getMonth() &&
        receivedDate.getDate() === today.getDate()
      )
    }).length

    const pendingReview = allRequests.filter((r) => r.status === "pending_review").length

    return {
      success: true,
      stats: { outstanding, overdue, receivedToday, pendingReview },
    }
  } catch (err) {
    console.error("Unexpected error fetching document stats:", err)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function updateDocumentStatus(id: string, status: string) {
  try {
    const supabase = createClient({ useServiceRole: true })

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    // If marking as received, set the date_received
    if (status === "received") {
      updateData.date_received = new Date().toISOString()
    }

    const { error } = await supabase.from("document_requests").update(updateData).eq("id", id)

    if (error) {
      console.error(`Error updating document request status for ID ${id}:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath("/missing-documents")
    return { success: true }
  } catch (err) {
    console.error(`Unexpected error updating document request status for ID ${id}:`, err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function sendDocumentReminder(id: string) {
  try {
    const supabase = createClient({ useServiceRole: true })

    // Get the document request details first
    const { data: request, error: fetchError } = await supabase
      .from("document_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !request) {
      console.error(`Error fetching document request for ID ${id}:`, fetchError)
      return { success: false, error: fetchError?.message || "Document request not found" }
    }

    // Calculate days remaining before NOC (due date)
    const dueDate = new Date(request.due_date)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Import the email function
    const { sendDocumentReminderEmail } = await import("@/lib/email")

    // Send email reminders to both client and agent
    await sendDocumentReminderEmail({
      trackingNumber: request.tracking_number,
      clientName: request.client_name,
      clientEmail: request.client_email,
      policyType: request.policy_type,
      documentType: request.document_type,
      dueDate: request.due_date,
      daysRemaining,
      agentName: request.agent_name,
      agentEmail: request.agent_email,
      priority: request.priority || "normal",
    })

    // Update last_reminder_sent timestamp
    const { error } = await supabase
      .from("document_requests")
      .update({
        last_reminder_sent: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error(`Error updating reminder timestamp for ID ${id}:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath("/missing-documents")
    return { success: true, daysRemaining }
  } catch (err) {
    console.error(`Unexpected error sending reminder for ID ${id}:`, err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function sendBulkDocumentReminders() {
  try {
    const supabase = createClient({ useServiceRole: true })

    // Get all outstanding (non-received) document requests
    const { data: requests, error: fetchError } = await supabase
      .from("document_requests")
      .select("*")
      .neq("status", "received")
      .order("due_date", { ascending: true })

    if (fetchError) {
      console.error("Error fetching document requests:", fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!requests || requests.length === 0) {
      return {
        success: true,
        sent: 0,
        total: 0,
        message: "No outstanding document requests to send reminders for",
      }
    }

    console.log(`📤 Sending bulk reminders for ${requests.length} outstanding document requests...`)

    // Import the email function
    const { sendDocumentReminderEmail } = await import("@/lib/email")

    let successCount = 0
    let overdueCount = 0
    const results = []

    // Send reminders for each request
    for (const request of requests) {
      try {
        // Calculate days remaining before NOC (due date)
        const dueDate = new Date(request.due_date)
        const today = new Date()
        const diffTime = dueDate.getTime() - today.getTime()
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (daysRemaining < 0) {
          overdueCount++
        }

        // Send email reminders
        const emailResult = await sendDocumentReminderEmail({
          trackingNumber: request.tracking_number,
          clientName: request.client_name,
          clientEmail: request.client_email,
          policyType: request.policy_type,
          documentType: request.document_type,
          dueDate: request.due_date,
          daysRemaining,
          agentName: request.agent_name,
          agentEmail: request.agent_email,
          priority: request.priority || "normal",
        })

        // Update last_reminder_sent timestamp
        await supabase
          .from("document_requests")
          .update({
            last_reminder_sent: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", request.id)

        successCount++
        results.push({
          trackingNumber: request.tracking_number,
          clientName: request.client_name,
          daysRemaining,
          success: true,
        })
      } catch (err) {
        console.error(`Error sending reminder for ${request.tracking_number}:`, err)
        results.push({
          trackingNumber: request.tracking_number,
          clientName: request.client_name,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }

    console.log(`✅ Bulk reminders sent: ${successCount}/${requests.length} (${overdueCount} overdue)`)

    revalidatePath("/missing-documents")
    return {
      success: true,
      sent: successCount,
      total: requests.length,
      overdue: overdueCount,
      results,
      message: `Successfully sent ${successCount} reminders (${overdueCount} overdue)`,
    }
  } catch (err) {
    console.error("Unexpected error in sendBulkDocumentReminders:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}
