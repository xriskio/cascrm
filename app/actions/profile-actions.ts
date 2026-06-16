"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { UserRole } from "@/lib/permissions"

export async function updateProfile({
  userId,
  first_name,
  last_name,
}: {
  userId: string
  first_name: string
  last_name: string
}) {
  const supabase = await createClient()

  // Check if user exists in the users table
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (checkError) {
    console.error("Error checking user:", checkError)
  }

  if (existingUser) {
    // Update the user in the users table
    const { error } = await supabase
      .from("users")
      .update({
        first_name,
        last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating profile:", error)
      throw new Error("Failed to update profile")
    }
  } else {
    // Insert the user if they don't exist
    const { error } = await supabase.from("users").insert({
      id: userId,
      first_name,
      last_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating profile:", error)
      throw new Error("Failed to create profile")
    }
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function changePassword({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string
  currentPassword: string
  newPassword: string
}) {
  const supabase = await createClient()

  // Update the password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error("Error changing password:", error)
    throw new Error("Failed to change password")
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function updateNotificationPreferences({
  userId,
  preferences,
}: {
  userId: string
  preferences: {
    email_notifications: boolean
    sms_notifications: boolean
    in_app_notifications: boolean
    marketing_emails: boolean
  }
}) {
  const supabase = await createClient()

  try {
    // First, check if the notification_preferences column exists
    const { error: columnCheckError } = await supabase.rpc("column_exists", {
      table_name: "users",
      column_name: "notification_preferences",
    })

    // If the column doesn't exist, we'll store preferences in a metadata field
    if (columnCheckError) {
      console.log("notification_preferences column doesn't exist, using metadata field instead")

      // Check if user exists
      const { data: existingUser } = await supabase.from("users").select("id, metadata").eq("id", userId).maybeSingle()

      if (existingUser) {
        // Update the user's metadata field
        const metadata = existingUser.metadata || {}
        metadata.notification_preferences = preferences

        const { error } = await supabase
          .from("users")
          .update({
            metadata,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (error) throw error
      } else {
        // Create a new user with preferences in metadata
        const { error } = await supabase.from("users").insert({
          id: userId,
          metadata: { notification_preferences: preferences },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }
    } else {
      // The column exists, proceed with normal update
      // Check if user exists
      const { data: existingUser } = await supabase.from("users").select("id").eq("id", userId).maybeSingle()

      if (existingUser) {
        // Update the user
        const { error } = await supabase
          .from("users")
          .update({
            notification_preferences: preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (error) throw error
      } else {
        // Create a new user
        const { error } = await supabase.from("users").insert({
          id: userId,
          notification_preferences: preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    throw new Error("Failed to update notification preferences")
  }
}

// User Management Actions (Admin Only)

export async function getAllUsers() {
  const supabase = await createClient()

  // Get the current user to check if they're an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if the current user is an admin
  const { data: currentUserData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (currentUserData?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can view all users")
  }

  // Fetch all users
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, role, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }

  return users
}

export async function createUser({
  email,
  password,
  first_name,
  last_name,
  role,
}: {
  email: string
  password: string
  first_name: string
  last_name: string
  role: UserRole
}) {
  const supabase = await createClient()

  // Get the current user to check if they're an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if the current user is an admin
  const { data: currentUserData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (currentUserData?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can create users")
  }

  // Use the admin client to create a new user
  const { supabaseAdmin } = await import("@/lib/supabase/admin")

  // Create the auth user
  const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    throw new Error(`Failed to create user: ${authError.message}`)
  }

  if (!newUser.user) {
    throw new Error("Failed to create user: No user returned")
  }

  // Create the user profile in the users table
  const { error: profileError } = await supabase.from("users").insert({
    id: newUser.user.id,
    email,
    first_name,
    last_name,
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    console.error("Error creating user profile:", profileError)
    // Try to delete the auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
    throw new Error("Failed to create user profile")
  }

  revalidatePath("/profile")
  return { success: true, user: newUser.user }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Get the current user to check if they're an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if the current user is an admin
  const { data: currentUserData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (currentUserData?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can delete users")
  }

  // Prevent self-deletion
  if (user.id === userId) {
    throw new Error("You cannot delete your own account")
  }

  // Use the admin client to delete the user
  const { supabaseAdmin } = await import("@/lib/supabase/admin")

  // Delete from auth (this will cascade to users table if RLS is set up)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (authError) {
    console.error("Error deleting auth user:", authError)
    throw new Error("Failed to delete user")
  }

  // Also delete from users table
  const { error: profileError } = await supabase.from("users").delete().eq("id", userId)

  if (profileError) {
    console.error("Error deleting user profile:", profileError)
    // Don't throw here, as auth user is already deleted
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function updateUserRole({ userId, role }: { userId: string; role: UserRole }) {
  const supabase = await createClient()

  // Get the current user to check if they're an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if the current user is an admin
  const { data: currentUserData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (currentUserData?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can update user roles")
  }

  // Prevent changing own role
  if (user.id === userId) {
    throw new Error("You cannot change your own role")
  }

  // Update the user's role
  const { error } = await supabase
    .from("users")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("Error updating user role:", error)
    throw new Error("Failed to update user role")
  }

  revalidatePath("/profile")
  return { success: true }
}
