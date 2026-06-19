"use server"

import { createClient } from "@/lib/supabase/server"

export async function getRenewals() {
  try {
    const supabase = await createClient()

    const { data: renewals, error } = await supabase
      .from("renewals")
      .select("*")
      .order("expiration_date", { ascending: true })

    if (error) throw error

    return {
      success: true,
      data: renewals || [],
    }
  } catch (error) {
    console.error("Error fetching renewals:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}

export async function getRenewalById(id: string) {
  try {
    const supabase = await createClient()

    const { data: renewal, error } = await supabase.from("renewals").select("*").eq("id", id).single()

    if (error) throw error

    return {
      success: true,
      data: renewal,
    }
  } catch (error) {
    console.error("Error fetching renewal:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateRenewalStatus(id: string, status: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("renewals")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error updating renewal status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteRenewal(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("renewals").delete().eq("id", id)

    if (error) throw error

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting renewal:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function removeDuplicateRenewals() {
  try {
    const supabase = await createClient()

    // Find duplicates based on policy_number and client_name
    const { data: renewals, error: fetchError } = await supabase
      .from("renewals")
      .select("*")
      .order("created_at", { ascending: false })

    if (fetchError) throw fetchError

    const duplicateGroups = new Map()
    const toDelete: string[] = []

    renewals?.forEach((renewal) => {
      const key = `${renewal.policy_number}-${renewal.client_name}`
      if (duplicateGroups.has(key)) {
        // Keep the first (newest) and mark others for deletion
        toDelete.push(renewal.id)
      } else {
        duplicateGroups.set(key, renewal)
      }
    })

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase.from("renewals").delete().in("id", toDelete)

      if (deleteError) throw deleteError
    }

    return {
      success: true,
      deletedCount: toDelete.length,
    }
  } catch (error) {
    console.error("Error removing duplicates:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function bulkDeleteRenewals(renewalIds: string[]) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("renewals").delete().in("id", renewalIds)

    if (error) throw error

    return {
      success: true,
      deletedCount: renewalIds.length,
    }
  } catch (error) {
    console.error("Error bulk deleting renewals:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function bulkUpdateRenewalStatus(renewalIds: string[], status: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("renewals")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", renewalIds)

    if (error) throw error

    return {
      success: true,
      updatedCount: renewalIds.length,
    }
  } catch (error) {
    console.error("Error bulk updating renewal status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function bulkArchiveRenewals(renewalIds: string[]) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("renewals")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .in("id", renewalIds)

    if (error) throw error

    return {
      success: true,
      archivedCount: renewalIds.length,
    }
  } catch (error) {
    console.error("Error bulk archiving renewals:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteDuplicateRenewals(renewalIds?: string[]) {
  // TODO: implement
  return { success: true, deletedCount: 0 }
}

export async function addRenewal(renewalData: any) {
  try {
    const supabase = await createClient()

    // Generate renewal number for tracking
    const renewalNumber = `RNW-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const { data, error} = await supabase
      .from("renewals")
      .insert([
        {
          ...renewalData,
          renewal_number: renewalNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
      renewalNumber: renewalNumber,
      message: `Renewal created successfully with ID: ${renewalNumber}`,
    }
  } catch (error) {
    console.error("Error adding renewal:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateRemarketingCompanies(renewalId: string, companies: any[]) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("renewals")
      .update({
        remarketing_companies: companies,
        updated_at: new Date().toISOString(),
      })
      .eq("id", renewalId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error updating remarketing companies:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getRenewalStatusHistory(renewalId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("renewal_status_history")
      .select("*")
      .eq("renewal_id", renewalId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error("Error fetching renewal status history:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}

export async function getRenewal(renewalId: string) {
  // This is an alias for the existing function
  return await getRenewalById(renewalId)
}

export async function archiveRenewal(renewalId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("renewals")
      .update({
        status: "archived",
        updated_at: new Date().toISOString(),
      })
      .eq("id", renewalId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error archiving renewal:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
