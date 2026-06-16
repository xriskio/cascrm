import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const OAUTH_URL = "https://login.qqcatalyst.com/oauth/token"

export async function POST() {
  try {
    console.log("🔐 Testing QQCatalyst authentication...")

    // Check environment variables
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
      return NextResponse.json(
        {
          success: false,
          message: `Missing environment variables: ${missingVars.join(", ")}`,
          envCheck: requiredVars,
        },
        { status: 400 },
      )
    }

    // Test different auth methods
    const authMethods = [
      {
        name: "password_credentials",
        params: {
          grant_type: "password_credentials",
          client_id: process.env.QQ_CLIENT_ID!,
          client_secret: process.env.QQ_CLIENT_SECRET!,
          username: process.env.QQ_USERNAME!,
          password: process.env.QQ_PASSWORD!,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
      {
        name: "password",
        params: {
          grant_type: "password",
          client_id: process.env.QQ_CLIENT_ID!,
          client_secret: process.env.QQ_CLIENT_SECRET!,
          username: process.env.QQ_USERNAME!,
          password: process.env.QQ_PASSWORD!,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
      {
        name: "password_with_basic_auth",
        params: {
          grant_type: "password",
          username: process.env.QQ_USERNAME!,
          password: process.env.QQ_PASSWORD!,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${process.env.QQ_CLIENT_ID}:${process.env.QQ_CLIENT_SECRET}`).toString("base64")}`,
          Accept: "application/json",
        },
      },
    ]

    const results = []

    for (const method of authMethods) {
      try {
        console.log(`🔄 Testing ${method.name}...`)

        const response = await fetch(OAUTH_URL, {
          method: "POST",
          headers: method.headers,
          body: new URLSearchParams(method.params).toString(),
        })

        const responseText = await response.text()
        let responseData
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = responseText
        }

        results.push({
          method: method.name,
          status: response.status,
          success: response.ok,
          response: responseData,
        })

        if (response.ok) {
          console.log(`✅ ${method.name} succeeded`)
          break
        } else {
          console.log(`❌ ${method.name} failed: ${response.status}`)
        }
      } catch (error) {
        results.push({
          method: method.name,
          status: "error",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return NextResponse.json({
      success: results.some((r) => r.success),
      message: "Authentication test completed",
      results,
      envVarsPresent: Object.keys(requiredVars).filter((key) => requiredVars[key as keyof typeof requiredVars]),
    })
  } catch (error) {
    console.error("Auth test failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST()
}
