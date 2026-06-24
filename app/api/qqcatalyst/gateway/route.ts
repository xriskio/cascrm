export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { getQQCatalystToken } from "@/app/actions/qqcatalyst-token-actions"
import { requireApiPermission } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiPermission("delete")
    if (!auth.authorized) return auth.response

    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get("token_id")
    const endpoint = searchParams.get("endpoint") || "/v1/Carriers"
    const accessToken = searchParams.get("access_token")

    let token = accessToken

    // If token_id is provided, get token from database
    if (tokenId && !accessToken) {
      const tokenResult = await getQQCatalystToken(tokenId)
      if (!tokenResult.success || !tokenResult.data) {
        return NextResponse.json({ error: "Token not found" }, { status: 404 })
      }
      token = tokenResult.data.access_token
    }

    if (!token) {
      return NextResponse.json({ error: "No access token provided" }, { status: 400 })
    }

    // Make API call to QQCatalyst (similar to the server implementation)
    const apiHost = process.env.QQCATALYST_API_URL || "http://api.qqcatalyst.com"
    const apiUrl = `${apiHost}${endpoint}`

    console.log("Making API request to:", apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("QQCatalyst API error:", response.status, errorText)
      return NextResponse.json(
        { error: `API call failed: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Gateway error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiPermission("delete")
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const { tokenId, endpoint = "/v1/Carriers", data: postData } = body

    // Get token from database
    const tokenResult = await getQQCatalystToken(tokenId)
    if (!tokenResult.success || !tokenResult.data) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 })
    }

    const token = tokenResult.data.access_token
    const apiHost = process.env.QQCATALYST_API_URL || "http://api.qqcatalyst.com"
    const apiUrl = `${apiHost}${endpoint}`

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `API call failed: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Gateway POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
