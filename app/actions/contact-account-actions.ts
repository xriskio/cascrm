"use server"

import { createClient } from "@/lib/supabase/server"
import { fetchContactAccountInfo } from "@/lib/qqcatalyst/api"
import type { Database } from "@/types/supabase"
import type { ContactAccountInfoDTO } from "@/types/qqcatalyst-account"

/**
 * Fetch and cache contact account information
 */
export async function getContactAccountInfo(contactId: string) {
  try {
    const supabase = await createClient()

    // Check if we have cached account info
    const { data: cachedInfo } = await supabase
      .from("qqcatalyst_contact_accounts")
      .select("*")
      .eq("customer_id", contactId)
      .single()

    // If cached and recent (less than 1 hour old), return cached data
    if (cachedInfo && new Date(cachedInfo.last_synced) > new Date(Date.now() - 60 * 60 * 1000)) {
      return {
        success: true,
        data: {
          CustomerID: cachedInfo.customer_id,
          CustomerNo: cachedInfo.customer_no,
          AgentID: cachedInfo.agent_id,
          Agent: cachedInfo.agent_name,
          CsrID: cachedInfo.csr_id,
          CSR: cachedInfo.csr_name,
          CustomerPriorityID: cachedInfo.customer_priority_id,
          CustomerPriority: cachedInfo.customer_priority,
          CustomerSince: cachedInfo.customer_since,
          UserID: cachedInfo.user_id,
          UserPassword: "", // Don't return password
          Type: cachedInfo.customer_type,
          OfficeID: cachedInfo.office_id,
          CPAccess: cachedInfo.cp_access,
          Name: cachedInfo.customer_name,
          CustomerSourceID: cachedInfo.customer_source_id,
          CustomerSource: cachedInfo.customer_source,
          SourceDetail: cachedInfo.source_detail,
          CreatedByID: cachedInfo.created_by_id,
          CreatedByName: cachedInfo.created_by_name,
          CustomerSinceString: cachedInfo.customer_since_string,
        } as ContactAccountInfoDTO,
        cached: true,
      }
    }

    // Fetch fresh data from QQCatalyst
    const accountInfo = await fetchContactAccountInfo(contactId)

    if (!accountInfo) {
      return {
        success: false,
        error: "No account information found",
      }
    }

    // Cache the account information
    await supabase.from("qqcatalyst_contact_accounts").upsert({
      customer_id: accountInfo.CustomerID,
      customer_no: accountInfo.CustomerNo,
      agent_id: accountInfo.AgentID,
      agent_name: accountInfo.Agent,
      csr_id: accountInfo.CsrID,
      csr_name: accountInfo.CSR,
      customer_priority_id: accountInfo.CustomerPriorityID,
      customer_priority: accountInfo.CustomerPriority,
      customer_since: accountInfo.CustomerSince,
      user_id: accountInfo.UserID,
      customer_type: accountInfo.Type,
      office_id: accountInfo.OfficeID,
      cp_access: accountInfo.CPAccess,
      customer_name: accountInfo.Name,
      customer_source_id: accountInfo.CustomerSourceID,
      customer_source: accountInfo.CustomerSource,
      source_detail: accountInfo.SourceDetail,
      created_by_id: accountInfo.CreatedByID,
      created_by_name: accountInfo.CreatedByName,
      customer_since_string: accountInfo.CustomerSinceString,
      last_synced: new Date().toISOString(),
    })

    return {
      success: true,
      data: accountInfo,
      cached: false,
    }
  } catch (error) {
    console.error("Error in getContactAccountInfo:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Refresh contact account information from QQCatalyst
 */
export async function refreshContactAccountInfo(contactId: string) {
  try {
    const supabase = await createClient()

    // Fetch fresh data from QQCatalyst
    const accountInfo = await fetchContactAccountInfo(contactId)

    if (!accountInfo) {
      return {
        success: false,
        error: "No account information found",
      }
    }

    // Update cached information
    await supabase.from("qqcatalyst_contact_accounts").upsert({
      customer_id: accountInfo.CustomerID,
      customer_no: accountInfo.CustomerNo,
      agent_id: accountInfo.AgentID,
      agent_name: accountInfo.Agent,
      csr_id: accountInfo.CsrID,
      csr_name: accountInfo.CSR,
      customer_priority_id: accountInfo.CustomerPriorityID,
      customer_priority: accountInfo.CustomerPriority,
      customer_since: accountInfo.CustomerSince,
      user_id: accountInfo.UserID,
      customer_type: accountInfo.Type,
      office_id: accountInfo.OfficeID,
      cp_access: accountInfo.CPAccess,
      customer_name: accountInfo.Name,
      customer_source_id: accountInfo.CustomerSourceID,
      customer_source: accountInfo.CustomerSource,
      source_detail: accountInfo.SourceDetail,
      created_by_id: accountInfo.CreatedByID,
      created_by_name: accountInfo.CreatedByName,
      customer_since_string: accountInfo.CustomerSinceString,
      last_synced: new Date().toISOString(),
    })

    return {
      success: true,
      data: accountInfo,
    }
  } catch (error) {
    console.error("Error in refreshContactAccountInfo:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
