import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { redirect } from "next/navigation"

export default function InsuranceTypeFormPage({ params }: { params: { type: string } }) {
  const { type } = params

  // Redirect to dedicated form pages
  if (type === "general-liability") {
    redirect("/submissions/new/general-liability")
  } else if (type === "workers-comp") {
    redirect("/submissions/new/workers-comp")
  } else if (type === "excess-liability") {
    redirect("/submissions/new/excess-liability")
  } else if (type === "cyber-liability") {
    redirect("/submissions/new/cyber-liability")
  } else if (type === "commercial-property") {
    redirect("/submissions/new/commercial-property")
  } else if (type === "garage-keepers") {
    redirect("/submissions/new/garage-keepers")
  } else if (type === "auto-dealers") {
    redirect("/submissions/new/auto-dealers")
  } else if (type === "business-owners-policy") {
    redirect("/submissions/new/business-owners-policy")
  } else if (type === "contractors") {
    redirect("/submissions/new/contractors")
  } else if (type === "lessors-risk-only") {
    redirect("/submissions/new/lessors-risk-only")
  } else if (type === "retail-services") {
    redirect("/submissions/new/retail-services")
  } else if (type === "restaurants") {
    redirect("/submissions/new/restaurants")
  } else if (type === "manufacturing") {
    redirect("/submissions/new/manufacturing")
  } else if (type === "vacant-buildings") {
    redirect("/submissions/new/vacant-buildings")
  } else if (type === "vacant-land") {
    redirect("/submissions/new/vacant-land")
  } else if (type === "public-auto" || type === "nemt" || type === "transportation") {
    // For these types, we'll keep the existing implementation
    return (
      <div className="p-6">
        <Link href="/submissions/new" className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to insurance types
        </Link>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">
            {type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} Application
          </h1>
          <p className="text-gray-600">Commercial Auto form will be used for this insurance type.</p>
        </div>
      </div>
    )
  }

  return notFound()
}
