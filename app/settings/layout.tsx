import type React from "react"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Just return children - navigation is handled in root layout
  return <>{children}</>
}
