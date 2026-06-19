"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Plus, Edit, Trash2, Eye, Filter, Sparkles, Building, Users, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { createClient } from "@/lib/supabase/client"
import type { CarrierContact } from "@/types/carrier"

// Insurance specialties for filtering
const specialties = [
  "PUBLIC AUTO",
  "NEMT",
  "CONTRACTORS",
  "LESSORS RISK",
  "BUILDERS RISK",
  "HOME",
  "AUTO",
  "FLOOD",
  "EARTHQUAKE",
]

export default function CarrierContactsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [carriers, setCarriers] = useState<CarrierContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCarriers() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { data, error } = await supabase
          .from("carrier_contacts")
          .select("*")
          .order("insurance_carrier", { ascending: true })

        if (error) {
          console.error("Error fetching carrier contacts:", error)
          setError("Failed to load carrier contacts. Please try again.")
          return
        }

        setCarriers((data as any) || [])
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadCarriers()
  }, [])

  // Filter carriers based on search term and active filters
  const filteredCarriers = carriers.filter((carrier) => {
    const matchesSearch =
      carrier.insurance_carrier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.agency_contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.underwriter_contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.agency_contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.customer_service_phone?.includes(searchTerm)

    const matchesFilters =
      activeFilters.length === 0 ||
      (carrier.specialties && activeFilters.some((filter) => carrier.specialties?.includes(filter)))

    return matchesSearch && matchesFilters
  })

  const toggleFilter = (specialty: string) => {
    if (activeFilters.includes(specialty)) {
      setActiveFilters(activeFilters.filter((f) => f !== specialty))
    } else {
      setActiveFilters([...activeFilters, specialty])
    }
  }

  const handleDeleteCarrier = async (id: string) => {
    if (!confirm("Are you sure you want to delete this carrier contact?")) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from("carrier_contacts").delete().eq("id", id as any)

      if (error) {
        console.error("Error deleting carrier contact:", error)
        alert(`Error deleting carrier contact: ${error.message}`)
        return
      }

      // Remove the deleted carrier from the state
      setCarriers(carriers.filter((carrier) => carrier.id !== id))
    } catch (error) {
      console.error("Error deleting carrier contact:", error)
      alert("An unexpected error occurred. Please try again.")
    }
  }

  const stats = {
    total: carriers.length,
    active: carriers.filter((c) => c.specialties && c.specialties.length > 0).length,
    withContacts: carriers.filter((c) => c.agency_contact_email || c.underwriter_email).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="AI Carrier Intelligence" subtitle="Smart carrier management and relationship analytics">
        <Link href="/carrier-contacts/add">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" /> Add Carrier
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* AI Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Carriers</CardTitle>
              <Building className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs opacity-80">Insurance partners</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Carriers</CardTitle>
              <Users className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs opacity-80">With specialties</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">With Contacts</CardTitle>
              <Mail className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withContacts}</div>
              <p className="text-xs opacity-80">Contact info available</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="🔍 Search carriers, contacts, emails, or phone numbers..."
                  className="pl-10 bg-card backdrop-blur-sm border-border/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                className="flex items-center bg-card backdrop-blur-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter by Specialty
              </Button>
            </div>

            {showFilters && (
              <div className="p-4 border rounded-md bg-gradient-to-r from-muted to-slate-50">
                <h3 className="font-medium mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  Filter by Insurance Type:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => (
                    <Button
                      key={specialty}
                      variant={activeFilters.includes(specialty) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter(specialty)}
                      className={
                        activeFilters.includes(specialty)
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          : "bg-card backdrop-blur-sm"
                      }
                    >
                      {specialty}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 bg-card backdrop-blur-sm">
            <TabsTrigger value="all">All Carriers</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recent">Recently Contacted</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <Card className="bg-card backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Carrier Directory ({filteredCarriers.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="flex items-center justify-center">
                      <Sparkles className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                      Loading carrier contacts...
                    </div>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-red-500">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                      Retry
                    </Button>
                  </div>
                ) : filteredCarriers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-muted to-slate-50">
                          <th className="px-4 py-3 text-left font-semibold">Insurance Carrier</th>
                          <th className="px-4 py-3 text-left font-semibold">Producer Code</th>
                          <th className="px-4 py-3 text-left font-semibold">Agency Contact</th>
                          <th className="px-4 py-3 text-left font-semibold">Underwriter</th>
                          <th className="px-4 py-3 text-left font-semibold">Customer Service</th>
                          <th className="px-4 py-3 text-left font-semibold">Specialties</th>
                          <th className="px-4 py-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredCarriers.map((carrier, index) => (
                          <tr
                            key={carrier.id}
                            className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? "bg-card" : "bg-muted/30"}`}
                          >
                            <td className="px-4 py-3 font-medium text-blue-600">{carrier.insurance_carrier}</td>
                            <td className="px-4 py-3 font-mono text-sm">{carrier.producer_code}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{carrier.agency_contact || carrier.agency_contact_name}</div>
                              <div className="text-muted-foreground text-xs flex items-center">
                                {carrier.agency_contact_email && (
                                  <>
                                    <Mail className="h-3 w-3 mr-1" />
                                    {carrier.agency_contact_email}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">
                                {carrier.underwriter_contact || carrier.underwriter_name}
                              </div>
                              <div className="text-muted-foreground text-xs flex items-center">
                                {carrier.underwriter_email && (
                                  <>
                                    <Mail className="h-3 w-3 mr-1" />
                                    {carrier.underwriter_email}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {carrier.customer_service_phone && (
                                <div className="flex items-center text-blue-600">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {carrier.customer_service_phone}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {carrier.specialties &&
                                  carrier.specialties.slice(0, 2).map((specialty: string) => (
                                    <Badge
                                      key={specialty}
                                      variant="outline"
                                      className="text-xs bg-blue-500/10 text-blue-400 border-border"
                                    >
                                      {specialty}
                                    </Badge>
                                  ))}
                                {carrier.specialties && carrier.specialties.length > 2 && (
                                  <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                                    +{carrier.specialties.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <Link href={`/carrier-contacts/${carrier.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="View Details"
                                    className="h-8 w-8 hover:bg-blue-500/15"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={`/carrier-contacts/${carrier.id}/edit`}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Edit"
                                    className="h-8 w-8 hover:bg-green-500/15"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete"
                                  onClick={() => handleDeleteCarrier(carrier.id)}
                                  className="h-8 w-8 hover:bg-red-500/15"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      {activeFilters.length > 0 || searchTerm
                        ? "No carrier contacts found matching your criteria."
                        : "No carrier contacts found."}
                    </p>
                    <p className="text-muted-foreground mb-4">
                      {activeFilters.length > 0 || searchTerm
                        ? "Try adjusting your search or filters."
                        : "Add your first carrier contact using the 'Add Carrier' button."}
                    </p>
                    {!activeFilters.length && !searchTerm && (
                      <Link href="/carrier-contacts/add">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Carrier
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card className="bg-card backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No favorite carriers yet.</p>
                <p className="text-muted-foreground">Mark carriers as favorites to see them here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card className="bg-card backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <Phone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Recently contacted carriers will appear here.</p>
                <p className="text-muted-foreground">Contact history will be tracked automatically.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
