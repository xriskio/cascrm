// QQCatalyst OAuth authentication handler

// Use the environment variables as provided by the user
const QQ_TOKEN_URL = process.env.QQ_TOKEN_URL || "https://login.qqcatalyst.com/oauth/token"

// Try the new QQCATALYST_* credentials first, fallback to old QQ_* credentials
const QQ_CLIENT_ID = process.env.|| process.env.QQ_CLIENT_ID || ""
const QQ_CLIENT_SECRET = process.env.|| process.env.QQ_CLIENT_SECRET || ""
const QQ_BEARER_TOKEN = process.env.QQ_BEARER_TOKEN || ""
const QQ_USERNAME = process.env.QQ_USERNAME || ""
const QQ_PASSWORD = process.env.QQ_PASSWORD || ""

// In-memory token cache
let cachedToken: string | null = null
let tokenExpiry: number | null = null

class QQCatalystAuth {
  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    if (QQ_BEARER_TOKEN) return QQ_BEARER_TOKEN
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken
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

      // Check if client credentials are available
      if (!QQ_CLIENT_ID || !QQ_CLIENT_SECRET) {
        console.error("Missing QQCatalyst credentials in environment variables")
        console.error(`QQ_CLIENT_ID: ${QQ_CLIENT_ID ? "Set" : "Missing"}`)
        console.error(`QQ_CLIENT_SECRET: ${QQ_CLIENT_SECRET ? "Set" : "Missing"}`)
        throw new Error("Missing QQCatalyst Client ID and Secret in environment variables")
      }

      // Create Basic Auth header with client credentials
      const basicAuth = Buffer.from(`${QQ_CLIENT_ID}:${QQ_CLIENT_SECRET}`).toString("base64")

      // Determine grant type: use client_credentials if no username/password, else use password
      const grantType = QQ_USERNAME && QQ_PASSWORD ? "password" : "client_credentials"
      
      console.log(`Using grant_type: ${grantType}`)

      const bodyParams: Record<string, string> = {
        grant_type: grantType,
      }

      // Add username and password only if available (password grant)
      if (grantType === "password") {
        bodyParams.username = QQ_USERNAME
        bodyParams.password = QQ_PASSWORD
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
      // Check if credentials are available
      if (!QQ_CLIENT_ID || !QQ_CLIENT_SECRET) {
        throw new Error("Missing QQCatalyst Client ID and Secret in environment variables")
      }

      // Create Basic Auth header with client credentials
      const basicAuth = Buffer.from(`${QQ_CLIENT_ID}:${QQ_CLIENT_SECRET}`).toString("base64")

      // Determine grant type
      const grantType = QQ_USERNAME && QQ_PASSWORD ? "password" : "client_credentials"
      
      const bodyParams: Record<string, string> = {
        grant_type: grantType,
      }

      if (grantType === "password") {
        bodyParams.username = QQ_USERNAME
        bodyParams.password = QQ_PASSWORD
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
    // Check if credentials are available
    if (!QQ_CLIENT_ID || !QQ_CLIENT_SECRET) {
      throw new Error("Missing QQCatalyst Client ID and Secret in environment variables")
    }

    const basicAuth = Buffer.from(`${QQ_CLIENT_ID}:${QQ_CLIENT_SECRET}`).toString("base64")

    // Determine grant type
    const grantType = QQ_USERNAME && QQ_PASSWORD ? "password" : "client_credentials"
    
    const bodyParams: Record<string, string> = {
      grant_type: grantType,
    }

    if (grantType === "password") {
      bodyParams.username = QQ_USERNAME
      bodyParams.password = QQ_PASSWORD
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
