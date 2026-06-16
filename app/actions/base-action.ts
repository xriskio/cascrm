"use server"

import { createClient } from "@/lib/supabase/server"
import { type Permission, hasPermission, type UserRole } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { createAuditLog, addAuditFields } from "@/lib/audit"

// Base class for all server actions that need permission checks
export class BaseAction {
  protected async checkPermission(permission: Permission): Promise<UserRole> {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    // Get user role from the users table
    const { data: userData, error } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (error) {
      console.error("Error fetching user role:", error)
      throw new Error("Unauthorized")
    }

    const userRole = userData.role as UserRole

    // Check if the user has the required permission
    if (!hasPermission(userRole, permission)) {
      throw new Error("Insufficient permissions")
    }

    return userRole
  }

  protected async createRecord<T extends Record<string, any>>(
    tableName: string,
    data: T,
    options: {
      userId?: string
      skipAudit?: boolean
    } = {},
  ) {
    const supabase = createClient({ useServiceRole: true })
    const { userId, skipAudit = false } = options

    try {
      // Add audit fields
      const recordWithAudit = await addAuditFields(data, userId, true)

      // Insert the record
      const { data: newRecord, error } = await supabase.from(tableName).insert(recordWithAudit).select().single()

      if (error) {
        console.error(`Error creating ${tableName}:`, error)
        return { success: false, error }
      }

      // Create audit log
      if (!skipAudit) {
        await createAuditLog({
          action: "create",
          tableName,
          recordId: newRecord.id,
          newData: newRecord,
          userId,
        })
      }

      return { success: true, data: newRecord }
    } catch (error) {
      console.error(`Error in createRecord for ${tableName}:`, error)
      return { success: false, error }
    }
  }

  protected async updateRecord<T extends Record<string, any>>(
    tableName: string,
    id: string,
    data: Partial<T>,
    options: {
      userId?: string
      skipAudit?: boolean
    } = {},
  ) {
    const supabase = createClient({ useServiceRole: true })
    const { userId, skipAudit = false } = options

    try {
      // Get the current record for audit
      const { data: currentRecord, error: fetchError } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single()

      if (fetchError) {
        console.error(`Error fetching ${tableName} for update:`, fetchError)
        return { success: false, error: fetchError }
      }

      // Add audit fields
      const recordWithAudit = await addAuditFields(data, userId)

      // Update the record
      const { data: updatedRecord, error } = await supabase
        .from(tableName)
        .update(recordWithAudit)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating ${tableName}:`, error)
        return { success: false, error }
      }

      // Create audit log
      if (!skipAudit) {
        await createAuditLog({
          action: "update",
          tableName,
          recordId: id,
          oldData: currentRecord,
          newData: updatedRecord,
          userId,
        })
      }

      return { success: true, data: updatedRecord }
    } catch (error) {
      console.error(`Error in updateRecord for ${tableName}:`, error)
      return { success: false, error }
    }
  }

  protected async deleteRecord(
    tableName: string,
    id: string,
    options: {
      userId?: string
      skipAudit?: boolean
    } = {},
  ) {
    const supabase = createClient({ useServiceRole: true })
    const { userId, skipAudit = false } = options

    try {
      // Get the current record for audit
      const { data: currentRecord, error: fetchError } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single()

      if (fetchError) {
        console.error(`Error fetching ${tableName} for delete:`, fetchError)
        return { success: false, error: fetchError }
      }

      // Delete the record
      const { error } = await supabase.from(tableName).delete().eq("id", id)

      if (error) {
        console.error(`Error deleting ${tableName}:`, error)
        return { success: false, error }
      }

      // Create audit log
      if (!skipAudit) {
        await createAuditLog({
          action: "delete",
          tableName,
          recordId: id,
          oldData: currentRecord,
          userId,
        })
      }

      return { success: true }
    } catch (error) {
      console.error(`Error in deleteRecord for ${tableName}:`, error)
      return { success: false, error }
    }
  }
}
