
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function MarkNotificationsAsReadButton() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  // supabase imported at top of file

  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true)

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        toast.error("You must be logged in to mark notifications as read")
        return
      }

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userData.user.id)
        .eq("is_read", false)

      if (error) {
        console.error("Error marking notifications as read:", error)
        toast.error("Failed to mark notifications as read")
        return
      }

      toast.success("All notifications marked as read")
      navigate.refresh()
    } catch (error) {
      console.error("Error in markAllAsRead:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleMarkAllAsRead} disabled={isLoading}>
      {isLoading ? "Marking as read..." : "Mark all as read"}
    </Button>
  )
}
