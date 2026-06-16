"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface QQCatalystToken {
  id: string
  token_name: string
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
  expires_at?: string
  client_id?: string
  client_secret?: string
  username?: string
  password?: string
  grant_type: string
  scope?: string
  access_token_url: string
  client_authentication: string
  is_active: boolean
  created_at: string
  updated_at: string
  metadata?: any
}

export async function getQQCatalystTokens() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("qqcatalyst_tokens")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching QQCatalyst tokens:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error in getQQCatalystTokens:", error)
    return { success: false, error: "Failed to fetch tokens" }
  }
}

export async function getQQCatalystToken(id: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("qqcatalyst_tokens")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching QQCatalyst token:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getQQCatalystToken:", error)
    return { success: false, error: "Failed to fetch token" }
  }
}

export async function createQQCatalystToken(tokenData: Partial<QQCatalystToken>) {
  const supabase = await createClient()

  try {
    // Calculate expires_at if expires_in is provided
    let expires_at = null
    if (tokenData.expires_in) {
      expires_at = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    }

    const { data, error } = await supabase
      .from("qqcatalyst_tokens")
      .insert({
        ...tokenData,
        expires_at,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating QQCatalyst token:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/qqcatalyst/tokens")
    return { success: true, data }
  } catch (error) {
    console.error("Error in createQQCatalystToken:", error)
    return { success: false, error: "Failed to create token" }
  }
}

export async function updateQQCatalystToken(id: string, tokenData: Partial<QQCatalystToken>) {
  const supabase = await createClient()

  try {
    // Calculate expires_at if expires_in is provided
    let expires_at = tokenData.expires_at
    if (tokenData.expires_in) {
      expires_at = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    }

    const { data, error } = await supabase
      .from("qqcatalyst_tokens")
      .update({
        ...tokenData,
        expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating QQCatalyst token:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/qqcatalyst/tokens")
    return { success: true, data }
  } catch (error) {
    console.error("Error in updateQQCatalystToken:", error)
    return { success: false, error: "Failed to update token" }
  }
}

export async function deleteQQCatalystToken(id: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("qqcatalyst_tokens").update({ is_active: false }).eq("id", id)

    if (error) {
      console.error("Error deleting QQCatalyst token:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/qqcatalyst/tokens")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteQQCatalystToken:", error)
    return { success: false, error: "Failed to delete token" }
  }
}

export async function refreshQQCatalystToken(id: string) {
  const supabase = await createClient()

  try {
    // Get the token
    const tokenResult = await getQQCatalystToken(id)
    if (!tokenResult.success || !tokenResult.data) {
      return { success: false, error: "Token not found" }
    }

    const token = tokenResult.data

    // Refresh the token using the stored credentials
    const refreshResult = await refreshTokenWithCredentials(token)
    if (!refreshResult.success) {
      return refreshResult
    }

    // Update the token in the database
    const updateResult = await updateQQCatalystToken(id, {
      access_token: refreshResult.data.access_token,
      refresh_token: refreshResult.data.refresh_token,
      expires_in: refreshResult.data.expires_in,
      token_type: refreshResult.data.token_type || token.token_type,
    })

    return updateResult
  } catch (error) {
    console.error("Error in refreshQQCatalystToken:", error)
    return { success: false, error: "Failed to refresh token" }
  }
}

async function refreshTokenWithCredentials(token: QQCatalystToken) {
  try {
    const basicAuth = Buffer.from(`${token.client_id}:${token.client_secret}`).toString("base64")

    const response = await fetch(token.access_token_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: token.grant_type,
        username: token.username || "",
        password: token.password || "",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Error refreshing token:", error)
    return { success: false, error: error.message }
  }
}

export async function testQQCatalystToken(id: string, endpoint = "/v1/Carriers") {
  try {
    const tokenResult = await getQQCatalystToken(id)
    if (!tokenResult.success || !tokenResult.data) {
      return { success: false, error: "Token not found" }
    }

    const token = tokenResult.data
    const apiHost = process.env.QQ_API_BASE || "http://api.qqcatalyst.com"

    const response = await fetch(`${apiHost}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: `API call failed: ${response.status} - ${errorText}` }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Error testing QQCatalyst token:", error)
    return { success: false, error: error.message }
  }
}
