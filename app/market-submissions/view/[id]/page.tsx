import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default async function MarketSubmissionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: submission, error } = await supabase
    .from("market_submissions")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !submission) {
    console.error("Error fetching market submission:", error)
    notFound()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/15 text-yellow-300"
      case "quoted":
        return "bg-blue-500/15 text-blue-300"
      case "declined":
        return "bg-red-500/15 text-red-300"
      case "bound":
        return "bg-green-500/15 text-green-300"
      case "expired":
        return "bg-muted text-foreground"
      default:
        return "bg-muted text-foreground"
    }
  }

  const DetailRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="font-medium text-foreground">{value || "Not specified"}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader
        title="Market Submission Details"
        subtitle={`Tracking #${submission.tracking_number || "N/A"}`}
      >
        <Button asChild variant="outline">
          <Link href="/market-submissions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Link>
        </Button>
      </PageHeader>

      <div className="container mx-auto py-6 px-6 space-y-6">
        {/* Status Card */}
        <Card className="bg-card backdrop-blur-sm border border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{submission.client_name || "Unnamed Client"}</CardTitle>
              <Badge className={`${getStatusColor(submission.quote_status)} text-lg px-4 py-2`}>
                {submission.quote_status || "pending"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailRow label="Policy Type" value={submission.policy_type} />
              <DetailRow label="Priority" value={submission.priority} />
              <DetailRow label="Status" value={submission.status} />
            </div>
          </CardContent>
        </Card>

        {/* Market/Carrier Information */}
        <Card className="bg-card backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Market & Carrier Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Market Name" value={submission.market_name} />
              <DetailRow label="Carrier Name" value={submission.carrier_name} />
            </div>
          </CardContent>
        </Card>

        {/* Wholesaler Information */}
        <Card className="bg-card backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Wholesaler Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow label="Wholesaler Name" value={submission.wholesaler_name} />
              <DetailRow label="Company" value={submission.wholesaler_company} />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                {submission.wholesaler_email ? (
                  <a
                    href={`mailto:${submission.wholesaler_email}`}
                    className="font-medium text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {submission.wholesaler_email}
                  </a>
                ) : (
                  <p className="font-medium text-foreground">Not specified</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                {submission.wholesaler_phone ? (
                  <a
                    href={`tel:${submission.wholesaler_phone}`}
                    className="font-medium text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    {submission.wholesaler_phone}
                  </a>
                ) : (
                  <p className="font-medium text-foreground">Not specified</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Timeline */}
        <Card className="bg-card backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Submission Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Submission Date</p>
                <p className="font-medium text-foreground">{formatDate(submission.submission_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Response Date</p>
                <p className="font-medium text-foreground">{formatDate(submission.response_date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Information */}
        <Card className="bg-card backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Quote Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Quote Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  {submission.quote_amount
                    ? `$${Number(submission.quote_amount).toLocaleString()}`
                    : "Not quoted"}
                </p>
              </div>
              <DetailRow label="Premium Quoted (Text)" value={submission.premium_quoted} />
            </div>
          </CardContent>
        </Card>

        {/* Coverage Details */}
        {submission.coverage_details && (
          <Card className="bg-card backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Coverage Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{submission.coverage_details}</p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {submission.notes && (
          <Card className="bg-card backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{submission.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Decline Reason */}
        {submission.quote_status === "declined" && submission.decline_reason && (
          <Card className="bg-red-50/70 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-300">
                <AlertCircle className="h-5 w-5" />
                Decline Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-400 whitespace-pre-wrap">{submission.decline_reason}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="bg-card backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created At</p>
                <p className="font-medium">{formatDate(submission.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(submission.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
