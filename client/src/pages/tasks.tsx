import { supabase } from "@/lib/supabase/client"

export default async function TasksPage() {
  const supabase = supabase

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Redirect to my-tasks by default
    return null
}
