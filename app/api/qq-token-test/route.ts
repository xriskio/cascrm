export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Testing QQCatalyst token...")

    // 1. Check environment variables
    const envCheck = {
      QQ_BASE_URL: process.env.QQ_BASE_URL || "Not set",
      QQ_OAUTH_URL: process.env.QQ_OAUTH_URL || "Not set",
      QQ_TOKEN_URL: process.env.QQ_TOKEN_URL || "Not set",
      QQ_CLIENT_ID: process.env.QQ_CLIENT_ID ? `Set (${process.env.QQ_CLIENT_ID.substring(0, 8)}...)` : "❌ Missing",
      QQ_CLIENT_SECRET: process.env.QQ_CLIENT_SECRET
        ? `Set (${process.env.QQ_CLIENT_SECRET.substring(0, 8)}...)`
        : "❌ Missing",
      QQ_USERNAME: process.env.QQ_USERNAME ? `Set (${process.env.QQ_USERNAME})` : "❌ Missing",
      QQ_PASSWORD: process.env.QQ_PASSWORD ? "Set (hidden)" : "❌ Missing",
    }

    console.log("Environment variables:", envCheck)

    // 2. Try different token URLs to see which one works
    const tokenUrls = [
      process.env.QQ_TOKEN_URL,
      process.env.QQ_OAUTH_URL,
      "https://login.qqcatalyst.com/oauth/token",
      "https://api.qqcatalyst.com/oauth/token",
    ].filter(Boolean)

    const tokenResults: any[] = []

    for (const tokenUrl of tokenUrls) {
      console.log(`🔐 Testing token URL: ${tokenUrl}`)

      try {
        // Test with password grant
        const passwordGrantRes = await fetch(tokenUrl as string, {
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

        const passwordText = await passwordGrantRes.text()
        console.log(`Password grant response (${passwordGrantRes.status}):`, passwordText.substring(0, 200))

        const passwordResult = {
          url: tokenUrl,
          method: "password grant",
          status: passwordGrantRes.status,
          success: passwordGrantRes.ok,
          contentType: passwordGrantRes.headers.get("content-type"),
          response: passwordText.substring(0, 500),
          isJson: false,
          tokenData: null as any,
        }

        if (passwordGrantRes.ok && passwordText.startsWith("{")) {
          try {
            passwordResult.tokenData = JSON.parse(passwordText)
            passwordResult.isJson = true
          } catch (e) {
            console.log("Failed to parse as JSON")
          }
        }

        tokenResults.push(passwordResult)

        // Also try client_credentials grant
        const clientCredentialsRes = await fetch(tokenUrl as string, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: process.env.QQ_CLIENT_ID!,
            client_secret: process.env.QQ_CLIENT_SECRET!,
          }),
        })

        const clientText = await clientCredentialsRes.text()
        console.log(`Client credentials response (${clientCredentialsRes.status}):`, clientText.substring(0, 200))

        const clientResult = {
          url: tokenUrl,
          method: "client_credentials grant",
          status: clientCredentialsRes.status,
          success: clientCredentialsRes.ok,
          contentType: clientCredentialsRes.headers.get("content-type"),
          response: clientText.substring(0, 500),
          isJson: false,
          tokenData: null as any,
        }

        if (clientCredentialsRes.ok && clientText.startsWith("{")) {
          try {
            clientResult.tokenData = JSON.parse(clientText)
            clientResult.isJson = true
          } catch (e) {
            console.log("Failed to parse as JSON")
          }
        }

        tokenResults.push(clientResult)
      } catch (error) {
        console.error(`Error testing ${tokenUrl}:`, error)
        tokenResults.push({
          url: tokenUrl,
          method: "error",
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // 3. Test API endpoints with any successful token
    const successfulToken = tokenResults.find((r) => r.success && r.tokenData?.access_token)
    const apiTests = []

    if (successfulToken) {
      console.log("✅ Found working token, testing API endpoints...")

      const baseUrl = process.env.QQ_BASE_URL || "https://api.qqcatalyst.com"
      const accessToken = successfulToken.tokenData.access_token

      const testEndpoints = [
        "/v1/Contacts/LastModifiedCreated?startDate=2024-01-01&endDate=2024-12-31&pageNumber=1&pageSize=1",
        "/v1/Contacts",
        "/v1/Policies",
        "/v1/Carriers",
      ]

      for (const endpoint of testEndpoints) {
        try {
          console.log(`🧪 Testing endpoint: ${baseUrl}${endpoint}`)

          const apiRes = await fetch(`${baseUrl}${endpoint}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })

          const apiText = await apiRes.text()
          console.log(`API response (${apiRes.status}):`, apiText.substring(0, 200))

          apiTests.push({
            endpoint,
            status: apiRes.status,
            success: apiRes.ok,
            contentType: apiRes.headers.get("content-type"),
            isHtml: apiText.includes("<!DOCTYPE") || apiText.includes("<html"),
            isJson: apiText.startsWith("{") || apiText.startsWith("["),
            response: apiText.substring(0, 300),
          })
        } catch (error) {
          apiTests.push({
            endpoint,
            status: 0,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Token test completed",
      environment: envCheck,
      tokenTests: tokenResults,
      apiTests,
      summary: {
        workingTokenFound: !!successfulToken,
        workingTokenMethod: successfulToken?.method,
        workingTokenUrl: successfulToken?.url,
        apiEndpointsReturningJson: apiTests.filter((t) => t.isJson).length,
        apiEndpointsReturningHtml: apiTests.filter((t) => t.isHtml).length,
      },
    })
  } catch (error: any) {
    console.error("💥 Token test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
