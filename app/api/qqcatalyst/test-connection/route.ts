import { type NextRequest, NextResponse } from "next/server"
import { getQQCatalystClient } from "@/lib/qqcatalyst/client"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("Testing QQCatalyst API connection...")
    
    // Get the QQCatalyst client
    const qqClient = getQQCatalystClient()
    
    // Try to get a token first
    const token = await qqClient.getToken()
    console.log("✅ Successfully obtained QQCatalyst access token")
    
    // Test a simple API call - get carriers list
    const carriersResponse = await qqClient.request("Carriers")
    
    console.log("✅ Successfully called QQCatalyst API")
    
    return NextResponse.json({
      success: true,
      message: "QQCatalyst API connection successful!",
      hasToken: !!token,
      apiCallSuccessful: !!carriersResponse,
      sampleData: {
        carriers: Array.isArray(carriersResponse) ? carriersResponse.length : "N/A"
      }
    })
  } catch (error) {
    console.error("❌ QQCatalyst API connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        error: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
}
