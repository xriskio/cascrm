import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskActions } from "@/components/tasks/task-actions"

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  try {
    // Check if the tasks table exists first
    const { error: tableCheckError } = await supabase.from("tasks").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      console.error("Tasks table does not exist")
      notFound()
    }

    // Get task details
    const { data: task, error } = await supabase.from("tasks").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching task:", error)
      notFound()
    }

    if (!task) {
      console.error("Task not found:", params.id)
      notFound()
    }

    // Format date
    const formatDate = (dateString: string) => {
      if (!dateString) return "No due date"
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }

    // Get priority class
    const getPriorityClass = (priority: string) => {
      switch (priority) {
        case "Low":
          return "bg-blue-100 text-blue-800"
        case "Medium":
          return "bg-yellow-100 text-yellow-800"
        case "High":
          return "bg-orange-100 text-orange-800"
        case "Urgent":
          return "bg-red-100 text-red-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    // Get status class
    const getStatusClass = (status: string) => {
      switch (status) {
        case "Not Started":
          return "bg-gray-100 text-gray-800"
        case "In Progress":
          return "bg-blue-100 text-blue-800"
        case "On Hold":
          return "bg-yellow-100 text-yellow-800"
        case "Completed":
          return "bg-green-100 text-green-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    // Check if user can edit this task
    const canEdit = session.user.id === task.creator_id || session.user.id === task.assignee_id
    const canDelete = session.user.id === task.creator_id
    const canArchive =
      session.user.id === task.creator_id ||
      session.user.id === task.assignee_id ||
      session.user.id === task.supervisor_id

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Task Details</h1>
          <div className="flex items-center space-x-2">
            <TaskActions
              taskId={task.id}
              taskTitle={task.title}
              taskStatus={task.status}
              canEdit={canEdit}
              canDelete={canDelete}
              canArchive={canArchive}
            />
            <Button asChild variant="outline">
              <Link href="/tasks">Back to Tasks</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{task.title}</CardTitle>
            <div className="flex space-x-2 mt-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusClass(task.status)}`}>
                {task.status}
              </span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${getPriorityClass(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Task Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1">{task.description || "No description provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p>{formatDate(task.due_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completion</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${task.completion_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-1">{task.completion_percentage}% complete</p>
                  </div>
                  {task.client_id && (
                    <div>
                      <p className="text-sm text-gray-500">Related Client</p>
                      <p>{task.client_id}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Assignment Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p>{task.creator_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p>{task.assignee_id || "Unassigned"}</p>
                  </div>
                  {task.supervisor_id && (
                    <div>
                      <p className="text-sm text-gray-500">Supervisor</p>
                      <p>{task.supervisor_id}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p>{formatDate(task.created_at)}</p>
                  </div>
                  {task.updated_at && (
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p>{formatDate(task.updated_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in task detail page:", error)
    notFound()
  }
}
