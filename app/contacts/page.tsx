"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Users,
  TrendingUp,
  Grid3X3,
  List,
  Download,
  Upload,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Shield,
  Clock,
  User,
  Tag,
  RefreshCw,
  AlertCircle,
  Building2,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Contact {
  id: string
  entity_id: string
  display_name: string
  customer_no?: string
  first_name?: string
  last_name?: string
  company_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  is_person?: boolean
  prospect?: boolean
  customer_since?: string
  agent_name?: string
  csr_name?: string
  customer_priority?: string
  type?: string
  created_at?: string
  updated_at?: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load contacts from database
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try multiple possible table names where contacts might be stored
      const tablesToTry = ["contacts", "qqcatalyst_contacts", "clients"]
      const allContacts: Contact[] = []
      let foundData = false

      for (const tableName of tablesToTry) {
        try {
          console.log(`Trying to load from table: ${tableName}`)

          const { data, error: fetchError } = await supabase
            .from(tableName)
            .select("*")
            .order("created_at", { ascending: false })

          if (fetchError) {
            console.log(`Table ${tableName} error:`, fetchError.message)
            continue
          }

          if (data && data.length > 0) {
            console.log(`Found ${data.length} records in ${tableName}`)

            // Transform data to match our Contact interface
            const transformedData = data.map((item: any) => ({
              id: item.id || item.entity_id,
              entity_id: item.entity_id || item.id,
              display_name:
                item.display_name ||
                item.name ||
                `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
                "Unknown",
              customer_no: item.customer_no || item.customer_number,
              first_name: item.first_name,
              last_name: item.last_name,
              company_name: item.company_name || item.business_name,
              email: item.email,
              phone: item.phone,
              address: item.address,
              city: item.city,
              state: item.state,
              zip: item.zip,
              is_person: item.is_person,
              prospect: item.prospect,
              customer_since: item.customer_since,
              agent_name: item.agent_name,
              csr_name: item.csr_name,
              customer_priority: item.customer_priority,
              type: item.type,
              created_at: item.created_at,
              updated_at: item.updated_at,
            }))

            allContacts.push(...transformedData)
            foundData = true
          }
        } catch (tableError) {
          console.log(`Error accessing table ${tableName}:`, tableError)
        }
      }

      setContacts(allContacts)

      if (!foundData) {
        setError(
          "No contacts found in any table. The import might have failed or data might be in a different location.",
        )
      } else {
        console.log(`Successfully loaded ${allContacts.length} total contacts`)
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
      setError(`Failed to load contacts: ${error instanceof Error ? error.message : String(error)}`)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const refreshContacts = async () => {
    setRefreshing(true)
    await loadContacts()
    setRefreshing(false)
  }

  // Calculate metrics
  const totalContacts = contacts.length
  const prospects = contacts.filter((c) => c.prospect).length
  const customers = contacts.filter((c) => !c.prospect).length
  const businesses = contacts.filter((c) => !c.is_person).length
  const individuals = contacts.filter((c) => c.is_person).length

  // Filter and search contacts
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      !searchQuery ||
      contact.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery) ||
      contact.customer_no?.includes(searchQuery) ||
      contact.entity_id?.includes(searchQuery)

    const matchesType =
      filterType === "all" ||
      (filterType === "individual" && contact.is_person) ||
      (filterType === "business" && !contact.is_person)

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "prospect" && contact.prospect) ||
      (filterStatus === "customer" && !contact.prospect)

    return matchesSearch && matchesType && matchesStatus
  })

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
      case "oldest":
        return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
      case "name":
        return (a.display_name || "").localeCompare(b.display_name || "")
      case "customer_no":
        return (a.customer_no || "").localeCompare(b.customer_no || "")
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

  const getStatusColor = (isProspect?: boolean) => {
    return isProspect ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
  }

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "bg-gray-100 text-gray-800"

    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium mr-3">
                {contact.display_name ? getInitials(contact.display_name) : "??"}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{contact.display_name}</CardTitle>
                {contact.company_name && (
                  <CardDescription className="text-sm text-blue-600 font-medium">
                    {contact.company_name}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center mt-2 space-x-2">
              <Badge className={getStatusColor(contact.prospect)} variant="outline">
                {contact.prospect ? "Prospect" : "Customer"}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800" variant="outline">
                {contact.is_person ? "Individual" : "Business"}
              </Badge>
              {contact.customer_priority && (
                <Badge className={getPriorityColor(contact.customer_priority)} variant="outline">
                  {contact.customer_priority}
                </Badge>
              )}
              {contact.customer_no && <span className="text-xs text-gray-500">#{contact.customer_no}</span>}
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
                <Link href={`/contacts/${contact.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/contacts/${contact.id}/policies`}>View Policies</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/contacts/${contact.id}/files`}>View Files</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/contacts/${contact.id}/account`}>Account Info</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {contact.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-3 w-3 mr-2" />
              {contact.email}
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-3 w-3 mr-2" />
              {contact.phone}
            </div>
          )}
          {(contact.city || contact.state) && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 mr-2" />
              {[contact.city, contact.state].filter(Boolean).join(", ")}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Account Information</h4>
          <div className="grid grid-cols-2 gap-2">
            {contact.agent_name && (
              <div className="flex items-center text-xs">
                <User className="h-3 w-3 mr-1 text-blue-500" />
                <span className="text-gray-600">Agent: {contact.agent_name}</span>
              </div>
            )}
            {contact.csr_name && (
              <div className="flex items-center text-xs">
                <Shield className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-gray-600">CSR: {contact.csr_name}</span>
              </div>
            )}
            {contact.customer_since && (
              <div className="flex items-center text-xs">
                <Clock className="h-3 w-3 mr-1 text-purple-500" />
                <span className="text-gray-600">Since: {formatDate(contact.customer_since)}</span>
              </div>
            )}
            {contact.type && (
              <div className="flex items-center text-xs">
                <Tag className="h-3 w-3 mr-1 text-orange-500" />
                <span className="text-gray-600">Type: {contact.type}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-gray-500">
            Added {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "Unknown"}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/contacts/${contact.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Link>
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
          <h1 className="text-3xl font-bold">QQCatalyst Contacts</h1>
          <p className="text-gray-600">Imported contacts and customer data from QQCatalyst</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshContacts} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/qqcatalyst/sync">
              <Upload className="h-4 w-4 mr-2" />
              Import from QQ
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-gray-600">From QQCatalyst</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers}</div>
            <p className="text-xs text-gray-600">{prospects} prospects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businesses}</div>
            <p className="text-xs text-gray-600">{individuals} individuals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Import Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts > 0 ? "Active" : "Empty"}</div>
            <p className="text-xs text-gray-600">Data sync status</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, phone, customer number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="customer_no">Customer #</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Contacts ({totalContacts})</TabsTrigger>
            <TabsTrigger value="customers">Customers ({customers})</TabsTrigger>
            <TabsTrigger value="prospects">Prospects ({prospects})</TabsTrigger>
            <TabsTrigger value="businesses">Businesses ({businesses})</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {sortedContacts.length} of {totalContacts} contacts
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export ({totalContacts})
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading contacts...</div>
            </div>
          ) : sortedContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Contacts Found</h3>
              <p className="text-gray-600 mb-4">Import contact data from QQCatalyst to get started.</p>
              <Button asChild>
                <Link href="/admin/qqcatalyst/sync">
                  <Upload className="h-4 w-4 mr-2" />
                  Import from QQCatalyst
                </Link>
              </Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {sortedContacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {sortedContacts
              .filter((c) => !c.prospect)
              .map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="prospects" className="space-y-4">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {sortedContacts
              .filter((c) => c.prospect)
              .map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="businesses" className="space-y-4">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {sortedContacts
              .filter((c) => !c.is_person)
              .map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
