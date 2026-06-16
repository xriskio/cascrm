"use server"

import { createClient } from "@/lib/supabase/server"
import { handleAsyncError } from "@/lib/error-utils"

export async function saveFieldMapping(params: {
  name: string
  description?: string
  mappings: Record<string, string>
  type: "renewals" | "clients"
}) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("field_mappings").upsert(
      {
        name: params.name,
        description: params.description,
        mappings: params.mappings,
        type: params.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "name,type",
      },
    )

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return handleAsyncError(error)
  }
}

export async function getFieldMappings(type: "renewals" | "clients") {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("field_mappings")
      .select("*")
      .eq("type", type)
      .order("updated_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return handleAsyncError(error)
  }
}

export async function deleteFieldMapping(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("field_mappings").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return handleAsyncError(error)
  }
}
