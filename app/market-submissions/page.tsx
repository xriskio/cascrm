import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, FileText, TrendingUp, Clock } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default async function MarketSubmissionsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch market submissions
  const { data: marketSubmissions, error } = await supabase
    .from("market_submissions")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching market submissions:", error)
  }

  // Calculate stats
  const stats = {
    total: marketSubmissions?.length || 0,
    pending: marketSubmissions?.filter((m) => m.quote_status === "pending").length || 0,
    quoted: marketSubmissions?.filter((m) => m.quote_status === "quoted").length || 0,
    declined: marketSubmissions?.filter((m) => m.quote_status === "declined").length || 0,
    bound: marketSubmissions?.filter((m) => m.quote_status === "bound").length || 0,
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status color
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader
        title="Market Submissions"
        subtitle="Track broker submissions to markets and wholesalers"
      >
        <Button
          asChild
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transition-all duration-200"
        >
          <Link href="/market-submissions/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Market Submission
          </Link>
        </Button>
      </PageHeader>

      <div className="container mx-auto py-6 px-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quoted</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.quoted}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Declined</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.declined}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bound</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.bound}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Market Submissions List */}
        <div className="space-y-4">
          {marketSubmissions && marketSubmissions.length > 0 ? (
            marketSubmissions.map((submission) => (
              <Card
                key={submission.id}
                className="bg-card backdrop-blur-sm border border-border/50 hover:shadow-xl transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          <Link
                            href={`/market-submissions/view/${submission.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {submission.client_name || "Unnamed Client"}
                          </Link>
                        </CardTitle>
                        <Badge className={getStatusColor(submission.quote_status)}>
                          {submission.quote_status || "pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {submission.tracking_number || "No tracking number"}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/market-submissions/view/${submission.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Market/Carrier</p>
                      <p className="font-medium">{submission.market_name || submission.carrier_name || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Wholesaler</p>
                      <p className="font-medium">{submission.wholesaler_name || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted Date</p>
                      <p className="font-medium">{formatDate(submission.submission_date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quote Amount</p>
                      <p className="font-medium">
                        {submission.quote_amount
                          ? `$${Number(submission.quote_amount).toLocaleString()}`
                          : submission.premium_quoted || "Not quoted"}
                      </p>
                    </div>
                  </div>
                  {submission.wholesaler_company && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Company:</span> {submission.wholesaler_company}
                        {submission.wholesaler_email && (
                          <>
                            {" • "}
                            <span className="font-medium">Email:</span> {submission.wholesaler_email}
                          </>
                        )}
                        {submission.wholesaler_phone && (
                          <>
                            {" • "}
                            <span className="font-medium">Phone:</span> {submission.wholesaler_phone}
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-card backdrop-blur-sm border border-border/50">
              <CardContent className="p-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-card rounded-full mb-4">
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-lg font-medium mb-2 text-foreground">No market submissions found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first market submission.
                  </p>
                  <Button asChild>
                    <Link href="/market-submissions/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Market Submission
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
