import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Logging out from QQCatalyst")

    const response = NextResponse.json({ success: true, message: "Logged out successfully" })

    // Clear all QQCatalyst-related cookies
    response.cookies.delete("qqc_access_token")
    response.cookies.delete("qqc_refresh_token")
    response.cookies.delete("oauth_state")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as any).message,
      },
      { status: 500 },
    )
  }
}
