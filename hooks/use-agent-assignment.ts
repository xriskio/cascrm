"use client"
import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { extractErrorMessage } from "@/lib/error-utils"

export function useAgentAssignment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const assignAgent = useCallback(
    async (renewalId: string, agentId?: string) => {
      try {
        setLoading(true)
        setError(null)

        // If no agentId provided, show agent selection modal
        if (!agentId) {
          // For now, just return a mock success
          return { success: true, message: "Agent would be assigned here" }
        }

        // Update renewal with assigned agent
        const { error: updateError } = await supabase
          .from("renewals")
          .update({
            assigned_agent_id: agentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", renewalId)

        if (updateError) throw updateError

        // Create notification for agent
        const { error: notificationError } = await supabase.from("notifications").insert({
          user_id: agentId,
          title: "New Renewal Assignment",
          message: `You have been assigned a new renewal to process`,
          type: "renewal_assignment",
          related_id: renewalId,
          created_at: new Date().toISOString(),
        })

        if (notificationError) {
          console.warn("Failed to create notification:", notificationError)
        }

        return { success: true, message: "Agent assigned successfully" }
      } catch (err) {
        const errorMessage = extractErrorMessage(err)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  const unassignAgent = useCallback(
    async (renewalId: string) => {
      try {
        setLoading(true)
        setError(null)

        const { error } = await supabase
          .from("renewals")
          .update({
            assigned_agent_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", renewalId)

        if (error) throw error

        return { success: true }
      } catch (err) {
        const errorMessage = extractErrorMessage(err)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  const getAgentAssignments = useCallback(
    async (agentId: string) => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("renewals")
          .select("*")
          .eq("assigned_agent_id", agentId)
          .order("expiration_date", { ascending: true })

        if (error) throw error

        return { success: true, data: data || [] }
      } catch (err) {
        const errorMessage = extractErrorMessage(err)
        setError(errorMessage)
        return { success: false, error: errorMessage, data: [] }
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  return {
    assignAgent,
    unassignAgent,
    getAgentAssignments,
    loading,
    error,
  }
}
