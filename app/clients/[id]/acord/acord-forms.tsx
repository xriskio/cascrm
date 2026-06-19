"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Printer, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface AcordFormsProps {
  client: {
    id: string
    name: string
    business_name?: string
    policy_type?: string
    policy_number?: string
    carrier?: string
    effective_date?: string
    expiration_date?: string
    premium?: number
    street_address?: string
    city?: string
    state?: string
    zip?: string
    phone?: string
    email?: string
  }
}

export function AcordForms({ client }: AcordFormsProps) {
  const [activeTab, setActiveTab] = useState("available")
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock ACORD forms data
  const availableForms = [
    {
      id: "acord125",
      name: "ACORD 125",
      description: "Commercial Insurance Application",
      type: "Commercial Lines",
      lastGenerated: null,
    },
    {
      id: "acord126",
      name: "ACORD 126",
      description: "Commercial General Liability Section",
      type: "Commercial Lines",
      lastGenerated: null,
    },
    {
      id: "acord127",
      name: "ACORD 127",
      description: "Business Auto Section",
      type: "Commercial Lines",
      lastGenerated: null,
    },
    {
      id: "acord130",
      name: "ACORD 130",
      description: "Workers Compensation Application",
      type: "Commercial Lines",
      lastGenerated: null,
    },
    {
      id: "acord140",
      name: "ACORD 140",
      description: "Property Section",
      type: "Commercial Lines",
      lastGenerated: null,
    },
  ]

  const generatedForms = [
    {
      id: "acord25-gen",
      name: "ACORD 25",
      description: "Certificate of Liability Insurance",
      type: "Certificate",
      lastGenerated: "2023-11-15T14:30:00Z",
      status: "complete",
    },
    {
      id: "acord27-gen",
      name: "ACORD 27",
      description: "Evidence of Property Insurance",
      type: "Certificate",
      lastGenerated: "2023-10-22T09:15:00Z",
      status: "complete",
    },
    {
      id: "acord80-gen",
      name: "ACORD 80",
      description: "Homeowner Application",
      type: "Personal Lines",
      lastGenerated: "2023-09-05T16:45:00Z",
      status: "complete",
    },
  ]

  const handleGenerateForm = (formId: string) => {
    setIsGenerating(true)
    // Simulate form generation
    setTimeout(() => {
      setIsGenerating(false)
      setActiveTab("generated")
      // In a real app, you would call an API to generate the form
    }, 2000)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Information for ACORD Forms</CardTitle>
          <CardDescription>This information will be pre-filled in all generated ACORD forms.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Client Name</h3>
                <p className="mt-1 text-base">{client.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
                <p className="mt-1 text-base">{client.business_name || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-base">
                  {client.street_address || "N/A"}
                  <br />
                  {client.city && client.state && client.zip
                    ? `${client.city}, ${client.state} ${client.zip}`
                    : "Address incomplete"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Policy Type</h3>
                <p className="mt-1 text-base">{client.policy_type || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Policy Number</h3>
                <p className="mt-1 text-base">{client.policy_number || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Carrier</h3>
                <p className="mt-1 text-base">{client.carrier || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Policy Period</h3>
                <p className="mt-1 text-base">
                  {client.effective_date && client.expiration_date
                    ? `${formatDate(client.effective_date)} to ${formatDate(client.expiration_date)}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Forms</TabsTrigger>
          <TabsTrigger value="generated">Generated Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableForms.map((form) => (
              <Card key={form.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        {form.name}
                      </CardTitle>
                      <CardDescription>{form.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{form.type}</Badge>
                  </div>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button
                    onClick={() => handleGenerateForm(form.id)}
                    disabled={isGenerating}
                    className="w-full"
                    variant="default"
                  >
                    {isGenerating ? "Generating..." : "Generate Form"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generated" className="space-y-4 mt-6">
          {generatedForms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No forms have been generated yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab("available")}>
                Generate Forms
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {generatedForms.map((form) => (
                <Card key={form.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          {form.name}
                        </CardTitle>
                        <CardDescription>{form.description}</CardDescription>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {form.type}
                        </Badge>
                        {form.status === "complete" ? (
                          <Badge variant={"success" as any} className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant={"warning" as any} className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Generated on {formatDate(form.lastGenerated)}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
