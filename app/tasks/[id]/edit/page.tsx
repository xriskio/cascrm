import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { TaskForm } from "@/components/tasks/task-form"

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get task details
  const { data: task, error } = await supabase.from("tasks").select("*").eq("id", params.id).single()

  if (error || !task) {
    console.error("Error fetching task:", error)
    notFound()
  }

  // Check if user can edit this task
  const canEdit = user.id === task.creator_id || user.id === task.assignee_id
  if (!canEdit) {
    redirect("/tasks/my-tasks")
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
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
      <TaskForm users={formattedUsers} clients={formattedClients} task={task} />
    </div>
  )
}
