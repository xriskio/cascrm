import { supabase } from "@/lib/supabase/client"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { MarkNotificationsAsReadButton } from "@/components/notifications/mark-read-button"

export default async function NotificationsPage() {
  const supabase = supabase

  // Get current user
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return <div>Please log in to view notifications</div>
  }

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })

  // Get unread notifications
  const unreadNotifications = notifications?.filter((n) => !n.is_read) || []

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">View and manage your notifications</p>
        </div>
        {unreadNotifications.length > 0 && <MarkNotificationsAsReadButton />}
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            All
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{notifications?.length || 0}</span>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
              {unreadNotifications.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>All notifications from the system</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications?.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">No notifications</div>
              ) : (
                <div className="divide-y">
                  {notifications?.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>Notifications you haven't read yet</CardDescription>
            </CardHeader>
            <CardContent>
              {unreadNotifications.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No unread notifications
                </div>
              ) : (
                <div className="divide-y">
                  {unreadNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationItem({ notification }: { notification: any }) {
  const formattedDate = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  })

  return (
    <div className="flex items-start gap-4 py-4">
      <div className={`mt-1 h-2 w-2 rounded-full ${notification.is_read ? "bg-gray-300" : "bg-blue-500"}`} />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold">{notification.title}</h4>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
        {notification.link && (
          <div className="mt-2">
            <Link to={notification.link}>
              <Button variant="link" className="h-auto p-0 text-blue-500">
                View details
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
