
import { useEffect } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Link } from "react-router-dom"
import { fetchClients } from "./fetchClients"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Grid3X3,
  List,
  Download,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

interface Client {
  id: string
  name: string
  business_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  status?: string
  total_premium?: number
  renewal_date?: string
  created_at?: string
  policy_count?: number
  entity_id?: string | number
  qq_contact_id?: string | number
  customerDetails?: any
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCarrier, setFilterCarrier] = useState("all")
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({})
  const [dataSource, setDataSource] = useState<"db" | "qq" | "both">("db")
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  // Load clients from database
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch clients from database
        const clientData = await fetchClients().catch((err) => {
          console.error("Error fetching clients:", err)
          return []
        })

        if (!clientData || clientData.length === 0) {
          setError("No clients found in the database. Try importing from QQCatalyst.")
        }

        console.log(`Loaded ${clientData?.length || 0} clients from database`)
        setClients(clientData || [])
      } catch (error) {
        console.error("Error loading clients:", error)
        setError(`Failed to load clients: ${error instanceof Error ? error.message : String(error)}`)
        setClients([])
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  // Function to refresh client data
  const refreshClientData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      // Force refresh from database
      const clientData = await fetchClients(0).catch((err) => {
        console.error("Error refreshing clients:", err)
        return []
      })

      console.log(`Refreshed ${clientData?.length || 0} clients from database`)
      setClients(clientData || [])

      // If still no data, show error
      if (!clientData || clientData.length === 0) {
        setError("No clients found after refresh. Try importing from QQCatalyst.")
      }
    } catch (error) {
      console.error("Error refreshing clients:", error)
      setError(`Failed to refresh clients: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setRefreshing(false)
    }
  }

  // Fixed QQ Import function
  const handleImportFromQQ = async () => {
    setIsImporting(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      console.log("🚀 Starting QQ clients import...")

      const response = await fetch("/api/qqcatalyst/import-all", {
        method: "POST",
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
        setImportSuccess(`Successfully imported ${data.imported} clients from QQCatalyst`)
        toast({
          title: "Import Successful",
          description: `Imported ${data.imported} clients from QQCatalyst`,
        })
        refreshClientData() // Reload the clients
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

  // Calculate metrics from real data only
  const totalClients = clients.length
  const totalPremium = clients.reduce((sum, client) => sum + (client.total_premium || 0), 0)
  const renewalsDue = clients.filter((client) => {
    if (!client.renewal_date) return false
    const renewalDate = new Date(client.renewal_date)
    const now = new Date()
    const oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    return renewalDate <= oneMonthFromNow && renewalDate >= now
  }).length

  const activeClients = clients.filter((client) => client.status === "active").length
  const highValueClients = clients.filter((client) => (client.total_premium || 0) > 10000).length

  // Filter and search clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      !searchQuery ||
      client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.includes(searchQuery) ||
      client.id?.toString().includes(searchQuery) ||
      (client.qq_contact_id || "").toString().includes(searchQuery)

    const matchesType =
      filterType === "all" ||
      (filterType === "individual" && !client.business_name) ||
      (filterType === "business" && client.business_name)

    const matchesStatus = filterStatus === "all" || client.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Sort clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
      case "oldest":
        return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
      case "name":
        return (a.name || "").localeCompare(b.name || "")
      case "premium":
        return (b.total_premium || 0) - (a.total_premium || 0)
      default:
        return 0
    }
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const ClientCard = ({ client }: { client: Client }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <CardTitle className="text-lg font-semibold">{client.name}</CardTitle>
            </div>
            {client.business_name && (
              <CardDescription className="text-sm text-blue-600 font-medium">{client.business_name}</CardDescription>
            )}
            <div className="flex items-center mt-1 space-x-2">
              <Badge className={getStatusColor(client.status)} variant="outline">
                {client.status || "Unknown"}
              </Badge>
              {client.qq_contact_id && <span className="text-xs text-gray-500">#{client.qq_contact_id}</span>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/clients/${client.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/clients/${client.id}/policies`}>View Policies</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/clients/${client.id}/emails`}>Send Email</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/clients/${client.id}/tasks-notes`}>Add Task</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {client.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-3 w-3 mr-2" />
              {client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-3 w-3 mr-2" />
              {client.phone}
            </div>
          )}
          {(client.city || client.state) && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 mr-2" />
              {[client.city, client.state].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-gray-500">
            Added {client.created_at ? new Date(client.created_at).toLocaleDateString() : "Unknown"}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/clients/${client.id}`}>View</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-gray-600">Client management and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshClientData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>

          {/* QQ Import Button */}
          <Button variant="outline" size="sm" onClick={handleImportFromQQ} disabled={isImporting}>
            <Download className={`h-4 w-4 mr-2 ${isImporting ? "animate-spin" : ""}`} />
            {isImporting ? "Importing..." : "Import from QQ"}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/qqcatalyst/sync">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Advanced Import
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Advanced QQCatalyst import options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

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

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-2xl font-bold">{totalClients}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Clients</p>
              <p className="text-2xl font-bold">{activeClients}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Premium</p>
              <p className="text-2xl font-bold">
                ${totalPremium.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Renewals Due</p>
              <p className="text-2xl font-bold">{renewalsDue}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Value</p>
              <p className="text-2xl font-bold">{highValueClients}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search clients..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Client Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="premium">Premium (High-Low)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2">Loading clients...</p>
            </div>
          ) : sortedClients.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">
                No clients found. Try adjusting your filters or import from QQCatalyst.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <Link to="/clients/new">Add New Client</Link>
                </Button>
                <Button variant="outline" onClick={handleImportFromQQ} disabled={isImporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isImporting ? "Importing..." : "Import from QQCatalyst"}
                </Button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <h3 className="font-medium">{client.name}</h3>
                          {client.business_name && <p className="text-sm text-blue-600">{client.business_name}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(client.status)} variant="outline">
                          {client.status || "Unknown"}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/clients/${client.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm">
                          {client.email || "No email"} • {client.phone || "No phone"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm">
                          {[client.city, client.state].filter(Boolean).join(", ") || "No location"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Added</p>
                        <p className="text-sm">{formatDate(client.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="active">
          <div className="text-center py-10">
            <p>Active clients will be shown here.</p>
          </div>
        </TabsContent>
        <TabsContent value="inactive">
          <div className="text-center py-10">
            <p>Inactive clients will be shown here.</p>
          </div>
        </TabsContent>
        <TabsContent value="prospects">
          <div className="text-center py-10">
            <p>Prospects will be shown here.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Client Button (Fixed) */}
      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="rounded-full shadow-lg" asChild>
          <Link to="/clients/new">
            <Plus className="h-5 w-5 mr-2" />
            Add Client
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default ClientsPage
