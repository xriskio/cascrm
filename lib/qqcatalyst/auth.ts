// QQCatalyst OAuth authentication handler
import { supabaseAdmin } from "@/lib/supabase/admin"

// Use the environment variables as provided by the user
const QQ_TOKEN_URL = process.env.QQ_TOKEN_URL || "https://login.qqcatalyst.com/oauth/token"

// In-memory token cache
let cachedToken: string | null = null
let tokenExpiry: number | null = null

type StoredQQCatalystToken = {
  access_token: string | null
  expires_at: string | null
}

function getConfiguredBearerToken() {
  return process.env.QQ_BEARER_TOKEN || process.env.QQCATALYST_BEARER_TOKEN || ""
}

function getOAuthConfig() {
  return {
    clientId: process.env.QQ_CLIENT_ID || "",
    clientSecret: process.env.QQ_CLIENT_SECRET || "",
    username: process.env.QQ_USERNAME || "",
    password: process.env.QQ_PASSWORD || "",
  }
}

function tokenExpiresInFuture(expiresAt: string | null) {
  if (!expiresAt) return true
  const expiresAtMs = new Date(expiresAt).getTime()
  return Number.isFinite(expiresAtMs) && expiresAtMs > Date.now()
}

async function getStoredBearerToken() {
  try {
    const { data, error } = await supabaseAdmin
      .from("qqcatalyst_tokens")
      .select("access_token, expires_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      console.warn("Unable to read stored QQCatalyst token:", error.message)
      return null
    }

    const storedToken = (data as StoredQQCatalystToken[] | null)?.find(
      (token) => token.access_token && tokenExpiresInFuture(token.expires_at),
    )

    if (!storedToken?.access_token) return null

    return {
      accessToken: storedToken.access_token,
      expiresAt: storedToken.expires_at,
    }
  } catch (error) {
    console.warn("Unable to read stored QQCatalyst token:", error)
    return null
  }
}

class QQCatalystAuth {
  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    const configuredBearerToken = getConfiguredBearerToken()
    if (configuredBearerToken) return configuredBearerToken

    // Check if we have a valid cached token
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken
    }

    const storedBearerToken = await getStoredBearerToken()
    if (storedBearerToken) {
      cachedToken = storedBearerToken.accessToken
      tokenExpiry = storedBearerToken.expiresAt
        ? new Date(storedBearerToken.expiresAt).getTime()
        : Date.now() + 5 * 60 * 1000
      return storedBearerToken.accessToken
    }

    // Otherwise, get a new token
    return await this.refreshToken()
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<string> {
    try {
      console.log("Refreshing QQCatalyst access token...")
      const { clientId, clientSecret, username, password } = getOAuthConfig()

      // Check if client credentials are available
      if (!clientId || !clientSecret) {
        console.error("Missing QQCatalyst credentials in environment variables")
        console.error(`QQ_CLIENT_ID: ${clientId ? "Set" : "Missing"}`)
        console.error(`QQ_CLIENT_SECRET: ${clientSecret ? "Set" : "Missing"}`)
        throw new Error("Missing QQCatalyst Client ID and Secret in environment variables")
      }

      // Create Basic Auth header with client credentials
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

      // Determine grant type: use client_credentials if no username/password, else use password
      const grantType = username && password ? "password" : "client_credentials"
      
      console.log(`Using grant_type: ${grantType}`)

      const bodyParams: Record<string, string> = {
        grant_type: grantType,
      }

      // Add username and password only if available (password grant)
      if (grantType === "password") {
        bodyParams.username = username
        bodyParams.password = password
      }

      const response = await fetch(QQ_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams(bodyParams),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Token refresh failed: ${response.status} - ${errorText}`)
        throw new Error(`Token refresh failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (!data.access_token) {
        throw new Error("No access token returned from QQCatalyst")
      }

      // Cache the token and set expiry (default to 1 hour if expires_in not provided)
      cachedToken = data.access_token
      tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000

      console.log("QQCatalyst token refreshed successfully")
      return data.access_token
    } catch (error) {
      console.error("Error refreshing QQCatalyst token:", error)
      throw error
    }
  }

  /**
   * Get a client token directly (for testing)
   */
  async getClientToken(): Promise<any> {
    try {
      const { clientId, clientSecret, username, password } = getOAuthConfig()

      // Check if credentials are available
      if (!clientId || !clientSecret) {
        throw new Error("Missing QQCatalyst Client ID and Secret in environment variables")
      }

      // Create Basic Auth header with client credentials
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

      // Determine grant type
      const grantType = username && password ? "password" : "client_credentials"
      
      const bodyParams: Record<string, string> = {
        grant_type: grantType,
      }

      if (grantType === "password") {
        bodyParams.username = username
        bodyParams.password = password
      }

      const response = await fetch(QQ_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams(bodyParams),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Token request failed: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting client token:", error)
      throw error
    }
  }

  /**
   * Clear the token cache
   */
  clearTokenCache() {
    cachedToken = null
    tokenExpiry = null
  }
}

// Export singleton instance
export const qqAuth = new QQCatalystAuth()

// Export helper functions for compatibility with the provided code
export async function getQQCatalystToken() {
  try {
    const configuredBearerToken = getConfiguredBearerToken()
    if (configuredBearerToken) {
      return { access_token: configuredBearerToken, token_type: "bearer" }
    }

    const storedBearerToken = await getStoredBearerToken()
    if (storedBearerToken) {
      return {
        access_token: storedBearerToken.accessToken,
        token_type: "bearer",
        expires_at: storedBearerToken.expiresAt,
      }
    }

    const { clientId, clientSecret, username, password } = getOAuthConfig()

    // Check if credentials are available
    if (!clientId || !clientSecret) {
      throw new Error("Missing QQCatalyst Client ID and Secret in environment variables")
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    // Determine grant type
    const grantType = username && password ? "password" : "client_credentials"
    
    const bodyParams: Record<string, string> = {
      grant_type: grantType,
    }

    if (grantType === "password") {
      bodyParams.username = username
      bodyParams.password = password
    }

    const response = await fetch(QQ_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams(bodyParams),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token request failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getQQCatalystToken:", error)
    throw error
  }
}

export async function refreshQQCatalystToken() {
  return await getQQCatalystToken()
}
