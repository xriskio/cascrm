"use client"

import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function CasHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
      {/* Left side - Logo and Search */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Casurance</span>
        </div>

        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search clients, policies, endorsements..."
              className="pl-10 pr-4 py-2 w-full bg-muted border-border rounded-full focus:bg-card focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Right side - Actions and Profile */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="rounded-full p-2">
          <Plus className="w-5 h-5" />
        </Button>

        <NotificationBell />

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">MW</span>
          </div>
        </div>
      </div>
    </div>
  )
}
