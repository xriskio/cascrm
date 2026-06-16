"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/auth")
  const isDashboard = pathname === "/dashboard" || pathname?.startsWith("/dashboard/")

  if (isAuthPage || isDashboard) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0B]">
      <TopNavigation />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
