"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"

export async function createBucket(name: string) {
  try {
    const { data, error } = await supabaseAdmin.storage.createBucket(name, {
      public: false,
      fileSizeLimit: 10485760, // 10MB
    })

    if (error) {
      console.error("Error creating bucket:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error creating bucket:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function listBuckets() {
  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets()

    if (error) {
      console.error("Error listing buckets:", error)
      return { success: false, error: error.message }
    }

    return { success: true, buckets: data }
  } catch (error) {
    console.error("Unexpected error listing buckets:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteBucket(name: string) {
  try {
    const { error } = await supabaseAdmin.storage.deleteBucket(name)

    if (error) {
      console.error("Error deleting bucket:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting bucket:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
