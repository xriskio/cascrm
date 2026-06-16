import CommercialPropertyForm from "./commercial-property-form"

export default function CommercialPropertyPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Commercial Property Submission</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <CommercialPropertyForm />
      </div>
    </div>
  )
}
