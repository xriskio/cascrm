import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("Starting QQCatalyst OAuth flow...")

    // Get credentials from environment variables
    const clientId = process.env.QQ_CLIENT_ID
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"

    console.log("Client ID:", clientId ? "Present" : "Missing")
    console.log("Base URL:", baseUrl)

    if (!clientId) {
      console.error("QQ_CLIENT_ID not found in environment variables")
      return NextResponse.json(
        {
          error: "QQCatalyst Client ID not configured",
          details: "Missing QQ_CLIENT_ID environment variable",
        },
        { status: 500 },
      )
    }

    // Build redirect URI
    const redirectUri = `${baseUrl}/api/auth/qqcatalyst/callback`
    console.log("Redirect URI:", redirectUri)

    // Generate state for security
    const state = Math.random().toString(36).substring(7)
    console.log("Generated state:", state)

    // Build authorization URL
    const authParams = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read write", // Adjust scope as needed
      state: state,
    })

    const authUrl = `https://login.qqcatalyst.com/oauth/authorize?${authParams.toString()}`
    console.log("Authorization URL:", authUrl)

    // Store state in a cookie for verification
    const response = NextResponse.redirect(authUrl)
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    })

    return response
  } catch (error) {
    console.error("QQCatalyst auth error:", error)

    // Return detailed error information
    return NextResponse.json(
      {
        error: "Failed to initiate authentication",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
