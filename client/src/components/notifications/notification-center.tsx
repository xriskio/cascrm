
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  link?: string
  is_read: boolean
  created_at: string
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      // This would be replaced with actual API call
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "Renewal Status Updated",
          message: "Renewal for ABC Company changed from 'pending' to 'quoted'",
          type: "renewal_status_change",
          link: "/renewals/123",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "New Lead Assigned",
          message: "New lead from website contact form has been assigned to you",
          type: "lead_assignment",
          link: "/leads/456",
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ]

      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter((n) => !n.is_read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // This would be replaced with actual API call
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))

      toast({
        title: "Notification marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      // This would be replaced with actual API call
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)

      toast({
        title: "All notifications marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "renewal_status_change":
        return "🔄"
      case "lead_assignment":
        return "🎯"
      case "task_assignment":
        return "📋"
      case "service_request":
        return "🔧"
      default:
        return "📢"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "renewal_status_change":
        return "bg-blue-100 text-blue-800"
      case "lead_assignment":
        return "bg-green-100 text-green-800"
      case "task_assignment":
        return "bg-purple-100 text-purple-800"
      case "service_request":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) {
        return "Just now"
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`
      } else {
        return date.toLocaleDateString()
      }
    } catch {
      return "Unknown date"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading notifications...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.is_read ? "bg-gray-50 border-gray-200" : "bg-white border-orange-200 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <Badge className={getNotificationColor(notification.type)}>
                        {notification.type.replace("_", " ")}
                      </Badge>
                      {!notification.is_read && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
                    </div>

                    <h4 className="font-medium text-gray-900 mb-1">{notification.title || "No title"}</h4>

                    <p className="text-sm text-gray-600 mb-2">{notification.message || "No message"}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>

                      <div className="flex gap-2">
                        {notification.link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => window.open(notification.link, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}

                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
