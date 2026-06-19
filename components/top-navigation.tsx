"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  FileText,
  Users,
  Phone,
  DollarSign,
  FileCheck,
  FolderOpen,
  Settings,
  UserPlus,
  RefreshCw,
  Briefcase,
  ClipboardList,
  AlertCircle,
  Shield,
  CheckSquare,
  Building2,
  UserCog,
  ShieldCheck,
  FileSearch,
  BookOpen,
  ClipboardCheck,
  User,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Database,
  PiIcon as Api,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { GlobalSearch } from "@/components/global-search"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { createClient } from "@/lib/supabase/client"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Submissions", href: "/submissions", icon: FileText },
  { name: "Market Submissions", href: "/market-submissions", icon: Briefcase },
  { name: "Renewals", href: "/renewals", icon: RefreshCw },
  { name: "Renewal Workflow", href: "/renewals/workflow", icon: RefreshCw },
  { name: "Leads", href: "/leads", icon: UserPlus },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Call Log", href: "/call-log", icon: Phone },
  { name: "Quotes", href: "/quotes", icon: DollarSign },
  { name: "Carrier Contacts", href: "/carrier-contacts", icon: Briefcase },
  { name: "Service Requests", href: "/service-requests", icon: ClipboardList },
  { name: "Agency Resources", href: "/agency-resources", icon: BookOpen },
  { name: "Task Manager", href: "/tasks", icon: CheckSquare },
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
  { name: "Missing Documents", href: "/missing-documents", icon: AlertCircle },
  { name: "Reports", href: "/reports", icon: FileCheck },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "Settings", href: "/settings", icon: Settings },
]

const adminNavigation = [
  { name: "Admin Dashboard", href: "/admin", icon: Shield },
  { name: "User Management", href: "/admin/users", icon: UserCog },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileSearch },
  { name: "Security", href: "/admin/security", icon: ShieldCheck },
]

const apiNavigation = [
  { name: "QQCatalyst Sync", href: "/admin/qqcatalyst/sync", icon: Database },
  { name: "API Settings", href: "/admin/qqcatalyst", icon: Api },
  { name: "Data Viewer", href: "/admin/qqcatalyst/data-viewer", icon: FileSearch },
  { name: "Import Renewals", href: "/renewals/import", icon: RefreshCw },
]

