"use client"

import { useState } from "react"
import { Search, Bell, Plus, Settings, HelpCircle, Monitor, MessageSquare, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: "renewal" | "endorsement" | "meeting" | "task"
  isRead: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Policy Renewal Due",
    message: "Policy renewal due for Universal Trucking",
    time: "2 hours ago",
    type: "renewal",
    isRead: false,
  },
  {
    id: "2",
    title: "New Endorsement Request",
    message: "New endorsement request from Global Linen",
    time: "5 hours ago",
    type: "endorsement",
    isRead: false,
  },
  {
    id: "3",
    title: "Client Meeting Notes",
    message: "Reminder: Submit updated underwriting info for Global Linen by 5/30",
    time: "1 day ago",
    type: "meeting",
    isRead: true,
  },
  {
    id: "4",
    title: "Task Assignment",
    message: "New task assigned: Review ABC Corp submission",
    time: "2 days ago",
    type: "task",
    isRead: true,
  },
]

export function FacebookStyleHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState(mockNotifications)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "renewal":
        return "🔄"
      case "endorsement":
        return "📋"
      case "meeting":
        return "📅"
      case "task":
        return "✅"
      default:
        return "📢"
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 hidden sm:block">Casurance</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search clients, policies, endorsements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-100 border-0 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Add Button */}
          <Link href="/submissions/new">
            <Button variant="ghost" size="sm" className="rounded-full p-2 hover:bg-gray-100">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full p-2 hover:bg-gray-100 relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 hover:bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? "bg-blue-50" : ""}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full p-1 hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-600 text-white">MW</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              {/* User Profile Section */}
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-600 text-white text-lg">MW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">Man Wale</p>
                    <p className="text-sm text-gray-600">Senior Agent</p>
                  </div>
                </div>

                {/* Business Profiles */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">IL</span>
                    </div>
                    <span className="font-medium">Insure LIMOS</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">C</span>
                    </div>
                    <div>
                      <p className="font-medium">Casurance.com</p>
                      <p className="text-xs text-gray-600">Commercial Insurance Services</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mb-4">
                  👥 See all profiles
                </Button>
              </div>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center space-x-3 p-3">
                  <Settings className="h-5 w-5" />
                  <span>Settings & privacy</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center space-x-3 p-3">
                <HelpCircle className="h-5 w-5" />
                <span>Help & support</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center space-x-3 p-3">
                <Monitor className="h-5 w-5" />
                <span>Display & accessibility</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center space-x-3 p-3">
                <MessageSquare className="h-5 w-5" />
                <span>Give feedback</span>
                <span className="ml-auto text-xs text-gray-500">CTRL B</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="flex items-center space-x-3 p-3 text-red-600 hover:text-red-700">
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
