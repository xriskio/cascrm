"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Eye,
  FileText,
  Info,
  AlignLeft,
  Settings,
  CreditCard,
  File,
  Mail,
  FileSpreadsheet,
  DollarSign,
  Users,
  ClipboardList,
  BarChart2,
  AlertTriangle,
  Clock,
  ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ClientTopNavProps {
  client: {
    id: string
    name: string
    business_name?: string
  }
}

export function ClientTopNav({ client }: ClientTopNavProps) {
  const pathname = usePathname()
  const baseUrl = `/clients/${client.id}`

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const navigation = [
    { name: "Overview", href: `${baseUrl}`, icon: Eye },
    { name: "Policies", href: `${baseUrl}/policies`, icon: FileText },
    { name: "Policy Info", href: `${baseUrl}/policy-info`, icon: Info },
    { name: "Details", href: `${baseUrl}/details`, icon: AlignLeft },
    { name: "Adjustments", href: `${baseUrl}/adjustments`, icon: Settings },
    { name: "Billing", href: `${baseUrl}/billing`, icon: CreditCard },
    { name: "Files", href: `${baseUrl}/files`, icon: File },
    { name: "Emails", href: `${baseUrl}/emails`, icon: Mail },
    { name: "ACORD", href: `${baseUrl}/acord`, icon: FileSpreadsheet },
    { name: "Agency Commissions", href: `${baseUrl}/commissions`, icon: DollarSign },
    { name: "Producers", href: `${baseUrl}/producers`, icon: Users },
    { name: "Tasks/Notes", href: `${baseUrl}/tasks`, icon: ClipboardList },
    { name: "Quotes", href: `${baseUrl}/quotes`, icon: BarChart2 },
    { name: "Claims", href: `${baseUrl}/claims`, icon: AlertTriangle },
    { name: "Log", href: `${baseUrl}/log`, icon: Clock },
  ]

  return (
    <div className="bg-white border-b shadow-sm">
      {/* Client Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 bg-blue-500">
            <AvatarFallback className="bg-blue-500 text-white">{getInitials(client.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{client.name}</h1>
            <p className="text-sm text-gray-500">{client.business_name}</p>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation */}
      <ScrollArea className="w-full">
        <div className="flex items-center px-6 py-2 space-x-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                )}
              >
                <item.icon className="mr-2 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {item.name}
                {isActive && <ChevronRight className="ml-1 h-3 w-3" />}
              </Link>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
