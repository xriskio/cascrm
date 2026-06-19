// Enhanced version of the QQCatalyst client with better error handling and caching
import axios from "axios"

const TOKEN_URL = process.env.QQ_TOKEN_URL || "https://login.qqcatalyst.com/oauth/token"
const QQ_BASE_URL = process.env.QQ_API_BASE || process.env.QQ_BASE_URL
const QQ_CLIENT_ID = process.env.QQ_CLIENT_ID
const QQ_CLIENT_SECRET = process.env.QQ_CLIENT_SECRET
const QQ_USERNAME = process.env.QQ_USERNAME
const QQ_PASSWORD = process.env.QQ_PASSWORD

interface TokenCache {
  token: string | null
  exp: number
}

let cached: TokenCache = { token: null, exp: 0 }

async function fetchToken(): Promise<string> {
  // Return cached token if still valid
  if (cached.token && Date.now() < cached.exp) {
    return cached.token
  }

  try {
    const response = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: "password",
        username: QQ_USERNAME || "",
        password: QQ_PASSWORD || "",
        client_id: QQ_CLIENT_ID || "",
        client_secret: QQ_CLIENT_SECRET || "",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000, // 10 second timeout
      },
    )

    const { access_token, expires_in } = response.data

    // Cache token with 1 minute buffer before expiration
    cached = {
      token: access_token,
      exp: Date.now() + (expires_in - 60) * 1000,
    }

    console.log("QQCatalyst token refreshed successfully")
    return access_token
  } catch (error) {
    console.error("Failed to fetch QQCatalyst token:", error)
    throw new Error(`Authentication failed: ${error.message}`)
  }
}

export async function qqcatalystRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
): Promise<any> {
  try {
    const token = await fetchToken()
    const url = `${QQ_BASE_URL}/${endpoint.replace(/^\//, "")}`

    const config = {
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
      ...(data && { data }),
    }

    const response = await axios(config)
    return response.data
  } catch (error) {
    console.error(`QQCatalyst API error for ${endpoint}:`, error)

    // If it's a 401, clear the cached token and retry once
    if (error.response?.status === 401 && cached.token) {
      console.log("Token expired, clearing cache and retrying...")
      cached = { token: null, exp: 0 }

      try {
        const token = await fetchToken()
        const url = `${QQ_BASE_URL}/${endpoint.replace(/^\//, "")}`

        const config = {
          method,
          url,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
          ...(data && { data }),
        }

        const response = await axios(config)
        return response.data
      } catch (retryError) {
        throw retryError
      }
    }

    throw error
  }
}

// Utility function to clear token cache (useful for testing or manual refresh)
export function clearTokenCache(): void {
  cached = { token: null, exp: 0 }
  console.log("QQCatalyst token cache cleared")
}
