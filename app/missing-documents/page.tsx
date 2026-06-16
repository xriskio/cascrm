"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { FileText, Send, Plus, Eye, AlertTriangle, CheckCircle, X } from "lucide-react"
import { toast } from "sonner"
import {
  getDocumentRequests,
  getDocumentStats,
  updateDocumentStatus,
  sendDocumentReminder,
  sendBulkDocumentReminders,
  createDocumentRequest,
} from "@/app/actions/document-request-actions"

interface DocumentRequest {
  id: string
  tracking_number: string
  client_name: string
  client_email?: string
  agent_name?: string
  agent_email?: string
  policy_type: string
  document_type: string
  date_requested: string
  due_date: string
  date_received?: string
  last_reminder_sent?: string
  status: string
  priority: string
  notes?: string
}

export default function MissingDocumentsPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    outstanding: 0,
    overdue: 0,
    receivedToday: 0,
    pendingReview: 0,
  })
  const [filter, setFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    agentName: "",
    agentEmail: "",
    policyType: "",
    documentType: "",
    dueDate: "",
    priority: "normal",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [sendingReminders, setSendingReminders] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [requestsResult, statsResult] = await Promise.all([getDocumentRequests(), getDocumentStats()])

      if (requestsResult.success && requestsResult.data) {
        setRequests(requestsResult.data)
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load document requests")
    } finally {
      setLoading(false)
    }
  }

  const handleSendReminder = async (id: string) => {
    try {
      const result = await sendDocumentReminder(id)
      if (result.success) {
        toast.success("Reminder sent successfully!")
        fetchData()
      } else {
        toast.error("Failed to send reminder")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleMarkReceived = async (id: string) => {
    try {
      const result = await updateDocumentStatus(id, "received")
      if (result.success) {
        toast.success("Document marked as received!")
        fetchData()
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleSendBulkReminders = async () => {
    try {
      setSendingReminders(true)
      toast.loading("Sending reminders to clients and agents...")
      
      const result = await sendBulkDocumentReminders()
      
      if (result.success) {
        toast.success(
          `✅ Sent ${result.sent} reminders (${result.overdue} overdue) to insured clients and agents with days remaining before NOC`,
          { duration: 5000 }
        )
        fetchData()
      } else {
        toast.error(result.error || "Failed to send reminders")
      }
    } catch (error) {
      toast.error("An error occurred while sending reminders")
    } finally {
      setSendingReminders(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const result = await createDocumentRequest(formData)
      if (result.success) {
        toast.success(`Document request created! Tracking #: ${result.trackingNumber}`)
        setShowAddModal(false)
        setFormData({
          clientName: "",
          clientEmail: "",
          agentName: "",
          agentEmail: "",
          policyType: "",
          documentType: "",
          dueDate: "",
          priority: "normal",
          notes: "",
        })
        fetchData()
      } else {
        toast.error(result.error || "Failed to create document request")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setSubmitting(false)
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

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== "received"

    if (status === "received") {
      return (
        <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
          Received
        </span>
      )
    }

    if (isOverdue) {
      return (
        <span className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
          Overdue
        </span>
      )
    }

    if (status === "pending_review") {
      return (
        <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
          Pending Review
        </span>
      )
    }

    return (
      <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
        Pending
      </span>
    )
  }

  const outstandingRequests = requests.filter((r) => r.status !== "received")
  const receivedRequests = requests.filter((r) => r.status === "received")

  const filteredOutstanding =
    filter === "all"
      ? outstandingRequests
      : filter === "overdue"
        ? outstandingRequests.filter((r) => new Date(r.due_date) < new Date())
        : filter === "high-priority"
          ? outstandingRequests.filter((r) => r.priority === "high")
          : outstandingRequests

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="Missing Documents" subtitle="AI-powered document tracking and automated reminders">
        <div className="flex gap-3">
          <button
            onClick={handleSendBulkReminders}
            disabled={sendingReminders || loading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className={`h-4 w-4 ${sendingReminders ? 'animate-pulse' : ''}`} />
            {sendingReminders ? "Sending..." : "Send Reminders"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Document Request
          </button>
        </div>
      </PageHeader>

      <div className="container mx-auto p-6">
        {/* AI Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.outstanding}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {stats.overdue}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Received Today</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.receivedToday}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.pendingReview}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Outstanding Document Requests */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Outstanding Document Requests
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Filter by:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all">All Clients</option>
                  <option value="high-priority">High Priority</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredOutstanding.length > 0 ? (
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
                      Policy Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Requested
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
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
                  {filteredOutstanding.map((request) => (
                    <tr key={request.id} className="hover:bg-white/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">{request.tracking_number}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{request.client_name}</td>
                      <td className="px-6 py-4 text-gray-600">{request.policy_type}</td>
                      <td className="px-6 py-4 text-gray-600">{request.document_type}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(request.date_requested)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(request.due_date)}</td>
                      <td className="px-6 py-4">{getStatusBadge(request.status, request.due_date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSendReminder(request.id)}
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                          >
                            Send Reminder
                          </button>
                          <button
                            onClick={() => handleMarkReceived(request.id)}
                            className="text-orange-500 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
                          >
                            Mark Received
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No outstanding document requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Recently Received Documents */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg">
          <div className="p-6 border-b border-gray-200/50">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Recently Received Documents
            </h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : receivedRequests.length > 0 ? (
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
                      Policy Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Requested
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Received
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200/50">
                  {receivedRequests.slice(0, 10).map((request) => (
                    <tr key={request.id} className="hover:bg-white/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">{request.tracking_number}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{request.client_name}</td>
                      <td className="px-6 py-4 text-gray-600">{request.policy_type}</td>
                      <td className="px-6 py-4 text-gray-600">{request.document_type}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(request.date_requested)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(request.date_received || "")}</td>
                      <td className="px-6 py-4">{getStatusBadge(request.status, request.due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No received documents yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Document Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Add Document Request</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="client@example.com (for reminder emails)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={formData.agentName}
                    onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Agent name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Email
                  </label>
                  <input
                    type="email"
                    value={formData.agentEmail}
                    onChange={(e) => setFormData({ ...formData, agentEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="agent@casurance.net"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Type<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.policyType}
                  onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Workers' Compensation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Payroll Records"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Optional additional details"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
