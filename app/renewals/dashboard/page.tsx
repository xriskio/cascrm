"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, FileText, CheckCircle, Clock, Search, Plus, UserPlus, Trash2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RenewalDashboardData {
  totalRenewals: number
  upcomingRenewals: number
  pendingQuotes: number
  boundRenewals: number
  totalPremium: number
  avgPremium: number
  renewalsByStatus: Record<string, number>
  recentActivity: any[]
  upcomingDeadlines: any[]
}

export default function RenewalDashboard() {
  const [dashboardData, setDashboardData] = useState<RenewalDashboardData>({
    totalRenewals: 0,
    upcomingRenewals: 0,
    pendingQuotes: 0,
    boundRenewals: 0,
    totalPremium: 0,
    avgPremium: 0,
    renewalsByStatus: {},
    recentActivity: [],
    upcomingDeadlines: [],
  })
  const [renewals, setRenewals] = useState<any[]>([])
  const [filteredRenewals, setFilteredRenewals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    setFilteredRenewals(renewals)
  }, [renewals])

  useEffect(() => {
    filterRenewals()
  }, [renewals, searchTerm, statusFilter, activeTab])

  const filterRenewals = () => {
    let filtered = renewals

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.policy_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.policy_type?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (activeTab !== "all") {
      if (activeTab === "upcoming") {
        const today = new Date()
        const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter((r) => {
          if (!r.expiration_date) return false
          const expDate = new Date(r.expiration_date)
          return expDate >= today && expDate <= ninetyDaysFromNow
        })
      } else if (activeTab === "pending") {
        filtered = filtered.filter((r) => r.status?.toLowerCase() === "pending")
      } else if (activeTab === "bound") {
        filtered = filtered.filter((r) => r.status?.toLowerCase() === "bound")
      }
    }

    setFilteredRenewals(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/15 text-yellow-300"
      case "contacted":
        return "bg-blue-500/15 text-blue-300"
      case "quoted":
        return "bg-purple-500/15 text-purple-300"
      case "bound":
        return "bg-green-500/15 text-green-300"
      case "declined":
        return "bg-red-500/15 text-red-300"
      case "non-renewed":
        return "bg-orange-500/15 text-orange-300"
      case "lost":
        return "bg-muted text-foreground"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const { getRenewals } = await import("@/app/actions/renewal-actions")
      const result = await getRenewals()
      if (result.success) {
        const renewalsData = result.data || []
        setRenewals(renewalsData)

        // Calculate dashboard metrics
        const totalRenewals = renewalsData.length
        const upcomingRenewals = renewalsData.filter((r) => {
          if (!r.expiration_date) return false
          const today = new Date()
          const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
          const expDate = new Date(r.expiration_date)
          return expDate >= today && expDate <= ninetyDaysFromNow
        }).length
        const pendingQuotes = renewalsData.filter((r) => r.status?.toLowerCase() === "pending").length
        const boundRenewals = renewalsData.filter((r) => r.status?.toLowerCase() === "bound").length
        const totalPremium = renewalsData.reduce((sum, r) => sum + (r.policy_premium || 0), 0)

        setDashboardData({
          totalRenewals,
          upcomingRenewals,
          pendingQuotes,
          boundRenewals,
          totalPremium,
          avgPremium: totalRenewals > 0 ? totalPremium / totalRenewals : 0,
          renewalsByStatus: {},
          recentActivity: [],
          upcomingDeadlines: [],
        })
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card text-foreground p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Renewals Dashboard</h1>
            <p className="text-blue-100 mt-1">Manage and track all policy renewals in one place</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Duplicates
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
            <Button className="bg-card text-blue-600 hover:bg-muted">
              <Plus className="h-4 w-4 mr-2" />
              New Renewal
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Renewals</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.totalRenewals}</p>
                  <p className="text-sm text-blue-600 mt-1">📊 Click to view all renewals</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Renewals</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.upcomingRenewals}</p>
                  <p className="text-sm text-orange-600 mt-1">📅 Next 90 days</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Quotes</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.pendingQuotes}</p>
                  <p className="text-sm text-yellow-600 mt-1">⚠️ Require attention</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bound Policies</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.boundRenewals}</p>
                  <p className="text-sm text-green-600 mt-1">💰 Total: $1,258,821.41</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="bound">Bound</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="non-renewed">Non-Renewed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Expiration (Earliest)
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "all" ? "bg-card text-blue-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Renewals
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "upcoming" ? "bg-card text-blue-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "pending" ? "bg-card text-blue-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab("bound")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "bound" ? "bg-card text-blue-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bound
              </button>
            </div>

            {/* Renewals Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  All Renewals{" "}
                  <span className="text-sm font-normal text-muted-foreground">{filteredRenewals.length} renewals</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">CLIENT</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">POLICY INFO</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">EXPIRATION</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">PREMIUM</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">STATUS</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRenewals.map((renewal) => (
                      <tr key={renewal.id} className="border-b border-border hover:bg-muted">
                        <td className="py-4 px-4">
                          <div className="font-medium text-foreground">{renewal.client_name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-foreground">{renewal.policy_type}</div>
                            <div className="text-sm text-muted-foreground">Policy #: {renewal.policy_number}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-foreground">
                              {new Date(renewal.expiration_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Expired {Math.abs(getDaysUntilExpiration(renewal.expiration_date))} days ago
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-foreground">
                            ${renewal.policy_premium?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={renewal.status}
                            className="text-sm border-none bg-transparent focus:outline-none"
                          >
                            <option value="Non-Renewed">Non-Renewed</option>
                            <option value="Pending">Pending</option>
                            <option value="Bound">Bound</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-border hover:bg-blue-500/10"
                            >
                              View
                            </Button>
                            <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-border hover:bg-orange-500/10"
                            >
                              Archive
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-border hover:bg-red-500/10">
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
