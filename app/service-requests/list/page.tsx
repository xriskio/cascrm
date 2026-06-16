"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, ChevronDown } from "lucide-react"
import { getServiceRequests } from "@/app/actions/service-request-actions"

export default function ServiceRequestListPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true)
        const result = await getServiceRequests()
        if (result.success) {
          setRequests(result.data || [])
        } else {
          setError(result.error || "Failed to load service requests")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRequestTypeLabel = (type) => {
    const typeLabels = {
      endorsements: "Endorsement",
      certificates: "Certificate of Insurance",
      "additional-insured": "Additional Insured",
      locations: "Add/Remove Locations",
      vehicles: "Add/Remove Vehicles",
      drivers: "Add/Remove Drivers",
      billing: "Billing Issue",
      cancel: "Policy Cancellation",
    }

    return typeLabels[type] || type
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.policyNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id?.toString().includes(searchQuery)

    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/service-requests" className="inline-flex items-center text-orange-500 hover:text-orange-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Service Requests
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">All Service Requests</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, policy..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <select
                className="appearance-none w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="appearance-none w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md bg-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="endorsements">Endorsements</option>
                <option value="certificates">Certificates</option>
                <option value="additional-insured">Additional Insured</option>
                <option value="locations">Locations</option>
                <option value="vehicles">Vehicles</option>
                <option value="drivers">Drivers</option>
                <option value="billing">Billing</option>
                <option value="cancel">Cancellation</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">Loading service requests...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No service requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
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
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRequestTypeLabel(request.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.policyNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        href={`/service-requests/view/${request.id}`}
                        className="text-orange-500 hover:text-orange-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
