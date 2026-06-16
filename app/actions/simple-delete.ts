"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Create a direct admin client
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function deleteResource(id: string) {
  console.log("Deleting resource with ID:", id)

  try {
    // Direct delete operation
    const { error } = await supabaseAdmin.from("agency_resources").delete().eq("id", id)

    if (error) {
      console.error("Delete error:", error)
      return { success: false, message: error.message }
    }

    console.log("Resource deleted successfully")
    revalidatePath("/agency-resources")
    return { success: true }
  } catch (err) {
    console.error("Unexpected error:", err)
    return { success: false, message: "An unexpected error occurred" }
  }
}
