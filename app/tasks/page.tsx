import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function TasksPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Redirect to my-tasks by default
  redirect("/tasks/my-tasks")
}
