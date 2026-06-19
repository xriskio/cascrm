"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { BellRing } from "lucide-react"

type Notification = {
  id: string
  title: string
  message: string
  link?: string
  type: string
  reference_id?: string
  reference_type?: string
  is_read: boolean
  created_at: string
  user_id?: string
}

type SimpleNotification = {
  id: string
  message: string
  type: "info" | "error" | "success" | "warning"
}

type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  tableExists: boolean
  addNotification: (notification: Omit<Notification, "id" | "created_at" | "is_read">) => void
  removeNotification: (id: string) => void
  // Simple notification methods for compatibility
  push: (notification: SimpleNotification) => void
  remove: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createClient()

  // Check if notifications table exists
  useEffect(() => {
    checkTableExists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch notifications on mount if table exists
  useEffect(() => {
    if (tableExists) {
      fetchNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableExists])

  // Subscribe to new notifications if table exists
  useEffect(() => {
    if (!tableExists) return

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification

          // Check if this notification is for the current user
          supabase.auth.getUser().then(({ data }) => {
            if (data.user && newNotification.user_id === data.user.id) {
              // Add the new notification to the list
              setNotifications((prev) => [newNotification, ...prev])
              setUnreadCount((prev) => prev + 1)

              // Show a toast notification
              toast(
                <div className="flex items-center gap-2">
                  <BellRing className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">{newNotification.title}</div>
                    <div className="text-sm">{newNotification.message}</div>
                  </div>
                </div>,
                {
                  action: {
                    label: "View",
                    onClick: () => {
                      if (newNotification.link) {
                        window.location.href = newNotification.link
                      }
                    },
                  },
                },
              )
            }
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableExists])

  const checkTableExists = async () => {
    try {
      // Try to query the notifications table
      const { error } = await supabase.from("notifications").select("id").limit(1)

      // If we get a "relation does not exist" error, the table doesn't exist
      if (error && error.message.includes("does not exist")) {
        console.log("Notifications table does not exist yet. Please run the migration script.")
        setTableExists(false)
        return
      }

      setTableExists(true)
    } catch (error) {
      console.error("Error checking if notifications table exists:", error)
      setTableExists(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      if (!tableExists) return

      setIsLoading(true)
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) return

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        // If we get a "relation does not exist" error, the table doesn't exist
        if (error.message.includes("does not exist")) {
          console.log("Notifications table does not exist yet. Please run the migration script.")
          setTableExists(false)
          return
        }

        console.error("Error fetching notifications:", error)
        return
      }

      setNotifications((data as any) || [])
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0)
    } catch (error) {
      console.error("Error in fetchNotifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      if (!tableExists) return

      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)

      if (error) {
        console.error("Error marking notification as read:", error)
        return
      }

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error in markAsRead:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      if (!tableExists) return

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) return

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userData.user.id)
        .eq("is_read", false)

      if (error) {
        console.error("Error marking all notifications as read:", error)
        return
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error in markAllAsRead:", error)
    }
  }

  const refreshNotifications = async () => {
    if (tableExists) {
      await fetchNotifications()
    } else {
      await checkTableExists()
      if (tableExists) {
        await fetchNotifications()
      }
    }
  }

  const addNotification = (notification: Omit<Notification, "id" | "created_at" | "is_read">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
    setUnreadCount((prev) => prev + 1)
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  // Simple notification methods for compatibility
  const push = (notification: SimpleNotification) => {
    const fullNotification: Notification = {
      id: notification.id,
      title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
      message: notification.message,
      type: notification.type,
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setNotifications((prev) => [fullNotification, ...prev])
    setUnreadCount((prev) => prev + 1)
  }

  const remove = (id: string) => {
    removeNotification(id)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        tableExists,
        addNotification,
        removeNotification,
        push,
        remove,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
