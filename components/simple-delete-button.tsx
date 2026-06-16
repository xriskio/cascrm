"use client"

import { useRouter } from "next/navigation"
import { deleteResource } from "@/app/actions/simple-delete"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SimpleDeleteButton({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this resource?")) {
      try {
        const result = await deleteResource(id)

        if (result.success) {
          alert("Resource deleted successfully")
          router.refresh()
        } else {
          alert(`Failed to delete: ${result.message}`)
        }
      } catch (error) {
        alert("Error deleting resource")
        console.error(error)
      }
    }
  }

  return (
    <Button onClick={handleDelete} variant="destructive" size="sm" className="flex items-center gap-1">
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  )
}
