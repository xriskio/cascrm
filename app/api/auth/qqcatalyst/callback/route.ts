import { type NextRequest, NextResponse } from "next/server"
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    console.log("QQCatalyst OAuth callback received")

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    console.log("Callback params:", { code: code ? "Present" : "Missing", state, error, errorDescription })

    // Check for OAuth errors
    if (error) {
      console.error("OAuth error from QQCatalyst:", error, errorDescription)
      const errorMessage = errorDescription || error
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/qqcatalyst/oauth?error=${encodeURIComponent(errorMessage)}`,
      )
    }

    // Verify we have an authorization code
    if (!code) {
      console.error("No authorization code received")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/qqcatalyst/oauth?error=no_authorization_code`)
    }

    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code)
    console.log("Token exchange successful")

    // Redirect to OAuth page with access token (similar to React app pattern)
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/qqcatalyst/oauth?access_token=${tokenData.access_token}&success=oauth_completed`,
    )

    // Also set secure cookies with tokens for server-side use
    response.cookies.set("qqc_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in || 3600,
    })

    if (tokenData.refresh_token) {
      response.cookies.set("qqc_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400 * 30, // 30 days
      })
    }

    console.log("QQCatalyst OAuth callback completed successfully")
    return response
  } catch (error) {
    console.error("QQCatalyst callback error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/qqcatalyst/oauth?error=${encodeURIComponent(error.message)}`,
    )
  }
}

async function exchangeCodeForToken(code: string) {
  const clientId = process.env.QQ_CLIENT_ID || "fdc3c5d6-4bd4-40c0-b681-d2ad2f5db414"
  const clientSecret = process.env.QQ_CLIENT_SECRET
  const tokenUrl = process.env.QQ_TOKEN_URL || "https://login.qqcatalyst.com/oauth/token"
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/qqcatalyst/callback`

  console.log("Exchanging code for token...")
  console.log("Token URL:", tokenUrl)
  console.log("Client ID:", clientId)

  if (!clientSecret) {
    throw new Error("QQCatalyst client secret not configured")
  }

  // Create Basic Auth header for client credentials
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const requestBody = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  })

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
      Accept: "application/json",
    },
    body: requestBody.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Token exchange failed:", response.status, errorText)
    throw new Error(`Failed to exchange code for token: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data
}
