"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { submitApplication } from "@/app/actions/submit-application"

export default function TestSubmissionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestSubmission = async () => {
    setIsSubmitting(true)
    setResult(null)

    try {
      // Create a minimal test FormData with required fields
      const formData = new FormData()
      formData.append("insuranceType", "Public Auto")
      formData.append("companyName", "Test Company")
      formData.append("contactName", "Test Contact")
      formData.append("email", "test@example.com")
      formData.append("phoneNumber", "555-123-4567")

      // Add some public auto specific fields
      formData.append("businessDescription", "Test business description")
      formData.append("yearsInBusiness", "5")
      formData.append("requestedEffectiveDate", new Date().toISOString())

      // Submit the test data
      await submitApplication(formData)

      setResult({
        success: true,
        message: "Test submission successful! You should be redirected to the success page.",
      })
    } catch (error) {
      console.error("Test submission failed:", error)
      setResult({
        success: false,
        message: `Test submission failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Test Public Auto Form Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This page allows you to test if the Public Auto form submission is working correctly with the updated
            database schema.
          </p>

          <Button onClick={handleTestSubmission} disabled={isSubmitting} className="mb-4">
            {isSubmitting ? "Submitting..." : "Test Submission"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-md ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              <p className="font-medium">{result.success ? "Success!" : "Error"}</p>
              <p>{result.message}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium mb-2">Next Steps:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>If the test is successful, try submitting a real Public Auto application</li>
              <li>Check your database to verify the submission was recorded correctly</li>
              <li>Verify that the email notification was sent (if configured)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
