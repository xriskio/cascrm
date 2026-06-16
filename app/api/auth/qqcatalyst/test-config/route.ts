import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = {
      clientId: process.env.QQC_CLIENT_ID ? "✅ Present" : "❌ Missing",
      clientSecret: process.env.QQC_CLIENT_SECRET ? "✅ Present" : "❌ Missing",
      tokenUrl: process.env.QQC_TOKEN_URL || "Using default",
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || "Using localhost",
      nodeEnv: process.env.NODE_ENV,
    }

    console.log("QQCatalyst configuration check:", config)

    return NextResponse.json({
      success: true,
      config,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/qqcatalyst/callback`,
    })
  } catch (error) {
    console.error("Config test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
