
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { hasPermission, type Permission, type UserRole } from "@/lib/permissions"

export function usePermissions() {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = (await import("@/lib/supabase/client")).supabase

  useEffect(() => {
    async function getUserRole() {
      try {
        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Get user role from the users table
          const { data: userData, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()

          if (error) {
            console.error("Error fetching user role:", error)
            setUserRole("user") // Default to lowest access
          } else {
            setUserRole(userData.role as UserRole)
          }
        }
      } catch (error) {
        console.error("Error in getUserRole:", error)
        setUserRole("user") // Default to lowest access
      } finally {
        setIsLoading(false)
      }
    }

    getUserRole()
  }, [supabase])

  // Check if the user has a specific permission
  const can = (permission: Permission): boolean => {
    if (!userRole) return false
    return hasPermission(userRole, permission)
  }

  return {
    userRole,
    isLoading,
    can,
    isAdmin: userRole === "admin",
    isAgent: userRole === "agent",
    isUser: userRole === "user",
  }
}
