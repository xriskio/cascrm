import { NextResponse } from "next/server"
import { requireApiPermission } from "@/lib/api-auth"
import { qqAuth } from "@/lib/qqcatalyst/auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST() {
  try {
    const auth = await requireApiPermission("delete")
    if (!auth.authorized) return auth.response

    const token = await qqAuth.getAccessToken()
    
    return NextResponse.json({
      access_token: token,
      success: true
    })
  } catch (error: any) {
    console.error("Token generation error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to generate token",
        success: false
      },
      { status: 500 }
    )
  }
}
