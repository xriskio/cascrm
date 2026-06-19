import LessorsRiskOnlyForm from "./lessors-risk-only-form"

export default function LessorsRiskOnlyPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Lessors Risk Only Submission</h1>
      <div className="bg-card rounded-lg shadow-md p-6">
        <LessorsRiskOnlyForm />
      </div>
    </div>
  )
}
