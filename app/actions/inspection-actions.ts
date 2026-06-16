"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Generate unique inspection tracking number
function generateInspectionNumber(): string {
  const prefix = "INSP"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}

export async function createInspection(data: any) {
  try {
    console.log("Creating inspection request...")
    console.log("Data received:", JSON.stringify(data, null, 2))

    // Generate tracking number
    const inspectionNumber = generateInspectionNumber()

    // Get current user information
    const regularClient = createClient()
    const { data: { user } } = await regularClient.auth.getUser()
    const createdBy = user?.email || data.contactName || "System"

    // Prepare inspection data
    const inspectionData = {
      inspection_number: inspectionNumber,
      named_insured: data.namedInsured,
      policy_number: data.policyNumber,
      effective_date: data.effectiveDate,
      noc_date: data.nocDate || null,
      insurance_company: data.insuranceCompany,
      policy_type: data.policyType,
      contact_company: data.contactCompany,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail,
      notes: data.notes || null,
      status: "pending",
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Use service role for insert
    const supabase = createClient({ useServiceRole: true })
    const { data: savedData, error } = await supabase
      .from("inspections")
      .insert([inspectionData])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: error.message }
    }

    console.log("Inspection created successfully:", inspectionNumber)

    // Revalidate paths
    revalidatePath("/inspections")
    revalidatePath("/inspections/requests")

    return {
      success: true,
      inspectionNumber: inspectionNumber,
      inspectionId: savedData.id,
    }
  } catch (error) {
    console.error("Error creating inspection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getInspections(status?: string) {
  try {
    const supabase = createClient()
    let query = supabase
      .from("inspections")
      .select("*")
      .order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}

export async function getInspectionStats() {
  try {
    const supabase = createClient()

    // Get counts for different statuses
    const { data: allInspections, error } = await supabase
      .from("inspections")
      .select("status, created_at")

    if (error) throw error

    const pending = allInspections?.filter((i) => i.status === "pending").length || 0
    const compliance = allInspections?.filter((i) => i.status === "compliance_issue").length || 0

    // Get today's completed count
    const today = new Date().toISOString().split("T")[0]
    const completedToday =
      allInspections?.filter(
        (i) =>
          i.status === "completed" && i.created_at.startsWith(today)
      ).length || 0

    return {
      success: true,
      stats: {
        pending,
        compliance,
        completedToday,
      },
    }
  } catch (error) {
    console.error("Error fetching inspection stats:", error)
    return {
      success: false,
      stats: {
        pending: 0,
        compliance: 0,
        completedToday: 0,
      },
    }
  }
}
