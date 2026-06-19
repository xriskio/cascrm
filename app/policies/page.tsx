"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Search, Shield, RefreshCw, Filter, ArrowUpDown } from "lucide-react"

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("updated_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterType, setFilterType] = useState("all")
  const supabase = createClient()

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("policies")
        .select("*, contacts(*)")
        .order("updated_at", { ascending: false })

      if (error) throw error
      setPolicies(data || [])
    } catch (error) {
      console.error("Error fetching policies:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchPolicies()
  }

  // Filter and sort policies
  const filteredPolicies = policies
    .filter((policy) => {
      const matchesSearch =
        !searchQuery ||
        policy.policy_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.line_of_business?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.contacts?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.contacts?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === "all" || policy.line_of_business === filterType

      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      const aValue = a[sortBy] || ""
      const bValue = b[sortBy] || ""

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
    })

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Get unique policy types for filter
  const policyTypes = Array.from(new Set(policies.map((p) => p.line_of_business).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Policies</h1>
          <p className="text-muted-foreground">View and manage all policies</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Policies</CardTitle>
          <CardDescription>
            {filteredPolicies.length} {filteredPolicies.length === 1 ? "policy" : "policies"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {policyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                </Button>
              </div>
            </div>

            {/* Policies table */}
            {loading ? (
              <div className="text-center py-8">Loading policies...</div>
            ) : filteredPolicies.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No policies found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => {
                          setSortBy("policy_number")
                          setSortOrder(sortBy === "policy_number" && sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Policy Number
                        {sortBy === "policy_number" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => {
                          setSortBy("line_of_business")
                          setSortOrder(sortBy === "line_of_business" && sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Type
                        {sortBy === "line_of_business" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                      </TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => {
                          setSortBy("updated_at")
                          setSortOrder(sortBy === "updated_at" && sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Updated
                        {sortBy === "updated_at" && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.policy_number || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{policy.line_of_business || "Unknown"}</Badge>
                        </TableCell>
                        <TableCell>
                          {policy.contacts ? (
                            <Link href={`/contacts/${policy.contact_id}`} className="text-blue-600 hover:underline">
                              {policy.contacts.first_name} {policy.contacts.last_name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(policy.updated_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/policies/${policy.id}`}>View</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
