"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCarrierContactById, updateCarrierContact } from "@/app/actions/carrier-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { type CarrierContact, type Underwriter, LINES_OF_BUSINESS } from "@/types/carrier"

const SPECIALTIES = [
  "PUBLIC AUTO",
  "NEMT",
  "GENERAL LIABILITY",
  "WORKERS COMP",
  "EXCESS LIABILITY",
  "CYBER LIABILITY",
  "COMMERCIAL PROPERTY",
  "LESSORS RISK ONLY",
  "AUTO DEALERS",
  "GARAGE KEEPERS",
  "BUSINESS OWNERS POLICY",
  "CONTRACTORS",
  "RESTAURANTS",
  "TRANSPORTATION",
]

export default function EditCarrierContactPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [carrier, setCarrier] = useState<CarrierContact | null>(null)
  const [loading, setLoading] = useState(true)
  const [underwriters, setUnderwriters] = useState<Array<Underwriter & { lines: string[] }>>([])

  useEffect(() => {
    const fetchCarrier = async () => {
      try {
        const data = await getCarrierContactById(params.id)
        setCarrier(data)

        // Initialize underwriters state
        if (data?.underwriters && Array.isArray(data.underwriters)) {
          setUnderwriters(
            data.underwriters.map((uw) => ({
              name: uw.name || "",
              phone: uw.phone || "",
              email: uw.email || "",
              lines: uw.lines_of_business || [],
            })),
          )
        } else {
          // Initialize with a default empty underwriter if none exist
          setUnderwriters([{ name: "", phone: "", email: "", lines: [] }])
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching carrier:", error)
        setLoading(false)
      }
    }

    fetchCarrier()
  }, [params.id])

  const addUnderwriter = () => {
    setUnderwriters([...underwriters, { name: "", phone: "", email: "", lines: [] }])
  }

  const removeUnderwriter = (index: number) => {
    const newUnderwriters = [...underwriters]
    newUnderwriters.splice(index, 1)
    setUnderwriters(newUnderwriters)
  }

  const handleUnderwriterChange = (index: number, field: string, value: string) => {
    const newUnderwriters = [...underwriters]
    newUnderwriters[index] = { ...newUnderwriters[index], [field]: value }
    setUnderwriters(newUnderwriters)
  }

  const handleLineOfBusinessChange = (index: number, line: string, checked: boolean) => {
    const newUnderwriters = [...underwriters]
    const currentLines = newUnderwriters[index].lines

    if (checked) {
      newUnderwriters[index].lines = [...currentLines, line]
    } else {
      newUnderwriters[index].lines = currentLines.filter((l) => l !== line)
    }

    setUnderwriters(newUnderwriters)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center">
              <p>Loading carrier contact information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!carrier) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center">
              <p>Carrier contact not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const updateCarrierAction = updateCarrierContact.bind(null, params.id)

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Carrier Contact</CardTitle>
          <CardDescription>Update information for {carrier.insurance_carrier}</CardDescription>
        </CardHeader>
        <form action={updateCarrierAction}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Carrier Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance_carrier">Insurance Carrier Name *</Label>
                  <Input
                    id="insurance_carrier"
                    name="insurance_carrier"
                    defaultValue={carrier.insurance_carrier}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="producer_code">Producer Code</Label>
                  <Input id="producer_code" name="producer_code" defaultValue={carrier.producer_code} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website_link">Website Link</Label>
                  <Input id="website_link" name="website_link" type="url" defaultValue={carrier.website_link} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loss_run_request_link">Loss Run Request Link</Label>
                  <Input
                    id="loss_run_request_link"
                    name="loss_run_request_link"
                    type="url"
                    defaultValue={carrier.loss_run_request_link}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Portal Access</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website_login">Website Login</Label>
                  <Input id="website_login" name="website_login" defaultValue={carrier.website_login} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency_user_id">Agency User ID</Label>
                  <Input id="agency_user_id" name="agency_user_id" defaultValue={carrier.agency_user_id} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" defaultValue={carrier.password} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_service_phone">Customer Service Phone</Label>
                  <Input
                    id="customer_service_phone"
                    name="customer_service_phone"
                    defaultValue={carrier.customer_service_phone}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_phone">Billing Phone</Label>
                  <Input id="billing_phone" name="billing_phone" defaultValue={carrier.billing_phone} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agency_contact_name">Agency Contact Name</Label>
                  <Input
                    id="agency_contact_name"
                    name="agency_contact_name"
                    defaultValue={carrier.agency_contact_name || carrier.agency_contact}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency_contact_number">Agency Contact Number</Label>
                  <Input
                    id="agency_contact_number"
                    name="agency_contact_number"
                    defaultValue={carrier.agency_contact_number}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency_contact_email">Agency Contact Email</Label>
                  <Input
                    id="agency_contact_email"
                    name="agency_contact_email"
                    type="email"
                    defaultValue={carrier.agency_contact_email}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claims_email">Claims Email</Label>
                  <Input id="claims_email" name="claims_email" type="email" defaultValue={carrier.claims_email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="claims_phone_number">Claims Phone Number</Label>
                  <Input
                    id="claims_phone_number"
                    name="claims_phone_number"
                    defaultValue={carrier.claims_phone_number}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Specialties</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {SPECIALTIES.map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty}`}
                      name="specialties"
                      value={specialty}
                      defaultChecked={
                        carrier.specialties?.includes(specialty) || carrier.insurance_specialties?.includes(specialty)
                      }
                    />
                    <Label htmlFor={`specialty-${specialty}`}>{specialty}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Underwriters</h3>
                <Button type="button" variant="outline" onClick={addUnderwriter}>
                  Add Underwriter
                </Button>
              </div>

              {underwriters.map((underwriter, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Underwriter {index + 1}</h4>
                    {index > 0 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeUnderwriter(index)}>
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`underwriter_name_${index}`}>Name</Label>
                      <Input
                        id={`underwriter_name_${index}`}
                        name={`underwriter_name_${index}`}
                        value={underwriter.name}
                        onChange={(e) => handleUnderwriterChange(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`underwriter_phone_${index}`}>Phone</Label>
                      <Input
                        id={`underwriter_phone_${index}`}
                        name={`underwriter_phone_${index}`}
                        value={underwriter.phone}
                        onChange={(e) => handleUnderwriterChange(index, "phone", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`underwriter_email_${index}`}>Email</Label>
                      <Input
                        id={`underwriter_email_${index}`}
                        name={`underwriter_email_${index}`}
                        type="email"
                        value={underwriter.email}
                        onChange={(e) => handleUnderwriterChange(index, "email", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Lines of Business</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {LINES_OF_BUSINESS.map((line) => (
                        <div key={`${index}-${line}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`underwriter_line_${index}_${line}`}
                            name={`underwriter_lines_${index}`}
                            value={line}
                            checked={underwriter.lines.includes(line)}
                            onCheckedChange={(checked) => handleLineOfBusinessChange(index, line, checked as boolean)}
                          />
                          <Label htmlFor={`underwriter_line_${index}_${line}`}>{line}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Hidden field to track underwriter count */}
              <input type="hidden" name="underwriter_count" value={underwriters.length} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={4} defaultValue={carrier.notes} />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Update Carrier Contact</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
