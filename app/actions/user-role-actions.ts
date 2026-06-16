"use server"

import { createClient } from "@/lib/supabase"

export async function ensureUserRecord(userId: string, email: string) {
  try {
    // Use service role to bypass RLS
    const supabase = createClient({ useServiceRole: true })

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle()

    if (fetchError && !fetchError.message.includes("No rows found")) {
      console.error("Error fetching user:", fetchError)
      return { error: fetchError.message }
    }

    // If user exists, return their role
    if (existingUser) {
      return { role: existingUser.role || "user" }
    }

    // Create new user record
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email: email,
        name: email.split("@")[0],
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("role")
      .single()

    if (insertError) {
      console.error("Error creating user:", insertError)
      return { error: insertError.message }
    }

    return { role: newUser?.role || "user" }
  } catch (error) {
    console.error("Error in ensureUserRecord:", error)
    return { error: "Failed to ensure user record" }
  }
}
