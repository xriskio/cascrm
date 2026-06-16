import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// In-memory token cache (in a real app, this would be in a database or Redis)
let tokenCache: {
  token: string
  expires: number
} | null = null

export async function GET() {
  try {
    // Check if we have a cached token
    if (tokenCache && tokenCache.expires > Date.now()) {
      return NextResponse.json({
        valid: true,
        expired: false,
        expiresIn: Math.floor((tokenCache.expires - Date.now()) / 1000),
      })
    }

    // If token is expired but exists
    if (tokenCache) {
      return NextResponse.json({
        valid: false,
        expired: true,
        expiresIn: 0,
      })
    }

    // Try to get a new token
    const clientId = process.env.QQ_CLIENT_ID || process.env.QQC_CLIENT_ID
    const clientSecret = process.env.QQ_CLIENT_SECRET || process.env.QQC_CLIENT_SECRET
    const username = process.env.QQ_USERNAME || process.env.QQC_USERNAME
    const password = process.env.QQ_PASSWORD || process.env.QQC_PASSWORD
    const tokenUrl = process.env.QQ_TOKEN_URL || process.env.QQC_TOKEN_URL || "https://login.qqcatalyst.com/oauth/token"

    if (!clientId || !clientSecret || !username || !password) {
      return NextResponse.json({
        valid: false,
        expired: false,
        error: "Missing credentials",
      })
    }

    // Create Basic Auth header
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    // Set up request body
    const formData = new URLSearchParams()
    formData.append("grant_type", "password")
    formData.append("username", username)
    formData.append("password", password)

    // Make the request
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({
        valid: false,
        expired: false,
        error: `Failed to get token: ${response.status}`,
      })
    }

    const tokenData = await response.json()

    // Update token cache
    tokenCache = {
      token: tokenData.access_token,
      expires: Date.now() + (tokenData.expires_in - 30) * 1000, // Subtract 30 seconds for safety
    }

    return NextResponse.json({
      valid: true,
      expired: false,
      expiresIn: tokenData.expires_in,
    })
  } catch (error) {
    console.error("Error checking token status:", error)
    return NextResponse.json({
      valid: false,
      expired: false,
      error: error.message || "Unknown error occurred",
    })
  }
}
