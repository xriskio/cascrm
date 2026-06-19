"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown, ChevronUp, Phone, User, Building, Mail, Clock, FileText, X } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const callFormSchema = z.object({
  call_date: z.date(),
  call_time: z.string().min(1, "Call time is required"),
  named_insured: z.string().optional(),
  contact_name: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  reason: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.string().default("pending"),
  call_back_date: z.date().optional().nullable(),
  call_back_time: z.string().optional(),
  notes: z.string().optional(),
})

type CallFormValues = z.infer<typeof callFormSchema>

const CATEGORY_OPTIONS = [
  { value: "billing", label: "Billing" },
  { value: "policy service", label: "Policy Service" },
  { value: "quote", label: "Quote" },
  { value: "new business opportunity", label: "New Business Opportunity" },
  { value: "other", label: "Other" },
]

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "called back", label: "Called Back" },
  { value: "message left", label: "Message Left" },
  { value: "resolved", label: "Resolved" },
]

export default function IncomingCallForm({ onSaved }: { onSaved?: () => void }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [callBackDateOpen, setCallBackDateOpen] = useState(false)
  const [callDateOpen, setCallDateOpen] = useState(false)
  const supabase = createClient()

  const form = useForm<CallFormValues>({
    resolver: zodResolver(callFormSchema) as any,
    defaultValues: {
      call_date: new Date(),
      call_time: format(new Date(), "HH:mm"),
      named_insured: "",
      contact_name: "",
      phone: "",
      email: "",
      reason: "",
      category: "",
      status: "pending",
      call_back_date: null,
      call_back_time: "",
      notes: "",
    },
  })

  async function onSubmit(data: CallFormValues) {
    setIsSubmitting(true)
    try {
      console.log("Submitting call data:", data)

      // Generate call tracking number
      const callNumber = `CALL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

      // Format the data for Supabase
      const formattedData = {
        call_number: callNumber,
        call_date: data.call_date ? format(data.call_date, "yyyy-MM-dd") : null,
        call_time: data.call_time,
        named_insured: data.named_insured || null,
        contact_name: data.contact_name,
        phone: data.phone,
        email: data.email || null,
        reason: data.reason || null,
        category: data.category,
        status: data.status,
        call_back_date: data.call_back_date ? format(data.call_back_date, "yyyy-MM-dd") : null,
        call_back_time: data.call_back_time || null,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Formatted data for Supabase:", formattedData)

      // Insert the data into Supabase
      const { data: insertedData, error } = await supabase.from("incoming_calls").insert([formattedData]).select()

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Failed to save call: ${error.message}`)
      }

      console.log("Call saved successfully:", insertedData)
      toast.success(`Call logged successfully! Tracking #: ${callNumber}`)

      // Reset form with fresh default values
      form.reset({
        call_date: new Date(),
        call_time: format(new Date(), "HH:mm"),
        named_insured: "",
        contact_name: "",
        phone: "",
        email: "",
        reason: "",
        category: "",
        status: "pending",
        call_back_date: null,
        call_back_time: "",
        notes: "",
      })

      if (onSaved) {
        onSaved()
      }

      router.refresh()
      setIsExpanded(false)
    } catch (error) {
      console.error("Error saving call:", error)
      toast.error(error instanceof Error ? error.message : "Failed to log call")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clear callback date
  function clearCallbackDate() {
    form.setValue("call_back_date", null)
    form.setValue("call_back_time", "")
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader
        className={cn("cursor-pointer bg-blue-500/10", isExpanded ? "border-b" : "")}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            <CardTitle>Log Incoming Call</CardTitle>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Contact Name*
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter caller's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="named_insured"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Company Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number*
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="caller@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="call_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Call Date*
                          </FormLabel>
                          <Popover open={callDateOpen} onOpenChange={setCallDateOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                  onClick={() => setCallDateOpen(true)}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date)
                                  setCallDateOpen(false)
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="call_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Call Time*
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="call_back_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Callback Date
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <Popover open={callBackDateOpen} onOpenChange={setCallBackDateOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "flex-1 pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                    onClick={() => setCallBackDateOpen(true)}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={(date) => {
                                    field.onChange(date)
                                    setCallBackDateOpen(false)
                                  }}
                                  initialFocus
                                  disabled={(date) => date < new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                            {field.value && (
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="call_back_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Callback Time
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Reason Details
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief reason for call" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about the call..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsExpanded(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Log Call"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      )}
    </Card>
  )
}
