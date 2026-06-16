import { Database, Loader2 } from "lucide-react"

export default function QQCatalystLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Database className="h-8 w-8 text-blue-600 mr-2" />
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading QQCatalyst</h3>
        <p className="text-gray-500">Please wait while we load the QQCatalyst integration...</p>
      </div>
    </div>
  )
}
