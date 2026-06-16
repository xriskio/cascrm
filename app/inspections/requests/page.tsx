"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { getInspections } from "@/app/actions/inspection-actions"

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

export default function InspectionRequestsPage() {
  const router = useRouter()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    try {
      const result = await getInspections()

      if (result.success) {
        setInspections(result.data)
      } else {
        toast.error("Failed to load inspections")
      }
    } catch (error) {
      console.error("Error fetching inspections:", error)
      toast.error("Failed to load inspections")
    } finally {
      setLoading(false)
    }
  }

  const filteredInspections = statusFilter === "all"
    ? inspections
    : inspections.filter((i) => i.status === statusFilter)

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
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      confirmed: { bg: "bg-green-100", text: "text-green-800", label: "Confirmed" },
      completed: { bg: "bg-blue-100", text: "text-blue-800", label: "Completed" },
      compliance_issue: { bg: "bg-red-100", text: "text-red-800", label: "Compliance Issue" },
    }

    const config = statusMap[status] || statusMap.pending
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/inspections")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inspections
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Inspection Requests</h1>
          <p className="text-gray-600 mt-1">View and manage all inspection requests</p>
        </div>
        <button
          onClick={() => router.push("/inspections/schedule")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
        >
          Schedule New Inspection
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="compliance_issue">Compliance Issues</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredInspections.length} of {inspections.length} requests
          </span>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="text-gray-600">Loading inspections...</p>
            </div>
          </div>
        ) : filteredInspections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Named Insured
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy Type
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
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-900">{inspection.inspection_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{inspection.named_insured}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {inspection.policy_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {inspection.policy_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(inspection.effective_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inspection.contact_name}</div>
                      <div className="text-xs text-gray-500">{inspection.contact_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inspection.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => router.push(`/inspections/view/${inspection.id}`)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <svg
                className="h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                {statusFilter === "all" ? "No inspection requests found" : `No ${statusFilter} inspections found`}
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                {statusFilter === "all"
                  ? "Get started by scheduling your first inspection request."
                  : "Try adjusting your filter to see more results."}
              </p>
              {statusFilter === "all" && (
                <button
                  onClick={() => router.push("/inspections/schedule")}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
                >
                  Schedule Inspection
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
