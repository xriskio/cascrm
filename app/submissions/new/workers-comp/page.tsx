import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import WorkersCompForm from "./workers-comp-form"

export default function WorkersCompPage() {
  return (
    <div className="p-6">
      <Link href="/submissions/new" className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to insurance types
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Workers Compensation Application</h1>
        <WorkersCompForm insuranceType="workers-comp" />
      </div>
    </div>
  )
}
