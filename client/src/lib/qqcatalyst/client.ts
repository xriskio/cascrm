import { getQQCatalystToken, refreshQQCatalystToken } from "./auth"

// Update the base URL to match the documentation (must use HTTPS)
const QQ_API_BASE = process.env.QQ_API_BASE || "https://api.qqcatalyst.com/v1"

export class QQCatalystClient {
  private baseUrl: string
  private token: string | null = null
  private tokenExpiry: Date | null = null

  constructor(baseUrl: string = QQ_API_BASE) {
    this.baseUrl = baseUrl
  }

  async getToken(): Promise<string> {
    // Check if token exists and is not expired
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token
    }

    try {
      // Get a new token
      const tokenResponse = await getQQCatalystToken()

      if (!tokenResponse.access_token) {
        throw new Error("Failed to get QQCatalyst token")
      }

      this.token = tokenResponse.access_token

      // Set token expiry (subtract 5 minutes for safety margin)
      const expiresInMs = (tokenResponse.expires_in || 3600) * 1000
      this.tokenExpiry = new Date(Date.now() + expiresInMs - 5 * 60 * 1000)

      if (!this.token) {
        throw new Error("Failed to get access token from QQCatalyst")
      }

      return this.token
    } catch (error) {
      console.error("Error getting QQCatalyst token:", error)
      throw error
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const tokenResponse = await refreshQQCatalystToken()

      if (!tokenResponse.access_token) {
        throw new Error("Failed to refresh QQCatalyst token")
      }

      this.token = tokenResponse.access_token

      // Set token expiry (subtract 5 minutes for safety margin)
      const expiresInMs = (tokenResponse.expires_in || 3600) * 1000
      this.tokenExpiry = new Date(Date.now() + expiresInMs - 5 * 60 * 1000)

      if (!this.token) {
        throw new Error("Failed to get access token from QQCatalyst")
      }

      return this.token
    } catch (error) {
      console.error("Error refreshing QQCatalyst token:", error)
      throw error
    }
  }

  async request(endpoint: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: any): Promise<any> {
    try {
      // Ensure we have a valid token
      const token = await this.getToken()

      // Ensure endpoint doesn't start with a slash
      const cleanEndpoint = endpoint.startsWith("/") ? endpoint.substring(1) : endpoint

      // Special case handling for endpoints that require POST instead of GET
      if (method === "GET" && this.requiresPostMethod(cleanEndpoint)) {
        console.log(`Endpoint ${cleanEndpoint} requires POST method, switching from GET to POST`)
        method = "POST"
      }

      // Build the full URL
      const url = `${this.baseUrl}/${cleanEndpoint}`

      console.log(`Making ${method} request to ${url}`)

      // Set up headers
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      // Set up request options
      const options: RequestInit = {
        method,
        headers,
        cache: "no-store",
      }

      // Add body for non-GET requests
      if (method !== "GET" && body) {
        options.body = JSON.stringify(body)
      } else if (method === "POST" && !body) {
        // For POST requests that don't have a body, provide an empty object
        options.body = JSON.stringify({})
      }

      // Make the request
      const response = await fetch(url, options)

      // Check if the response is OK
      if (!response.ok) {
        // If token expired (401), try to refresh and retry once
        if (response.status === 401) {
          console.log("Token expired, refreshing...")
          await this.refreshToken()
          return this.request(endpoint, method, body)
        }

        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }

      // Parse the response
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      console.error(`Error making request to ${endpoint}:`, error)
      throw error
    }
  }

  // Helper method to determine if an endpoint requires POST instead of GET
  private requiresPostMethod(endpoint: string): boolean {
    // List of endpoints that require POST instead of GET  
    // Note: Policies/LastModifiedCreated uses GET, so don't include it
    const postEndpoints = ["PolicyInfo", "PolicySummary"]

    // Check if the endpoint matches exactly (not just starts with)
    return postEndpoints.some((pe) => endpoint === pe || endpoint.startsWith(`${pe}/`))
  }
}

// Legacy function for backward compatibility
export async function qqcatalystRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
): Promise<any> {
  const client = new QQCatalystClient()
  return await client.request(endpoint, method, body)
}

// Singleton instance
export const qqClient = new QQCatalystClient()

// Export a function to get the singleton client instance
export function getQQCatalystClient(): QQCatalystClient {
  return qqClient
}
