"use server"

import { createClient } from "@/lib/supabase/server"
import { fetchPolicySummary } from "@/lib/qqcatalyst/api"
import { revalidatePath } from "next/cache"

export async function importPolicySummaryAction(policyId: string) {
  try {
    const supabase = await createClient()

    // Fetch policy summary from QQCatalyst
    const policySummary = await fetchPolicySummary(policyId)

    if (!policySummary) {
      return { success: false, message: "Policy summary not found in QQCatalyst" }
    }

    // Check if policy already exists in our database
    const { data: existingPolicy } = await supabase
      .from("policies")
      .select("id")
      .eq("qq_policy_id", policySummary.PolicyID)
      .single()

    const policyData = {
      qq_policy_id: policySummary.PolicyID,
      policy_number: policySummary.PolicyNo,
      customer_id: policySummary.CustomerID,
      customer_name: policySummary.CustomerName,
      agent_id: policySummary.AgentID,
      agent_name: policySummary.AgentName,
      csr_id: policySummary.CSRID,
      csr_name: policySummary.CSRName,
      effective_date: policySummary.EffectiveDate,
      expiration_date: policySummary.ExpirationDate,
      status: policySummary.Status,
      policy_status_caption: policySummary.PolicyStatusCaption,
      total_premium: policySummary.TotalPremium,
      total_premium_string: policySummary.TotalPremiumString,
      premium_base: policySummary.PremiumBase,
      premium_down_pay_amount: policySummary.PremiumDownPayAmount,
      line_of_business: policySummary.LOB,
      lob_id: policySummary.LOBID,
      carrier_id: policySummary.CarrierID,
      carrier_name: policySummary.WritingCarrier,
      carrier_naic: policySummary.WritingCarrierNAIC,
      carrier_display_name: policySummary.WritingCarrierDisplayName,
      mga_id: policySummary.MGAID,
      mga_name: policySummary.MGA,
      description: policySummary.Description,
      business_type: policySummary.BusinessType,
      non_renewal: policySummary.NonRenewal,
      prior_policy_id: policySummary.PriorPolicyID,
      prior_policy_no: policySummary.PriorPolicyNo,
      producer_ids: policySummary.ProducerIds,
      agency_fees: policySummary.PolicyAgencyFees,
      raw_summary_data: policySummary,
      updated_at: new Date().toISOString(),
    }

    if (existingPolicy) {
      // Update existing policy
      const { error } = await supabase.from("policies").update(policyData).eq("id", existingPolicy.id)

      if (error) throw error

      revalidatePath("/admin/qqcatalyst")
      return {
        success: true,
        message: `Policy ${policySummary.PolicyNo} summary updated successfully`,
        action: "updated",
        data: policySummary,
      }
    } else {
      // Insert new policy
      const { error } = await supabase.from("policies").insert(policyData)

      if (error) throw error

      revalidatePath("/admin/qqcatalyst")
      return {
        success: true,
        message: `Policy ${policySummary.PolicyNo} summary imported successfully`,
        action: "created",
        data: policySummary,
      }
    }
  } catch (error) {
    console.error("Error importing policy summary:", error)
    return {
      success: false,
      message: `Failed to import policy summary: ${error.message}`,
    }
  }
}

export async function importMultiplePolicySummariesAction(policyIds: string[]) {
  try {
    if (!policyIds || policyIds.length === 0) {
      return { success: false, message: "No policy IDs provided" }
    }

    let imported = 0
    let updated = 0
    let errors = 0
    const results = []

    for (const policyId of policyIds) {
      try {
        const result = await importPolicySummaryAction(policyId)
        if (result.success) {
          if (result.action === "created") imported++
          else if (result.action === "updated") updated++
          results.push(result.data)
        } else {
          errors++
        }
      } catch (error) {
        console.error(`Error importing policy summary ${policyId}:`, error)
        errors++
      }
    }

    revalidatePath("/admin/qqcatalyst")
    return {
      success: true,
      message: `Import complete: ${imported} new, ${updated} updated, ${errors} errors`,
      stats: { imported, updated, errors, total: policyIds.length },
      data: results,
    }
  } catch (error) {
    console.error("Error importing multiple policy summaries:", error)
    return {
      success: false,
      message: `Failed to import policy summaries: ${error.message}`,
    }
  }
}
