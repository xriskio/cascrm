import type React from "react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-muted">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        <div className="h-16 flex items-center justify-center border-b border-border">
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
        <nav className="p-4">
          <Link href="/admin" className="block px-4 py-2 hover:bg-muted">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block px-4 py-2 hover:bg-muted">
            Users
          </Link>
          <Link href="/admin/permissions" className="block px-4 py-2 hover:bg-muted">
            Permissions
          </Link>
          <Link href="/admin/products" className="block px-4 py-2 hover:bg-muted">
            Products
          </Link>
          <Link href="/admin/orders" className="block px-4 py-2 hover:bg-muted">
            Orders
          </Link>
          <Link href="/admin/qqcatalyst" className="block px-4 py-2 hover:bg-muted">
            QQCatalyst Import
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  )
}
