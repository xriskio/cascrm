import { type NextRequest, NextResponse } from "next/server"
import { QQ_CONFIG } from "@/lib/qqcatalyst/config"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Check if all required environment variables are set
    const status = {
      QQ_CLIENT_ID: !!QQ_CONFIG.CLIENT_ID,
      QQ_CLIENT_SECRET: !!QQ_CONFIG.CLIENT_SECRET,
      QQ_USERNAME: !!QQ_CONFIG.USERNAME,
      QQ_PASSWORD: !!QQ_CONFIG.PASSWORD,
      QQ_TOKEN_URL: !!QQ_CONFIG.TOKEN_URL,
      QQ_BASE_URL: !!QQ_CONFIG.BASE_URL,
    }

    const allSet = Object.values(status).every(Boolean)

    return NextResponse.json({
      success: true,
      allConfigured: allSet,
      status,
      config: {
        TOKEN_URL: QQ_CONFIG.TOKEN_URL,
        BASE_URL: QQ_CONFIG.BASE_URL,
        CLIENT_ID: QQ_CONFIG.CLIENT_ID ? `${QQ_CONFIG.CLIENT_ID.substring(0, 8)}...` : "Not set",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        allConfigured: false,
      },
      { status: 500 },
    )
  }
}
