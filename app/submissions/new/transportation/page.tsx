import TransportationForm from "./transportation-form"

export const metadata = {
  title: "Transportation Application | InsureTrac",
  description: "Submit a new transportation insurance application",
}

export default function TransportationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Trucker's Commercial Auto Application</h1>
        <p className="text-muted-foreground mt-2">
          Complete the form below to submit a new transportation insurance application.
        </p>
      </div>
      <TransportationForm />
    </div>
  )
}
