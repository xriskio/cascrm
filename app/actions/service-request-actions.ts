"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createServiceRequest(data: {
  type: string
  clientName: string
  policyNumber: string
  effectiveDate: string
  description: string
  urgency: string
  specificData: string
}) {
  try {
    // Use service role to bypass RLS policies
    const supabase = createClient({ useServiceRole: true })

    // Generate service request tracking number
    const requestNumber = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const { data: insertedData, error } = await supabase
      .from("service_requests")
      .insert({
        request_number: requestNumber,
        type: data.type,
        client_name: data.clientName,
        policy_number: data.policyNumber,
        effective_date: data.effectiveDate,  // matches the column
        description: data.description,        // matches the column
        urgency: data.urgency,
        specific_data: data.specificData,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating service request:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/service-requests")
    return { success: true, id: insertedData.id, requestNumber }
  } catch (err) {
    console.error("Unexpected error creating service request:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getServiceRequests() {
  try {
    // Use service role to bypass RLS policies
    const supabase = createClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching service requests:", error)
      return { success: false, error: error.message }
    }

    // Transform the data to match the expected format in the frontend
    const transformedData = data.map((item) => ({
      id: item.id,
      type: item.type,
      clientName: item.client_name,
      policyNumber: item.policy_number,
      effectiveDate: item.effective_date, // matches the column
      description: item.description,      // matches the column
      urgency: item.urgency,
      specificData: item.specific_data,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))

    return { success: true, data: transformedData }
  } catch (err) {
    console.error("Unexpected error fetching service requests:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getServiceRequestById(id: string) {
  try {
    // Use service role to bypass RLS policies
    const supabase = createClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Error fetching service request with ID ${id}:`, error)
      return { success: false, error: error.message }
    }

    // Transform the data to match the expected format in the frontend
    const transformedData = {
      id: data.id,
      type: data.type,
      clientName: data.client_name,
      policyNumber: data.policy_number,
      effectiveDate: data.effective_date, // matches the column
      description: data.description,      // matches the column
      urgency: data.urgency,
      specificData: data.specific_data,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return { success: true, data: transformedData }
  } catch (err) {
    console.error(`Unexpected error fetching service request with ID ${id}:`, err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateServiceRequestStatus(id: string, status: string) {
  try {
    // Use service role to bypass RLS policies
    const supabase = createClient({ useServiceRole: true })

    const { error } = await supabase
      .from("service_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error(`Error updating service request status for ID ${id}:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath("/service-requests")
    revalidatePath(`/service-requests/view/${id}`)
    return { success: true }
  } catch (err) {
    console.error(`Unexpected error updating service request status for ID ${id}:`, err)
    return { success: false, error: "An unexpected error occurred" }
  }
}
