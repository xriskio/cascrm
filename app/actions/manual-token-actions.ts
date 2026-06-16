"use server"

import { createClient } from "@/lib/supabase/server"

export async function saveManualToken(
  token: string,
  name = "Updated Working Token"
) {
  try {
    // First test the token
    const testResult = await testQQToken(token)

    if (!testResult.success) {
      return {
        success: false,
        error: `Token test failed: ${testResult.error}`,
        testResult,
      }
    }

    const supabase = await createClient()

    // Deactivate all existing tokens
    await supabase.from("qqcatalyst_tokens").update({ is_active: false }).neq("id", "dummy")

    // Save the new token
    const { data, error } = await supabase
      .from("qqcatalyst_tokens")
      .insert({
        access_token: token,
        token_name: name,
        is_active: true,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save token: ${error.message}`)
    }

    return {
      success: true,
      message: "Token saved and activated successfully",
      testResult,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function testQQToken(token: string) {
  try {
    const qqBaseUrl = process.env.QQ_BASE_URL || "https://api.qqcatalyst.com"

    // Test with a simple endpoint using GET
    const testUrl = `${qqBaseUrl}/v1/Contacts/LastModifiedCreated?startDate=2025-01-01&endDate=2025-06-09&pageNumber=1&pageSize=1`

    console.log("🧪 Testing token with URL:", testUrl)

    const response = await fetch(testUrl, {
      method: "GET", // Use GET as confirmed working in Postman
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    console.log("🧪 Test response status:", response.status)
    console.log("🧪 Test response (first 200 chars):", responseText.slice(0, 200))

    if (!response.ok) {
      // Check if it's HTML (404 page)
      const isHtml = responseText.includes("<!DOCTYPE") || responseText.includes("<html")

      return {
        success: false,
        error: `API request failed: ${response.status} - ${responseText}`,
        isHtml,
        status: response.status,
      }
    }

    try {
      const data = JSON.parse(responseText)
      const items = data.value ?? data.items ?? data

      return {
        success: true,
        message: `Token is valid! Found ${Array.isArray(items) ? items.length : "unknown"} items`,
        testResult: {
          status: response.status,
          dataStructure: Object.keys(data),
          itemCount: Array.isArray(items) ? items.length : 0,
          sample: Array.isArray(items) && items.length > 0 ? items[0] : null,
        },
      }
    } catch (parseError) {
      return {
        success: false,
        error: `Response is not valid JSON: ${parseError}`,
        rawResponse: responseText.slice(0, 500),
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getActiveToken() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("qqcatalyst_tokens").select("*").eq("is_active", true).single()

    if (error || !data) {
      return {
        success: false,
        error: "No active token found",
      }
    }

    return {
      success: true,
      token: data.access_token,
      tokenName: data.token_name,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function clearAllTokens() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("qqcatalyst_tokens").delete().neq("id", "dummy")

    if (error) {
      throw new Error(`Failed to clear tokens: ${error.message}`)
    }

    return {
      success: true,
      message: "All tokens cleared successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
