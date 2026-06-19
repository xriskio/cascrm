import { getRenewal } from "@/app/actions/renewal-actions"
import { notFound } from "next/navigation"
import { RenewalForm } from "../../renewal-form"

export default async function EditRenewalPage({ params }: { params: { id: string } }) {
  const result = await getRenewal(params.id)

  if (!result.success) {
    notFound()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Renewal</h1>
      <RenewalForm renewal={(result as any).renewal} />
    </div>
  )
}
