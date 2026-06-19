"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, UserCheck, Calendar, Building, Shield, RefreshCw, Star, Clock, Users } from "lucide-react"
import { getContactAccountInfo, refreshContactAccountInfo } from "@/app/actions/contact-account-actions"
import type { ContactAccountInfoDTO } from "@/types/qqcatalyst-account"
import { formatDistanceToNow } from "date-fns"

interface ClientAccountInfoProps {
  clientId: string
  contactId?: string
}

export function ClientAccountInfo({ clientId, contactId }: ClientAccountInfoProps) {
  const [accountInfo, setAccountInfo] = useState<ContactAccountInfoDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)

  const loadAccountInfo = async (refresh = false) => {
    try {
      setLoading(!refresh)
      setRefreshing(refresh)
      setError(null)

      const result = refresh
        ? await refreshContactAccountInfo(contactId || clientId)
        : await getContactAccountInfo(contactId || clientId)

      if (result.success) {
        setAccountInfo(result.data as any)
        setCached((result as any).cached || false)
      } else {
        setError(result.error || "Failed to load account information")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAccountInfo()
  }, [clientId, contactId])

  const handleRefresh = () => {
    loadAccountInfo(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "premium":
        return "bg-red-500/15 text-red-300"
      case "medium":
      case "standard":
        return "bg-yellow-500/15 text-yellow-300"
      case "low":
      case "basic":
        return "bg-green-500/15 text-green-300"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => loadAccountInfo()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!accountInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No account information available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
              {cached && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Cached
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Customer since{" "}
              {accountInfo.CustomerSinceString ||
                formatDistanceToNow(new Date(accountInfo.CustomerSince), { addSuffix: true })}
            </CardDescription>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">#{accountInfo.CustomerNo}</Badge>
              <Badge className={getPriorityColor(accountInfo.CustomerPriority)}>
                <Star className="h-3 w-3 mr-1" />
                {accountInfo.CustomerPriority}
              </Badge>
            </div>
            <p className="font-medium">{accountInfo.Name}</p>
            <p className="text-sm text-muted-foreground">{accountInfo.Type}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Customer since {new Date(accountInfo.CustomerSince).toLocaleDateString()}</span>
            </div>
            {accountInfo.CPAccess && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Customer Portal Access</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Agent & CSR Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Assigned Agent
            </h4>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(accountInfo.Agent)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{accountInfo.Agent}</p>
                <p className="text-sm text-muted-foreground">Agent ID: {accountInfo.AgentID}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customer Service Rep
            </h4>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(accountInfo.CSR)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{accountInfo.CSR}</p>
                <p className="text-sm text-muted-foreground">CSR ID: {accountInfo.CsrID}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Source & Creation Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Customer Source</h4>
            <div className="space-y-1">
              <p className="text-sm">{accountInfo.CustomerSource}</p>
              {accountInfo.SourceDetail && <p className="text-xs text-muted-foreground">{accountInfo.SourceDetail}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Created By</h4>
            <div className="space-y-1">
              <p className="text-sm">{accountInfo.CreatedByName}</p>
              <p className="text-xs text-muted-foreground">ID: {accountInfo.CreatedByID}</p>
            </div>
          </div>
        </div>

        {/* Office Information */}
        {accountInfo.OfficeID && (
          <>
            <Separator />
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Office ID: {accountInfo.OfficeID}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
