"use server"

import { createClient } from "@/lib/supabase"
import { handleAsyncError } from "@/lib/error-utils"

const adminSupabase = createClient({ useServiceRole: true })

export async function getRenewalStats() {
  try {
    const { data: allRenewals, error } = await adminSupabase.from("renewals").select("expiration_date")

    if (error) throw error

    const total = allRenewals?.length || 0
    const badDates =
      allRenewals?.filter(
        (r) =>
          !r.expiration_date ||
          r.expiration_date === "1969-12-31" ||
          new Date(r.expiration_date).getFullYear() === 1969,
      ).length || 0
    const goodDates = total - badDates

    return {
      success: true,
      stats: { total, badDates, goodDates },
    }
  } catch (error) {
    return handleAsyncError(error)
  }
}

export async function deleteAllRenewals() {
  try {
    const { error } = await adminSupabase.from("renewals").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    if (error) throw error
    return { success: true, message: "All renewals deleted successfully" }
  } catch (error) {
    return handleAsyncError(error)
  }
}

export async function deleteBadDateRenewals() {
  try {
    const { error } = await adminSupabase
      .from("renewals")
      .delete()
      .or("expiration_date.is.null,expiration_date.eq.1969-12-31")
    if (error) throw error
    return { success: true, message: "Bad date renewals deleted successfully" }
  } catch (error) {
    return handleAsyncError(error)
  }
}

export async function deleteDuplicateRenewals() {
  try {
    // This is a simplified approach - in production you'd want more sophisticated duplicate detection
    const { error } = await adminSupabase.rpc("delete_duplicate_renewals")
    if (error) throw error
    return { success: true, message: "Duplicate renewals deleted successfully" }
  } catch (error) {
    return handleAsyncError(error)
  }
}
