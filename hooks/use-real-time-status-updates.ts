"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export function useRealTimeStatusUpdates() {
  const supabase = createClient()
  const subscriptionRef = useRef<any>(null)

  const subscribeToStatusUpdates = (callback: (newStatus: string) => void) => {
    // Clean up any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    // Subscribe to renewal status changes
    const subscription = supabase
      .channel("renewal-status-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "renewals",
          filter: "status=neq.status",
        },
        (payload) => {
          const newStatus = payload.new.status
          callback(newStatus)
        },
      )
      .subscribe()

    subscriptionRef.current = subscription

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe()
    }
  }

  // Clean up subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  return { subscribeToStatusUpdates }
}
