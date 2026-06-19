"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function CarrierContactDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [carrier, setCarrier] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    async function loadCarrierContact() {
      // Skip fetching for the "add" route
      if (id === "add") {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("carrier_contacts").select("*").eq("id", id as any).single()

        if (error) {
          console.error("Error fetching carrier contact:", error.message)
          setError(error.message)
        } else if (data) {
          setCarrier(data)
        } else {
          setError("Carrier contact not found")
        }
      } catch (err) {
        console.error("Error loading carrier:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadCarrierContact()
  }, [id])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  // If we're on the "add" route, redirect to the add page
  useEffect(() => {
    if (id === "add") {
      router.replace("/carrier-contacts/add")
    }
  }, [id, router])

  if (id === "add") {
    return null // Don't render anything while redirecting
  }

  if (loading) {
    return <div className="p-6">Loading carrier details...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p className="text-red-500">{error}</p>
            <div className="mt-4">
              <Link href="/carrier-contacts">
                <Button>Back to Carrier Contacts</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!carrier) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Carrier Not Found</h2>
            <p>The requested carrier contact could not be found.</p>
            <div className="mt-4">
              <Link href="/carrier-contacts">
                <Button>Back to Carrier Contacts</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Rest of your component remains the same...
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/carrier-contacts">
            <Button variant="ghost" className="mr-4">
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{carrier.insurance_carrier}</h1>
        </div>
        <Link href={`/carrier-contacts/${id}/edit`}>
          <Button className="bg-orange-500 hover:bg-orange-600">Edit</Button>
        </Link>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-0 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Carrier Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Insurance Carrier</p>
                  <p className="font-medium">{carrier.insurance_carrier}</p>
                </div>
                {carrier.producer_code && (
                  <div>
                    <p className="text-sm text-gray-500">Producer Code</p>
                    <p className="font-medium">{carrier.producer_code}</p>
                  </div>
                )}
                {carrier.website_link && (
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={carrier.website_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {carrier.website_link}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Display specialties if available */}
          {(carrier.specialties?.length > 0 || carrier.insurance_specialties?.length > 0) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {(carrier.specialties || carrier.insurance_specialties || []).map(
                    (specialty: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contacts" className="mt-0 space-y-6">
          {/* Display underwriters if available */}
          {carrier.underwriters && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Underwriters</h2>
                <div className="space-y-4">
                  {Array.isArray(carrier.underwriters) ? (
                    carrier.underwriters.map((underwriter: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-medium">{underwriter.name || "Unnamed Underwriter"}</h3>
                        {underwriter.phone && <p>Phone: {underwriter.phone}</p>}
                        {underwriter.email && <p>Email: {underwriter.email}</p>}

                        {/* Display lines of business if available */}
                        {underwriter.lines_of_business && underwriter.lines_of_business.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Lines of Business:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {underwriter.lines_of_business.map((line: string, lineIndex: number) => (
                                <Badge key={lineIndex} variant="outline" className="bg-blue-50 text-blue-700">
                                  {line}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No underwriters available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Display agency contact if available */}
          {(carrier.agency_contact || carrier.agency_contact_name) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Agency Contact</h2>
                <p>
                  <strong>Name:</strong> {carrier.agency_contact || carrier.agency_contact_name}
                </p>
                {carrier.agency_contact_number && (
                  <p>
                    <strong>Phone:</strong> {carrier.agency_contact_number}
                  </p>
                )}
                {carrier.agency_contact_email && (
                  <p>
                    <strong>Email:</strong> {carrier.agency_contact_email}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <p>{carrier.notes || "No notes available."}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
