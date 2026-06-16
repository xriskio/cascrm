"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, UserPlus, Archive, AlertTriangle } from "lucide-react"

interface BulkActionsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedIds: string[]
  onBulkDelete: () => Promise<void>
  onBulkArchive?: () => Promise<void>
  onBulkAssign?: () => Promise<void>
}

export default function BulkActionsModal({
  isOpen,
  onClose,
  selectedIds,
  onBulkDelete,
  onBulkArchive,
  onBulkAssign,
}: BulkActionsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState<string | null>(null)

  const handleAction = async (actionType: string, actionFn: () => Promise<void>) => {
    setAction(actionType)
    setIsLoading(true)
    try {
      await actionFn()
      onClose()
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error)
    } finally {
      setIsLoading(false)
      setAction(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Perform actions on {selectedIds.length} selected renewal{selectedIds.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>These actions cannot be undone. Please review your selection carefully.</AlertDescription>
          </Alert>

          <div className="grid gap-3">
            <Button
              variant="destructive"
              onClick={() => handleAction("delete", onBulkDelete)}
              disabled={isLoading}
              className="w-full justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {action === "delete" ? "Deleting..." : `Delete ${selectedIds.length} Renewals`}
            </Button>

            {onBulkArchive && (
              <Button
                variant="outline"
                onClick={() => handleAction("archive", onBulkArchive)}
                disabled={isLoading}
                className="w-full justify-start"
              >
                <Archive className="h-4 w-4 mr-2" />
                {action === "archive" ? "Archiving..." : `Archive ${selectedIds.length} Renewals`}
              </Button>
            )}

            {onBulkAssign && (
              <Button
                variant="outline"
                onClick={() => handleAction("assign", onBulkAssign)}
                disabled={isLoading}
                className="w-full justify-start"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {action === "assign" ? "Assigning..." : `Assign ${selectedIds.length} Renewals`}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
