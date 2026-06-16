"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { submitApplication } from "@/app/actions/submit-application"

export default function TestSubmissionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; submissionNumber?: string } | null>(null)

  const handleTestSubmission = async () => {
    setIsSubmitting(true)
    setResult(null)

    try {
      // Create a minimal test FormData with required fields for Public Auto
      const formData = new FormData()

      // Required fields
      formData.append("insuranceType", "Public Auto")
      formData.append("companyName", "Test Company")
      formData.append("contactName", "Test Contact")
      formData.append("email", "test@example.com")
      formData.append("phoneNumber", "555-123-4567")
      formData.append("yearsInBusiness", "5")
      formData.append("businessType", "LLC")
      formData.append("address", "123 Test St")
      formData.append("city", "Test City")
      formData.append("state", "CA")
      formData.append("zipCode", "90210")

      // Coverage fields
      formData.append("liabilityLimit", "$1,000,000")
      formData.append("uninsuredMotoristLimit", "$500,000")
      formData.append("medicalPaymentLimit", "$10,000")
      formData.append("currentInsuranceCarrier", "Test Insurance")
      formData.append("currentAnnualPremium", "5000")

      // Operations fields
      formData.append("serviceArea", "Test Area")
      formData.append("operatingRadius", "50")
      formData.append("annualMiles", "25000")
      formData.append("percentageUrbanDriving", "60")
      formData.append("percentageInterstateDriving", "40")

      // Submit the test data
      await submitApplication(formData)

      setResult({
        success: true,
        message: "Test submission successful! The form data was properly saved to the database.",
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
          <CardDescription>
            This page tests if the Public Auto form submission works with the updated database schema and RLS policies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the button below to simulate submitting a Public Auto application with test data.
          </p>

          <Button onClick={handleTestSubmission} disabled={isSubmitting} className="mb-4">
            {isSubmitting ? "Submitting..." : "Test Public Auto Submission"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-md ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              <p className="font-medium">{result.success ? "Success!" : "Error"}</p>
              <p>{result.message}</p>
              {result.submissionNumber && <p className="mt-2">Submission Number: {result.submissionNumber}</p>}
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium mb-2">What this test does:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Creates a FormData object with test data for a Public Auto application</li>
              <li>Calls the same submitApplication function used by the actual form</li>
              <li>Attempts to save the data to the submissions table in your database</li>
              <li>Reports whether the submission was successful or not</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-2">Next Steps:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>If the test is successful, try submitting a real Public Auto application through the form</li>
              <li>Check your Supabase database to verify the submission was recorded correctly</li>
              <li>Verify that the email notification was sent (if configured)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
