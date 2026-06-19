"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Key, Settings, FileText, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function QQCatalystPage() {
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "not_authenticated">("checking")

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/qqcatalyst/status")
      const data = await response.json()
      setAuthStatus(data.authenticated ? "authenticated" : "not_authenticated")
    } catch (error) {
      setAuthStatus("not_authenticated")
    }
  }

  const features = [
    {
      title: "OAuth Authentication",
      description: "Secure OAuth2 integration with QQCatalyst",
      icon: Key,
      href: "/qqcatalyst/oauth",
      status: authStatus === "authenticated" ? "active" : "inactive",
    },
    {
      title: "Data Import",
      description: "Import contacts and policies from QQCatalyst",
      icon: Database,
      href: "/admin/qqcatalyst/import",
      status: authStatus === "authenticated" ? "available" : "requires_auth",
    },
    {
      title: "Dashboard",
      description: "View imported data and statistics",
      icon: FileText,
      href: "/admin/qqcatalyst/dashboard",
      status: "available",
    },
    {
      title: "Configuration",
      description: "Manage QQCatalyst settings and credentials",
      icon: Settings,
      href: "/qqcatalyst/env-setup",
      status: "available",
    },
    {
      title: "Token Management",
      description: "Manage QQCatalyst access tokens and credentials",
      icon: Key,
      href: "/admin/qqcatalyst/tokens",
      status: "available",
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">QQCatalyst Integration</h1>
          <p className="text-muted-foreground mt-2">Connect and sync data with your QQCatalyst system</p>
        </div>
        <div className="flex items-center gap-2">
          {authStatus === "authenticated" ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Not Connected
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Start */}
      {authStatus === "not_authenticated" && (
        <Card className="mb-6 border-border bg-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription>Get started by authenticating with QQCatalyst</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/qqcatalyst/oauth">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect with OAuth
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/qqcatalyst/env-setup">Setup Credentials</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5" />
                  {feature.title}
                </div>
                <Badge
                  variant={
                    feature.status === "active" ? "default" : feature.status === "available" ? "secondary" : "outline"
                  }
                >
                  {feature.status === "active"
                    ? "Active"
                    : feature.status === "available"
                      ? "Available"
                      : "Requires Auth"}
                </Badge>
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" disabled={feature.status === "requires_auth"}>
                <Link href={feature.href}>Open {feature.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integration Details</CardTitle>
          <CardDescription>Based on the QQCatalyst OAuth2 reference implementation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium mb-2">OAuth Flow</h4>
              <p className="text-sm text-muted-foreground">Secure OAuth2 authentication with authorization code flow</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">API Integration</h4>
              <p className="text-sm text-muted-foreground">
                Direct API calls to QQCatalyst endpoints with Bearer token authentication
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Sync</h4>
              <p className="text-sm text-muted-foreground">
                Import and sync contacts, policies, and other data from QQCatalyst
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
