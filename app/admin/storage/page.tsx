import type { Metadata } from "next"
import { listBuckets } from "@/app/actions/storage-actions"
import CreateBucketForm from "./create-bucket"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Storage Management",
  description: "Manage Supabase storage buckets",
}

export default async function StoragePage() {
  const { success, buckets, error } = await listBuckets()

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage Management</h1>
        <p className="text-muted-foreground mt-2">Create and manage storage buckets for your application</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <CreateBucketForm />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Existing Buckets</CardTitle>
              <CardDescription>List of all storage buckets in your project</CardDescription>
            </CardHeader>
            <CardContent>
              {!success ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error || "Failed to load buckets"}</AlertDescription>
                </Alert>
              ) : buckets && buckets.length > 0 ? (
                <ul className="space-y-2">
                  {buckets.map((bucket) => (
                    <li key={bucket.id} className="p-3 bg-muted rounded-md flex justify-between items-center">
                      <span className="font-medium">{bucket.name}</span>
                      <span className="text-xs text-muted-foreground">{bucket.public ? "Public" : "Private"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No buckets found. Create your first bucket.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
