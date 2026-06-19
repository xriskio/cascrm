import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if environment variables are set
    const envStatus = {
      QQ_CLIENT_ID: !!process.env.QQ_CLIENT_ID,
      QQ_CLIENT_SECRET: !!process.env.QQ_CLIENT_SECRET,
      QQ_USERNAME: !!process.env.QQ_USERNAME,
      QQ_PASSWORD: !!process.env.QQ_PASSWORD,
      QQ_TOKEN_URL: !!process.env.QQ_TOKEN_URL,
    }

    return NextResponse.json({
      status: envStatus,
      allSet: Object.values(envStatus).every(Boolean),
    })
  } catch (error) {
    console.error("Error checking environment variables:", error)
    return NextResponse.json(
      {
        error: "Failed to check environment variables",
        details: (error as any).message,
      },
      { status: 500 },
    )
  }
}
