import { supabase } from "@/lib/supabase/client"
import { createClient } from "@/lib/supabase"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText } from "lucide-react"

export const dynamic = "force-dynamic" // Disable caching for this page

export default async function SubmissionsPage() {
    return null

  // supabase imported at top of file

  // Fetch all submissions, ordered by most recent first
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching submissions:", error)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Submissions</h1>
        <Button asChild>
          <Link to="/submissions/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Submission
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions && submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Submission #</th>
                    <th className="border px-4 py-2 text-left">Insurance Type</th>
                    <th className="border px-4 py-2 text-left">Company</th>
                    <th className="border px-4 py-2 text-left">Status</th>
                    <th className="border px-4 py-2 text-left">Date</th>
                    <th className="border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{submission.tracking_number}</td>
                      <td className="border px-4 py-2">{submission.policy_type}</td>
                      <td className="border px-4 py-2">{submission.json_raw?.companyName || submission.client_name || "N/A"}</td>
                      <td className="border px-4 py-2 capitalize">{submission.status}</td>
                      <td className="border px-4 py-2">{new Date(submission.created_at).toLocaleDateString()}</td>
                      <td className="border px-4 py-2">
                        <Link
                          href={`/submissions/view/${submission.tracking_number}`}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex flex-col items-center justify-center space-y-3">
                <FileText className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium">No submissions found</h3>
                <p className="text-sm text-gray-500">
                  {error ? "There was an error loading submissions." : "Create your first submission to get started."}
                </p>
                <Button asChild>
                  <Link to="/submissions/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Submission
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug section - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">Debug Information</h3>
          <p>Number of submissions: {submissions?.length || 0}</p>
          {error && (
            <div className="text-red-500 mt-2">
              <p>Error: {error.message}</p>
              <p>Code: {error.code}</p>
              <p>Details: {error.details}</p>
            </div>
          )}
          <div className="mt-2">
            <details>
              <summary className="cursor-pointer">Raw Submissions Data</summary>
              <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(submissions, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
