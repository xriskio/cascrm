"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowLeft } from "lucide-react"

export default function ServiceRequestSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get("id")

  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!requestId) {
      router.push("/service-requests")
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/service-requests")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [requestId, router])

  if (!requestId) {
    return null
  }

  return (
    <div className="p-6">
      <div className="bg-card border border-border rounded-lg p-8 text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Request Submitted Successfully</h1>
        <p className="text-muted-foreground mb-4">
          Your service request has been submitted. Our team will review your request and get back to you shortly.
        </p>
        <div className="bg-muted p-4 rounded-md mb-6">
          <p className="text-sm text-muted-foreground mb-1">Request ID</p>
          <p className="font-medium">{requestId}</p>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          You will be redirected to the service requests page in {countdown} seconds.
        </p>
        <Link href="/service-requests" className="inline-flex items-center text-orange-500 hover:text-orange-400">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Return to Service Requests
        </Link>
      </div>
    </div>
  )
}
