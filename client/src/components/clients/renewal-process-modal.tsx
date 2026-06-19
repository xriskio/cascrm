
import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, Calendar, DollarSign } from "lucide-react"

interface RenewalProcessModalProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    name: string
    policy_number?: string
    carrier?: string
    premium?: number
    expiration_date?: string
  }
}

export function RenewalProcessModal({ isOpen, onClose, client }: RenewalProcessModalProps) {
  const [renewalType, setRenewalType] = useState("standard")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [newPremium, setNewPremium] = useState(client.premium?.toString() || "")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call to start renewal process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Renewal process started!",
        description: `Renewal initiated for ${client.name}. You'll receive updates as the process progresses.`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start renewal process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Start Renewal Process
          </DialogTitle>
          <DialogDescription>Initiate the renewal process for {client.name}'s policy.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Current Policy Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Policy Number:</span>
                  <span>{client.policy_number || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Carrier:</span>
                  <span>{client.carrier || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Premium:</span>
                  <span>${client.premium?.toLocaleString() || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiration Date:</span>
                  <span>{client.expiration_date ? new Date(client.expiration_date).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewal-type">Renewal Type</Label>
              <Select value={renewalType} onValueChange={setRenewalType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select renewal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Renewal</SelectItem>
                  <SelectItem value="early">Early Renewal</SelectItem>
                  <SelectItem value="quote_only">Quote Only</SelectItem>
                  <SelectItem value="remarket">Remarket</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="effective-date">New Effective Date</Label>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-premium">Estimated New Premium</Label>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="new-premium"
                  type="number"
                  step="0.01"
                  value={newPremium}
                  onChange={(e) => setNewPremium(e.target.value)}
                  placeholder="Enter estimated premium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or notes for the renewal..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSubmitting ? "animate-spin" : ""}`} />
              {isSubmitting ? "Starting Process..." : "Start Renewal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
