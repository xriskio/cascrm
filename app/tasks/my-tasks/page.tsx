import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, User, AlertCircle, CheckCircle2, Clock, Pause, Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { TaskActions } from "@/components/tasks/task-actions"

export default async function MyTasksPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get tasks assigned to the current user (including archived)
  // Use a simpler query without joins to avoid relationship errors
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee_id", user.id)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
  }

  // Fetch user data separately
  const userIds = new Set<string>()
  const clientIds = new Set<string>()

  tasks?.forEach((task) => {
    if (task.creator_id) userIds.add(task.creator_id)
    if (task.assignee_id) userIds.add(task.assignee_id)
    if (task.supervisor_id) userIds.add(task.supervisor_id)
    if (task.client_id) clientIds.add(task.client_id)
  })

  // Fetch users
  const { data: users } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .in("id", Array.from(userIds))
    .maybeSingle()

  // Fetch clients
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .in("id", Array.from(clientIds))
    .maybeSingle()

  // Create lookup maps
  const userMap = new Map()
  if (Array.isArray(users)) {
    users.forEach((user) => {
      userMap.set(user.id, user)
    })
  } else if (users) {
    userMap.set(users.id, users)
  }

  const clientMap = new Map()
  if (Array.isArray(clients)) {
    clients.forEach((client) => {
      clientMap.set(client.id, client)
    })
  } else if (clients) {
    clientMap.set(clients.id, clients)
  }

  // Group tasks by status
  const notStarted = tasks?.filter((task) => task.status === "Not Started") || []
  const inProgress = tasks?.filter((task) => task.status === "In Progress") || []
  const onHold = tasks?.filter((task) => task.status === "On Hold") || []
  const completed = tasks?.filter((task) => task.status === "Completed") || []
  const archived = tasks?.filter((task) => task.status === "Archived") || []

  // Format user name
  const formatUserName = (userId: string) => {
    const user = userMap.get(userId)
    if (!user) return "Unassigned"
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Unknown User"
  }

  // Format client name
  const formatClientName = (clientId: string) => {
    const client = clientMap.get(clientId)
    if (!client) return "No Client"
    return client.name || "Unknown Client"
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Not Started":
        return <AlertCircle className="h-4 w-4" />
      case "In Progress":
        return <Clock className="h-4 w-4" />
      case "On Hold":
        return <Pause className="h-4 w-4" />
      case "Completed":
        return <CheckCircle2 className="h-4 w-4" />
      case "Archived":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="My Tasks" subtitle="AI-powered task management and productivity insights">
        <Button
          asChild
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transition-all duration-200"
        >
          <Link href="/tasks/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Task
          </Link>
        </Button>
      </PageHeader>

      <div className="container mx-auto py-6 px-6">
        {/* AI Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {tasks?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {inProgress.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {completed.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {onHold.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                <Pause className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  {archived.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl p-1">
            <TabsTrigger value="all" className="rounded-lg">
              All ({tasks?.filter((t) => t.status !== "Archived").length || 0})
            </TabsTrigger>
            <TabsTrigger value="not-started" className="rounded-lg">
              Not Started ({notStarted.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-lg">
              In Progress ({inProgress.length})
            </TabsTrigger>
            <TabsTrigger value="on-hold" className="rounded-lg">
              On Hold ({onHold.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">
              Completed ({completed.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="rounded-lg">
              Archived ({archived.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TaskList
              tasks={tasks?.filter((t) => t.status !== "Archived") || []}
              formatUserName={formatUserName}
              formatClientName={formatClientName}
              formatDate={formatDate}
              getPriorityClass={getPriorityClass}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="not-started">
            <TaskList
              tasks={notStarted}
              formatUserName={formatUserName}
              formatClientName={formatClientName}
              formatDate={formatDate}
              getPriorityClass={getPriorityClass}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="in-progress">
            <TaskList
              tasks={inProgress}
              formatUserName={formatUserName}
              formatClientName={formatClientName}
              formatDate={formatDate}
              getPriorityClass={getPriorityClass}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="on-hold">
            <TaskList
              tasks={onHold}
              formatUserName={formatUserName}
              formatClientName={formatClientName}
              formatDate={formatDate}
              getPriorityClass={getPriorityClass}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="completed">
            <TaskList
              tasks={completed}
              formatUserName={formatUserName}
              formatClientName={formatClientName}
              formatDate={formatDate}
              getPriorityClass={getPriorityClass}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="archived">
            <TaskList
              tasks={archived}
              formatUserName={formatUserName}
              formatClientName={formatClientName}
              formatDate={formatDate}
              getPriorityClass={getPriorityClass}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function TaskList({ tasks, formatUserName, formatClientName, formatDate, getPriorityClass, getStatusIcon }: any) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-16 text-center">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-lg font-medium mb-2 text-gray-800">No tasks found in this category</p>
          <p className="text-sm text-gray-600">Tasks will appear here once created.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {tasks.map((task: any) => (
        <div
          key={task.id}
          className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  {getStatusIcon(task.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    <Link href={`/tasks/${task.id}`} className="hover:text-blue-600 transition-colors duration-200">
                      {task.title}
                    </Link>
                  </h3>
                  <Badge className={`${getPriorityClass(task.priority)} mt-1`}>{task.priority}</Badge>
                </div>
              </div>
              <TaskActions taskId={task.id} taskTitle={task.title} currentStatus={task.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium text-gray-800">{formatDate(task.due_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Created By</p>
                  <p className="font-medium text-gray-800">
                    {task.creator_id ? formatUserName(task.creator_id) : "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Supervisor</p>
                  <p className="font-medium text-gray-800">
                    {task.supervisor_id ? formatUserName(task.supervisor_id) : "None"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Completion</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.completion_percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{task.completion_percentage || 0}%</span>
                </div>
              </div>
            </div>

            {task.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50/50 p-3 rounded-lg">{task.description}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-transparent"
              >
                <Link href={`/tasks/${task.id}`}>View Details</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transition-all duration-200"
              >
                <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
