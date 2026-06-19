"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { deleteDuplicateRenewals } from "@/app/actions/renewal-actions"

export function useDuplicateDetection() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const detectDuplicates = async () => {
    try {
      setLoading(true)

      // Get all renewals
      const { data: renewals, error } = await supabase
        .from("renewals")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Find duplicates based on policy number and client name
      const seen = new Map()
      const duplicates = []

      for (const renewal of renewals || []) {
        const key = `${renewal.policy_number}-${renewal.client_name || (renewal as any).insured_name}`.toLowerCase()

        if (seen.has(key)) {
          duplicates.push({
            original: seen.get(key),
            duplicate: renewal,
          })
        } else {
          seen.set(key, renewal)
        }
      }

      return { success: true, duplicates }
    } catch (error) {
      console.error("Error detecting duplicates:", error)
      return { success: false, error: (error as any).message || "Failed to detect duplicates", duplicates: [] }
    } finally {
      setLoading(false)
    }
  }

  const removeDuplicates = async (duplicateIds: string[]) => {
    try {
      setLoading(true)

      const result = await deleteDuplicateRenewals()
      return {
        success: result.success,
        removed: duplicateIds.length,
        error: (result as any).error,
      }
    } catch (error) {
      console.error("Error removing duplicates:", error)
      return { success: false, error: (error as any).message || "Failed to remove duplicates", removed: 0 }
    } finally {
      setLoading(false)
    }
  }

  return { detectDuplicates, removeDuplicates, loading }
}
