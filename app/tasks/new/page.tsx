import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { TaskForm } from "@/components/tasks/task-form"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Create New Task | InsureTrac",
  description: "Create a new task in the system",
}

export default async function NewTaskPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get users for assignee and supervisor dropdowns
  const { data: users } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .order("first_name", { ascending: true })

  // Get clients for client dropdown
  const { data: clients } = await supabase.from("clients").select("id, name").order("name", { ascending: true })

  // Format users for dropdown
  const formattedUsers = (users || []).map((user) => ({
    id: user.id,
    name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Unknown User",
  }))

  // Format clients for dropdown
  const formattedClients = (clients || []).map((client) => ({
    id: client.id,
    name: client.name || "Unknown Client",
  }))

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
      <TaskForm users={formattedUsers} clients={formattedClients} />
    </div>
  )
}
