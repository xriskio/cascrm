import { NextResponse } from "next/server"
import { fetchContactsLastModified, fetchPoliciesLastModified } from "@/lib/qqcatalyst/api-enhanced"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET() {
  try {
    console.log("🧪 Testing QQCatalyst API connection...")
    
    // Test fetching just 1 page of contacts
    const contactsResult = await fetchContactsLastModified({
      pageNumber: 1,
      pageSize: 10,
    })

    console.log("✅ Contacts fetch successful:", {
      count: contactsResult.data.length,
      total: contactsResult.totalItems,
    })

    // Test fetching just 1 page of policies  
    const policiesResult = await fetchPoliciesLastModified({
      pageNumber: 1,
      pageSize: 10,
    })

    console.log("✅ Policies fetch successful:", {
      count: policiesResult.data.length,
      total: policiesResult.totalItems,
    })

    return NextResponse.json({
      success: true,
      contacts: {
        fetched: contactsResult.data.length,
        total: contactsResult.totalItems,
      },
      policies: {
        fetched: policiesResult.data.length,
        total: policiesResult.totalItems,
      },
      message: "QQCatalyst API connection successful!",
    })
  } catch (error) {
    console.error("❌ QQCatalyst API test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
