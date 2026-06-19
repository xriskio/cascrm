"use server"

import { createClient } from "@/lib/supabase/server"
import { fetchPoliciesLastModified, fetchAllPoliciesInDateRange } from "@/lib/qqcatalyst/api"
import { revalidatePath } from "next/cache"

export async function syncPoliciesAction(
  params: {
    startDate?: string
    endDate?: string
    pageSize?: number
    pageNumber?: number
  } = {},
) {
  try {
    const supabase = await createClient()

    // Fetch policies from QQCatalyst
    const response = await fetchPoliciesLastModified(params)

    if (!response.isSuccess) {
      return {
        success: false,
        message: `QQCatalyst API error: ${response.errorMessage || "Unknown error"}`,
      }
    }

    let imported = 0
    let updated = 0
    let errors = 0

    for (const policy of response.data) {
      try {
        // Check if policy already exists
        const { data: existingPolicy } = await supabase
          .from("policies")
          .select("id")
          .eq("qq_policy_id", policy.PolicyId)
          .single()

        const policyData = {
          qq_policy_id: policy.PolicyId,
          policy_number: policy.PolicyNumber,
          customer_id: policy.CustomerId,
          customer_name: policy.CustomerName,
          agent_name: policy.AgentName,
          effective_date: policy.EffectiveDate,
          expiration_date: policy.ExpirationDate,
          status: policy.Status,
          total_premium: policy.TotalPremium,
          line_of_business: policy.LOB,
          lob_id: policy.LOBId,
          carrier_id: policy.CarrierId,
          carrier_name: policy.WritingCarrier,
          mga_id: policy.MGAId,
          mga_name: policy.MGA,
          description: policy.Description,
          created_on: policy.CreatedOn,
          date_last_modified: policy.DateLastModified,
          has_been_modified: policy.HasBeenModified,
          is_deleted: policy.IsDeleted,
          term: policy.Term,
          policy_type: policy.PolicyType,
          package_type: policy.PackageType,
          prior_policy_id: policy.PriorPolicyID,
          producer_ids: policy.ProducerIDs,
          lob_list: policy.LOBList,
          agency_fees: policy.PolicyAgencyFees,
          raw_policy_data: policy,
          updated_at: new Date().toISOString(),
        }

        if (existingPolicy) {
          // Update existing policy
          const { error } = await supabase.from("policies").update(policyData).eq("id", existingPolicy.id)

          if (error) throw error
          updated++
        } else {
          // Insert new policy
          const { error } = await supabase.from("policies").insert(policyData)

          if (error) throw error
          imported++
        }
      } catch (error) {
        console.error(`Error processing policy ${policy.PolicyId}:`, error)
        errors++
      }
    }

    revalidatePath("/admin/qqcatalyst")
    return {
      success: true,
      message: `Sync complete: ${imported} new, ${updated} updated, ${errors} errors`,
      stats: {
        imported,
        updated,
        errors,
        total: response.data.length,
        pageNumber: response.pageNumber,
        pagesTotal: response.pagesTotal,
        totalItems: response.totalItems,
      },
    }
  } catch (error) {
    console.error("Error syncing policies:", error)
    return {
      success: false,
      message: `Failed to sync policies: ${(error as any).message}`,
    }
  }
}

export async function syncAllPoliciesInDateRangeAction(
  params: {
    startDate?: string
    endDate?: string
    maxPages?: number
  } = {},
) {
  try {
    const supabase = await createClient()

    // Set default date range if not provided
    const startDate = params.startDate || "2024-01-01"
    const endDate = params.endDate || new Date().toISOString().split("T")[0]

    // Fetch all policies in date range
    const response = await fetchAllPoliciesInDateRange({
      startDate,
      endDate,
      maxPages: params.maxPages || 5, // Limit to 5 pages by default
    })

    let imported = 0
    let updated = 0
    let errors = 0

    for (const policy of response.policies) {
      try {
        // Check if policy already exists
        const { data: existingPolicy } = await supabase
          .from("policies")
          .select("id")
          .eq("qq_policy_id", policy.PolicyId)
          .single()

        const policyData = {
          qq_policy_id: policy.PolicyId,
          policy_number: policy.PolicyNumber,
          customer_id: policy.CustomerId,
          customer_name: policy.CustomerName,
          agent_name: policy.AgentName,
          effective_date: policy.EffectiveDate,
          expiration_date: policy.ExpirationDate,
          status: policy.Status,
          total_premium: policy.TotalPremium,
          line_of_business: policy.LOB,
          lob_id: policy.LOBId,
          carrier_id: policy.CarrierId,
          carrier_name: policy.WritingCarrier,
          mga_id: policy.MGAId,
          mga_name: policy.MGA,
          description: policy.Description,
          created_on: policy.CreatedOn,
          date_last_modified: policy.DateLastModified,
          has_been_modified: policy.HasBeenModified,
          is_deleted: policy.IsDeleted,
          term: policy.Term,
          policy_type: policy.PolicyType,
          package_type: policy.PackageType,
          prior_policy_id: policy.PriorPolicyID,
          producer_ids: policy.ProducerIDs,
          lob_list: policy.LOBList,
          agency_fees: policy.PolicyAgencyFees,
          raw_policy_data: policy,
          updated_at: new Date().toISOString(),
        }

        if (existingPolicy) {
          // Update existing policy
          const { error } = await supabase.from("policies").update(policyData).eq("id", existingPolicy.id)

          if (error) throw error
          updated++
        } else {
          // Insert new policy
          const { error } = await supabase.from("policies").insert(policyData)

          if (error) throw error
          imported++
        }
      } catch (error) {
        console.error(`Error processing policy ${policy.PolicyId}:`, error)
        errors++
      }
    }

    revalidatePath("/admin/qqcatalyst")
    return {
      success: true,
      message: `Bulk sync complete: ${imported} new, ${updated} updated, ${errors} errors from ${response.totalFetched} policies`,
      stats: {
        imported,
        updated,
        errors,
        totalFetched: response.totalFetched,
        pagesFetched: response.pagesFetched,
        dateRange: `${startDate} to ${endDate}`,
      },
    }
  } catch (error) {
    console.error("Error syncing all policies in date range:", error)
    return {
      success: false,
      message: `Failed to sync policies: ${(error as any).message}`,
    }
  }
}
