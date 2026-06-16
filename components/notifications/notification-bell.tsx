"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { useNotifications } from "./notification-context"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, tableExists } = useNotifications()
  const [open, setOpen] = useState(false)

  // Don't render if table doesn't exist
  if (!tableExists) {
    return null
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-gray-700">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <>
            <ScrollArea className="h-80">
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex flex-col gap-1 p-3 transition-colors hover:bg-muted/50",
                      !notification.is_read && "bg-blue-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.is_read && <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(notification.created_at)}</span>
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-500 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                        {notification.link && (
                          <Link
                            href={notification.link}
                            className="text-blue-500 hover:underline"
                            onClick={() => {
                              if (!notification.is_read) {
                                handleMarkAsRead(notification.id)
                              }
                              setOpen(false)
                            }}
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t p-2 text-center">
              <Link
                href="/notifications"
                className="text-sm text-blue-500 hover:underline"
                onClick={() => setOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
