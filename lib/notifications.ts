import { createClient } from "./supabase"

const supabase = createClient({ useServiceRole: true })

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: string
  link?: string
  referenceId?: string
  referenceType?: string
}

export async function createNotification(data: NotificationData) {
  try {
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
        reference_id: data.referenceId,
        reference_type: data.referenceType,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating notification:", error)
      return { success: false, error: error.message }
    }

    return { success: true, notification }
  } catch (error) {
    console.error("Exception in createNotification:", error)
    return { success: false, error: "Failed to create notification" }
  }
}

export async function createRenewalStatusNotification(
  renewalId: string,
  oldStatus: string,
  newStatus: string,
  renewalData: any,
  changedBy: string,
) {
  try {
    // Get all users who should be notified (agents, managers, etc.)
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .in("role", ["agent", "manager", "admin"])

    if (usersError) {
      console.error("Error fetching users for notifications:", usersError)
      return { success: false, error: usersError.message }
    }

    const notifications = []

    for (const user of users || []) {
      const notification = await createNotification({
        userId: user.id,
        title: `Renewal Status Updated`,
        message: `Renewal for ${renewalData.client_name || renewalData.insured_name} changed from "${oldStatus}" to "${newStatus}" by ${changedBy}`,
        type: "renewal_status_change",
        link: `/renewals/${renewalId}`,
        referenceId: renewalId,
        referenceType: "renewal",
      })

      if (notification.success) {
        notifications.push(notification.notification)
      }
    }

    return { success: true, notifications }
  } catch (error) {
    console.error("Exception in createRenewalStatusNotification:", error)
    return { success: false, error: "Failed to create renewal status notifications" }
  }
}
