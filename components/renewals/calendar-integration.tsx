"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Download, ExternalLink, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CalendarIntegrationProps {
  renewal: any
}

export default function CalendarIntegration({ renewal }: CalendarIntegrationProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [calendarType, setCalendarType] = useState("google")
  const [reminderTime, setReminderTime] = useState("1")

  // Format date for calendar event
  const formatDateForCalendar = (date: string | null | undefined) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/g, "")
  }

  // Generate calendar event details
  const getEventDetails = () => {
    const title = `Renewal Follow-up: ${renewal.client_name || renewal.insured_name || "Client"}`
    const description = `
Policy: ${renewal.policy_number || "N/A"}
Type: ${renewal.line_of_business || renewal.policy_type || "N/A"}
Expiration: ${renewal.expiration_date ? new Date(renewal.expiration_date).toLocaleDateString() : "N/A"}
Carrier: ${renewal.insurance_carrier || renewal.writing_carrier || "N/A"}
Premium: ${renewal.policy_premium ? `$${renewal.policy_premium}` : "N/A"}
Contact: ${renewal.customer_primary_phone || renewal.client_phone || "N/A"}
Email: ${renewal.customer_primary_email || renewal.client_email || "N/A"}
Notes: ${renewal.renewal_offer_notes || ""}
    `.trim()

    const startDate = renewal.next_follow_up_date || renewal.expiration_date
    if (!startDate) return null

    return {
      title,
      description,
      startDate: formatDateForCalendar(startDate),
      endDate: formatDateForCalendar(startDate), // Same day event
    }
  }

  // Generate Google Calendar URL
  const getGoogleCalendarUrl = () => {
    const eventDetails = getEventDetails()
    if (!eventDetails) return "#"

    const startDate = new Date(renewal.next_follow_up_date || renewal.expiration_date)
    // Add one hour to end date for Google Calendar
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 1)

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: eventDetails.title,
      details: eventDetails.description,
      dates: `${eventDetails.startDate}/${formatDateForCalendar(endDate.toISOString())}`,
      reminders: `popup,${reminderTime * 60}`,
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  // Generate Outlook Calendar URL
  const getOutlookCalendarUrl = () => {
    const eventDetails = getEventDetails()
    if (!eventDetails) return "#"

    const startDate = new Date(renewal.next_follow_up_date || renewal.expiration_date)
    // Add one hour to end date for Outlook
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 1)

    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: eventDetails.title,
      body: eventDetails.description,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      allday: "false",
      reminder: `${reminderTime * 60}`,
    })

    return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`
  }

  // Generate iCalendar (.ics) file content
  const generateIcsContent = () => {
    const eventDetails = getEventDetails()
    if (!eventDetails) return ""

    const startDate = new Date(renewal.next_follow_up_date || renewal.expiration_date)
    // Add one hour to end date for iCal
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 1)

    const now = new Date()
    const uid = `renewal-${renewal.id}-${now.getTime()}@insuretrac.com`

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InsureTrac//Renewal Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${eventDetails.title}
DTSTART:${eventDetails.startDate}
DTEND:${formatDateForCalendar(endDate.toISOString())}
DESCRIPTION:${eventDetails.description.replace(/\n/g, "\\n")}
LOCATION:
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT${reminderTime}H
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
UID:${uid}
DTSTAMP:${formatDateForCalendar(now.toISOString())}
END:VEVENT
END:VCALENDAR`
  }

  // Download ICS file
  const downloadIcsFile = () => {
    const icsContent = generateIcsContent()
    if (!icsContent) return

    const clientName = renewal.client_name || renewal.insured_name || "client"
    const fileName = `renewal-followup-${clientName.replace(/\s+/g, "-").toLowerCase()}.ics`

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle calendar action
  const handleCalendarAction = () => {
    if (calendarType === "google") {
      window.open(getGoogleCalendarUrl(), "_blank")
    } else if (calendarType === "outlook") {
      window.open(getOutlookCalendarUrl(), "_blank")
    } else if (calendarType === "ics") {
      downloadIcsFile()
    }
    setIsDialogOpen(false)
  }

  // Check if we have a follow-up date
  const hasFollowUpDate = Boolean(renewal.next_follow_up_date || renewal.expiration_date)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasFollowUpDate ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add the follow-up date (
              {new Date(renewal.next_follow_up_date || renewal.expiration_date).toLocaleDateString()}) to your calendar
              to stay on top of this renewal.
            </p>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add to Calendar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="calendar-type">Calendar Type</Label>
                    <Select value={calendarType} onValueChange={setCalendarType}>
                      <SelectTrigger id="calendar-type">
                        <SelectValue placeholder="Select calendar type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Calendar</SelectItem>
                        <SelectItem value="outlook">Outlook Calendar</SelectItem>
                        <SelectItem value="ics">Download .ics File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Reminder</Label>
                    <Select value={reminderTime} onValueChange={setReminderTime}>
                      <SelectTrigger id="reminder-time">
                        <SelectValue placeholder="Select reminder time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No reminder</SelectItem>
                        <SelectItem value="0.25">15 minutes before</SelectItem>
                        <SelectItem value="0.5">30 minutes before</SelectItem>
                        <SelectItem value="1">1 hour before</SelectItem>
                        <SelectItem value="2">2 hours before</SelectItem>
                        <SelectItem value="24">1 day before</SelectItem>
                        <SelectItem value="48">2 days before</SelectItem>
                        <SelectItem value="168">1 week before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCalendarAction} className="w-full mt-4">
                    {calendarType === "ics" ? (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download .ics File
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in {calendarType === "google" ? "Google Calendar" : "Outlook"}
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCalendarType("google")
                  window.open(getGoogleCalendarUrl(), "_blank")
                }}
              >
                Google
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCalendarType("outlook")
                  window.open(getOutlookCalendarUrl(), "_blank")
                }}
              >
                Outlook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCalendarType("ics")
                  downloadIcsFile()
                }}
              >
                .ics File
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No follow-up date set for this renewal.</p>
            <p className="text-sm mt-2">Set a follow-up date to enable calendar integration.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
