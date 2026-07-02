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
    const storedState = request.cookies.get("oauth_state")?.value
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"

    console.log("Callback params:", { code: code ? "Present" : "Missing", state: state ? "Present" : "Missing", error, errorDescription })

    // Check for OAuth errors
    if (error) {
      console.error("OAuth error from QQCatalyst:", error, errorDescription)
      const errorMessage = errorDescription || error
      const response = NextResponse.redirect(`${appUrl}/qqcatalyst/oauth?error=${encodeURIComponent(errorMessage)}`)
      response.cookies.delete("oauth_state")
      return response
    }

    if (!state || !storedState || state !== storedState) {
      console.error("OAuth state validation failed")
      const response = NextResponse.redirect(`${appUrl}/qqcatalyst/oauth?error=invalid_oauth_state`)
      response.cookies.delete("oauth_state")
      return response
    }

    // Verify we have an authorization code
    if (!code) {
      console.error("No authorization code received")
      const response = NextResponse.redirect(`${appUrl}/qqcatalyst/oauth?error=no_authorization_code`)
      response.cookies.delete("oauth_state")
      return response
    }

    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code)
    console.log("Token exchange successful")

    if (!tokenData.access_token) {
      throw new Error("QQCatalyst token response did not include an access token")
    }

    // Keep tokens in httpOnly cookies; never place them in URLs where logs/referrers can expose them.
    const response = NextResponse.redirect(`${appUrl}/qqcatalyst/oauth?success=oauth_completed`)
    response.cookies.delete("oauth_state")

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
    const message = error instanceof Error ? error.message : "Unknown QQCatalyst callback error"
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}/qqcatalyst/oauth?error=${encodeURIComponent(message)}`,
    )
    response.cookies.delete("oauth_state")
    return response
  }
}

async function exchangeCodeForToken(code: string) {
  const clientId = process.env.QQ_CLIENT_ID || ""
  const clientSecret = process.env.QQ_CLIENT_SECRET
  const tokenUrl = process.env.QQ_TOKEN_URL || "https://login.qqcatalyst.com/oauth/token"
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}/api/auth/qqcatalyst/callback`

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
