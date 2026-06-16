"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  PlusCircle,
  FileText,
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface Submission {
  id: string
  tracking_number: string
  policy_type: string
  client_name: string
  contact_email: string
  contact_phone: string
  json_raw: any
  status: string
  assigned_agent: string
  created_at: string
  updated_at: string
}

export default function SubmissionsListPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error("Error fetching submissions:", error)
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return ""
    return String(value)
  }

  const formatDate = (dateString: string): string => {
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

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      submitted: "bg-blue-100 text-blue-800 border-blue-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      under_review: "bg-purple-100 text-purple-800 border-purple-300",
      quoted: "bg-cyan-100 text-cyan-800 border-cyan-300",
    }

    return (
      <Badge
        className={`${statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-300"} capitalize`}
        variant="outline"
      >
        {status.replace("_", " ")}
      </Badge>
    )
  }

  const extractVehicleCount = (formData: any): number => {
    if (!formData) return 0
    if (formData.numberOfVehicles) return Number(formData.numberOfVehicles) || 0
    if (formData.vehicles?.length) return formData.vehicles.length
    return 0
  }

  const extractDriverCount = (formData: any): number => {
    if (!formData) return 0
    if (formData.numberOfDrivers) return Number(formData.numberOfDrivers) || 0
    if (formData.drivers?.length) return formData.drivers.length
    return 0
  }

  const extractLiabilityLimit = (formData: any): string => {
    if (!formData) return "N/A"
    if (formData.liabilityLimit) return formData.liabilityLimit
    if (formData.coverageLimit) return formData.coverageLimit
    return "N/A"
  }

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const searchFields = [
        safeString(submission.tracking_number),
        safeString(submission.json_raw?.companyName),
        safeString(submission.json_raw?.contactName),
        safeString(submission.json_raw?.businessName || submission.client_name),
        safeString(submission.policy_type),
      ]
        .join(" ")
        .toLowerCase()

      const matchesSearch = searchTerm === "" || searchFields.includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [submissions, searchTerm, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleDownloadSampleForms = () => {
    toast({
      title: "Download Started",
      description: "Sample forms are being downloaded...",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadSampleForms}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Sample Forms
          </Button>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/submissions/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Application
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search Application Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Application Name</TableHead>
                  <TableHead className="font-semibold">Created By</TableHead>
                  <TableHead className="font-semibold">Application Date</TableHead>
                  <TableHead className="font-semibold text-center">Number Of Vehicles</TableHead>
                  <TableHead className="font-semibold text-center">Number Of Drivers</TableHead>
                  <TableHead className="font-semibold">Decision</TableHead>
                  <TableHead className="font-semibold">Liability Limit</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubmissions.length > 0 ? (
                  paginatedSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {submission.json_raw?.companyName ||
                          submission.json_raw?.businessName ||
                          submission.tracking_number}
                      </TableCell>
                      <TableCell>
                        {submission.assigned_agent ||
                          submission.json_raw?.contactName ||
                          "System"}
                      </TableCell>
                      <TableCell>{formatDate(submission.created_at)}</TableCell>
                      <TableCell className="text-center">
                        {extractVehicleCount(submission.json_raw)}
                      </TableCell>
                      <TableCell className="text-center">
                        {extractDriverCount(submission.json_raw)}
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600">
                          {submission.status === "approved"
                            ? "Approved"
                            : submission.status === "rejected"
                              ? "Declined"
                              : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell>{extractLiabilityLimit(submission.json_raw)}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell className="text-center">
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/submissions/view/${submission.tracking_number}`}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            No submissions found
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {searchTerm || statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Create your first application to get started"}
                          </p>
                        </div>
                        <Button asChild>
                          <Link href="/submissions/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Application
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Items per page:{" "}
                <Select value={String(itemsPerPage)} disabled>
                  <SelectTrigger className="inline-flex w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of{" "}
                  {filteredSubmissions.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
