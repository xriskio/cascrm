"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { addExternalResource } from "@/app/actions/resource-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const CATEGORIES = [
  "Forms",
  "Procedures",
  "Regulations",
  "Training",
  "Marketing",
  "Carrier Information",
  "Reference",
  "Other",
]

export default function AddResourcePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Other")
  const [externalUrl, setExternalUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!externalUrl.trim()) {
      setError("URL is required")
      return
    }

    try {
      setIsSubmitting(true)

      // Create FormData
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("externalUrl", externalUrl)

      // Submit the form
      const result = await addExternalResource(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to add resource")
      }

      // Redirect on success
      router.push("/agency-resources")
      router.refresh()
    } catch (err) {
      console.error("Error adding resource:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/agency-resources" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add External Resource</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter resource title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter resource description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalUrl">External URL *</Label>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <Input
                  id="externalUrl"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Resource"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="font-medium text-gray-700 mb-2">Recommended External Resources</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="https://npiregistry.cms.hhs.gov/search"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              NPI Registry
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </li>
          <li>
            <a
              href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              SAFER DOT Lookup
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </li>
          <li>
            <a
              href="https://www.cpuc.ca.gov/regulatory-services/licensing/transportation-licensing-and-analysis-branch/tcp-certificates-and-permits"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              CA CPUC TCP Lookup
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
