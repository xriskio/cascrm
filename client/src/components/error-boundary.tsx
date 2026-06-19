
import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Caught client-side error:", error)
      setHasError(true)
      setError(error.error)
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-center mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6 text-center">
            We're sorry, but there was an error loading this page. Our team has been notified.
          </p>
          <div className="text-sm bg-gray-100 p-4 rounded mb-4 overflow-auto max-h-32">
            <code>{error?.toString() || "Unknown error"}</code>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => (window.location.href = "/")}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
