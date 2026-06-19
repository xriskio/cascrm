
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardCheckIcon, CalendarIcon, AlertTriangleIcon } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/ui/page-header"
import { getInspections, getInspectionStats } from "@/lib/actions/inspection-actions"

interface Inspection {
  id: string
  inspection_number: string
  named_insured: string
  policy_number: string
  insurance_company: string
  policy_type: string
  effective_date: string
  contact_name: string
  contact_email: string
  status: string
  created_at: string
}

export default function InspectionsPage() {
  const navigate = useNavigate()
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isSendingReminders, setIsSendingReminders] = useState(false)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    compliance: 0,
    completedToday: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [inspectionsResult, statsResult] = await Promise.all([
        getInspections(),
        getInspectionStats(),
      ])

      if (inspectionsResult.success) {
        setInspections(inspectionsResult.data)
      }

      if (statsResult.success) {
        setStats(statsResult.stats)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load inspection data")
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleInspection = () => {
    navigate("/inspections/schedule")
  }

  const handleViewRequests = () => {
    navigate("/inspections/requests")
  }

  const handleViewCompliance = () => {
    navigate("/inspections/compliance")
  }

  const handleScheduleNow = () => {
    navigate("/inspections/schedule")
  }

  const handleSendReminders = async () => {
    setIsSendingReminders(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Reminders sent successfully!")
    } catch (error) {
      toast.error("Failed to send reminders")
    } finally {
      setIsSendingReminders(false)
    }
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success("Report generated successfully!")
    } catch (error) {
      toast.error("Failed to generate report")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "from-yellow-100 to-orange-100", text: "text-yellow-800", label: "Scheduled" },
      confirmed: { bg: "from-green-100 to-emerald-100", text: "text-green-800", label: "Confirmed" },
      completed: { bg: "from-blue-100 to-cyan-100", text: "text-blue-800", label: "Completed" },
      compliance_issue: { bg: "from-red-100 to-pink-100", text: "text-red-800", label: "Issues Found" },
    }

    const config = statusMap[status] || statusMap.pending
    return (
      <span className={`bg-gradient-to-r ${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}>
        {config.label}
      </span>
    )
  }

  // Separate upcoming and completed inspections
  const upcomingInspections = inspections.filter(
    (i) => i.status === "pending" || i.status === "confirmed"
  )
  const completedInspections = inspections.filter(
    (i) => i.status === "completed" || i.status === "compliance_issue"
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="Inspections" subtitle="AI-powered inspection management and compliance tracking">
        <button
          onClick={handleScheduleInspection}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          Schedule New Inspection
        </button>
      </PageHeader>

      <div className="container mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Issues</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {stats.compliance}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <AlertTriangleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.completedToday}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <ClipboardCheckIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            onClick={handleViewRequests}
            className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <CalendarIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold ml-4 text-gray-800">Inspection Requests</h2>
            </div>
            <p className="text-gray-600 mb-4">
              View and manage pending inspection requests from clients and underwriters.
            </p>
            <div className="flex items-center text-blue-500 font-medium group-hover:text-blue-600 transition-colors duration-200">
              View Requests →
            </div>
          </div>

          <div
            onClick={handleViewCompliance}
            className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center mb-6">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <AlertTriangleIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold ml-4 text-gray-800">Pending Compliance</h2>
            </div>
            <p className="text-gray-600 mb-4">Track inspections with missing photos, documents, or certificates.</p>
            <div className="flex items-center text-orange-500 font-medium group-hover:text-orange-600 transition-colors duration-200">
              View Compliance Issues →
            </div>
          </div>

          <div
            onClick={handleScheduleNow}
            className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center mb-6">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <ClipboardCheckIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold ml-4 text-gray-800">Schedule Inspection</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Schedule a new inspection with all required policy and contact details.
            </p>
            <div className="flex items-center text-green-500 font-medium group-hover:text-green-600 transition-colors duration-200">
              Schedule Now →
            </div>
          </div>
        </div>

        {/* Upcoming Inspections */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Upcoming Inspections
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleSendReminders}
                  disabled={isSendingReminders}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  {isSendingReminders ? "Sending..." : "Send Reminders"}
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  {isGeneratingReport ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : upcomingInspections.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Policy Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inspection Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Effective Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200/50">
                  {upcomingInspections.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-white/50 transition-colors duration-200">
                      <td className="px-6 py-4 text-gray-800 font-mono text-sm">{inspection.inspection_number}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{inspection.named_insured}</td>
                      <td className="px-6 py-4 text-gray-600">{inspection.policy_number}</td>
                      <td className="px-6 py-4 text-gray-600">{inspection.policy_type}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(inspection.effective_date)}</td>
                      <td className="px-6 py-4 text-gray-600">{inspection.contact_name}</td>
                      <td className="px-6 py-4">{getStatusBadge(inspection.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/inspections/view/${inspection.id}`)}
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No upcoming inspections</p>
                <button
                  onClick={handleScheduleNow}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Schedule your first inspection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Completed Inspections */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg">
          <div className="p-6 border-b border-gray-200/50">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Completed Inspections
            </h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : completedInspections.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Policy Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inspection Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Completed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200/50">
                  {completedInspections.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-white/50 transition-colors duration-200">
                      <td className="px-6 py-4 text-gray-800 font-mono text-sm">{inspection.inspection_number}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{inspection.named_insured}</td>
                      <td className="px-6 py-4 text-gray-600">{inspection.policy_number}</td>
                      <td className="px-6 py-4 text-gray-600">{inspection.policy_type}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(inspection.created_at)}</td>
                      <td className="px-6 py-4 text-gray-600">{inspection.contact_name}</td>
                      <td className="px-6 py-4">{getStatusBadge(inspection.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/inspections/view/${inspection.id}`)}
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                          >
                            View Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No completed inspections yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
