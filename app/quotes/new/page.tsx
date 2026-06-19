"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Upload, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Carrier {
  id: string
  name: string
  lineOfBusiness: string
  premium: string
  rating: string
  dateSent: string
  dateReceived: string
  paymentDetails: string
  quoteFile?: File
}

interface Coverage {
  id: string
  name: string
  limit: string
  premium: string
  monthlyPayment: string
}

export default function NewQuotePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [loading, setLoading] = useState(false)

  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    submissionType: "",
    insuranceType: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    insuredName: "",
    insuredAddress: "",
    followUp2Date: "",
    finalFollowUpDate: "",
    dispositionStatus: "pending",
    totalPremium: "",
    monthlyPayment: "",
    downPayment: "",
    numberOfInstallments: "",
    notes: "",
  })

  // Carriers State
  const [carriers, setCarriers] = useState<Carrier[]>([
    {
      id: "1",
      name: "",
      lineOfBusiness: "",
      premium: "",
      rating: "",
      dateSent: "",
      dateReceived: "",
      paymentDetails: "",
    },
  ])

  // Coverages State
  const [coverages, setCoverages] = useState<Coverage[]>([
    {
      id: "1",
      name: "",
      limit: "",
      premium: "",
      monthlyPayment: "",
    },
  ])

  const [exclusions, setExclusions] = useState("")

  const addCarrier = () => {
    const newCarrier: Carrier = {
      id: Date.now().toString(),
      name: "",
      lineOfBusiness: "",
      premium: "",
      rating: "",
      dateSent: "",
      dateReceived: "",
      paymentDetails: "",
    }
    setCarriers([...carriers, newCarrier])
  }

  const removeCarrier = (id: string) => {
    setCarriers(carriers.filter((c) => c.id !== id))
  }

  const updateCarrier = (id: string, field: keyof Carrier, value: string) => {
    setCarriers(carriers.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const addCoverage = () => {
    const newCoverage: Coverage = {
      id: Date.now().toString(),
      name: "",
      limit: "",
      premium: "",
      monthlyPayment: "",
    }
    setCoverages([...coverages, newCoverage])
  }

  const removeCoverage = (id: string) => {
    setCoverages(coverages.filter((c) => c.id !== id))
  }

  const updateCoverage = (id: string, field: keyof Coverage, value: string) => {
    setCoverages(coverages.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const quoteData = {
        ...basicInfo,
        carriers: carriers.filter((c) => c.name.trim() !== ""),
        coverages: coverages.filter((c) => c.name.trim() !== ""),
        exclusions,
      }

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      })

      const result = await response.json()

      if (response.ok) {
        router.push(`/quotes`)
      } else {
        console.error("Quote creation error:", result)
        alert(`Error creating quote: ${result.error || "Unknown error"}${result.details ? ` - ${result.details}` : ""}`)
      }
    } catch (error) {
      console.error("Error creating quote:", error)
      alert("Error creating quote. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const submissionTypes = [
    "Commercial Auto",
    "General Liability",
    "Workers Compensation",
    "Commercial Property",
    "Business Owners Policy",
    "Cyber Liability",
    "Excess Liability",
    "Auto Dealers",
    "Contractors",
    "Garage Keepers",
    "Lessors Risk Only",
    "NEMT",
    "Public Auto",
    "Restaurants",
    "Transportation",
  ]

  const linesOfBusiness = [
    "Commercial Auto",
    "General Liability",
    "Workers Compensation",
    "Commercial Property",
    "Business Owners Policy",
    "Cyber Liability",
    "Professional Liability",
    "Product Liability",
    "Umbrella/Excess",
    "Directors & Officers",
    "Employment Practices",
    "Crime/Fidelity",
    "Inland Marine",
    "International",
  ]

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/quotes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Quote</h1>
          <p className="text-muted-foreground">Enter quote details and track through the process</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Quick Import
        </Button>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Advanced Import
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="coverages">Coverages</TabsTrigger>
          <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submissionType">Type of Submission *</Label>
                  <Select
                    value={basicInfo.submissionType}
                    onValueChange={(value) => setBasicInfo({ ...basicInfo, submissionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select submission type" />
                    </SelectTrigger>
                    <SelectContent>
                      {submissionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="insuranceType">Insurance Type *</Label>
                  <Select
                    value={basicInfo.insuranceType}
                    onValueChange={(value) => setBasicInfo({ ...basicInfo, insuranceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select insurance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {submissionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={basicInfo.contactName}
                    onChange={(e) => setBasicInfo({ ...basicInfo, contactName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={basicInfo.contactPhone}
                    onChange={(e) => setBasicInfo({ ...basicInfo, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={basicInfo.contactEmail}
                    onChange={(e) => setBasicInfo({ ...basicInfo, contactEmail: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="insuredName">Insured Name</Label>
                  <Input
                    id="insuredName"
                    value={basicInfo.insuredName}
                    onChange={(e) => setBasicInfo({ ...basicInfo, insuredName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="insuredAddress">Insured Address</Label>
                <Textarea
                  id="insuredAddress"
                  value={basicInfo.insuredAddress}
                  onChange={(e) => setBasicInfo({ ...basicInfo, insuredAddress: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="followUp2Date">Follow-Up 2 Date</Label>
                  <Input
                    id="followUp2Date"
                    type="date"
                    value={basicInfo.followUp2Date}
                    onChange={(e) => setBasicInfo({ ...basicInfo, followUp2Date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="finalFollowUpDate">Final Follow-Up Date</Label>
                  <Input
                    id="finalFollowUpDate"
                    type="date"
                    value={basicInfo.finalFollowUpDate}
                    onChange={(e) => setBasicInfo({ ...basicInfo, finalFollowUpDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dispositionStatus">Disposition Status</Label>
                <Select
                  value={basicInfo.dispositionStatus}
                  onValueChange={(value) => setBasicInfo({ ...basicInfo, dispositionStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="bound">Bound</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="totalPremium">Total Premium</Label>
                  <Input
                    id="totalPremium"
                    type="number"
                    step="0.01"
                    value={basicInfo.totalPremium}
                    onChange={(e) => setBasicInfo({ ...basicInfo, totalPremium: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                  <Input
                    id="monthlyPayment"
                    type="number"
                    step="0.01"
                    value={basicInfo.monthlyPayment}
                    onChange={(e) => setBasicInfo({ ...basicInfo, monthlyPayment: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    step="0.01"
                    value={basicInfo.downPayment}
                    onChange={(e) => setBasicInfo({ ...basicInfo, downPayment: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="numberOfInstallments">Number of Installments</Label>
                <Input
                  id="numberOfInstallments"
                  type="number"
                  value={basicInfo.numberOfInstallments}
                  onChange={(e) => setBasicInfo({ ...basicInfo, numberOfInstallments: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={basicInfo.notes}
                  onChange={(e) => setBasicInfo({ ...basicInfo, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carriers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Carrier Information</CardTitle>
              <Button onClick={addCarrier}>
                <Plus className="h-4 w-4 mr-2" />
                Add Carrier
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {carriers.map((carrier, index) => (
                <div key={carrier.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Carrier {index + 1}</h3>
                    {carriers.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeCarrier(carrier.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Carrier Name</Label>
                      <Input
                        placeholder="Insurance company name"
                        value={carrier.name}
                        onChange={(e) => updateCarrier(carrier.id, "name", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Line of Business</Label>
                      <Select
                        value={carrier.lineOfBusiness}
                        onValueChange={(value) => updateCarrier(carrier.id, "lineOfBusiness", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select line of business" />
                        </SelectTrigger>
                        <SelectContent>
                          {linesOfBusiness.map((line) => (
                            <SelectItem key={line} value={line}>
                              {line}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Premium</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={carrier.premium}
                        onChange={(e) => updateCarrier(carrier.id, "premium", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Carrier Rating</Label>
                      <Select
                        value={carrier.rating}
                        onValueChange={(value) => updateCarrier(carrier.id, "rating", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A++">A++</SelectItem>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B++">B++</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="C++">C++</SelectItem>
                          <SelectItem value="C+">C+</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="C-">C-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Date Sent to Carrier</Label>
                      <Input
                        type="date"
                        value={carrier.dateSent}
                        onChange={(e) => updateCarrier(carrier.id, "dateSent", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Date Received Back</Label>
                      <Input
                        type="date"
                        value={carrier.dateReceived}
                        onChange={(e) => updateCarrier(carrier.id, "dateReceived", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Payment Details</Label>
                    <Textarea
                      placeholder="Payment terms"
                      value={carrier.paymentDetails}
                      onChange={(e) => updateCarrier(carrier.id, "paymentDetails", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Upload Quote File</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">.pdf, .csv, .xlsx, .docx (Max 10MB)</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Coverage Information</CardTitle>
              <Button onClick={addCoverage}>
                <Plus className="h-4 w-4 mr-2" />
                Add Coverage
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {coverages.map((coverage, index) => (
                <div key={coverage.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Coverage {index + 1}</h3>
                    {coverages.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeCoverage(coverage.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Coverage Name</Label>
                      <Input
                        placeholder="e.g., General Liability"
                        value={coverage.name}
                        onChange={(e) => updateCoverage(coverage.id, "name", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Coverage Limit</Label>
                      <Input
                        placeholder="e.g., $1,000,000"
                        value={coverage.limit}
                        onChange={(e) => updateCoverage(coverage.id, "limit", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Premium</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={coverage.premium}
                        onChange={(e) => updateCoverage(coverage.id, "premium", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Monthly Payment</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={coverage.monthlyPayment}
                        onChange={(e) => updateCoverage(coverage.id, "monthlyPayment", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exclusions">
          <Card>
            <CardHeader>
              <CardTitle>Exclusions</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="exclusions">Policy Exclusions</Label>
                <Textarea
                  id="exclusions"
                  placeholder="Enter any policy exclusions or special terms..."
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Quote
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Quote"}
          </Button>
        </div>
      </div>
    </div>
  )
}
