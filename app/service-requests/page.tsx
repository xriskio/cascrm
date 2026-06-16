"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, FileCheck, UserPlus, Building, Car, Users, DollarSign, XCircle, Search, Plane } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { getServiceRequests } from "@/app/actions/service-request-actions"

export default function ServiceRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const result = await getServiceRequests()
      if (result.success) {
        setRequests(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching service requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const serviceRequestTypes = [
    {
      id: "endorsements",
      name: "Endorsements",
      icon: <FileText className="h-10 w-10 mb-2" />,
      description: "Request changes to your policy",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "certificates",
      name: "Certificates of Insurance",
      icon: <FileCheck className="h-10 w-10 mb-2" />,
      description: "Request proof of insurance",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "additional-insured",
      name: "Additional Insured",
      icon: <UserPlus className="h-10 w-10 mb-2" />,
      description: "Add parties to your policy",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      id: "locations",
      name: "Add/Remove Locations",
      icon: <Building className="h-10 w-10 mb-2" />,
      description: "Update covered locations",
      gradient: "from-orange-500 to-red-500",
    },
    {
      id: "vehicles",
      name: "Add/Remove Vehicles",
      icon: <Car className="h-10 w-10 mb-2" />,
      description: "Update covered vehicles",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      id: "drivers",
      name: "Add/Remove Drivers",
      icon: <Users className="h-10 w-10 mb-2" />,
      description: "Update authorized drivers",
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      id: "billing",
      name: "Billing Issues",
      icon: <DollarSign className="h-10 w-10 mb-2" />,
      description: "Resolve payment problems",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      id: "cancel",
      name: "Request to Cancel Policy",
      icon: <XCircle className="h-10 w-10 mb-2" />,
      description: "Cancel an existing policy",
      gradient: "from-red-500 to-pink-500",
    },
    {
      id: "airport-endorsements",
      name: "Airport Endorsements",
      icon: <Plane className="h-10 w-10 mb-2" />,
      description: "Request airport operation endorsements",
      gradient: "from-sky-500 to-blue-500",
    },
    {
      id: "filing-request",
      name: "Filing Request",
      icon: <FileText className="h-10 w-10 mb-2" />,
      description: "Request insurance filings",
      gradient: "from-slate-500 to-gray-500",
    },
  ]

  const handleRequestClick = (requestType: string) => {
    router.push(`/service-requests/new?type=${requestType}`)
  }

  const getRequestTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      endorsements: "Endorsement",
      certificates: "Certificate of Insurance",
      "additional-insured": "Additional Insured",
      locations: "Add/Remove Locations",
      vehicles: "Add/Remove Vehicles",
      drivers: "Add/Remove Drivers",
      billing: "Billing Issue",
      cancel: "Policy Cancellation",
      "airport-endorsements": "Airport Endorsements",
      "filing-request": "Filing Request",
    }
    return typeLabels[type] || type
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      in_progress: { bg: "bg-blue-100", text: "text-blue-800", label: "In Progress" },
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
    }
    const config = statusMap[status] || statusMap.pending
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}>
        {config.label}
      </span>
    )
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

  // Get recent requests (last 10)
  const recentRequests = requests.slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="Service Requests" subtitle="AI-powered service request management">
        <Link
          href="/service-requests/list"
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          View All Requests
        </Link>
      </PageHeader>

      <div className="p-6">
        {/* AI Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="🤖 AI-powered search across all service requests..."
              className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Service Request Types Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Create New Service Request
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceRequestTypes.map((type) => (
              <div
                key={type.id}
                className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
                onClick={() => handleRequestClick(type.id)}
              >
                <div
                  className={`p-3 bg-gradient-to-r ${type.gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <div className="text-white">{type.icon}</div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">{type.name}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Recent Service Requests
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-gray-200/50">
                {loading ? (
                  <tr className="text-center">
                    <td colSpan={7} className="px-6 py-16 text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-lg font-medium">Loading service requests...</p>
                      </div>
                    </td>
                  </tr>
                ) : recentRequests.length > 0 ? (
                  recentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-white/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">#{request.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{getRequestTypeLabel(request.type)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.policyNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => router.push(`/service-requests/view/${request.id}`)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-center">
                    <td colSpan={7} className="px-6 py-16 text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                          <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                        <p className="text-lg font-medium mb-2">No service requests found</p>
                        <p className="text-sm">Requests will appear here once created.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
