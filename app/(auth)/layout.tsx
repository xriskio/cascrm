import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Just return children - auth styling is handled in root layout
  return <>{children}</>
}
