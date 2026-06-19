import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

// Interface for audit log data
export interface AuditLogData {
  action: "create" | "update" | "delete" | "view"
  tableName: string
  recordId: string | number
  oldData?: any
  newData?: any
  userId?: string
}

// Create an audit log entry
export async function createAuditLog(data: AuditLogData) {
  try {
    const supabase = await (createClient as any)({ useServiceRole: true })
    const headersList = headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    // Get user name if userId is provided
    let userName = "Unknown User"
    if (data.userId) {
      const { data: userData } = await supabase
        .from("users")
        .select("email, first_name, last_name")
        .eq("id", data.userId)
        .maybeSingle()

      if (userData) {
        userName =
          userData.first_name && userData.last_name ? `${userData.first_name} ${userData.last_name}` : userData.email
      }
    }

    // Create the audit log
    const { error } = await supabase.from("audit_logs").insert({
      user_id: data.userId,
      user_name: userName,
      action: data.action,
      table_name: data.tableName,
      record_id: String(data.recordId),
      old_data: data.oldData || null,
      new_data: data.newData || null,
      ip_address: ip,
    })

    if (error) {
      console.error("Error creating audit log:", error)
    }
  } catch (error) {
    console.error("Error in createAuditLog:", error)
  }
}

// Add audit fields to a record
export async function addAuditFields(
  data: Record<string, any>,
  userId?: string,
  isCreate = false,
): Promise<Record<string, any>> {
  const now = new Date().toISOString()
  const result = { ...data }

  if (isCreate) {
    result.created_at = now
    result.created_by = userId
  }

  result.updated_at = now
  result.updated_by = userId

  return result
}

// Get user information for audit display
export async function getUserInfo(userId: string) {
  try {
    const supabase = await (createClient as any)({ useServiceRole: true })
    const { data, error } = await supabase
      .from("users")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .maybeSingle()

    if (error || !data) {
      return { name: "Unknown User", email: null }
    }

    return {
      name: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.email,
      email: data.email,
    }
  } catch (error) {
    console.error("Error getting user info:", error)
    return { name: "Unknown User", email: null }
  }
}
