import { type NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { renewalId, type } = await request.json()
    const supabase = await createClient()

    // Get renewal details
    const { data: renewal, error } = await supabase.from("renewals").select("*").eq("id", renewalId).single()

    if (error || !renewal) {
      return NextResponse.json({ success: false, error: "Renewal not found" }, { status: 404 })
    }

    // Send notification based on type
    let subject = ""
    let template = ""

    switch (type) {
      case "expiring":
        subject = "Policy Renewal Required"
        template = "renewal_expiring"
        break
      case "quote_ready":
        subject = "Your Renewal Quote is Ready"
        template = "quote_ready"
        break
      case "bound":
        subject = "Policy Successfully Renewed"
        template = "renewal_bound"
        break
      case "declined":
        subject = "Renewal Application Update"
        template = "renewal_declined"
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid notification type" }, { status: 400 })
    }

    // Create an in-app notification
    try {
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: renewal.assigned_agent_id || renewal.created_by,
        title: subject,
        message: `Renewal ${renewal.tracking_number || renewalId} requires attention`,
        type: "renewal_notification",
        related_id: renewalId,
        created_at: new Date().toISOString(),
      })

      if (notificationError) {
        console.error("Failed to create notification:", notificationError)
      }
    } catch (notifError) {
      console.log("Notifications table not available:", notifError)
    }

    // Track email sending
    try {
      await supabaseAdmin.from("email_tracking").insert({
        renewal_id: renewalId,
        template_name: template,
        recipient_email: renewal.client_email || "unknown@example.com",
        status: "sent",
        metadata: {
          subject,
          type,
          client_name: renewal.client_name || renewal.insured_name,
          policy_number: renewal.policy_number,
        },
        sent_at: new Date().toISOString(),
      })
    } catch (trackingError) {
      console.log("Email tracking table not available:", trackingError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 })
  }
}
