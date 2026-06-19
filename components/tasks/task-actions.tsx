"use client"

import { useState } from "react"
import { MoreHorizontal, Archive, Trash2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { archiveTask, deleteTask, updateTaskStatus } from "@/app/actions/task-actions"
import { toast } from "@/hooks/use-toast"

interface TaskActionsProps {
  taskId: string
  taskTitle: string
  currentStatus?: string
  taskStatus?: string
  canEdit?: boolean
  canDelete?: boolean
  canArchive?: boolean
}

export function TaskActions({ taskId, taskTitle, currentStatus }: TaskActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkComplete = async () => {
    setIsLoading(true)
    try {
      const success = await updateTaskStatus(taskId, "Completed", 100)
      if (success) {
        toast({
          title: "Success",
          description: "Task marked as complete",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to mark task as complete",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark task as complete",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async () => {
    setIsLoading(true)
    try {
      const result = await archiveTask(taskId)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to archive task",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const result = await deleteTask(taskId)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setShowDeleteDialog(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete task",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus !== "Completed" && currentStatus !== "Archived" && (
            <DropdownMenuItem onClick={handleMarkComplete} disabled={isLoading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Complete
            </DropdownMenuItem>
          )}
          {currentStatus !== "Archived" && (
            <DropdownMenuItem onClick={handleArchive} disabled={isLoading}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} disabled={isLoading} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{taskTitle}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
