"use client"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Mail, Phone, MessageSquare, Send } from "lucide-react"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    name: string
    email?: string
    phone?: string
  }
}

export function ContactModal({ isOpen, onClose, client }: ContactModalProps) {
  const [activeTab, setActiveTab] = useState("email")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Message sent successfully!",
        description: `Your ${activeTab} has been sent to ${client.name}`,
      })

      // Reset form
      setSubject("")
      setMessage("")
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCall = () => {
    if (client.phone) {
      // In a real app, this would integrate with a phone system
      toast({
        title: "Call initiated",
        description: `Calling ${client.name} at ${client.phone}...`,
      })
      onClose()
    } else {
      toast({
        title: "No phone number",
        description: "This client doesn't have a phone number on file.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Contact {client.name}
          </DialogTitle>
          <DialogDescription>Choose how you'd like to contact this client.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" disabled={!client.email}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" disabled={!client.phone}>
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="call" disabled={!client.phone}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input id="to" value={client.email || "No email on file"} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={5}
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !client.email}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Email"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">To</Label>
                  <Input id="phone" value={client.phone || "No phone on file"} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms-message">Message</Label>
                  <Textarea
                    id="sms-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your SMS message here..."
                    rows={4}
                    maxLength={160}
                    required
                  />
                  <div className="text-xs text-gray-500 text-right">{message.length}/160 characters</div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !client.phone}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send SMS"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="call" className="space-y-4 mt-4">
            <div className="text-center p-6">
              <Phone className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Call {client.name}</h3>
              <p className="text-gray-600 mb-4">
                {client.phone ? `Ready to call ${client.phone}` : "No phone number on file"}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={handleCall}
                  disabled={!client.phone}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Start Call
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
