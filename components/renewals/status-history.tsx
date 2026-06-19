"use client"

import { useEffect, useState } from "react"
import { getRenewalStatusHistory } from "@/app/actions/renewal-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, MessageSquare } from "lucide-react"
import { extractErrorMessage } from "@/lib/error-utils"

interface StatusHistoryProps {
  renewalId: string
}

interface StatusChange {
  id: string
  old_status: string
  new_status: string
  changed_by_name: string
  changed_at: string
  notes?: string
}

export default function StatusHistory({ renewalId }: StatusHistoryProps) {
  const [history, setHistory] = useState<StatusChange[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [renewalId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getRenewalStatusHistory(renewalId)

      if (result.success) {
        setHistory(Array.isArray(result.data) ? result.data : [])
      } else {
        setError(extractErrorMessage(result.error))
      }
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/15 text-yellow-300"
      case "quoted":
        return "bg-blue-500/15 text-blue-300"
      case "bound":
        return "bg-green-500/15 text-green-300"
      case "declined":
        return "bg-red-500/15 text-red-300"
      case "non-renewed":
        return "bg-purple-500/15 text-purple-300"
      case "lost":
        return "bg-muted text-foreground"
      default:
        return "bg-muted text-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading status history...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Status History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-600 text-sm mb-4">Error loading status history: {error}</div>}

        {history.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No status changes recorded</div>
        ) : (
          <div className="space-y-4">
            {history.map((change, index) => (
              <div key={change.id || index} className="border-l-2 border-border pl-4 pb-4 relative">
                {index !== history.length - 1 && (
                  <div className="absolute left-0 top-8 bottom-0 w-0.5 bg-muted"></div>
                )}
                <div className="absolute left-0 top-2 w-2 h-2 bg-orange-500 rounded-full transform -translate-x-1"></div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(change.old_status || "")}>
                        {change.old_status || "Unknown"}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge className={getStatusColor(change.new_status || "")}>
                        {change.new_status || "Unknown"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {change.changed_by_name || "Unknown"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(change.changed_at)}
                      </div>
                    </div>

                    {change.notes && (
                      <div className="flex items-start gap-1 text-sm">
                        <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{change.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
