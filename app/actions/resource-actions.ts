"use server"

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import type { AgencyResource as Resource } from "@/types/resource"
import { revalidatePath } from "next/cache"

// ——————————————
// Setup your clients
// ——————————————

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment")
}

// Client that bypasses RLS for writes
const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey)

/**
 * Insert a new resource.
 */
export async function addResource(resource: Resource): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from("agency_resources").insert([resource])

    if (error) {
      console.error("Error inserting resource:", error)
      return { success: false, error: error.message }
    }

    // Revalidate your listing page
    revalidatePath("/agency-resources")
    return { success: true }
  } catch (error: any) {
    console.error("Error in addResource:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Add an external resource (link).
 */
export async function addExternalResource(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const externalUrl = formData.get("externalUrl") as string

    if (!title || !externalUrl) {
      return { success: false, error: "Title and URL are required" }
    }

    const resource = {
      title,
      description,
      category,
      external_url: externalUrl,
      resource_type: "link",
    }

    const { error } = await supabaseAdmin.from("agency_resources").insert([resource])

    if (error) {
      console.error("Error inserting external resource:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/agency-resources")
    return { success: true }
  } catch (error: any) {
    console.error("Error in addExternalResource:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Update an existing resource.
 */
export async function updateResource(
  id: string,
  updates: Partial<Resource>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from("agency_resources").update(updates).eq("id", id)

    if (error) {
      console.error("Error updating resource:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/agency-resources")
    revalidatePath(`/agency-resources/${id}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error in updateResource:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a resource.
 */
export async function deleteResource(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    // First check if the resource exists
    const { data, error: fetchError} = await supabase.from("agency_resources").select("id").eq("id", id).single()

    if (fetchError) {
      console.error("Error fetching resource:", fetchError)
      return { success: false, error: "Resource not found" }
    }

    // Delete the resource
    const { error } = await supabaseAdmin.from("agency_resources").delete().eq("id", id)

    if (error) {
      console.error("Error deleting resource:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/agency-resources")
    return { success: true }
  } catch (error: any) {
    console.error("Error in deleteResource:", error)
    return { success: false, error: error.message }
  }
}

// Alias for deleteResource to maintain compatibility
export const deleteResourceAction = deleteResource

/**
 * Fetch all resources (for SSR pages).
 */
export async function getResources(): Promise<{ resources: Resource[]; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("agency_resources")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching resources:", error)
      return { resources: [], error: error.message }
    }

    return { resources: data || [], error: null }
  } catch (error: any) {
    console.error("Error in getResources:", error)
    return { resources: [], error: error.message }
  }
}

/**
 * Fetch a single resource by ID.
 */
export async function getResourceById(id: string): Promise<{ resource: Resource | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("agency_resources").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching resource by ID:", error)
      return { resource: null, error: error.message }
    }

    return { resource: data, error: null }
  } catch (error: any) {
    console.error("Error in getResourceById:", error)
    return { resource: null, error: error.message }
  }
}
