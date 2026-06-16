export interface Task {
  id: string
  title: string
  description?: string
  status: "Not Started" | "In Progress" | "On Hold" | "Completed" | "Archived"
  priority: "Low" | "Medium" | "High" | "Urgent"
  due_date?: string | null
  completion_percentage: number
  creator_id: string
  assignee_id?: string | null
  supervisor_id?: string | null
  client_id?: string | null
  created_at: string
  updated_at?: string | null
}

export interface TaskFormData {
  title: string
  description?: string
  status: "Not Started" | "In Progress" | "On Hold" | "Completed" | "Archived"
  priority: "Low" | "Medium" | "High" | "Urgent"
  due_date?: string | null
  completion_percentage: number
  assignee_id?: string | null
  supervisor_id?: string | null
  client_id?: string | null
}

export interface TaskStats {
  total: number
  notStarted: number
  inProgress: number
  completed: number
  onHold: number
  overdue: number
  dueToday: number
  dueSoon: number
}
