"use client"

import { useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

export function useNotification() {
  const { toast } = useToast()

  const showNotification = useCallback(
    (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
      const variants = {
        info: undefined,
        success: "default",
        warning: "destructive",
        error: "destructive",
      }

      toast({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        description: message,
        variant: variants[type],
      })
    },
    [toast],
  )

  return { showNotification }
}
