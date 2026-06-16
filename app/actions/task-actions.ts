"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Task } from "@/types/task"

export async function getMyTasks() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("assignee_id", user.id)
      .neq("status", "Archived")
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Error fetching tasks:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getMyTasks:", error)
    return []
  }
}

export async function getTaskStats() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        total: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        onHold: 0,
        overdue: 0,
        dueToday: 0,
        dueSoon: 0,
      }
    }

    const { data, error } = await supabase.from("tasks").select("*").eq("assignee_id", user.id)

    if (error) {
      console.error("Error fetching task stats:", error)
      return {
        total: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        onHold: 0,
        overdue: 0,
        dueToday: 0,
        dueSoon: 0,
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const stats = {
      total: data.length,
      notStarted: data.filter((task) => task.status === "Not Started").length,
      inProgress: data.filter((task) => task.status === "In Progress").length,
      completed: data.filter((task) => task.status === "Completed").length,
      onHold: data.filter((task) => task.status === "On Hold").length,
      overdue: data.filter((task) => {
        if (!task.due_date || task.status === "Completed") return false
        const dueDate = new Date(task.due_date)
        return dueDate < today
      }).length,
      dueToday: data.filter((task) => {
        if (!task.due_date || task.status === "Completed") return false
        const dueDate = new Date(task.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.getTime() === today.getTime()
      }).length,
      dueSoon: data.filter((task) => {
        if (!task.due_date || task.status === "Completed") return false
        const dueDate = new Date(task.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate > today && dueDate <= nextWeek
      }).length,
    }

    return stats
  } catch (error) {
    console.error("Error in getTaskStats:", error)
    return {
      total: 0,
      notStarted: 0,
      inProgress: 0,
      completed: 0,
      onHold: 0,
      overdue: 0,
      dueToday: 0,
      dueSoon: 0,
    }
  }
}

export async function updateTaskStatus(taskId: string, status: string, completionPercentage: number) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("tasks")
      .update({
        status,
        completion_percentage: completionPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)

    if (error) {
      console.error("Error updating task status:", error)
      return false
    }

    revalidatePath("/dashboard")
    revalidatePath("/tasks")
    return true
  } catch (error) {
    console.error("Error in updateTaskStatus:", error)
    return false
  }
}

// Simple archive task - no permission checks
export async function archiveTask(taskId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("tasks").update({ status: "Archived" }).eq("id", taskId)

    if (error) {
      console.error("Error archiving task:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    return { success: true, message: "Task archived successfully" }
  } catch (error) {
    console.error("Error in archiveTask:", error)
    return { success: false, error: "Failed to archive task" }
  }
}

// Simple delete task - no permission checks
export async function deleteTask(taskId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("tasks").delete().eq("id", taskId)

    if (error) {
      console.error("Error deleting task:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/tasks")
    revalidatePath("/dashboard")
    return { success: true, message: "Task deleted successfully" }
  } catch (error) {
    console.error("Error in deleteTask:", error)
    return { success: false, error: "Failed to delete task" }
  }
}

// Get user names for tasks
export async function getUserNames(userIds: string[]): Promise<{ [key: string]: string }> {
  const supabase = await createClient()

  if (!userIds || userIds.length === 0) return {}

  try {
    const { data, error } = await supabase.from("users").select("id, first_name, last_name, email").in("id", userIds)

    if (error || !data) {
      console.error("Error fetching user names:", error)
      return {}
    }

    const userMap: { [key: string]: string } = {}
    data.forEach((user) => {
      userMap[user.id] = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Unknown User"
    })

    return userMap
  } catch (error) {
    console.error("Error fetching user names:", error)
    return {}
  }
}

// Get client names for tasks
export async function getClientNames(clientIds: string[]): Promise<{ [key: string]: string }> {
  const supabase = await createClient()

  if (!clientIds || clientIds.length === 0) return {}

  try {
    const { data, error } = await supabase.from("clients").select("id, name").in("id", clientIds)

    if (error || !data) {
      console.error("Error fetching client names:", error)
      return {}
    }

    const clientMap: { [key: string]: string } = {}
    data.forEach((client) => {
      clientMap[client.id] = client.name || "Unknown Client"
    })

    return clientMap
  } catch (error) {
    console.error("Error fetching client names:", error)
    return {}
  }
}

// Get all users for dropdown
export async function getAllUsers() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("users").select("id, first_name, last_name, email")

    if (error) {
      console.error("Error fetching users:", error)
      return []
    }

    return data.map((user) => ({
      id: user.id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Unknown User",
    }))
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    return []
  }
}

// Get all clients for dropdown
export async function getAllClients() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("clients").select("id, name")

    if (error) {
      console.error("Error fetching clients:", error)
      return []
    }

    return data.map((client) => ({
      id: client.id,
      name: client.name || "Unknown Client",
    }))
  } catch (error) {
    console.error("Error in getAllClients:", error)
    return []
  }
}

// Create a new task
export async function createTask(formData: any): Promise<{ success: boolean; message: string; id?: string; taskNumber?: string }> {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: "You must be logged in to create a task" }
    }

    // Generate task number for tracking
    const taskNumber = `TSK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Process the data to ensure valid UUIDs or null values
    const taskData: any = {
      title: formData.title,
      description: formData.description || "",
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date,
      completion_percentage: formData.completion_percentage,
      creator_id: user.id,
      assignee_id: formData.assignee_id === "none" ? null : formData.assignee_id || user.id,
      supervisor_id: formData.supervisor_id === "none" ? null : formData.supervisor_id || null,
      client_id: formData.client_id === "none" ? null : formData.client_id || null,
      task_number: taskNumber,
    }

    const { data, error } = await supabase.from("tasks").insert(taskData).select("id").single()

    if (error) {
      console.error("Error creating task:", error)
      return { success: false, message: `Error creating task: ${error.message}` }
    }

    revalidatePath("/tasks")
    revalidatePath("/tasks/my-tasks")
    revalidatePath("/tasks/assigned")
    revalidatePath("/tasks/all")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `Task created successfully with ID: ${taskNumber}`,
      id: data.id,
      taskNumber: taskNumber,
    }
  } catch (error) {
    console.error("Error creating task:", error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Update an existing task
export async function updateTask(taskId: string, formData: any): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: "You must be logged in to update a task" }
    }

    // Process the data to ensure valid UUIDs or null values
    const taskData = {
      title: formData.title,
      description: formData.description || "",
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date,
      completion_percentage: formData.completion_percentage,
      assignee_id: formData.assignee_id === "none" ? null : formData.assignee_id || null,
      supervisor_id: formData.supervisor_id === "none" ? null : formData.supervisor_id || null,
      client_id: formData.client_id === "none" ? null : formData.client_id || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("tasks").update(taskData).eq("id", taskId)

    if (error) {
      console.error("Error updating task:", error)
      return { success: false, message: `Error updating task: ${error.message}` }
    }

    revalidatePath("/tasks")
    revalidatePath(`/tasks/${taskId}`)
    revalidatePath("/tasks/my-tasks")
    revalidatePath("/tasks/assigned")
    revalidatePath("/tasks/all")
    revalidatePath("/dashboard")

    return { success: true, message: "Task updated successfully" }
  } catch (error) {
    console.error("Error updating task:", error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Get a single task by ID
export async function getTaskById(taskId: string): Promise<{ task: Task | null; error: string | null }> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).single()

    if (error) {
      console.error("Error fetching task:", error)
      return { task: null, error: error.message }
    }

    return { task: data, error: null }
  } catch (error) {
    console.error("Error fetching task:", error)
    return {
      task: null,
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
