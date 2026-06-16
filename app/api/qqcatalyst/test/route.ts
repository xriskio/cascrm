export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"

const QQ_API = "https://api.qqcatalyst.com/v1"
const OAUTH_URL = "https://login.qqcatalyst.com/oauth/token"

async function getToken() {
  console.log("🔐 Attempting QQCatalyst authentication...")

  // Check if all required environment variables are present
  const requiredVars = {
    QQ_CLIENT_ID: process.env.QQ_CLIENT_ID,
    QQ_CLIENT_SECRET: process.env.QQ_CLIENT_SECRET,
    QQ_USERNAME: process.env.QQ_USERNAME,
    QQ_PASSWORD: process.env.QQ_PASSWORD,
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`)
  }

  // Try the password_credentials grant type first (most common)
  const params = new URLSearchParams({
    grant_type: "password",
    client_id: process.env.QQ_CLIENT_ID!,
    client_secret: process.env.QQ_CLIENT_SECRET!,
    username: process.env.QQ_USERNAME!,
    password: process.env.QQ_PASSWORD!,
  })

  console.log("🔄 Making auth request to:", OAUTH_URL)
  console.log("📝 Grant type: password")

  let response = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  })

  // If standard password grant fails, try with Basic Auth header
  if (!response.ok) {
    console.log("⚠️ Standard auth failed, trying Basic Auth...")

    const basicAuth = Buffer.from(`${process.env.QQ_CLIENT_ID}:${process.env.QQ_CLIENT_SECRET}`).toString("base64")

    const basicParams = new URLSearchParams({
      grant_type: "password",
      username: process.env.QQ_USERNAME!,
      password: process.env.QQ_PASSWORD!,
    })

    response = await fetch(OAUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/json",
      },
      body: basicParams.toString(),
    })
  }

  if (!response.ok) {
    const text = await response.text()
    console.error("❌ All auth methods failed")
    console.error(`Status: ${response.status}`)
    console.error(`Response: ${text}`)
    throw new Error(`Auth failed: ${response.status} ${text}`)
  }

  const data = await response.json()
  console.log("✅ Authentication successful")
  return data.access_token as string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const endpoint = searchParams.get("endpoint") || "Contacts/LastModifiedCreated"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log(`Testing QQCatalyst API endpoint: ${endpoint} with limit: ${limit}`)

    const token = await getToken()

    // Build the URL with proper query parameters for GET request
    let url: string
    if (endpoint.includes("?")) {
      // Endpoint already has query params
      url = `${QQ_API}/${endpoint}&pageSize=${limit}`
    } else if (endpoint === "Contacts/LastModifiedCreated") {
      // Special handling for LastModifiedCreated endpoint
      url = `${QQ_API}/${endpoint}?startDate=2025-01-01&endDate=2025-06-09&pageNumber=1&pageSize=${limit}`
    } else {
      // Standard endpoint
      url = `${QQ_API}/${endpoint}?pageNumber=1&pageSize=${limit}`
    }

    console.log(`Making GET request to: ${url}`)

    const response = await fetch(url, {
      method: "GET", // Explicitly use GET
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    console.log(`Response status: ${response.status}`)
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const text = await response.text()
      console.error(`API request failed: ${response.status} - ${text}`)
      return NextResponse.json(
        {
          success: false,
          message: `API request failed: ${response.status} - ${text}`,
          endpoint,
          url,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`Response data keys:`, Object.keys(data))

    // Handle different response structures
    const items = Array.isArray(data)
      ? data
      : data.value || data.items || data.Contacts || data.Policies || data.Data || []

    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${items.length} items from ${endpoint}`,
      count: items.length,
      endpoint,
      url,
      sample: items.length > 0 ? items[0] : null,
      fullResponse: data, // Include full response for debugging
    })
  } catch (error) {
    console.error("Error testing QQCatalyst API:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
