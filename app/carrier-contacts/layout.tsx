import type React from "react"

export default function CarrierContactsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Just return children - navigation is handled in root layout
  return <>{children}</>
}
