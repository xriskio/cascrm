import { PersonalAutoForm } from "./personal-auto-form"

export default function PersonalAutoPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Personal Auto Insurance Submission</h1>
        <p className="text-muted-foreground mt-2">Complete the form below to submit a personal auto insurance application.</p>
      </div>
      <PersonalAutoForm />
    </div>
  )
}
