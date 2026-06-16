"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbProps {
  clientId: string
  clientName: string
}

export function Breadcrumb({ clientId, clientName }: BreadcrumbProps) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Build breadcrumb items
  const breadcrumbs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Clients", href: "/clients" },
    { name: clientName, href: `/clients/${clientId}` },
  ]

  // Add additional segments if they exist
  if (segments.length > 2) {
    const pageName = segments[2]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    breadcrumbs.push({
      name: pageName,
      href: `/${segments.slice(0, 3).join("/")}`,
    })
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />}
          <Link href={breadcrumb.href} className="flex items-center hover:text-blue-600 transition-colors">
            {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4 mr-1" />}
            {breadcrumb.name}
          </Link>
        </div>
      ))}
    </nav>
  )
}
