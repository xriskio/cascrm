import { Loader2 } from "lucide-react"

export default function ServiceRequestViewLoading() {
  return (
    <div className="p-6">
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="ml-2 text-muted-foreground">Loading service request...</p>
      </div>
    </div>
  )
}
