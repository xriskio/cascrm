"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"

type UserData = {
  email: string
  password?: string
  firstName: string
  lastName: string
  role: string
  id?: string
}

// Updated to match the existing schema in Supabase
export async function createUser(userData: UserData) {
  const supabase = supabaseAdmin

  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    throw new Error(`Failed to create user: ${authError.message}`)
  }

  // Then create the user profile with the fields matching the existing schema
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email: userData.email,
    first_name: userData.firstName,
    last_name: userData.lastName,
    name: `${userData.firstName} ${userData.lastName}`,
    role: userData.role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    console.error("Error creating user profile:", profileError)
    // Try to clean up the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw new Error(`Failed to create user profile: ${profileError.message}`)
  }

  return { id: authData.user.id }
}

export async function updateUser(userData: UserData) {
  if (!userData.id) {
    throw new Error("User ID is required")
  }

  const supabase = supabaseAdmin

  try {
    // First, check if the email is changing
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userData.id)
      .single()

    if (fetchError) {
      console.error("Error fetching current user:", fetchError)
      throw new Error(`Failed to fetch current user: ${fetchError.message}`)
    }

    // Only update auth user email if it's changing
    if (currentUser.email !== userData.email) {
      try {
        const { error: authError } = await supabase.auth.admin.updateUserById(userData.id, { email: userData.email })

        if (authError) {
          console.error("Error updating auth user:", authError)
          throw new Error(`Failed to update auth user: ${authError.message}`)
        }
      } catch (err) {
        console.error("Exception updating auth user:", err)
        // Continue with profile update even if auth update fails
        console.warn("Continuing with profile update despite auth update failure")
      }
    }

    // Update user profile with the corrected field names
    const { error: profileError } = await supabase
      .from("users")
      .update({
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.id)

    if (profileError) {
      console.error("Error updating user profile:", profileError)
      throw new Error(`Failed to update user profile: ${profileError.message}`)
    }

    return { id: userData.id, success: true }
  } catch (error) {
    console.error("Error in updateUser:", error)
    // Return a more user-friendly error that doesn't expose internal details
    throw new Error(
      error instanceof Error
        ? `Error updating user: ${error.message}`
        : "An unknown error occurred while updating the user",
    )
  }
}

export async function getUserById(id: string) {
  const supabase = supabaseAdmin

  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching user:", error)
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  // Map the database field names to our application field names
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function getAllUsers() {
  const supabase = supabaseAdmin

  const { data, error } = await supabase.from("users").select("*").order("name")

  if (error) {
    console.error("Error fetching users:", error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  // Map the database field names to our application field names
  return data.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    name: user.name,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }))
}

export async function deleteUser(id: string) {
  const supabase = supabaseAdmin

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(id)

  if (authError) {
    console.error("Error deleting auth user:", authError)
    throw new Error(`Failed to delete user: ${authError.message}`)
  }

  // Delete user profile
  const { error: profileError } = await supabase.from("users").delete().eq("id", id)

  if (profileError) {
    console.error("Error deleting user profile:", profileError)
    throw new Error(`Failed to delete user profile: ${profileError.message}`)
  }

  return { success: true }
}

// Add a function to check if the user table exists with the correct schema
export async function checkUserTableSchema() {
  const supabase = supabaseAdmin

  try {
    // Try to get one row from the users table to check its structure
    const { data, error } = await supabase.from("users").select("*").limit(1)

    if (error) {
      console.error("Error checking user table schema:", error)
      return { exists: false, error: error.message }
    }

    return { exists: true, fields: data && data.length ? Object.keys(data[0]) : [] }
  } catch (err) {
    console.error("Exception checking user table schema:", err)
    return { exists: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}