export function TopNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>("user")
  const [userName, setUserName] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    getUserRole()
  }, [])

  async function getUserRole() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("No authenticated user found")
        return
      }

      // Try to get user from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle()

      if (userError) {
        // Default to 'user' role if there's any error
        console.log("Error fetching user role, using default:", userError.message)
        setUserRole("user")
        setUserName(user.email?.split("@")[0] || "User")
      } else if (userData) {
        setUserRole(userData.role || "user")
        setUserName(userData.full_name || user.email?.split("@")[0] || "User")
      } else {
        // No data found, use default
        setUserRole("user")
        setUserName(user.email?.split("@")[0] || "User")
      }
    } catch (error) {
      console.error("Error in getUserRole:", error)
      setUserRole("user")
    }
  }

  const isAdmin = userRole === "admin"
  const isManager = userRole === "manager"
  const showAdminSection = isAdmin || isManager

  const handleBack = () => {
    window.history.back()
  }

  const handleForward = () => {
    window.history.forward()
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="bg-[#0F0F11] shadow-lg border-b border-[rgba(255,255,255,0.06)]">
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Browser Controls */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="relative">
                  <Building2 className="h-8 w-8 text-[#3B82F6]" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-[#F59E0B] animate-pulse" />
                </div>
                <div>
                  <span className="text-xl font-bold text-[#F0F0F2]">InsureTrack</span>
                  <div className="text-xs text-[#8A8A96] font-medium">AI-Powered Portal</div>
                </div>
              </Link>

              {/* Browser Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-[#F0F0F2] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#3B82F6]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleForward}
                  className="text-[#F0F0F2] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#3B82F6]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReload}
                  className="text-[#F0F0F2] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#3B82F6]"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl mx-8">
              <GlobalSearch />
            </div>

            {/* Right: Navigation Menu + User */}
            <div className="flex items-center space-x-4">
              {/* Main Navigation Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    <div className="flex items-center space-x-2">
                      <Menu className="h-4 w-4" />
                      <span>Navigation</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                  <div className="px-2 py-1 text-xs font-semibold text-[#8A8A96] uppercase tracking-wider">
                    Main Navigation
                  </div>
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <DropdownMenuItem
                        key={item.name}
                        onSelect={() => router.push(item.href)}
                        className={cn(
                          "flex items-center space-x-3 w-full px-2 py-2 cursor-pointer text-[#F0F0F2]",
                          isActive && "bg-[#141416] text-[#3B82F6]",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        {isActive && <div className="ml-auto w-2 h-2 bg-[#3B82F6] rounded-full"></div>}
                      </DropdownMenuItem>
                    )
                  })}

                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 text-xs font-semibold text-[#8A8A96] uppercase tracking-wider flex items-center">
                    <Api className="h-3 w-3 mr-1" />
                    API & Sync
                  </div>
                  {apiNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <DropdownMenuItem
                        key={item.name}
                        onSelect={() => router.push(item.href)}
                        className={cn(
                          "flex items-center space-x-3 w-full px-2 py-2 cursor-pointer text-[#F0F0F2]",
                          isActive && "bg-[#141416] text-[#22C55E]",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        {isActive && <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>}
                      </DropdownMenuItem>
                    )
                  })}

                  {showAdminSection && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1 text-xs font-semibold text-[#8A8A96] uppercase tracking-wider flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Administration
                      </div>
                      {adminNavigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                        return (
                          <DropdownMenuItem
                            key={item.name}
                            onSelect={() => router.push(item.href)}
                            className={cn(
                              "flex items-center space-x-3 w-full px-2 py-2 cursor-pointer text-[#F0F0F2]",
                              isActive && "bg-[#141416] text-[#EF4444]",
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                            {isActive && <div className="ml-auto w-2 h-2 bg-red-400 rounded-full"></div>}
                          </DropdownMenuItem>
                        )
                      })}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <NotificationBell />

              {/* User Profile */}
              <Link
                href="/profile"
                className="flex items-center text-sm text-[#F0F0F2] hover:bg-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 transition-colors duration-200 group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] shadow-lg group-hover:shadow-xl transition-shadow duration-200 mr-3">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#F0F0F2] text-sm">{userName}</p>
                  <p className="text-xs text-[#8A8A96] capitalize flex items-center">
                    {userRole}
                    {(isAdmin || isManager) && <Shield className="h-3 w-3 ml-1" />}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-white" />
            <span className="text-lg font-bold text-white">InsureTrack</span>
          </Link>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="px-2 pt-2 pb-3 space-y-1 bg-[#141416] border-t border-[rgba(255,255,255,0.06)]">
            {/* Search */}
            <div className="p-2">
              <GlobalSearch />
            </div>

            {/* Browser Controls */}
            <div className="flex items-center space-x-2 px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleForward}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Forward
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReload}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reload
              </Button>
            </div>

            {/* Main Navigation */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-blue-100 px-3 py-1 uppercase tracking-wider">
                Main Navigation
              </div>
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 mx-2",
                      isActive
                        ? "bg-white/20 text-white shadow-lg border border-white/30"
                        : "text-blue-100 hover:bg-white/10 hover:text-white",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {isActive && <div className="ml-auto w-2 h-2 bg-card rounded-full animate-pulse"></div>}
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* API Navigation */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-blue-100 px-3 py-1 uppercase tracking-wider flex items-center">
                <Api className="h-3 w-3 mr-1" />
                API & Sync
              </div>
              {apiNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 mx-2",
                      isActive
                        ? "bg-green-500/20 text-white shadow-lg border border-green-400/30"
                        : "text-blue-100 hover:bg-white/10 hover:text-white",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {isActive && <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Admin Navigation */}
            {showAdminSection && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-blue-100 px-3 py-1 uppercase tracking-wider flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Administration
                </div>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "block px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 mx-2",
                        isActive
                          ? "bg-red-500/20 text-white shadow-lg border border-red-400/30"
                          : "text-blue-100 hover:bg-white/10 hover:text-white",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                        {isActive && <div className="ml-auto w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* User Profile */}
            <div className="pt-2 border-t border-white/20 mt-3">
              <Link
                href="/profile"
                className="flex items-center text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors duration-200 mx-2 px-3 py-2 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg mr-3">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{userName}</p>
                  <p className="text-xs text-blue-200 capitalize flex items-center">
                    {userRole}
                    {(isAdmin || isManager) && <Shield className="h-3 w-3 ml-1" />}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
