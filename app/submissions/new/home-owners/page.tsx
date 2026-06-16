import { Suspense } from "react"
import { HomeOwnersForm } from "./home-owners-form"

export default function HomeOwnersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading application form...</p>
            </div>
          </div>
        }
      >
        <HomeOwnersForm />
      </Suspense>
    </div>
  )
}
