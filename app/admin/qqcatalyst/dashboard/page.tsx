"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Users, Shield, FileText, RefreshCw, Search, ArrowUpRight, Clock, Database } from "lucide-react"

export default function QQCatalystDashboard() {
  const [contacts, setContacts] = useState<any[]>([])
  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from("contacts")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(100)

        if (contactsError) throw contactsError
        setContacts(contactsData || [])

        // Fetch policies
        const { data: policiesData, error: policiesError } = await supabase
          .from("policies")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(100)

        if (policiesError) throw policiesError
        setPolicies(policiesData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const refreshData = async () => {
    setLoading(true)
    try {
      // Fetch contacts
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100)

      setContacts(contactsData || [])

      // Fetch policies
      const { data: policiesData } = await supabase
        .from("policies")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100)

      setPolicies(policiesData || [])
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery),
  )

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.policy_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.line_of_business?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QQCatalyst Data Dashboard</h1>
          <p className="text-muted-foreground">View and manage your imported QQCatalyst data</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh Data"}
          </Button>
          <Button asChild>
            <Link href="/admin/qqcatalyst/import">
              <Database className="h-4 w-4 mr-2" />
              Import More Data
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {contacts[0]?.updated_at ? formatDate(contacts[0].updated_at) : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.length}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {policies[0]?.updated_at ? formatDate(policies[0].updated_at) : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lines of Business</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(policies.map((p) => p.line_of_business).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique policy types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts[0]?.updated_at ? formatDate(contacts[0].updated_at) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Most recent data sync</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts or policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({filteredContacts.length})</TabsTrigger>
              <TabsTrigger value="policies">Policies ({filteredPolicies.length})</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/contacts">
                  <Users className="h-4 w-4 mr-2" />
                  View All Contacts
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/clients">
                  <Users className="h-4 w-4 mr-2" />
                  View All Clients
                </Link>
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>QQCatalyst Data Overview</CardTitle>
                <CardDescription>Summary of your imported data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recent Contacts</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.slice(0, 5).map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              {contact.first_name} {contact.last_name}
                            </TableCell>
                            <TableCell>{contact.email || "N/A"}</TableCell>
                            <TableCell>{formatDate(contact.updated_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-2 text-right">
                      <Button variant="link" size="sm" onClick={() => setActiveTab("contacts")}>
                        View all contacts
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Recent Policies</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Policy #</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {policies.slice(0, 5).map((policy) => (
                          <TableRow key={policy.id}>
                            <TableCell>{policy.policy_number || "N/A"}</TableCell>
                            <TableCell>{policy.line_of_business || "N/A"}</TableCell>
                            <TableCell>{formatDate(policy.updated_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-2 text-right">
                      <Button variant="link" size="sm" onClick={() => setActiveTab("policies")}>
                        View all policies
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/admin/qqcatalyst/import">Run Another Import</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/qqcatalyst/sync">Advanced Sync Options</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Imported Contacts</CardTitle>
                <CardDescription>Contacts imported from QQCatalyst</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading contacts...</div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-4">No contacts found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.slice(0, 20).map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            {contact.first_name} {contact.last_name}
                          </TableCell>
                          <TableCell>{contact.email || "N/A"}</TableCell>
                          <TableCell>{contact.phone || "N/A"}</TableCell>
                          <TableCell>{formatDate(contact.updated_at)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/contacts/${contact.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(filteredContacts.length, 20)} of {filteredContacts.length} contacts
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contacts">
                    <Users className="h-4 w-4 mr-2" />
                    View All Contacts
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>Imported Policies</CardTitle>
                <CardDescription>Policies imported from QQCatalyst</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading policies...</div>
                ) : filteredPolicies.length === 0 ? (
                  <div className="text-center py-4">No policies found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Policy Number</TableHead>
                        <TableHead>Line of Business</TableHead>
                        <TableHead>Contact ID</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPolicies.slice(0, 20).map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell>{policy.policy_number || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{policy.line_of_business || "Unknown"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={`/contacts/${policy.contact_id}`} className="text-blue-600 hover:underline">
                              {policy.contact_id}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(policy.updated_at)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/policies/${policy.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(filteredPolicies.length, 20)} of {filteredPolicies.length} policies
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/policies">
                    <Shield className="h-4 w-4 mr-2" />
                    View All Policies
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
