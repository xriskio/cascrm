
import { useEffect, useState } from "react"
import { getRenewalStatusHistory, updateRenewalStatus } from "@/lib/actions/renewal-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Clock, User, MessageSquare, Edit, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StatusTrackerProps {
  renewalId: string
  currentStatus: string
  onStatusUpdate?: (newStatus: string) => void
}

interface StatusChange {
  id: string
  old_status: string
  new_status: string
  changed_by_name: string
  changed_at: string
  notes?: string
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-800" },
  { value: "quoted", label: "Quoted", color: "bg-purple-100 text-purple-800" },
  { value: "bound", label: "Bound", color: "bg-green-100 text-green-800" },
  { value: "declined", label: "Declined", color: "bg-red-100 text-red-800" },
  { value: "non-renewed", label: "Non-Renewed", color: "bg-orange-100 text-orange-800" },
  { value: "lost", label: "Lost", color: "bg-gray-100 text-gray-800" },
  { value: "remarketing", label: "Remarketing", color: "bg-indigo-100 text-indigo-800" },
]

export default function StatusTracker({ renewalId, currentStatus, onStatusUpdate }: StatusTrackerProps) {
  const [history, setHistory] = useState<StatusChange[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [notes, setNotes] = useState("")
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchHistory()
  }, [renewalId])

  const fetchHistory = async () => {
    try {
      const result = await getRenewalStatusHistory(renewalId)
      if (result.success) {
        setHistory(result.history)
      }
    } catch (error) {
      console.error("Error fetching status history:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (newStatus === currentStatus) {
      setIsEditing(false)
      return
    }

    setUpdating(true)
    try {
      const result = await updateRenewalStatus(renewalId, newStatus, notes)
      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Renewal status changed to ${newStatus}`,
        })
        setIsEditing(false)
        setNotes("")
        fetchHistory() // Refresh history
        onStatusUpdate?.(newStatus)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status.toLowerCase())
    return statusOption?.color || "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status Tracking
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status Tracking
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Update Status
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Status & Update Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-700">Current Status:</span>
            <Badge className={getStatusColor(currentStatus)}>{currentStatus}</Badge>
          </div>

          {isEditing && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${option.color.split(" ")[0]}`}></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleStatusUpdate} disabled={updating} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {updating ? "Updating..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setNewStatus(currentStatus)
                    setNotes("")
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Status History */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Status History</h4>
          {history.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No status changes recorded</div>
          ) : (
            <div className="space-y-4">
              {history.map((change, index) => (
                <div key={change.id} className="border-l-2 border-gray-200 pl-4 pb-4 relative">
                  {index !== history.length - 1 && (
                    <div className="absolute left-0 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  <div className="absolute left-0 top-2 w-2 h-2 bg-orange-500 rounded-full transform -translate-x-1"></div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(change.old_status)}>{change.old_status}</Badge>
                        <span className="text-gray-400">→</span>
                        <Badge className={getStatusColor(change.new_status)}>{change.new_status}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {change.changed_by_name}
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
        </div>
      </CardContent>
    </Card>
  )
}
