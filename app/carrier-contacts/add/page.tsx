"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

// Lines of business for underwriters
const LINES_OF_BUSINESS = [
  "BUSINESS OWNER POLICIES",
  "GENERAL LIABILITY",
  "COMMERCIAL AUTO",
  "WORKERS COMPENSATION",
  "EXCESS LIABILITY",
  "CYBER LIABILITY",
  "PROFESSIONAL LIABILITY",
  "PROPERTY",
  "GARAGE LIABILITY",
  "GARAGE KEEPERS",
  "INLAND MARINE",
  "UMBRELLA",
]

// Insurance specialties for selection
const SPECIALTIES = [
  "PUBLIC AUTO",
  "NEMT",
  "CONTRACTORS",
  "LESSORS RISK",
  "BUILDERS RISK",
  "HOME",
  "AUTO",
  "FLOOD",
  "EARTHQUAKE",
]

export default function AddCarrierContactPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [underwriters, setUnderwriters] = useState([
    { name: "", phone: "", email: "", lines_of_business: [] as string[] },
  ])
  const [specialties, setSpecialties] = useState<string[]>([])

  const addUnderwriter = () => {
    setUnderwriters([...underwriters, { name: "", phone: "", email: "", lines_of_business: [] }])
  }

  const removeUnderwriter = (index: number) => {
    if (underwriters.length <= 1) return
    const newUnderwriters = [...underwriters]
    newUnderwriters.splice(index, 1)
    setUnderwriters(newUnderwriters)
  }

  const handleUnderwriterChange = (index: number, field: string, value: string) => {
    const newUnderwriters = [...underwriters]
    newUnderwriters[index] = { ...newUnderwriters[index], [field]: value }
    setUnderwriters(newUnderwriters)
  }

  const handleLineOfBusinessToggle = (index: number, line: string) => {
    const newUnderwriters = [...underwriters]
    const currentLines = newUnderwriters[index].lines_of_business

    if (currentLines.includes(line)) {
      newUnderwriters[index].lines_of_business = currentLines.filter((l) => l !== line)
    } else {
      newUnderwriters[index].lines_of_business = [...currentLines, line]
    }

    setUnderwriters(newUnderwriters)
  }

  const handleSpecialtyToggle = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter((s) => s !== specialty))
    } else {
      setSpecialties([...specialties, specialty])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const carrierData = {
      insurance_carrier: formData.get("insurance_carrier") as string,
      producer_code: formData.get("producer_code") as string,
      website_link: formData.get("website_link") as string,
      loss_run_request_link: formData.get("loss_run_request_link") as string,
      website_login: formData.get("website_login") as string,
      agency_user_id: formData.get("agency_user_id") as string,
      password: formData.get("password") as string,
      customer_service_phone: formData.get("customer_service_phone") as string,
      billing_phone: formData.get("billing_phone") as string,
      agency_contact_name: formData.get("agency_contact_name") as string,
      agency_contact_number: formData.get("agency_contact_number") as string,
      agency_contact_email: formData.get("agency_contact_email") as string,
      claims_email: formData.get("claims_email") as string,
      claims_phone_number: formData.get("claims_phone_number") as string,
      notes: formData.get("notes") as string,
      specialties: specialties,
      underwriters: underwriters,
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("carrier_contacts").insert(carrierData).select()

      if (error) {
        throw error
      }

      toast({
        title: "Carrier contact added",
        description: "The carrier contact has been successfully added.",
      })

      router.push("/carrier-contacts")
    } catch (error: any) {
      console.error("Error adding carrier contact:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding the carrier contact.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/carrier-contacts">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add Carrier Contact</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Carrier Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance_carrier">Insurance Carrier *</Label>
                  <Input id="insurance_carrier" name="insurance_carrier" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producer_code">Producer Code</Label>
                  <Input id="producer_code" name="producer_code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_link">Website Link</Label>
                  <Input id="website_link" name="website_link" type="url" placeholder="https://" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loss_run_request_link">Loss Run Request Link</Label>
                  <Input id="loss_run_request_link" name="loss_run_request_link" type="url" placeholder="https://" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Website Login Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website_login">Website Login</Label>
                  <Input id="website_login" name="website_login" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_user_id">Agency User ID</Label>
                  <Input id="agency_user_id" name="agency_user_id" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_service_phone">Customer Service Phone</Label>
                  <Input id="customer_service_phone" name="customer_service_phone" placeholder="(000) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_phone">Billing Phone</Label>
                  <Input id="billing_phone" name="billing_phone" placeholder="(000) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_contact_name">Agency Contact Name</Label>
                  <Input id="agency_contact_name" name="agency_contact_name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_contact_number">Agency Contact Number</Label>
                  <Input id="agency_contact_number" name="agency_contact_number" placeholder="(000) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_contact_email">Agency Contact Email</Label>
                  <Input id="agency_contact_email" name="agency_contact_email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claims_email">Claims Email</Label>
                  <Input id="claims_email" name="claims_email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claims_phone_number">Claims Phone Number</Label>
                  <Input id="claims_phone_number" name="claims_phone_number" placeholder="(000) 000-0000" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Insurance Specialties</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPECIALTIES.map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty}`}
                      checked={specialties.includes(specialty)}
                      onCheckedChange={() => handleSpecialtyToggle(specialty)}
                    />
                    <Label htmlFor={`specialty-${specialty}`}>{specialty}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Underwriter Information</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addUnderwriter}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Underwriter
                </Button>
              </div>

              {underwriters.map((underwriter, index) => (
                <div key={index} className="mb-6 border rounded-md p-4 relative">
                  {underwriters.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 h-auto"
                      onClick={() => removeUnderwriter(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <h3 className="font-medium mb-3">Underwriter {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor={`underwriter-name-${index}`}>Name</Label>
                      <Input
                        id={`underwriter-name-${index}`}
                        value={underwriter.name}
                        onChange={(e) => handleUnderwriterChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`underwriter-phone-${index}`}>Phone</Label>
                      <Input
                        id={`underwriter-phone-${index}`}
                        value={underwriter.phone}
                        onChange={(e) => handleUnderwriterChange(index, "phone", e.target.value)}
                        placeholder="(000) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`underwriter-email-${index}`}>Email</Label>
                      <Input
                        id={`underwriter-email-${index}`}
                        type="email"
                        value={underwriter.email}
                        onChange={(e) => handleUnderwriterChange(index, "email", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Lines of Business</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {LINES_OF_BUSINESS.map((line) => (
                        <div key={`${index}-${line}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`line-${index}-${line}`}
                            checked={underwriter.lines_of_business.includes(line)}
                            onCheckedChange={() => handleLineOfBusinessToggle(index, line)}
                          />
                          <Label htmlFor={`line-${index}-${line}`} className="text-sm">
                            {line}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <Textarea id="notes" name="notes" rows={4} placeholder="Add any notes about this carrier..." />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/carrier-contacts">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Carrier"}
          </Button>
        </div>
      </form>
    </div>
  )
}
