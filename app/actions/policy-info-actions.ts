"use server"

import { createClient } from "@/lib/supabase/server"
import { fetchPolicyInfo, fetchEnhancedPolicies } from "@/lib/qqcatalyst/api"
import { revalidatePath } from "next/cache"

export async function importPolicyInfoAction(policyId: string) {
  try {
    const supabase = await createClient()

    // Fetch detailed policy info from QQCatalyst
    const policyInfo = await fetchPolicyInfo(policyId)

    if (!policyInfo) {
      return { success: false, message: "Policy not found in QQCatalyst" }
    }

    // Check if policy already exists in our database
    const { data: existingPolicy } = await supabase
      .from("policies")
      .select("id")
      .eq("qq_policy_id", policyInfo.PolicyID)
      .single()

    const policyData = {
      qq_policy_id: policyInfo.PolicyID,
      policy_number: policyInfo.PolicyNo,
      customer_id: policyInfo.CustomerID,
      agent_id: policyInfo.AgentID,
      agent_name: policyInfo.Agent,
      csr_id: policyInfo.CsrID,
      csr_name: policyInfo.CSR,
      effective_date: policyInfo.EffectiveDate,
      expiration_date: policyInfo.ExpirationDate,
      policy_class: policyInfo.PolicyClass,
      carrier_id: policyInfo.CarrierID,
      carrier_name: policyInfo.Carrier,
      line_of_business: policyInfo.LOB,
      lob_id: policyInfo.LOBID,
      binder_date: policyInfo.BinderDate,
      binder_number: policyInfo.BinderNumber,
      business_type: policyInfo.BusinessType,
      premium_sent: policyInfo.PremiumSent,
      is_pending: policyInfo.isPending,
      status: policyInfo.Status,
      period: policyInfo.Period,
      policy_source: policyInfo.PolicySource,
      policy_source_details: policyInfo.PolicySourceDetails,
      description: policyInfo.Description,
      parent_carrier: policyInfo.ParentCarrier,
      non_renewal: policyInfo.NonRenewal,
      reinstated: policyInfo.Reinstated,
      subline_name: policyInfo.SublineName,
      carrier_naic: policyInfo.CarrierNAIC,
      created_by: policyInfo.CreatedBy,
      raw_data: policyInfo,
      updated_at: new Date().toISOString(),
    }

    if (existingPolicy) {
      // Update existing policy
      const { error } = await supabase.from("policies").update(policyData).eq("id", existingPolicy.id)

      if (error) throw error

      revalidatePath("/admin/qqcatalyst")
      return {
        success: true,
        message: `Policy ${policyInfo.PolicyNo} updated successfully`,
        action: "updated",
      }
    } else {
      // Insert new policy
      const { error } = await supabase.from("policies").insert(policyData)

      if (error) throw error

      revalidatePath("/admin/qqcatalyst")
      return {
        success: true,
        message: `Policy ${policyInfo.PolicyNo} imported successfully`,
        action: "created",
      }
    }
  } catch (error) {
    console.error("Error importing policy info:", error)
    return {
      success: false,
      message: `Failed to import policy: ${(error as any).message}`,
    }
  }
}

export async function importEnhancedPoliciesAction() {
  try {
    const supabase = await createClient()

    // Fetch enhanced policies from QQCatalyst
    const enhancedPolicies = await fetchEnhancedPolicies({ pageSize: 10 })

    if (!enhancedPolicies.items || enhancedPolicies.items.length === 0) {
      return { success: false, message: "No policies found in QQCatalyst" }
    }

    let imported = 0
    let updated = 0
    let errors = 0

    for (const policy of enhancedPolicies.items) {
      try {
        const result = await importPolicyInfoAction(policy.PolicyID || policy.ID)
        if (result.success) {
          if (result.action === "created") imported++
          else if (result.action === "updated") updated++
        } else {
          errors++
        }
      } catch (error) {
        console.error(`Error importing policy ${policy.PolicyID}:`, error)
        errors++
      }
    }

    revalidatePath("/admin/qqcatalyst")
    return {
      success: true,
      message: `Import complete: ${imported} new, ${updated} updated, ${errors} errors`,
      stats: { imported, updated, errors, total: enhancedPolicies.items.length },
    }
  } catch (error) {
    console.error("Error importing enhanced policies:", error)
    return {
      success: false,
      message: `Failed to import policies: ${(error as any).message}`,
    }
  }
}
