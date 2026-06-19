
import { useState, useEffect } from "react"
import { getMyTasks, getTaskStats, updateTaskStatus } from "@/lib/actions/task-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, PauseCircle, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"

export function DashboardTasks() {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    onHold: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function loadTasks() {
      try {
        setIsLoading(true)
        const [tasksData, statsData] = await Promise.all([getMyTasks(), getTaskStats()])
        setTasks(tasksData || [])
        setStats(statsData || {
          total: 0,
          notStarted: 0,
          inProgress: 0,
          completed: 0,
          onHold: 0,
        })
      } catch (err) {
        console.error("Error loading tasks:", err)
        setError(err.message || "Failed to load tasks")
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  const handleComplete = async (taskId) => {
    const success = await updateTaskStatus(taskId, "Completed", 100)
    if (success) {
      setTasks(
        tasks.map((task) => (task.id === taskId ? { ...task, status: "Completed", completion_percentage: 100 } : task)),
      )
    }
  }

  const handleReopen = async (taskId) => {
    const success = await updateTaskStatus(taskId, "In Progress", 50)
    if (success) {
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: "In Progress", completion_percentage: 50 } : task,
        ),
      )
    }
  }

  const filteredTasks = (tasks || []).filter((task) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dueDate = task.due_date ? new Date(task.due_date) : null

    switch (activeTab) {
      case "overdue":
        return dueDate && dueDate < today && task.status !== "Completed"
      case "today":
        if (!dueDate) return false
        const taskDate = new Date(dueDate)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === today.getTime()
      case "inProgress":
        return task.status === "In Progress"
      default:
        return true
    }
  })

  const getPriorityColor = (priority) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return "No due date"

    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const taskDate = new Date(date)
    taskDate.setHours(0, 0, 0, 0)

    if (taskDate.getTime() === today.getTime()) return "Today"
    if (taskDate.getTime() === tomorrow.getTime()) return "Tomorrow"
    if (taskDate.getTime() === yesterday.getTime()) return "Yesterday"

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
  }

  const isOverdue = (dateString) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Manage your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-red-500">
            <p>Error loading tasks. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Manage and track your tasks</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/tasks/new"
              className="inline-flex items-center justify-center rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Create New Task
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-500 mb-1">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{stats.notStarted}</div>
            <div className="text-sm text-gray-500">Not Started</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-500 mb-1">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-500 mb-1">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-500 mb-1">
              <PauseCircle className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{stats.onHold}</div>
            <div className="text-sm text-gray-500">On Hold</div>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mb-2 text-gray-300" />
                <p>No tasks found</p>
                <p className="text-sm">
                  {activeTab === "all"
                    ? "You don't have any tasks yet"
                    : activeTab === "overdue"
                      ? "No overdue tasks"
                      : activeTab === "today"
                        ? "No tasks due today"
                        : "No tasks in progress"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{task.title}</div>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500">
                        Status: <span className="font-medium">{task.status}</span>
                      </div>
                      <div
                        className={`text-sm ${isOverdue(task.due_date) && task.status !== "Completed" ? "text-red-500 font-medium" : "text-gray-500"}`}
                      >
                        Due: {formatDate(task.due_date)}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{task.completion_percentage}%</span>
                      </div>
                      <Progress value={task.completion_percentage} className="h-2" />
                    </div>

                    <div className="flex justify-end space-x-2">
                      {task.status !== "Completed" ? (
                        <button
                          onClick={() => handleComplete(task.id)}
                          className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                        >
                          Mark Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReopen(task.id)}
                          className="text-xs px-2 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                        >
                          Reopen
                        </button>
                      )}
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-gray-500">
          Showing {filteredTasks.length} of {stats.total} tasks
        </div>
        <Link to="/tasks" className="text-sm text-orange-500 hover:underline">
          View All
        </Link>
      </CardFooter>
    </Card>
  )
}
