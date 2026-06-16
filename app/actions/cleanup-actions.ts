"use server"

import { createClient } from "@/lib/supabase"
import { handleAsyncError, createSuccessResponse } from "@/lib/error-utils"
import { revalidatePath } from "next/cache"

const adminSupabase = createClient({ useServiceRole: true })

/**
 * Delete all existing clients from the database
 * This will clear all client data to prepare for QQCatalyst import
 */
export async function deleteAllClients() {
  try {
    console.log("Starting cleanup of all existing clients...")

    // First, get count of existing clients
    const { count: clientCount, error: countError } = await adminSupabase
      .from("clients")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error counting clients:", countError)
      throw new Error(`Failed to count clients: ${countError.message}`)
    }

    console.log(`Found ${clientCount} clients to delete`)

    if (clientCount === 0) {
      return createSuccessResponse({
        deleted: 0,
        message: "No clients found to delete",
      })
    }

    // Delete all clients
    const { error: deleteError } = await adminSupabase
      .from("clients")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all (using a condition that matches all)

    if (deleteError) {
      console.error("Error deleting clients:", deleteError)
      throw new Error(`Failed to delete clients: ${deleteError.message}`)
    }

    console.log(`Successfully deleted ${clientCount} clients`)

    // Revalidate the clients page
    revalidatePath("/clients")
    revalidatePath("/admin")

    return createSuccessResponse({
      deleted: clientCount,
      message: `Successfully deleted ${clientCount} clients. Database is now ready for QQCatalyst import.`,
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return handleAsyncError(error)
  }
}

/**
 * Delete all related data (policies, renewals, etc.) associated with clients
 */
export async function deleteAllClientRelatedData() {
  try {
    console.log("Starting cleanup of all client-related data...")

    const results = {
      clients: 0,
      policies: 0,
      renewals: 0,
      quotes: 0,
      tasks: 0,
      total: 0,
    }

    // Delete in order to respect foreign key constraints

    // 1. Delete tasks
    const { count: taskCount, error: taskError } = await adminSupabase
      .from("tasks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select("*", { count: "exact", head: true })

    if (!taskError) results.tasks = taskCount || 0

    // 2. Delete quotes
    const { count: quoteCount, error: quoteError } = await adminSupabase
      .from("quotes")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select("*", { count: "exact", head: true })

    if (!quoteError) results.quotes = quoteCount || 0

    // 3. Delete renewals
    const { count: renewalCount, error: renewalError } = await adminSupabase
      .from("renewals")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select("*", { count: "exact", head: true })

    if (!renewalError) results.renewals = renewalCount || 0

    // 4. Delete policies
    const { count: policyCount, error: policyError } = await adminSupabase
      .from("policies")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select("*", { count: "exact", head: true })

    if (!policyError) results.policies = policyCount || 0

    // 5. Finally delete clients
    const { count: clientCount, error: clientError } = await adminSupabase
      .from("clients")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select("*", { count: "exact", head: true })

    if (!clientError) results.clients = clientCount || 0

    results.total = results.clients + results.policies + results.renewals + results.quotes + results.tasks

    console.log("Cleanup results:", results)

    // Revalidate all related pages
    revalidatePath("/clients")
    revalidatePath("/renewals")
    revalidatePath("/quotes")
    revalidatePath("/tasks")
    revalidatePath("/admin")

    return createSuccessResponse({
      ...results,
      message: `Successfully deleted ${results.total} records total. Database is now clean for QQCatalyst import.`,
    })
  } catch (error) {
    console.error("Complete cleanup error:", error)
    return handleAsyncError(error)
  }
}

/**
 * Get count of existing data before cleanup
 */
export async function getDataCounts() {
  try {
    const counts = {
      clients: 0,
      policies: 0,
      renewals: 0,
      quotes: 0,
      tasks: 0,
    }

    // Get client count
    const { count: clientCount } = await adminSupabase.from("clients").select("*", { count: "exact", head: true })
    counts.clients = clientCount || 0

    // Get policy count
    const { count: policyCount } = await adminSupabase.from("policies").select("*", { count: "exact", head: true })
    counts.policies = policyCount || 0

    // Get renewal count
    const { count: renewalCount } = await adminSupabase.from("renewals").select("*", { count: "exact", head: true })
    counts.renewals = renewalCount || 0

    // Get quote count
    const { count: quoteCount } = await adminSupabase.from("quotes").select("*", { count: "exact", head: true })
    counts.quotes = quoteCount || 0

    // Get task count
    const { count: taskCount } = await adminSupabase.from("tasks").select("*", { count: "exact", head: true })
    counts.tasks = taskCount || 0

    return createSuccessResponse(counts)
  } catch (error) {
    console.error("Error getting data counts:", error)
    return handleAsyncError(error)
  }
}
