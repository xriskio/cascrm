import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AssignedTasksPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get tasks created by the current user but assigned to others
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(`
      *,
      creator:creator_id(id, first_name, last_name, email),
      assignee:assignee_id(id, first_name, last_name, email),
      supervisor:supervisor_id(id, first_name, last_name, email),
      client:client_id(id, name)
    `)
    .eq("creator_id", user.id)
    .neq("assignee_id", user.id)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
  }

  // Group tasks by status
  const notStarted = tasks?.filter((task) => task.status === "Not Started") || []
  const inProgress = tasks?.filter((task) => task.status === "In Progress") || []
  const onHold = tasks?.filter((task) => task.status === "On Hold") || []
  const completed = tasks?.filter((task) => task.status === "Completed") || []

  // Format user name
  const formatUserName = (user: any) => {
    if (!user) return "Unassigned"
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Unknown User"
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
        return "bg-blue-500/15 text-blue-300"
      case "Medium":
        return "bg-yellow-500/15 text-yellow-300"
      case "High":
        return "bg-orange-500/15 text-orange-300"
      case "Urgent":
        return "bg-red-500/15 text-red-300"
      default:
        return "bg-muted text-foreground"
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks I've Assigned</h1>
        <Button asChild>
          <Link href="/tasks/new">Create New Task</Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({tasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="not-started">Not Started ({notStarted.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="on-hold">On Hold ({onHold.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TaskList
            tasks={tasks || []}
            formatUserName={formatUserName}
            formatDate={formatDate}
            getPriorityClass={getPriorityClass}
          />
        </TabsContent>

        <TabsContent value="not-started">
          <TaskList
            tasks={notStarted}
            formatUserName={formatUserName}
            formatDate={formatDate}
            getPriorityClass={getPriorityClass}
          />
        </TabsContent>

        <TabsContent value="in-progress">
          <TaskList
            tasks={inProgress}
            formatUserName={formatUserName}
            formatDate={formatDate}
            getPriorityClass={getPriorityClass}
          />
        </TabsContent>

        <TabsContent value="on-hold">
          <TaskList
            tasks={onHold}
            formatUserName={formatUserName}
            formatDate={formatDate}
            getPriorityClass={getPriorityClass}
          />
        </TabsContent>

        <TabsContent value="completed">
          <TaskList
            tasks={completed}
            formatUserName={formatUserName}
            formatDate={formatDate}
            getPriorityClass={getPriorityClass}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TaskList({ tasks, formatUserName, formatDate, getPriorityClass }: any) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">No tasks found in this category.</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task: any) => (
        <Card key={task.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              <Link href={`/tasks/${task.id}`} className="hover:underline">
                {task.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p>{task.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p>{formatDate(task.due_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p>{formatUserName(task.assignee)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supervisor</p>
                <p>{formatUserName(task.supervisor)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p>{task.completion_percentage}%</p>
              </div>
            </div>
            {task.description && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{task.description}</p>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href={`/tasks/${task.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
