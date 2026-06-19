"use client"

import { useState } from "react"

export function useEmailNotifications() {
  const [sending, setSending] = useState(false)

  const sendEmailNotification = async (options: {
    to: string
    subject: string
    body: string
    renewalId?: string
  }) => {
    try {
      setSending(true)

      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      return { success: true, message: "Email sent successfully" }
    } catch (error) {
      console.error("Error sending email:", error)
      return { success: false, error: (error as any).message || "Failed to send email" }
    } finally {
      setSending(false)
    }
  }

  return { sendEmailNotification, sending }
}
