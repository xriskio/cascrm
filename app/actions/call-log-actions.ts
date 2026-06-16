"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const callSchema = z.object({
  call_date: z.string().optional(),
  call_time: z.string().optional(),
  named_insured: z.string().optional(),
  contact_name: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  reason: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.string().default("pending"),
  call_back_date: z.string().optional().nullable(),
  call_back_time: z.string().optional(),
  notes: z.string().optional(),
})

export async function createCall(formData: FormData) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Parse and validate form data
    const rawData = Object.fromEntries(formData.entries())
    const validatedData = callSchema.parse(rawData)

    // Generate call tracking number
    const callNumber = `CALL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Add user ID and tracking number
    const callData = {
      ...validatedData,
      call_number: callNumber,
      created_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Insert into database
    const { data, error } = await supabase.from("incoming_calls").insert([callData]).select()

    if (error) {
      console.error("Error creating call:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/call-log")
    return { success: true, data }
  } catch (error) {
    console.error("Exception creating call:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create call",
    }
  }
}

export async function updateCallStatus(id: string, status: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Update status
    const { error } = await supabase
      .from("incoming_calls")
      .update({
        status,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating call status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/call-log")
    return { success: true }
  } catch (error) {
    console.error("Exception updating call status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update call status",
    }
  }
}

export async function deleteCall(id: string) {
  try {
    const supabase = await createClient()

    // Delete call
    const { error } = await supabase.from("incoming_calls").delete().eq("id", id)

    if (error) {
      console.error("Error deleting call:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/call-log")
    return { success: true }
  } catch (error) {
    console.error("Exception deleting call:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete call",
    }
  }
}
