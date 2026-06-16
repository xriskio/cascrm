import { createClient } from "@/lib/supabase"

const adminSupabase = createClient({ useServiceRole: true })

export async function upsertContacts(data: any[]) {
  try {
    const { data: upsertedData, error } = await adminSupabase
      .from("contacts")
      .upsert(data, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) throw error

    return {
      success: true,
      data: upsertedData || [],
      count: upsertedData?.length || 0,
    }
  } catch (error) {
    console.error("Error upserting contacts:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      count: 0,
    }
  }
}

export async function upsertPolicies(data: any[]) {
  try {
    const { data: upsertedData, error } = await adminSupabase
      .from("policies")
      .upsert(data, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) throw error

    return {
      success: true,
      data: upsertedData || [],
      count: upsertedData?.length || 0,
    }
  } catch (error) {
    console.error("Error upserting policies:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      count: 0,
    }
  }
}

export async function upsertRenewals(data: any[]) {
  try {
    const { data: upsertedData, error } = await adminSupabase
      .from("renewals")
      .upsert(data, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) throw error

    return {
      success: true,
      data: upsertedData || [],
      count: upsertedData?.length || 0,
    }
  } catch (error) {
    console.error("Error upserting renewals:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      count: 0,
    }
  }
}

export async function upsertLocations(data: any[]) {
  try {
    const { data: upsertedData, error } = await adminSupabase
      .from("locations")
      .upsert(data, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) throw error

    return {
      success: true,
      data: upsertedData || [],
      count: upsertedData?.length || 0,
    }
  } catch (error) {
    console.error("Error upserting locations:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      count: 0,
    }
  }
}

export async function upsertVehicles(data: any[]) {
  try {
    const { data: upsertedData, error } = await adminSupabase
      .from("vehicles")
      .upsert(data, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) throw error

    return {
      success: true,
      data: upsertedData || [],
      count: upsertedData?.length || 0,
    }
  } catch (error) {
    console.error("Error upserting vehicles:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      count: 0,
    }
  }
}
