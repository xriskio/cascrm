"use client"

import { useState } from "react"
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
  ChevronLeftCircle,
  ChevronRightCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ClientSidebarProps {
  client: {
    id: string
    name: string
    business_name?: string
  }
}

export function ClientSidebar({ client }: ClientSidebarProps) {
  const pathname = usePathname()
  const baseUrl = `/clients/${client.id}`
  const [collapsed, setCollapsed] = useState(false)

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
    <div
      className={cn("bg-card border-r h-full flex flex-col transition-all duration-300", collapsed ? "w-16" : "w-64")}
    >
      <div className={cn("border-b flex items-center", collapsed ? "justify-center p-2" : "p-4")}>
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 bg-blue-500">
              <AvatarFallback className="bg-blue-500 text-white">{getInitials(client.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{client.name}</h2>
              <p className="text-sm text-muted-foreground">{client.business_name}</p>
            </div>
          </div>
        ) : (
          <Avatar className="h-10 w-10 bg-blue-500">
            <AvatarFallback className="bg-blue-500 text-white">{getInitials(client.name)}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <TooltipProvider delayDuration={0}>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return collapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center py-3 text-sm",
                      isActive
                        ? "bg-blue-500/10 text-blue-600 font-medium border-l-4 border-blue-600"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-sm",
                  isActive
                    ? "bg-blue-500/10 text-blue-600 font-medium border-l-4 border-blue-600"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )
          })}
        </TooltipProvider>
      </nav>
      <div className="p-2 border-t flex justify-center">
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0 rounded-full">
          {collapsed ? <ChevronRightCircle className="h-5 w-5" /> : <ChevronLeftCircle className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}
