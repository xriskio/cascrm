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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save } from "lucide-react"

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  business_name?: string
  street_address?: string
  city?: string
  state?: string
  zip?: string
  policy_type?: string
  policy_number?: string
  carrier?: string
  premium?: number
  customer_type?: string
  current_status?: string
  [key: string]: any
}

interface EditClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client
  onSave?: (updatedClient: Client) => void
}

export function EditClientModal({ isOpen, onClose, client, onSave }: EditClientModalProps) {
  const [formData, setFormData] = useState<Client>({ ...client })
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call to update client
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Client updated successfully!",
        description: `${client.name}'s information has been updated.`,
      })

      // Call the onSave callback if provided
      if (onSave) {
        onSave(formData)
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2" />
            Edit Client Information
          </DialogTitle>
          <DialogDescription>Update {client.name}'s information below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="policy">Policy</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input id="nickname" name="nickname" value={formData.nickname || ""} onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_type">Customer Type</Label>
                  <Select
                    value={formData.customer_type || "commercial"}
                    onValueChange={(value) => handleSelectChange("customer_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_status">Status</Label>
                  <Select
                    value={formData.current_status || "active"}
                    onValueChange={(value) => handleSelectChange("current_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_number">Client Number</Label>
                  <Input
                    id="client_number"
                    name="client_number"
                    value={formData.client_number || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uid">UID</Label>
                  <Input id="uid" name="uid" value={formData.uid || ""} onChange={handleChange} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Primary Phone</Label>
                  <Input id="phone" name="phone" value={formData.phone || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_phone">Secondary Phone</Label>
                  <Input
                    id="secondary_phone"
                    name="secondary_phone"
                    value={formData.secondary_phone || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Primary Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_email">Secondary Email</Label>
                  <Input
                    id="secondary_email"
                    name="secondary_email"
                    type="email"
                    value={formData.secondary_email || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street_address">Street Address</Label>
                <Input
                  id="street_address"
                  name="street_address"
                  value={formData.street_address || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" name="zip" value={formData.zip || ""} onChange={handleChange} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    value={formData.business_name || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="federal_ein">Federal EIN</Label>
                  <Input
                    id="federal_ein"
                    name="federal_ein"
                    value={formData.federal_ein || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="naics_code">NAICS Code</Label>
                  <Input id="naics_code" name="naics_code" value={formData.naics_code || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number_of_employees">Number of Employees</Label>
                  <Input
                    id="number_of_employees"
                    name="number_of_employees"
                    type="number"
                    value={formData.number_of_employees || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="policy" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy_type">Policy Type</Label>
                  <Select
                    value={formData.policy_type || ""}
                    onValueChange={(value) => handleSelectChange("policy_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial_auto">Commercial Auto</SelectItem>
                      <SelectItem value="general_liability">General Liability</SelectItem>
                      <SelectItem value="workers_comp">Workers Compensation</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="bop">Business Owners Policy</SelectItem>
                      <SelectItem value="cyber">Cyber Liability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy_number">Policy Number</Label>
                  <Input
                    id="policy_number"
                    name="policy_number"
                    value={formData.policy_number || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Carrier</Label>
                  <Input id="carrier" name="carrier" value={formData.carrier || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premium">Premium</Label>
                  <Input
                    id="premium"
                    name="premium"
                    type="number"
                    step="0.01"
                    value={formData.premium || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
