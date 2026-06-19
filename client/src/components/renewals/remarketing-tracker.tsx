
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Clock, Plus, X } from "lucide-react"
import { updateRemarketingCompanies } from "@/lib/actions/renewal-actions"

interface RemarketingCompany {
  id: string
  name: string
  status: "pending" | "quoted" | "declined" | "bound"
  submissionDate?: string
  responseDate?: string
  premium?: string
  notes?: string
}

interface RemarketingTrackerProps {
  renewalId: string
  renewal?: any
  companies?: RemarketingCompany[]
  onUpdate?: () => void
}

const commonCarriers = [
  "Travelers",
  "Hartford",
  "Liberty Mutual",
  "Zurich",
  "CNA",
  "Chubb",
  "AIG",
  "Nationwide",
  "Progressive",
  "State Farm",
  "Allstate",
  "GEICO",
  "Selective",
  "Guard",
  "Philadelphia",
  "Penn National",
  "EMC",
  "Acuity",
]

export default function RemarketingTracker({
  renewalId,
  renewal,
  companies: initialCompanies,
  onUpdate,
}: RemarketingTrackerProps) {
  // Safely initialize companies from multiple possible sources
  const getInitialCompanies = (): RemarketingCompany[] => {
    if (Array.isArray(initialCompanies)) {
      return initialCompanies
    }
    if (renewal && Array.isArray(renewal.remarketing_companies)) {
      return renewal.remarketing_companies
    }
    return []
  }

  const [companies, setCompanies] = useState<RemarketingCompany[]>(getInitialCompanies())
  const [isUpdating, setIsUpdating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCompany, setNewCompany] = useState({
    name: "",
    status: "pending" as const,
    submissionDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [newActivity, setNewActivity] = useState({
    date: new Date().toISOString().split("T")[0],
    activity: "",
    notes: "",
    followUpDate: "",
  })

  const [activities] = useState([
    {
      id: 1,
      date: "2024-01-15",
      activity: "Initial remarketing request sent",
      notes: "Sent to 3 carriers for competitive quotes",
      status: "completed",
    },
    {
      id: 2,
      date: "2024-01-18",
      activity: "Follow-up with Carrier A",
      notes: "Waiting for underwriter review",
      status: "pending",
    },
  ])

  // At the top of the component, add proper error handling
  const [error, setError] = useState<string | null>(null)

  const handleAddCompany = () => {
    if (!newCompany.name.trim()) return

    const company: RemarketingCompany = {
      id: Date.now().toString(),
      name: newCompany.name === "other" ? "" : newCompany.name,
      status: newCompany.status,
      submissionDate: newCompany.submissionDate,
      notes: newCompany.notes,
    }

    const updatedCompanies = [...companies, company]
    setCompanies(updatedCompanies)
    updateDatabase(updatedCompanies)

    // Reset form
    setNewCompany({
      name: "",
      status: "pending",
      submissionDate: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setShowAddForm(false)
  }

  const handleUpdateCompany = (id: string, updates: Partial<RemarketingCompany>) => {
    const updatedCompanies = companies.map((company) => (company.id === id ? { ...company, ...updates } : company))
    setCompanies(updatedCompanies)
    updateDatabase(updatedCompanies)
  }

  const handleRemoveCompany = (id: string) => {
    const updatedCompanies = companies.filter((company) => company.id !== id)
    setCompanies(updatedCompanies)
    updateDatabase(updatedCompanies)
  }

  const handleAddActivity = () => {
    // Add activity logic here
    console.log("Adding activity:", newActivity)
    setNewActivity({
      date: new Date().toISOString().split("T")[0],
      activity: "",
      notes: "",
      followUpDate: "",
    })
    onUpdate()
  }

  // In the updateDatabase function, replace the alert with proper error handling:
  const updateDatabase = async (updatedCompanies: RemarketingCompany[]) => {
    setIsUpdating(true)
    setError(null)
    try {
      const result = await updateRemarketingCompanies(renewalId, updatedCompanies)
      if (result.success) {
        onUpdate?.()
      } else {
        setError(extractErrorMessage(result.error))
      }
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "quoted":
        return "bg-blue-100 text-blue-800"
      case "declined":
        return "bg-red-100 text-red-800"
      case "bound":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusCounts = () => {
    return companies.reduce(
      (acc, company) => {
        acc[company.status] = (acc[company.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  const statusCounts = getStatusCounts()

  const extractErrorMessage = (error: any): string => {
    if (typeof error === "string") {
      return error
    }

    if (error?.message) {
      return error.message
    }

    return "An unexpected error occurred."
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Remarketing Tracker
        </CardTitle>
      </CardHeader>
      {/* Add error display in the CardContent: */}
      <CardContent className="space-y-6">
        {error && (
          <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded">Error: {error}</div>
        )}
        {/* Rest of the content */}
        {/* Status Summary */}
        {companies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-800">{statusCounts.pending || 0}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-800">{statusCounts.quoted || 0}</div>
              <div className="text-sm text-blue-600">Quoted</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-800">{statusCounts.declined || 0}</div>
              <div className="text-sm text-red-600">Declined</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-800">{statusCounts.bound || 0}</div>
              <div className="text-sm text-green-600">Bound</div>
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="space-y-4">
          <h4 className="font-semibold">Activity Timeline</h4>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">{getStatusIcon(activity.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{activity.activity}</h5>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                      <span className="text-sm text-gray-500">{activity.date}</span>
                    </div>
                  </div>
                  {activity.notes && <p className="text-sm text-gray-600 mt-1">{activity.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Activity */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Add New Activity</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activityDate">Date</Label>
              <Input
                id="activityDate"
                type="date"
                value={newActivity.date}
                onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={newActivity.followUpDate}
                onChange={(e) => setNewActivity({ ...newActivity, followUpDate: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="activity">Activity</Label>
              <Input
                id="activity"
                value={newActivity.activity}
                onChange={(e) => setNewActivity({ ...newActivity, activity: e.target.value })}
                placeholder="e.g., Called carrier for quote update"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="activityNotes">Notes</Label>
              <Textarea
                id="activityNotes"
                value={newActivity.notes}
                onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                placeholder="Add any additional details..."
                rows={3}
              />
            </div>
          </div>

          <Button onClick={handleAddActivity} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>

        {/* Add Company Form */}
        {showAddForm && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Insurance Carrier</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carrierName">
                  Carrier Name <span className="text-red-500">*</span>
                </Label>
                <select
                  id="carrierName"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a carrier...</option>
                  {commonCarriers.map((carrier) => (
                    <option key={carrier} value={carrier}>
                      {carrier}
                    </option>
                  ))}
                  <option value="other">Other (type below)</option>
                </select>
                {newCompany.name === "other" && (
                  <Input
                    id="otherCarrierName"
                    type="text"
                    placeholder="Enter carrier name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={newCompany.status}
                  onChange={(e) => setNewCompany({ ...newCompany, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="quoted">Quoted</option>
                  <option value="declined">Declined</option>
                  <option value="bound">Bound</option>
                </select>
              </div>

              <div>
                <Label htmlFor="submissionDate">Submission Date</Label>
                <Input
                  id="submissionDate"
                  type="date"
                  value={newCompany.submissionDate}
                  onChange={(e) => setNewCompany({ ...newCompany, submissionDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  type="text"
                  value={newCompany.notes}
                  onChange={(e) => setNewCompany({ ...newCompany, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCompany} disabled={!newCompany.name.trim() || newCompany.name === "other"}>
                Add Carrier
              </Button>
            </div>
          </div>
        )}

        {/* Companies List */}
        <div className="space-y-4">
          {companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No carriers added yet.</p>
              <p className="text-sm">Click "Add Carrier" to start tracking remarketing submissions.</p>
            </div>
          ) : (
            companies.map((company) => (
              <div key={company.id} className="flex gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">{getStatusIcon(company.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{company.name}</h5>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(company.status)}>
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">{company.submissionDate}</span>
                    </div>
                  </div>
                  {company.notes && <p className="text-sm text-gray-600 mt-1">{company.notes}</p>}
                </div>
              </div>
            ))
          )}
        </div>

        {isUpdating && <div className="text-center text-sm text-gray-500">Updating remarketing data...</div>}
      </CardContent>
    </Card>
  )
}
