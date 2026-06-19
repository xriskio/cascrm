"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getRenewal, updateRenewalStatus, archiveRenewal } from "@/app/actions/renewal-actions"
import { extractErrorMessage } from "@/lib/error-utils"
import { ArrowLeft, AlertTriangle, Archive, Send, FileCheck, RefreshCw, FileText, Mail, GitBranch } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

export default function RenewalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const renewalId = params.id as string
  const [renewal, setRenewal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [startingWorkflow, setStartingWorkflow] = useState(false)
  const [existingWorkflowId, setExistingWorkflowId] = useState<string | null>(null)

  useEffect(() => {
    async function loadRenewal() {
      if (!renewalId) return

      // Support both UUID and numeric IDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      const isNumericId = /^\d+$/.test(renewalId)
      
      if (!uuidRegex.test(renewalId) && !isNumericId) {
        setError("Invalid renewal ID format")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const result = await getRenewal(renewalId)

        if (result.success) {
          setRenewal(result.data)
          // Check for existing workflow
          const wfRes = await fetch(`/api/renewal-workflows?search=${result.data?.policy_number || result.data?.id}&limit=5`)
          if (wfRes.ok) {
            const wfJson = await wfRes.json()
            const match = (wfJson.data || []).find((w: { renewal_id: string; id: string }) => w.renewal_id === renewalId)
            if (match) setExistingWorkflowId(match.id)
          }
        } else {
          setError(result.error || "Failed to load renewal")
        }
      } catch (err) {
        setError(extractErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    loadRenewal()
  }, [renewalId])

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setProcessing(true)
      const result = await updateRenewalStatus(renewalId, newStatus, "", "User")
      if (result.success) {
        setRenewal({ ...renewal, status: newStatus })
        toast({
          title: "Status updated",
          description: `Renewal status updated to ${newStatus}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: extractErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleArchive = async () => {
    try {
      setProcessing(true)
      const result = await archiveRenewal(renewalId)
      if (result.success) {
        toast({
          title: "Renewal archived",
          description: "The renewal has been archived successfully",
        })
        router.push("/renewals")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to archive renewal",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: extractErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
      setShowArchiveDialog(false)
    }
  }

  const handleConvertToPolicy = async () => {
    try {
      setProcessing(true)
      // First update status to bound
      await updateRenewalStatus(renewalId, "bound", "Converted to policy", "User")

      toast({
        title: "Renewal converted",
        description: "Renewal has been marked as bound and converted to policy",
      })

      // Update local state
      setRenewal({ ...renewal, status: "bound" })
      setShowConvertDialog(false)
    } catch (err) {
      toast({
        title: "Error",
        description: extractErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleBeginRenewalProcess = async () => {
    try {
      setProcessing(true)
      // Call the API to send initial renewal notification
      const response = await fetch(`/api/renewals/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          renewalId,
          type: "expiring",
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Renewal process initiated",
          description: "Renewal notification has been sent to the client",
        })
        // Update status to "contacted"
        await updateRenewalStatus(renewalId, "contacted", "Initial notification sent", "User")
        setRenewal({ ...renewal, status: "contacted" })
      } else {
        throw new Error(result.error || "Failed to send notification")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: extractErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
      setShowEmailDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/renewals">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Renewals
          </Button>
        </Link>
      </div>
    )
  }

  if (!renewal) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Renewal not found</AlertDescription>
        </Alert>
        <Link href="/renewals">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Renewals
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/renewals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Renewals
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Renewal Details</h1>
        </div>
        <div className="flex gap-2">
          {existingWorkflowId ? (
            <Button
              onClick={() => router.push(`/renewal-workflow/${existingWorkflowId}`)}
              variant="outline"
              className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              View Workflow
            </Button>
          ) : (
            <Button
              onClick={async () => {
                setStartingWorkflow(true)
                try {
                  const res = await fetch('/api/renewal-workflows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      renewal_id: renewalId,
                      policy_number: renewal.policy_number,
                      named_insured: renewal.named_insured || renewal.client_name,
                      policy_type: renewal.policy_type || renewal.lob,
                      expiration_date: renewal.expiration_date,
                      agent_name: renewal.agent_name,
                      expiring_premium: renewal.premium || renewal.total_premium,
                    }),
                  })
                  const json = await res.json()
                  if (res.ok || res.status === 409) {
                    const wfId = json.data?.id || json.workflowId
                    toast({ title: 'Workflow Started', description: '120-day renewal workflow created.' })
                    router.push(`/renewal-workflow/${wfId}`)
                  } else {
                    toast({ title: 'Error', description: json.error || 'Failed to start workflow', variant: 'destructive' })
                  }
                } finally {
                  setStartingWorkflow(false)
                }
              }}
              disabled={startingWorkflow}
              variant="outline"
              className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              {startingWorkflow ? 'Starting...' : 'Start 120-Day Workflow'}
            </Button>
          )}

          {renewal.status !== "contacted" && (
            <Button
              onClick={() => setShowEmailDialog(true)}
              variant="outline"
              className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
            >
              <Mail className="h-4 w-4 mr-2" />
              Begin Renewal Process
            </Button>
          )}

          <Button
            onClick={() => setShowConvertDialog(true)}
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Convert to Policy
          </Button>

          <Button
            onClick={() => setShowArchiveDialog(true)}
            variant="outline"
            className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Client Name</label>
              <p className="text-lg">{renewal.named_insured || renewal.insured_name || renewal.client_name || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Policy Number</label>
              <p className="text-lg">{renewal.policy_number || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tracking Number</label>
              <p className="text-lg font-mono">{renewal.tracking_number || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={renewal.status === "bound" ? "default" : "secondary"}>
                  {renewal.status || "pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Policy Type</label>
              <p className="text-lg">{renewal.lob || renewal.policy_type || renewal.line_of_business || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Expiration Date</label>
              <p className="text-lg">
                {renewal.expiration_date ? new Date(renewal.expiration_date).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Carrier</label>
              <p className="text-lg">{renewal.carrier || renewal.insurance_carrier || renewal.writing_carrier || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Premium</label>
              <p className="text-lg">
                {renewal.premium || renewal.total_premium || renewal.expiring_premium
                  ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                      Number(renewal.premium) || Number(renewal.total_premium) || renewal.expiring_premium || 0,
                    )
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p>{renewal.created_at ? new Date(renewal.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p>{renewal.updated_at ? new Date(renewal.updated_at).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Archived</label>
              <p>{renewal.archived ? "Yes" : "No"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleStatusUpdate("pending")}
              variant="outline"
              size="sm"
              disabled={renewal.status === "pending" || processing}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Pending
            </Button>
            <Button
              onClick={() => handleStatusUpdate("contacted")}
              variant="outline"
              size="sm"
              disabled={renewal.status === "contacted" || processing}
            >
              <Send className="h-3 w-3 mr-1" />
              Contacted
            </Button>
            <Button
              onClick={() => handleStatusUpdate("quoted")}
              variant="outline"
              size="sm"
              disabled={renewal.status === "quoted" || processing}
            >
              <FileText className="h-3 w-3 mr-1" />
              Quoted
            </Button>
            <Button
              onClick={() => handleStatusUpdate("bound")}
              variant="outline"
              size="sm"
              disabled={renewal.status === "bound" || processing}
              className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
            >
              <FileCheck className="h-3 w-3 mr-1" />
              Bound
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Renewal</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this renewal? Archived renewals will no longer appear in the main
              renewals list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArchive} disabled={processing}>
              {processing ? "Archiving..." : "Archive Renewal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Policy Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Policy</DialogTitle>
            <DialogDescription>
              This will mark the renewal as bound and convert it to an active policy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConvertToPolicy}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? "Converting..." : "Convert to Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Begin Renewal Process Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Begin Renewal Process</DialogTitle>
            <DialogDescription>
              This will send an initial renewal notification to the client and update the status to "Contacted".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleBeginRenewalProcess}
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processing ? "Sending..." : "Send Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
