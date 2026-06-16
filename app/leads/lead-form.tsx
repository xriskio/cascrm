"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

const leadFormSchema = z.object({
  // Contact Information
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  company_name: z.string().optional().or(z.literal("")),

  // Lead Details
  source: z.string().min(1, { message: "Please select a lead source." }),
  product_interest: z.string().optional().or(z.literal("")),
  status: z.string().min(1),
  priority: z.string().min(1),

  // Additional Information
  notes: z.string().optional().or(z.literal("")),
  assigned_to: z.string().optional().or(z.literal("")),
})

type LeadFormValues = z.infer<typeof leadFormSchema>

const defaultValues: Partial<LeadFormValues> = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  source: "phone call",
  product_interest: "",
  status: "new",
  priority: "medium",
  notes: "",
  assigned_to: "",
}

export default function LeadForm({ lead }: { lead?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: lead || defaultValues,
  })

  async function onSubmit(data: LeadFormValues) {
    setIsSubmitting(true)

    try {
      // Generate lead tracking number
      const leadNumber = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

      const leadData = {
        lead_id: leadNumber,
        name: data.name,
        contact_name: data.name,
        company_name: data.company_name || null,
        email: data.email || null,
        phone: data.phone,
        source: data.source,
        product_interest: data.product_interest || null,
        status: data.status,
        priority: data.priority,
        notes: data.notes || null,
        assigned_to: (data.assigned_to && data.assigned_to !== "Unassigned") ? data.assigned_to : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        date_entered: new Date().toISOString(),
      }

      const { error } = await supabase.from("leads").insert([leadData] as any)

      if (error) {
        console.error("Error creating lead:", error)
        toast.error("Failed to create lead: " + error.message)
        return
      }

      toast.success(`Lead created successfully! Tracking #: ${leadNumber}`)
      router.push("/leads")
      router.refresh()
    } catch (error) {
      console.error("Exception creating lead:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">Contact Information</TabsTrigger>
            <TabsTrigger value="details">Lead Details</TabsTrigger>
            <TabsTrigger value="additional">Additional Information</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 555-5555" {...field} />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="phone call">Phone Call</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social media">Social Media</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Interest</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product interest" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="auto">Auto Insurance</SelectItem>
                        <SelectItem value="public-auto">Public Auto</SelectItem>
                        <SelectItem value="nemt">NEMT</SelectItem>
                        <SelectItem value="general-liability">General Liability</SelectItem>
                        <SelectItem value="workers-comp">Workers Compensation</SelectItem>
                        <SelectItem value="excess-liability">Excess Liability</SelectItem>
                        <SelectItem value="cyber-liability">Cyber Liability</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes about this lead..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/leads")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Lead"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
