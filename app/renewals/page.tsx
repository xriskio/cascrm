"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Search,
  Plus,
  UserPlus,
  Trash2,
  Upload,
  ArrowUpDown,
  AlertCircle,
  Download,
  Archive,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Renewal {
  id: string
  named_insured: string | null
  client_name: string | null
  insured_name: string | null
  policy_type: string | null
  lob: string | null
  policy_number: string | null
  expiration_date: string | null
  premium: number | null
  policy_premium: number | null
  status: string | null
  business_name: string | null
  carrier: string | null
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([])
  const [filteredRenewals, setFilteredRenewals] = useState<Renewal[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [activeTab, setActiveTab] = useState("Upcoming")
  const [selectedRenewals, setSelectedRenewals] = useState<string[]>([])
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [sortField, setSortField] = useState<"expiration_date">("expiration_date")
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [dateRangeStart, setDateRangeStart] = useState<string>("")
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("")
  const [showDateRangeImport, setShowDateRangeImport] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<string>("pending")

  // Calculate metrics from actual renewals data
  const totalRenewals = renewals.length
  const upcomingRenewals = renewals.filter((r) => {
    if (!r.expiration_date) return false
    const today = new Date()
    const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
    const expDate = new Date(r.expiration_date)
    return expDate >= today && expDate <= ninetyDaysFromNow
  }).length
  const pendingQuotes = renewals.filter((r) => r.status?.toLowerCase() === "pending").length
  const boundPolicies = renewals.filter((r) => r.status?.toLowerCase() === "bound").length
  const totalPremium = renewals.reduce((sum, r) => sum + (Number(r.premium) || r.policy_premium || 0), 0)

  const loadRenewals = async () => {
    setLoading(true)
    try {
      const { getRenewals } = await import("@/app/actions/renewal-actions")
      const result = await getRenewals()
      if (result.success) {
        setRenewals(result.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load renewals",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading renewals:", error)
      toast({
        title: "Error",
        description: "Failed to load renewals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fixed QQ Import function with your working token
  const handleImportFromQQ = async () => {
    setIsImporting(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      console.log("🚀 Starting QQ renewals import...")

      const response = await fetch("/api/qqcatalyst/renewals/import", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("🔍 QQ Import returned:", data)

      if (data.success) {
        setImportSuccess(`Successfully imported ${data.imported} renewals from QQCatalyst`)
        toast({
          title: "Import Successful",
          description: `Imported ${data.imported} renewals from QQCatalyst`,
        })
        loadRenewals() // Reload the renewals
      } else {
        setImportError(data.error || "Failed to import from QQCatalyst")
        toast({
          title: "Import Failed",
          description: data.error || "Failed to import from QQCatalyst",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error importing from QQ:", error)
      setImportError(`Failed to connect to QQCatalyst API: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast({
        title: "Import Error",
        description: `Failed to connect to QQCatalyst API: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Import renewals with date range filter
  const handleImportWithDateRange = async () => {
    if (!dateRangeStart || !dateRangeEnd) {
      toast({
        title: "Date Range Required",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
      return
    }

    // Validate start date is before or equal to end date
    if (new Date(dateRangeStart) > new Date(dateRangeEnd)) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before or equal to end date",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      console.log(`🚀 Importing QQ renewals from ${dateRangeStart} to ${dateRangeEnd}...`)

      // Format dates using local timestamps to avoid timezone shifts
      const startDate = new Date(`${dateRangeStart}T00:00:00`)
      const endDate = new Date(`${dateRangeEnd}T23:59:59.999`)

      const response = await fetch("/api/qqcatalyst/renewals/import-filtered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("🔍 Filtered QQ Import returned:", data)

      if (data.success) {
        setImportSuccess(
          `Successfully imported ${data.imported} of ${data.total} renewals from QQCatalyst (${dateRangeStart} to ${dateRangeEnd})`
        )
        toast({
          title: "Import Successful",
          description: `Imported ${data.imported} renewals from QQCatalyst`,
        })
        loadRenewals()
        setShowDateRangeImport(false)
      } else {
        setImportError(data.message || "Failed to import from QQCatalyst")
        toast({
          title: "Import Failed",
          description: data.message || "Failed to import from QQCatalyst",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error importing from QQ:", error)
      setImportError(`Failed to connect to QQCatalyst API: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast({
        title: "Import Error",
        description: `Failed to connect to QQCatalyst API: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleRemoveDuplicates = async () => {
    setLoading(true)
    try {
      const { removeDuplicateRenewals } = await import("@/app/actions/renewal-actions")
      const result = await removeDuplicateRenewals()
      if (result.success) {
        toast({
          title: "Success",
          description: `Removed ${result.deletedCount || 0} duplicate renewals`,
        })
        loadRenewals()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove duplicates",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing duplicates:", error)
      toast({
        title: "Error",
        description: "Failed to remove duplicates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRenewal = (renewalId: string, checked: boolean) => {
    if (checked) {
      setSelectedRenewals((prev) => [...prev, renewalId])
    } else {
      setSelectedRenewals((prev) => prev.filter((id) => id !== renewalId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedRenewals(filteredRenewals.map((r) => r.id))
    } else {
      setSelectedRenewals([])
    }
  }

  const handleBulkDelete = async () => {
    setLoading(true)
    try {
      const { bulkDeleteRenewals } = await import("@/app/actions/renewal-actions")
      const result = await bulkDeleteRenewals(selectedRenewals)
      if (result.success) {
        toast({
          title: "Success",
          description: `Deleted ${selectedRenewals.length} renewals`,
        })
        setSelectedRenewals([])
        setShowBulkModal(false)
        loadRenewals()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete renewals",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting renewals:", error)
      toast({
        title: "Error",
        description: "Failed to delete renewals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkStatusChange = async () => {
    setLoading(true)
    try {
      const { bulkUpdateRenewalStatus } = await import("@/app/actions/renewal-actions")
      const result = await bulkUpdateRenewalStatus(selectedRenewals, bulkStatus)
      if (result.success) {
        toast({
          title: "Success",
          description: `Updated status for ${selectedRenewals.length} renewals to ${bulkStatus}`,
        })
        setSelectedRenewals([])
        setShowBulkModal(false)
        loadRenewals()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update renewal status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating renewal status:", error)
      toast({
        title: "Error",
        description: "Failed to update renewal status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkArchive = async () => {
    setLoading(true)
    try {
      const { bulkArchiveRenewals } = await import("@/app/actions/renewal-actions")
      const result = await bulkArchiveRenewals(selectedRenewals)
      if (result.success) {
        toast({
          title: "Success",
          description: `Archived ${selectedRenewals.length} renewals`,
        })
        setSelectedRenewals([])
        setShowBulkModal(false)
        loadRenewals()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to archive renewals",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error archiving renewals:", error)
      toast({
        title: "Error",
        description: "Failed to archive renewals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRenewals()
  }, [])

  // Archive renewal handler
  const handleArchive = async (renewalId: string) => {
    try {
      const { archiveRenewal } = await import("@/app/actions/renewal-actions")
      const result = await archiveRenewal(renewalId)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Renewal archived successfully",
        })
        loadRenewals()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to archive renewal",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error archiving renewal:", error)
      toast({
        title: "Error",
        description: "Failed to archive renewal",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    setFilteredRenewals(renewals)
  }, [renewals])

  useEffect(() => {
    filterRenewals()
  }, [renewals, searchTerm, statusFilter, activeTab, sortDirection, sortField, dateRangeStart, dateRangeEnd, showArchived])

  const filterRenewals = () => {
    let filtered = renewals

    // Filter out archived renewals by default
    if (!showArchived) {
      filtered = filtered.filter((r) => r.status?.toLowerCase() !== "archived")
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.named_insured?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.policy_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.policy_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.lob?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Date range filter
    if (dateRangeStart && dateRangeEnd) {
      // Use local timestamps to avoid timezone shifts
      const startDate = new Date(`${dateRangeStart}T00:00:00`)
      const endDate = new Date(`${dateRangeEnd}T23:59:59.999`)
      
      filtered = filtered.filter((r) => {
        if (!r.expiration_date) return false
        const expDate = new Date(r.expiration_date)
        return expDate >= startDate && expDate <= endDate
      })
    }

    if (activeTab !== "All Renewals") {
      if (activeTab === "Upcoming") {
        const today = new Date()
        const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter((r) => {
          if (!r.expiration_date) return false
          const expDate = new Date(r.expiration_date)
          return expDate >= today && expDate <= ninetyDaysFromNow
        })
      } else if (activeTab === "Pending") {
        filtered = filtered.filter((r) => r.status?.toLowerCase() === "pending")
      } else if (activeTab === "Bound") {
        filtered = filtered.filter((r) => r.status?.toLowerCase() === "bound")
      }
    }

    // Apply sorting
    if (sortField === "expiration_date") {
      filtered.sort((a, b) => {
        const dateA = a.expiration_date ? new Date(a.expiration_date).getTime() : 0
        const dateB = b.expiration_date ? new Date(b.expiration_date).getTime() : 0

        if (sortDirection === "asc") {
          return dateA - dateB
        } else {
          return dateB - dateA
        }
      })
    }

    setFilteredRenewals(filtered)
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDaysUntilExpiration = (expirationDate: string | null) => {
    if (!expirationDate) return 0
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleView = (renewalId: string) => {
    router.push(`/renewals/${renewalId}`)
  }

  const handleEdit = (renewalId: string) => {
    router.push(`/renewals/${renewalId}/edit`)
  }

  const handleDelete = async (renewalId: string) => {
    if (!confirm("Are you sure you want to delete this renewal?")) return

    setLoading(true)
    try {
      const { deleteRenewal } = await import("@/app/actions/renewal-actions")
      const result = await deleteRenewal(renewalId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Renewal deleted successfully",
        })
        loadRenewals()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete renewal",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting renewal:", error)
      toast({
        title: "Error",
        description: "Failed to delete renewal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (renewalId: string, newStatus: string) => {
    setLoading(true)
    try {
      const { updateRenewalStatus } = await import("@/app/actions/renewal-actions")
      const result = await updateRenewalStatus(renewalId, newStatus)
      if (result.success) {
        toast({
          title: "Success",
          description: "Status updated successfully",
        })
        loadRenewals()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSort = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc"
    setSortDirection(newDirection)
  }

  const handleClearAllRenewals = async () => {
    if (!confirm("Are you sure you want to delete ALL renewals? This cannot be undone.")) return

    setLoading(true)
    try {
      const response = await fetch("/api/renewals/clear-all", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Deleted all ${data.deleted} renewals`,
        })
        loadRenewals()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to clear renewals",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error clearing renewals:", error)
      toast({
        title: "Error",
        description: "Failed to clear renewals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Renewals Dashboard</h1>
            <p className="text-blue-100 mt-1">Manage and track all policy renewals in one place</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-red-600/90 border-red-500/50 text-white hover:bg-red-700"
              onClick={handleClearAllRenewals}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? "Clearing..." : "Clear All Renewals"}
            </Button>

            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleRemoveDuplicates}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? "Removing..." : "Remove Duplicates"}
            </Button>

            {/* QQ Import Button */}
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleImportFromQQ}
              disabled={isImporting}
              title="Import upcoming renewals (next 4 months)"
            >
              <Download className={`h-4 w-4 mr-2 ${isImporting ? "animate-spin" : ""}`} />
              {isImporting ? "Importing..." : "Import Upcoming (4mo)"}
            </Button>

            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => router.push("/renewals/import")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setShowBulkModal(true)}
              disabled={selectedRenewals.length === 0}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedRenewals.length})
            </Button>
            <Button className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => router.push("/renewals/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Renewal
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Import Status Messages */}
        {importSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Import Successful</AlertTitle>
            <AlertDescription className="text-green-700">{importSuccess}</AlertDescription>
          </Alert>
        )}

        {importError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Import Failed</AlertTitle>
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Renewals</p>
                  <p className="text-3xl font-bold text-gray-900">{totalRenewals}</p>
                  <p className="text-sm text-blue-600 mt-1 flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    All renewals in system
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Renewals</p>
                  <p className="text-3xl font-bold text-gray-900">{upcomingRenewals}</p>
                  <p className="text-sm text-orange-600 mt-1 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Next 90 days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Quotes</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingQuotes}</p>
                  <p className="text-sm text-yellow-600 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Require attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Premium</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPremium)}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Annual value
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search renewals by name, policy number, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Bound">Bound</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
              <SelectItem value="Non-Renewed">Non-Renewed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleSort}>
            <ArrowUpDown className="h-4 w-4" />
            Expiration ({sortDirection === "asc" ? "Oldest First" : "Newest First"})
          </Button>
          <Button
            variant={showArchived ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Filter by Expiration Date</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="flex-1"
                    placeholder="Start Date"
                  />
                  <span className="self-center text-gray-500">to</span>
                  <Input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="flex-1"
                    placeholder="End Date"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(dateRangeStart || dateRangeEnd) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateRangeStart("")
                      setDateRangeEnd("")
                    }}
                  >
                    Clear Dates
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={() => setShowDateRangeImport(!showDateRangeImport)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {showDateRangeImport ? "Hide" : "Import by Date"}
                </Button>
              </div>
            </div>

            {/* Date Range Import Section */}
            {showDateRangeImport && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Import Renewals from QQCatalyst by Date Range
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Select a date range above and click the button below to import renewals expiring within that period
                    from QQCatalyst.
                  </p>
                  <Button
                    onClick={handleImportWithDateRange}
                    disabled={isImporting || !dateRangeStart || !dateRangeEnd}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                  >
                    <Download className={`h-4 w-4 mr-2 ${isImporting ? "animate-spin" : ""}`} />
                    {isImporting ? "Importing..." : "Import from QQCatalyst"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {["Upcoming", "Pending", "Bound", "All Renewals"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Renewals Table */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                All Renewals{" "}
                <span className="text-sm font-normal text-gray-500">{filteredRenewals.length} renewals</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                      <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">CLIENT</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">POLICY INFO</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">EXPIRATION</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">PREMIUM</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">STATUS</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRenewals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                        {loading ? (
                          "Loading renewals..."
                        ) : (
                          <div>
                            <p className="mb-4">No renewals found. Import data from QQCatalyst to get started.</p>
                            <Button onClick={handleImportFromQQ} disabled={isImporting}>
                              <Download className="h-4 w-4 mr-2" />
                              {isImporting ? "Importing..." : "Import from QQ"}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredRenewals.map((renewal) => (
                      <tr key={renewal.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <Checkbox
                            checked={selectedRenewals.includes(renewal.id)}
                            onCheckedChange={(checked) => handleSelectRenewal(renewal.id, checked as boolean)}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{renewal.named_insured || renewal.client_name || "Unknown Client"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{renewal.policy_type || "Unknown Type"}</div>
                            <div className="text-sm text-gray-500">Policy #: {renewal.policy_number || "N/A"}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{formatDate(renewal.expiration_date)}</div>
                            <div className="text-sm text-gray-500">
                              {getDaysUntilExpiration(renewal.expiration_date) > 0
                                ? `${getDaysUntilExpiration(renewal.expiration_date)} days left`
                                : `Expired ${Math.abs(getDaysUntilExpiration(renewal.expiration_date))} days ago`}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{formatCurrency(renewal.policy_premium)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Select
                            value={renewal.status || "pending"}
                            onValueChange={(value) => handleStatusChange(renewal.id, value)}
                          >
                            <SelectTrigger className="w-32 border-none shadow-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="bound">Bound</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                              <SelectItem value="non-renewed">Non-Renewed</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleView(renewal.id)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gray-900 text-white hover:bg-gray-800"
                              onClick={() => handleEdit(renewal.id)}
                            >
                              Edit
                            </Button>
                            {renewal.status?.toLowerCase() === "bound" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleArchive(renewal.id)}
                              >
                                <Archive className="h-4 w-4 mr-1" />
                                Archive
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDelete(renewal.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Bulk Actions</h3>
            <p className="text-gray-600 mb-4">
              Perform actions on {selectedRenewals.length} selected renewal{selectedRenewals.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-3">
              {/* Bulk Status Change */}
              <div className="border border-gray-200 rounded-lg p-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Change Status</label>
                <div className="flex gap-2">
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="bound">Bound</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="non-renewed">Non-Renewed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkStatusChange} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
              </div>

              {/* Bulk Archive */}
              <Button 
                variant="outline" 
                onClick={handleBulkArchive} 
                disabled={loading} 
                className="w-full text-green-600 border-green-200 hover:bg-green-50"
              >
                <Archive className="h-4 w-4 mr-2" />
                {loading ? "Archiving..." : `Archive ${selectedRenewals.length} Renewals`}
              </Button>

              {/* Bulk Delete */}
              <Button variant="destructive" onClick={handleBulkDelete} disabled={loading} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                {loading ? "Deleting..." : `Delete ${selectedRenewals.length} Renewals`}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBulkModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
