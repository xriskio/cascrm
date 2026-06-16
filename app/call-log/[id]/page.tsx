"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO, isValid } from "date-fns"
import { ArrowLeft, CalendarIcon, Mail, Phone, Save, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

const CATEGORY_OPTIONS = [
  { value: "billing", label: "Billing" },
  { value: "policy service", label: "Policy Service" },
  { value: "quote", label: "Quote" },
  { value: "new business opportunity", label: "New Business Opportunity" },
  { value: "other", label: "Other" },
]

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "called back", label: "Called Back", color: "green" },
  { value: "message left", label: "Message Left", color: "blue" },
  { value: "resolved", label: "Resolved", color: "gray" },
]

function formatDate(dateStr?: string) {
  if (!dateStr) return ""
  try {
    const date = parseISO(dateStr)
    return isValid(date) ? format(date, "yyyy-MM-dd") : ""
  } catch {
    return dateStr
  }
}

function formatTime(timeStr?: string) {
  if (!timeStr) return ""
  return timeStr.slice(0, 5)
}

function parseDate(dateStr?: string) {
  if (!dateStr) return undefined
  try {
    return parseISO(dateStr)
  } catch {
    return undefined
  }
}

export default function CallDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [call, setCall] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [callDateOpen, setCallDateOpen] = useState(false)
  const [callBackDateOpen, setCallBackDateOpen] = useState(false)
  const [formData, setFormData] = useState({
    named_insured: "",
    contact_name: "",
    phone: "",
    email: "",
    category: "",
    reason: "",
    status: "pending",
    call_date: null as Date | null,
    call_time: "",
    call_back_date: null as Date | null,
    call_back_time: "",
    notes: "",
  })

  // Fetch call details
  useEffect(() => {
    async function fetchCallDetails() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("incoming_calls").select("*").eq("id", params.id).single()

        if (error) {
          console.error("Error fetching call details:", error)
          toast.error("Error loading call details: " + error.message)
        } else {
          console.log("Fetched call details:", data)
          setCall(data)
          setFormData({
            named_insured: data.named_insured || "",
            contact_name: data.contact_name || "",
            phone: data.phone || "",
            email: data.email || "",
            category: data.category || "",
            reason: data.reason || "",
            status: data.status || "pending",
            call_date: parseDate(data.call_date) || null,
            call_time: formatTime(data.call_time),
            call_back_date: parseDate(data.call_back_date) || null,
            call_back_time: formatTime(data.call_back_time),
            notes: data.notes || "",
          })
        }
      } catch (error) {
        console.error("Exception fetching call details:", error)
        toast.error("Failed to load call details")
      } finally {
        setLoading(false)
      }
    }
    fetchCallDetails()
  }, [params.id, supabase])

  // Update call
  async function updateCall() {
    setSaving(true)
    try {
      const updateData = {
        named_insured: formData.named_insured || null,
        contact_name: formData.contact_name,
        phone: formData.phone,
        email: formData.email || null,
        category: formData.category,
        reason: formData.reason || null,
        status: formData.status,
        call_date: formData.call_date ? format(formData.call_date, "yyyy-MM-dd") : null,
        call_time: formData.call_time,
        call_back_date: formData.call_back_date ? format(formData.call_back_date, "yyyy-MM-dd") : null,
        call_back_time: formData.call_back_time || null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
      }

      console.log("Updating call with data:", updateData)

      const { error } = await supabase.from("incoming_calls").update(updateData).eq("id", params.id)

      if (error) {
        console.error("Error updating call:", error)
        toast.error("Error updating call: " + error.message)
      } else {
        toast.success("Call updated successfully")
        // Refresh the call data
        const { data } = await supabase.from("incoming_calls").select("*").eq("id", params.id).single()
        if (data) {
          setCall(data)
        }
      }
    } catch (error) {
      console.error("Exception updating call:", error)
      toast.error("Failed to update call")
    } finally {
      setSaving(false)
    }
  }

  // Delete call
  async function deleteCall() {
    try {
      if (confirm("Delete this call log entry?")) {
        const { error } = await supabase.from("incoming_calls").delete().eq("id", params.id)

        if (error) {
          console.error("Error deleting call:", error)
          toast.error("Error deleting call: " + error.message)
        } else {
          toast.success("Call deleted successfully")
          router.push("/call-log")
        }
      }
    } catch (error) {
      console.error("Exception deleting call:", error)
      toast.error("Failed to delete call")
    }
  }

  // Handle form changes
  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  function handleSelectChange(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle date changes
  function handleDateChange(name, date) {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  // Clear callback date
  function clearCallbackDate() {
    setFormData((prev) => ({ ...prev, call_back_date: null, call_back_time: "" }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading call details...</p>
        </div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Call Not Found</h2>
        <p className="mt-2 text-gray-500">The call log entry you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link href="/call-log">Back to Call Log</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/call-log">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Call Log
            </Link>
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="destructive" size="sm" onClick={deleteCall}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Named Insured / Company</label>
                  <Input name="named_insured" value={formData.named_insured} onChange={handleChange} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Name</label>
                  <Input name="contact_name" value={formData.contact_name} onChange={handleChange} className="mt-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <div className="mt-1 flex items-center">
                      <Input name="phone" value={formData.phone} onChange={handleChange} />
                      {formData.phone && (
                        <Button variant="ghost" size="icon" asChild className="ml-2">
                          <a href={`tel:${formData.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <div className="mt-1 flex items-center">
                      <Input name="email" value={formData.email} onChange={handleChange} />
                      {formData.email && (
                        <Button variant="ghost" size="icon" asChild className="ml-2">
                          <a href={`mailto:${formData.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Call Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Call Date</label>
                    <Popover open={callDateOpen} onOpenChange={setCallDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full mt-1 justify-start text-left font-normal",
                            !formData.call_date && "text-muted-foreground",
                          )}
                          onClick={() => setCallDateOpen(true)}
                        >
                          {formData.call_date ? format(formData.call_date, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.call_date || undefined}
                          onSelect={(date) => {
                            handleDateChange("call_date", date)
                            setCallDateOpen(false)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Call Time</label>
                    <Input
                      type="time"
                      name="call_time"
                      value={formData.call_time}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <Badge
                            className={`capitalize ${
                              option.value === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : option.value === "called back"
                                  ? "bg-green-100 text-green-800"
                                  : option.value === "message left"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {option.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Reason for Call</label>
                <Input name="reason" value={formData.reason} onChange={handleChange} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Callback Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Popover open={callBackDateOpen} onOpenChange={setCallBackDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !formData.call_back_date && "text-muted-foreground",
                          )}
                          onClick={() => setCallBackDateOpen(true)}
                        >
                          {formData.call_back_date ? format(formData.call_back_date, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.call_back_date || undefined}
                          onSelect={(date) => {
                            handleDateChange("call_back_date", date)
                            setCallBackDateOpen(false)
                          }}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    {formData.call_back_date && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearCallbackDate}
                        className="h-10 w-10 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Callback Time</label>
                  <Input
                    type="time"
                    name="call_back_time"
                    value={formData.call_back_time}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea name="notes" value={formData.notes} onChange={handleChange} className="mt-1" rows={4} />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" asChild>
              <Link href="/call-log">Cancel</Link>
            </Button>
            <Button onClick={updateCall} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-2 border-gray-200 pl-4 ml-2">
              <div className="text-sm text-gray-500">
                Created on {call.created_at ? format(parseISO(call.created_at), "PPpp") : "Unknown date"}
              </div>
              {call.updated_at && call.updated_at !== call.created_at && (
                <div className="text-sm text-gray-500 mt-2">
                  Last updated on {format(parseISO(call.updated_at), "PPpp")}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
