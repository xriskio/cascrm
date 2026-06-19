
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format, parseISO, isValid } from "date-fns"
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Filter,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { PageHeader } from "@/components/ui/page-header"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"

import IncomingCallForm from "./IncomingCallForm"
import { Link } from "react-router-dom"

const CATEGORY_OPTIONS = [
  { value: "billing", label: "Billing" },
  { value: "policy service", label: "Policy Service" },
  { value: "quote", label: "Quote" },
  { value: "new business opportunity", label: "New Business Opportunity" },
  { value: "other", label: "Other" },
]

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "called back", label: "Called Back", color: "green" },
  { value: "message left", label: "Message Left", color: "blue" },
  { value: "resolved", label: "Resolved", color: "gray" },
]

function formatDate(dateStr?: string) {
  if (!dateStr) return ""
  try {
    const date = parseISO(dateStr)
    return isValid(date) ? format(date, "MM/dd/yyyy") : ""
  } catch {
    return dateStr
  }
}

function formatTime(timeStr?: string) {
  if (!timeStr) return ""
  return timeStr.slice(0, 5)
}

function getStatusColor(status) {
  const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status)
  return statusOption?.color || "gray"
}

export default function IncomingCallLogPage() {
  const navigate = useNavigate()
  // supabase imported at top of file
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshFlag, setRefreshFlag] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" })
  const [expandedRow, setExpandedRow] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // Fetch calls
  useEffect(() => {
    async function fetchCalls() {
      setLoading(true)
      try {
        console.log("Fetching calls with sort:", sortConfig)
        const { data, error } = await supabase
          .from("incoming_calls")
          .select("*")
          .order(sortConfig.key, { ascending: sortConfig.direction === "asc" })

        if (error) {
          console.error("Error fetching calls:", error)
          toast.error("Error loading calls: " + error.message)
          setCalls([])
        } else {
          console.log("Fetched calls:", data)
          setCalls(data || [])
        }
      } catch (error) {
        console.error("Exception fetching calls:", error)
        toast.error("Failed to load calls")
        setCalls([])
      } finally {
        setLoading(false)
      }
    }
    fetchCalls()
  }, [refreshFlag, sortConfig, supabase])

  // Handle status update inline
  async function updateStatus(id, status) {
    try {
      console.log("Updating status:", id, status)
      const { error } = await supabase.from("incoming_calls").update({ status }).eq("id", id)

      if (error) {
        console.error("Error updating status:", error)
        toast.error("Error updating status: " + error.message)
      } else {
        toast.success("Status updated successfully")
        setRefreshFlag((f) => f + 1)
      }
    } catch (error) {
      console.error("Exception updating status:", error)
      toast.error("Error updating status")
    }
  }

  // Delete call
  async function deleteCall(id) {
    try {
      if (confirm("Delete this call log entry?")) {
        console.log("Deleting call:", id)
        const { error } = await supabase.from("incoming_calls").delete().eq("id", id)

        if (error) {
          console.error("Error deleting call:", error)
          toast.error("Error deleting call: " + error.message)
        } else {
          toast.success("Call deleted successfully")
          setRefreshFlag((f) => f + 1)
        }
      }
    } catch (error) {
      console.error("Exception deleting call:", error)
      toast.error("Error deleting call")
    }
  }

  // View call details
  function viewCallDetails(id) {
    navigate(`/call-log/${id}`)
  }

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Filter calls
  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      (call.named_insured || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.contact_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.phone || "").includes(searchTerm) ||
      (call.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.reason || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.notes || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" ? true : call.status === statusFilter
    const matchesCategory = categoryFilter === "all" ? true : call.category === categoryFilter
    const matchesDate = dateFilter ? formatDate(call.call_date) === format(dateFilter, "MM/dd/yyyy") : true

    return matchesSearch && matchesStatus && matchesCategory && matchesDate
  })

  // Export to CSV
  const exportToCSV = () => {
    try {
      const headers = [
        "Date",
        "Time",
        "Named Insured",
        "Contact",
        "Phone",
        "Email",
        "Category",
        "Reason",
        "Status",
        "Callback Date",
        "Callback Time",
        "Notes",
      ]

      const csvData = filteredCalls.map((call) => [
        formatDate(call.call_date),
        formatTime(call.call_time),
        call.named_insured || "",
        call.contact_name || "",
        call.phone || "",
        call.email || "",
        call.category || "",
        call.reason || "",
        call.status || "",
        formatDate(call.call_back_date),
        formatTime(call.call_back_time),
        call.notes || "",
      ])

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `call_log_${format(new Date(), "yyyy-MM-dd")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Call log exported successfully")
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast.error("Failed to export call log")
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setDateFilter(null)
  }

  // Calculate stats
  const stats = {
    total: calls.length,
    pending: calls.filter((call) => call.status === "pending").length,
    resolved: calls.filter((call) => call.status === "resolved").length,
    todayCalls: calls.filter((call) => {
      const today = new Date().toISOString().split("T")[0]
      return call.call_date === today
    }).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="AI Call Management" subtitle="Intelligent call tracking and customer interaction analytics">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setRefreshFlag((f) => f + 1)} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Hide Form" : "Log New Call"}
          </Button>
        </div>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* AI Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Calls</CardTitle>
              <Phone className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs opacity-80">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Pending</CardTitle>
              <Clock className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs opacity-80">Awaiting response</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Resolved</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <p className="text-xs opacity-80">Completed calls</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Today</CardTitle>
              <Users className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayCalls}</div>
              <p className="text-xs opacity-80">Calls today</p>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <IncomingCallForm
                onSaved={() => {
                  setRefreshFlag((f) => f + 1)
                  setShowForm(false)
                  toast.success("Call logged successfully!")
                }}
              />
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Smart Call Analytics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-end bg-gradient-to-r from-gray-50 to-slate-50">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium">AI-Powered Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by name, company, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/80 backdrop-blur-sm border-gray-200/50"
                  />
                </div>
              </div>

              <div className="w-full md:w-40 space-y-1">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-40 space-y-1">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-40 space-y-1">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/80 backdrop-blur-sm border-gray-200/50",
                        !dateFilter && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-100">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="cursor-pointer font-semibold" onClick={() => requestSort("call_date")}>
                      Date{" "}
                      {sortConfig.key === "call_date" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="inline h-4 w-4" />
                        ) : (
                          <ChevronDown className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                    <TableHead className="cursor-pointer font-semibold" onClick={() => requestSort("call_time")}>
                      Time{" "}
                      {sortConfig.key === "call_time" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="inline h-4 w-4" />
                        ) : (
                          <ChevronDown className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                    <TableHead className="cursor-pointer font-semibold" onClick={() => requestSort("named_insured")}>
                      Named Insured{" "}
                      {sortConfig.key === "named_insured" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="inline h-4 w-4" />
                        ) : (
                          <ChevronDown className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Callback</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                          Loading call log entries...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCalls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <Phone className="h-12 w-12 text-gray-300 mb-2" />
                          <p>No call log entries found.</p>
                          <p className="text-sm">Try adjusting your search criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCalls.map((call) => (
                      <>
                        <TableRow key={call.id} className="group hover:bg-blue-50/50 transition-colors">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExpandedRow(expandedRow === call.id ? null : call.id)}
                              className="h-8 w-8"
                            >
                              {expandedRow === call.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{formatDate(call.call_date)}</TableCell>
                          <TableCell>{formatTime(call.call_time)}</TableCell>
                          <TableCell className="font-medium">{call.named_insured || "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{call.contact_name || "-"}</span>
                              {call.phone && (
                                <a
                                  href={`tel:${call.phone}`}
                                  className="text-blue-600 text-sm flex items-center hover:text-blue-800"
                                >
                                  <Phone className="h-3 w-3 mr-1" /> {call.phone}
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {call.category ? (
                              <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                                {call.category}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={call.status || "pending"}
                              onValueChange={(value) => updateStatus(call.id, value)}
                            >
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue>
                                  <Badge
                                    className={cn(
                                      "capitalize",
                                      call.status === "pending" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                                      call.status === "called back" && "bg-green-100 text-green-800 hover:bg-green-100",
                                      call.status === "message left" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                                      call.status === "resolved" && "bg-gray-100 text-gray-800 hover:bg-gray-100",
                                    )}
                                  >
                                    {call.status || "pending"}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <Badge
                                      className={cn(
                                        "capitalize",
                                        option.value === "pending" && "bg-yellow-100 text-yellow-800",
                                        option.value === "called back" && "bg-green-100 text-green-800",
                                        option.value === "message left" && "bg-blue-100 text-blue-800",
                                        option.value === "resolved" && "bg-gray-100 text-gray-800",
                                      )}
                                    >
                                      {option.label}
                                    </Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {call.call_back_date ? (
                              <div className="text-sm">
                                {formatDate(call.call_back_date)}
                                {call.call_back_time && <span> at {formatTime(call.call_back_time)}</span>}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => viewCallDetails(call.id)}
                                title="View Details"
                                className="h-8 w-8 hover:bg-blue-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {call.email && (
                                <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:bg-green-100">
                                  <a href={`mailto:${call.email}`} title="Send email">
                                    <Mail className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {call.phone && (
                                <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:bg-blue-100">
                                  <a href={`tel:${call.phone}`} title="Call">
                                    <Phone className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteCall(call.id)}
                                title="Delete"
                                className="h-8 w-8 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRow === call.id && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-gradient-to-r from-slate-50 to-blue-50 p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                                  <h4 className="font-medium mb-2 flex items-center">
                                    <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                                    Call Details
                                  </h4>
                                  <dl className="grid grid-cols-[120px_1fr] gap-1 text-sm">
                                    <dt className="text-gray-500">Reason:</dt>
                                    <dd>{call.reason || "-"}</dd>
                                    <dt className="text-gray-500">Notes:</dt>
                                    <dd className="whitespace-pre-line">{call.notes || "-"}</dd>
                                    <dt className="text-gray-500">Created:</dt>
                                    <dd>{call.created_at ? format(parseISO(call.created_at), "PPpp") : "-"}</dd>
                                  </dl>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                                  <h4 className="font-medium mb-2 flex items-center">
                                    <Users className="h-4 w-4 mr-2 text-green-600" />
                                    Contact Information
                                  </h4>
                                  <dl className="grid grid-cols-[120px_1fr] gap-1 text-sm">
                                    <dt className="text-gray-500">Company:</dt>
                                    <dd>{call.named_insured || "-"}</dd>
                                    <dt className="text-gray-500">Contact:</dt>
                                    <dd>{call.contact_name || "-"}</dd>
                                    <dt className="text-gray-500">Phone:</dt>
                                    <dd>
                                      {call.phone ? (
                                        <a href={`tel:${call.phone}`} className="text-blue-600 hover:text-blue-800">
                                          {call.phone}
                                        </a>
                                      ) : (
                                        "-"
                                      )}
                                    </dd>
                                    <dt className="text-gray-500">Email:</dt>
                                    <dd>
                                      {call.email ? (
                                        <a href={`mailto:${call.email}`} className="text-blue-600 hover:text-blue-800">
                                          {call.email}
                                        </a>
                                      ) : (
                                        "-"
                                      )}
                                    </dd>
                                  </dl>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Button
                                  asChild
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                  <Link to={`/call-log/${call.id}`}>View Full Details</Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
