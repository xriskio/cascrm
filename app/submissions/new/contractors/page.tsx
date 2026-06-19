import type { Metadata } from "next"
import ContractorsForm from "./contractors-form"

export const metadata: Metadata = {
  title: "Contractors Insurance Application | InsureTrac",
  description: "Submit a new contractors insurance application",
}

export default function ContractorsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Contractors Insurance Application</h1>
        <p className="text-muted-foreground">Complete the form below to submit a contractors insurance application.</p>
      </div>
      <ContractorsForm />
    </div>
  )
}
