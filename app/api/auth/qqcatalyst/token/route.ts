import { NextResponse } from "next/server"
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    // Get credentials from environment variables
    const clientId = process.env.QQ_CLIENT_ID || process.env.QQC_CLIENT_ID
    const clientSecret = process.env.QQ_CLIENT_SECRET || process.env.QQC_CLIENT_SECRET
    const username = process.env.QQ_USERNAME || process.env.QQC_USERNAME
    const password = process.env.QQ_PASSWORD || process.env.QQC_PASSWORD
    const tokenUrl = process.env.QQ_TOKEN_URL || process.env.QQC_TOKEN_URL || "https://login.qqcatalyst.com/oauth/token"

    if (!clientId || !clientSecret || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing QQCatalyst credentials in environment variables",
        },
        { status: 500 },
      )
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
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: `Failed to get token: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const tokenData = await response.json()

    // Store token in a secure way (this is just for demo purposes)
    // In production, you'd want to store this in a more secure way
    const tokenPreview = tokenData.access_token ? `${tokenData.access_token.substring(0, 10)}...` : null

    return NextResponse.json({
      success: true,
      message: "Successfully authenticated with QQCatalyst",
      tokenPreview,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
    })
  } catch (error) {
    console.error("Error in QQCatalyst token route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password, clientId, clientSecret, tokenUrl } = body

    if (!clientId || !clientSecret || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required credentials",
        },
        { status: 400 },
      )
    }

    // Create Basic Auth header
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    // Set up request body
    const formData = new URLSearchParams()
    formData.append("grant_type", "password")
    formData.append("username", username)
    formData.append("password", password)

    // Make the request
    const response = await fetch(tokenUrl || "https://login.qqcatalyst.com/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: `Failed to get token: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const tokenData = await response.json()

    // Store token in a secure way (this is just for demo purposes)
    // In production, you'd want to store this in a more secure way
    const tokenPreview = tokenData.access_token ? `${tokenData.access_token.substring(0, 10)}...` : null

    return NextResponse.json({
      success: true,
      message: "Successfully authenticated with QQCatalyst",
      tokenPreview,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
    })
  } catch (error) {
    console.error("Error in QQCatalyst token route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
