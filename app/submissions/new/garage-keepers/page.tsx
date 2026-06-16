import type { Metadata } from "next"
import GarageKeepersForm from "./garage-keepers-form"

export const metadata: Metadata = {
  title: "New Garage Keepers Submission | InsureTrac",
  description: "Create a new Garage Keepers insurance submission",
}

export default function GarageKeepersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">New Garage Keepers Submission</h1>
      <GarageKeepersForm />
    </div>
  )
}
