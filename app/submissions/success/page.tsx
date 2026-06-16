"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SubmissionSuccessPage() {
  const searchParams = useSearchParams()
  const submissionNumber = searchParams.get("submissionNumber")

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h1>

        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Thank you for submitting your insurance application. Our team will review your information and get back to
            you shortly.
          </p>

          {submissionNumber && (
            <div className="bg-gray-50 p-4 rounded-md inline-block">
              <p className="text-sm text-gray-500 mb-1">Your Submission Number</p>
              <p className="text-xl font-mono font-bold text-gray-900">{submissionNumber}</p>
              <p className="text-sm text-gray-500 mt-2">
                Please save this number for your records. You can use it to track the status of your application.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild>
            <Link href="/submissions">View All Submissions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
