import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Test Suite - InsureTrac",
  description: "Testing tools for InsureTrac application",
}

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">InsureTrac Test Suite</h1>
          <p className="text-sm text-muted-foreground">Development and deployment testing tools</p>
        </div>
      </div>
      {children}
    </div>
  )
}
