"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, ChevronDown } from "lucide-react"
import { getServiceRequests } from "@/app/actions/service-request-actions"

export default function ServiceRequestListPage() {
  const [requests, setRequests] = useState<any[]>([])
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

  const getStatusBadgeClass = (status: any) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/15 text-yellow-300"
      case "in_progress":
        return "bg-blue-500/15 text-blue-300"
      case "completed":
        return "bg-green-500/15 text-green-300"
      case "cancelled":
        return "bg-red-500/15 text-red-300"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getRequestTypeLabel = (type: any) => {
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

    return (typeLabels as any)[type] || type
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
        <Link href="/service-requests" className="inline-flex items-center text-orange-500 hover:text-orange-400">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Service Requests
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">All Service Requests</h1>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by client, policy..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <select
                className="appearance-none w-full pl-4 pr-10 py-2 border border-border rounded-md bg-card"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="appearance-none w-full pl-4 pr-10 py-2 border border-border rounded-md bg-card"
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
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
            <p className="mt-2 text-muted-foreground">Loading service requests...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No service requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{request.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {getRequestTypeLabel(request.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{request.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{request.policyNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <Link
                        href={`/service-requests/view/${request.id}`}
                        className="text-orange-500 hover:text-orange-400"
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
