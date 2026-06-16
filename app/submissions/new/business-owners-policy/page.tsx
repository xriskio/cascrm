import type { Metadata } from "next"
import BusinessOwnersPolicyForm from "./business-owners-policy-form"

export const metadata: Metadata = {
  title: "Business Owners Policy Submission | InsureTrac",
  description: "Submit a new Business Owners Policy application",
}

export default function BusinessOwnersPolicyPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Business Owners Policy Submission</h1>
      <BusinessOwnersPolicyForm />
    </div>
  )
}
