export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { qqAuth } from "@/lib/qqcatalyst/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get("access_token")

    let token = accessToken

    // If no token provided in query, try to get from our auth system
    if (!token) {
      try {
        token = await qqAuth.getAccessToken()
      } catch (error) {
        return NextResponse.json(
          {
            error: "No access token available",
            details: "Please authenticate first",
          },
          { status: 401 },
        )
      }
    }

    // Make a test API call to QQCatalyst (similar to React app)
    const apiResponse = await fetch("http://api.qqcatalyst.com/v1/contacts", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!apiResponse.ok) {
      throw new Error(`API call failed: ${apiResponse.status}`)
    }

    const apiData = await apiResponse.json()

    return NextResponse.json({
      success: true,
      message: "API call successful",
      token_preview: token.substring(0, 20) + "...",
      api_data: apiData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("QQCatalyst test API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
