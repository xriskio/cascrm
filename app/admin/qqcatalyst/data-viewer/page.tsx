"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Loader2,
  RefreshCw,
  Users,
  FileText,
  Phone,
  Mail,
  StickyNote,
  CreditCard,
  Car,
  MapPin,
  Calendar,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface DataCounts {
  contacts: number
  policies: number
  policy_renewals: number
  policy_locations: number
  commercial_vehicles: number
  contact_phone_numbers: number
  contact_emails: number
  contact_notes: number
  customer_billing: number
  acord_forms: number
}

interface Contact {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  updated_at: string
}

interface Policy {
  id: number
  contact_id: number
  policy_number: string
  line_of_business: string
  updated_at: string
}

export default function DataViewerPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [counts, setCounts] = useState<DataCounts | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchCounts = async () => {
    try {
      const tables = [
        "contacts",
        "policies",
        "policy_renewals",
        "policy_locations",
        "commercial_vehicles",
        "contact_phone_numbers",
        "contact_emails",
        "contact_notes",
        "customer_billing",
        "acord_forms",
      ]

      const countPromises = tables.map(async (table) => {
        try {
          const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

          if (error) {
            console.warn(`Table ${table} not found or accessible:`, error)
            return { table, count: 0 }
          }

          return { table, count: count || 0 }
        } catch (err) {
          console.warn(`Error counting ${table}:`, err)
          return { table, count: 0 }
        }
      })

      const results = await Promise.all(countPromises)
      const countsObj = results.reduce((acc, { table, count }) => {
        acc[table as keyof DataCounts] = count
        return acc
      }, {} as DataCounts)

      setCounts(countsObj)
    } catch (err) {
      console.error("Error fetching counts:", err)
      setError("Failed to fetch data counts")
    }
  }

  const fetchSampleData = async () => {
    try {
      // Fetch sample contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, email, phone, updated_at")
        .order("updated_at", { ascending: false })
        .limit(10)

      if (contactsError && contactsError.code !== "PGRST116") {
        console.warn("Contacts table error:", contactsError)
      } else if (contactsData) {
        setContacts(contactsData)
      }

      // Fetch sample policies
      const { data: policiesData, error: policiesError } = await supabase
        .from("policies")
        .select("id, contact_id, policy_number, line_of_business, updated_at")
        .order("updated_at", { ascending: false })
        .limit(10)

      if (policiesError && policiesError.code !== "PGRST116") {
        console.warn("Policies table error:", policiesError)
      } else if (policiesData) {
        setPolicies(policiesData)
      }
    } catch (err) {
      console.error("Error fetching sample data:", err)
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)

    await Promise.all([fetchCounts(), fetchSampleData()])

    setLoading(false)
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading QQCatalyst data...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">QQCatalyst Data Viewer</h1>
          <p className="text-muted-foreground">View all imported data from QQCatalyst</p>
        </div>
        <Button onClick={refreshData} disabled={refreshing}>
          {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Data Counts Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contacts</p>
              <p className="text-2xl font-bold">{counts?.contacts || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <FileText className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Policies</p>
              <p className="text-2xl font-bold">{counts?.policies || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Calendar className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Renewals</p>
              <p className="text-2xl font-bold">{counts?.policy_renewals || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <MapPin className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Locations</p>
              <p className="text-2xl font-bold">{counts?.policy_locations || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Car className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vehicles</p>
              <p className="text-2xl font-bold">{counts?.commercial_vehicles || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Data Tables */}
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="contact-details">Contact Details</TabsTrigger>
          <TabsTrigger value="business-data">Business Data</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Recent Contacts
                <Badge variant="secondary" className="ml-2">
                  {counts?.contacts || 0} total
                </Badge>
              </CardTitle>
              <CardDescription>Latest 10 contacts imported from QQCatalyst</CardDescription>
            </CardHeader>
            <CardContent>
              {contacts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>{contact.id}</TableCell>
                        <TableCell>{`${contact.first_name || ""} ${contact.last_name || ""}`.trim()}</TableCell>
                        <TableCell>{contact.email || "-"}</TableCell>
                        <TableCell>{contact.phone || "-"}</TableCell>
                        <TableCell>{new Date(contact.updated_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No contacts found. Run an import to populate data.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Recent Policies
                <Badge variant="secondary" className="ml-2">
                  {counts?.policies || 0} total
                </Badge>
              </CardTitle>
              <CardDescription>Latest 10 policies imported from QQCatalyst</CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy ID</TableHead>
                      <TableHead>Contact ID</TableHead>
                      <TableHead>Policy Number</TableHead>
                      <TableHead>Line of Business</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>{policy.id}</TableCell>
                        <TableCell>{policy.contact_id}</TableCell>
                        <TableCell>{policy.policy_number || "-"}</TableCell>
                        <TableCell>{policy.line_of_business || "-"}</TableCell>
                        <TableCell>{new Date(policy.updated_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No policies found. Run an import to populate data.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact-details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Phone Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{counts?.contact_phone_numbers || 0}</p>
                <p className="text-sm text-muted-foreground">Total phone numbers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{counts?.contact_emails || 0}</p>
                <p className="text-sm text-muted-foreground">Total email addresses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <StickyNote className="mr-2 h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{counts?.contact_notes || 0}</p>
                <p className="text-sm text-muted-foreground">Total contact notes</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{counts?.customer_billing || 0}</p>
                <p className="text-sm text-muted-foreground">Total billing records</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-4 w-4" />
                  ACORD Forms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{counts?.acord_forms || 0}</p>
                <p className="text-sm text-muted-foreground">Total ACORD forms</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Import Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Import Status</CardTitle>
          <CardDescription>Current status of your QQCatalyst data import</CardDescription>
        </CardHeader>
        <CardContent>
          {counts && Object.values(counts).some((count) => count > 0) ? (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Data successfully imported from QQCatalyst
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
              No data found. Run an import to populate your database.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
