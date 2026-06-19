
import { useEffect, useState } from "react"
import { getRenewalStatusHistory } from "@/lib/actions/renewal-actions"
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
        return "bg-yellow-100 text-yellow-800"
      case "quoted":
        return "bg-blue-100 text-blue-800"
      case "bound":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      case "non-renewed":
        return "bg-purple-100 text-purple-800"
      case "lost":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
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
          <div className="text-center py-4 text-gray-500">No status changes recorded</div>
        ) : (
          <div className="space-y-4">
            {history.map((change, index) => (
              <div key={change.id || index} className="border-l-2 border-gray-200 pl-4 pb-4 relative">
                {index !== history.length - 1 && (
                  <div className="absolute left-0 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                <div className="absolute left-0 top-2 w-2 h-2 bg-orange-500 rounded-full transform -translate-x-1"></div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(change.old_status || "")}>
                        {change.old_status || "Unknown"}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className={getStatusColor(change.new_status || "")}>
                        {change.new_status || "Unknown"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
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
                        <MessageSquare className="h-4 w-4 mt-0.5 text-gray-400" />
                        <span className="text-gray-700">{change.notes}</span>
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
