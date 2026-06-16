export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 Testing QQCatalyst connection...")

    // Check environment variables
    const envVars = {
      QQ_BASE_URL: process.env.QQ_BASE_URL,
      QQ_OAUTH_URL: process.env.QQ_OAUTH_URL,
      QQ_CLIENT_ID: process.env.QQ_CLIENT_ID ? "Set" : "Missing",
      QQ_CLIENT_SECRET: process.env.QQ_CLIENT_SECRET ? "Set" : "Missing",
      QQ_USERNAME: process.env.QQ_USERNAME ? "Set" : "Missing",
      QQ_PASSWORD: process.env.QQ_PASSWORD ? "Set" : "Missing",
    }

    console.log("Environment variables:", envVars)

    // Try to get a token
    const QQ_OAUTH_URL = process.env.QQ_OAUTH_URL || "https://login.qqcatalyst.com/oauth/token"

    const tokenRes = await fetch(QQ_OAUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "password",
        username: process.env.QQ_USERNAME!,
        password: process.env.QQ_PASSWORD!,
        client_id: process.env.QQ_CLIENT_ID!,
        client_secret: process.env.QQ_CLIENT_SECRET!,
      }),
    })

    const tokenResult = {
      status: tokenRes.status,
      statusText: tokenRes.statusText,
      headers: Object.fromEntries(tokenRes.headers.entries()),
    }

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json()
      return NextResponse.json({
        success: true,
        message: "QQCatalyst connection successful",
        environment: envVars,
        tokenTest: {
          ...tokenResult,
          hasAccessToken: !!tokenData.access_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in,
        },
      })
    } else {
      const errorText = await tokenRes.text()
      return NextResponse.json({
        success: false,
        message: "QQCatalyst connection failed",
        environment: envVars,
        tokenTest: {
          ...tokenResult,
          error: errorText,
        },
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
