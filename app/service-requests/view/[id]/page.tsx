"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { getServiceRequestById, updateServiceRequestStatus } from "@/app/actions/service-request-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function ServiceRequestViewPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true)
        const result = await getServiceRequestById(params.id)
        if (result.success) {
          setRequest(result.data)
        } else {
          setError(result.error || "Failed to load service request")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [params.id])

  const handleStatusUpdate = async (status: string) => {
    try {
      setUpdating(true)
      const result = await updateServiceRequestStatus(params.id, status)
      if (result.success) {
        setRequest((prev: any) => ({ ...prev, status }))
        toast.success(`Status updated to ${status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}`)
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/15 text-yellow-300"
      case "in_progress":
        return "bg-blue-500/15 text-blue-300"
      case "completed":
        return "bg-green-500/15 text-green-300"
      case "cancelled":
        return "bg-red-500/15 text-red-300"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getRequestTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      endorsements: "Endorsement",
      certificates: "Certificate of Insurance",
      "additional-insured": "Additional Insured",
      locations: "Add/Remove Locations",
      vehicles: "Add/Remove Vehicles",
      drivers: "Add/Remove Drivers",
      billing: "Billing Issue",
      cancel: "Policy Cancellation",
    }

    return typeLabels[type] || type
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="ml-2 text-muted-foreground">Loading service request...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/service-requests" className="inline-flex items-center text-orange-500 hover:text-orange-400">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Service Requests
          </Link>
        </div>
        <Card className="bg-red-500/10 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/service-requests" className="inline-flex items-center text-orange-500 hover:text-orange-400">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Service Requests
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Service request not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/service-requests" className="inline-flex items-center text-orange-500 hover:text-orange-400">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Service Requests
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {getRequestTypeLabel(request.type)} Request #{request.id}
                  </CardTitle>
                  <CardDescription className="mt-1">Submitted on {formatDate(request.createdAt)}</CardDescription>
                </div>
                <Badge className={getStatusBadgeClass(request.status)}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Request Details</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                      <p className="mt-1 text-base">{request.clientName || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Policy Number</h3>
                      <p className="mt-1 text-base">{request.policyNumber || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Effective Date</h3>
                      <p className="mt-1 text-base flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatDate(request.effectiveDate)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Urgency</h3>
                      <p className="mt-1 text-base">
                        {request.urgency === "high" ? (
                          <span className="text-red-600 font-medium">High</span>
                        ) : request.urgency === "medium" ? (
                          <span className="text-yellow-600 font-medium">Medium</span>
                        ) : (
                          <span className="text-green-600 font-medium">Low</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-base whitespace-pre-wrap">
                        {request.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {request.specificData && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Information</h3>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-base whitespace-pre-wrap">{request.specificData}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="timeline">
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="h-4 w-4 rounded-full bg-green-500"></div>
                        <div className="h-full w-0.5 bg-muted"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium">Request Created</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {request.status !== "pending" && (
                      <div className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                          <div className="h-full w-0.5 bg-muted"></div>
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-medium">Status Updated to In Progress</p>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {request.updatedAt ? new Date(request.updatedAt).toLocaleString() : "N/A"}
                          </p>
                        </div>
                      </div>
                    )}

                    {(request.status === "completed" || request.status === "cancelled") && (
                      <div className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div
                            className={`h-4 w-4 rounded-full ${
                              request.status === "completed" ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Request {request.status === "completed" ? "Completed" : "Cancelled"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {request.updatedAt ? new Date(request.updatedAt).toLocaleString() : "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.status === "pending" && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleStatusUpdate("in_progress")}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Start Processing
                    </>
                  )}
                </Button>
              )}

              {request.status === "in_progress" && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </>
                  )}
                </Button>
              )}

              {(request.status === "pending" || request.status === "in_progress") && (
                <Button
                  variant="outline"
                  className="w-full border-border text-red-600 hover:bg-red-500/10"
                  onClick={() => handleStatusUpdate("cancelled")}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Request
                    </>
                  )}
                </Button>
              )}

              {(request.status === "completed" || request.status === "cancelled") && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusUpdate("in_progress")}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reopening...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Reopen Request
                    </>
                  )}
                </Button>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex flex-col items-start">
              <p className="text-sm text-muted-foreground mb-2">Quick Links</p>
              <div className="space-y-2 w-full">
                <Link
                  href={`/service-requests/edit/${params.id}`}
                  className="text-sm text-blue-600 hover:text-blue-300 flex items-center"
                >
                  Edit Request Details
                </Link>
                <Link
                  href={`/clients?search=${encodeURIComponent(request.clientName || "")}`}
                  className="text-sm text-blue-600 hover:text-blue-300 flex items-center"
                >
                  View Client Profile
                </Link>
                {request.policyNumber && (
                  <Link
                    href={`/policies?search=${encodeURIComponent(request.policyNumber)}`}
                    className="text-sm text-blue-600 hover:text-blue-300 flex items-center"
                  >
                    View Policy Details
                  </Link>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
