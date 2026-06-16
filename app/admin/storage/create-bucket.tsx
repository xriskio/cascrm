"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createBucket } from "@/app/actions/storage-actions"
import { toast } from "@/components/ui/use-toast"

export default function CreateBucketForm() {
  const [bucketName, setBucketName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createBucket(bucketName)
      if (result.success) {
        toast({
          title: "Success",
          description: `Bucket "${bucketName}" created successfully`,
        })
        setBucketName("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create bucket",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedBuckets = ["resources", "documents", "avatars", "submissions"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Storage Bucket</CardTitle>
        <CardDescription>Create a new storage bucket for your application</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="bucket-name" className="text-sm font-medium">
                Bucket Name
              </label>
              <Input
                id="bucket-name"
                placeholder="Enter bucket name"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Suggested Buckets:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedBuckets.map((name) => (
                  <Button key={name} type="button" variant="outline" size="sm" onClick={() => setBucketName(name)}>
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || !bucketName.trim()}>
            {isLoading ? "Creating..." : "Create Bucket"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
