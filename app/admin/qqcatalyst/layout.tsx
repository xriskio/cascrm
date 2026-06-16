import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Book, Users, Settings } from "lucide-react"

export default function QQCatalystLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">QQCatalyst Integration</h1>
        </div>
      </div>

      <nav className="flex space-x-2 mb-6 border-b pb-4">
        <Link href="/admin/qqcatalyst">
          <Button variant="ghost" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/admin/qqcatalyst/api-docs">
          <Button variant="ghost" size="sm">
            <Book className="mr-2 h-4 w-4" />
            API Docs
          </Button>
        </Link>
        <Link href="/admin/qqcatalyst/contacts">
          <Button variant="ghost" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Contacts
          </Button>
        </Link>
        <Link href="/admin/qqcatalyst/test">
          <Button variant="ghost" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Test
          </Button>
        </Link>
      </nav>

      {children}
    </div>
  )
}
