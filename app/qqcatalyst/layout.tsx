"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Database, Key, TestTube, Download, Upload, Users, FileText, Settings, Shield, BookOpen } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/qqcatalyst", icon: Database },
  { name: "Authentication", href: "/qqcatalyst/auth", icon: Key },
  { name: "Token Status", href: "/qqcatalyst/token-status", icon: Shield },
  { name: "API Testing", href: "/qqcatalyst/test", icon: TestTube },
  { name: "Data Import", href: "/qqcatalyst/import", icon: Download },
  { name: "Data Sync", href: "/qqcatalyst/sync", icon: Upload },
  { name: "Data Viewer", href: "/qqcatalyst/data-viewer", icon: Database },
  { name: "Contacts", href: "/qqcatalyst/contacts", icon: Users },
  { name: "Policy Info", href: "/qqcatalyst/policy-info", icon: FileText },
  { name: "Commercial Auto", href: "/qqcatalyst/commercial-auto", icon: FileText },
  { name: "Database Setup", href: "/qqcatalyst/database", icon: Settings },
  { name: "API Docs", href: "/qqcatalyst/api-docs", icon: BookOpen },
]

export default function QQCatalystLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            QQCatalyst
          </h2>
          <p className="text-sm text-muted-foreground mt-1">API Integration</p>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
