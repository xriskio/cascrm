import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, template, data } = await request.json()

    console.log(`[PLACEHOLDER] Would send email:`, {
      to,
      subject,
      template,
      data,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: `placeholder-${Date.now()}`,
        message: "Email functionality disabled - would have sent email",
      },
    })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json({ success: false, error: "Email functionality disabled" }, { status: 500 })
  }
}
