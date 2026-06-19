"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { submitApplication } from "@/app/actions/submit-application"
import { toast } from "@/hooks/use-toast"
import { HelpCircle, Plus, Trash2, UserPlus, UserMinus } from "lucide-react"
import { AddressInput } from "./address-input"

interface ScheduledItem {
  id: string
  category: string
  description: string
  value: number
}

interface NamedInsured {
  id: string
  name: string
  dateOfBirth: string
  address: string
}

export function HomeOwnersForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("interview")
  const [loading, setLoading] = useState(false)
  const [quoteNumber, setQuoteNumber] = useState<string>("")
  const [hasCoApplicant, setHasCoApplicant] = useState(false)
  const [useCustomDwellingAmount, setUseCustomDwellingAmount] = useState(false)
  const [useCustomPersonalPropertyAmount, setUseCustomPersonalPropertyAmount] = useState(false)

  // Form state with no prefilled data
  const [formData, setFormData] = useState({
    // Policy Information
    policyNumber: "",
    agent: "Wael Mohammad",
    contractTerm: "12 months",

    // Interview tab - Primary Applicant
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    lastFourSSN: "",
    email: "",
    phoneNumber: "",
    propertyAddress: "",
    primaryUse: "",

    // Co-Applicant Information
    coFirstName: "",
    coMiddleName: "",
    coLastName: "",
    coDateOfBirth: "",
    coLastFourSSN: "",
    coEmail: "",
    coPhoneNumber: "",
    relationshipToPrimary: "",

    // Property Review tab
    squareFootage: "",
    stories: "",
    bathrooms: "",
    yearBuilt: "",
    buildingMaterial: "",
    roofYearBuilt: "",
    roofMaterial: "",
    roofShape: "",
    foundationType: "",
    buildingQuality: "",
    isBasementFinished: false,
    hasGarage: false,
    hasSwimmingPool: false,
    hasSolarPanels: false,
    isSingleFamily: false,
    isUnconventionalHome: false,
    isCurrentlyInsured: false,
    hasPriorCancellations: false,
    hasDogs: false,
    isPrimaryHeatingStove: false,
    hasBusinessOnSite: false,

    // Coverage tab
    effectiveDate: "",
    autoInAgency: false,
    dwellingReplacementCost: 350000,
    customDwellingAmount: "",
    otherStructures: 35000,
    personalProperty: 175000,
    customPersonalPropertyAmount: "",
    lossOfUse: 70000,
    liability: 300000,
    medicalPayments: 5000,

    // Deductibles
    standardPerilsDeductible: 1000,
    windHailDeductible: "",
    windHailRoofSettlement: "",
    roofPaymentSchedule: "",
    waterBackup: false,
    waterBackupAmount: 5000,
    equipmentBreakdown: false,
    equipmentBreakdownAmount: 50000,
    buriedServiceLines: false,
    buriedServiceLinesAmount: 10000,
    underConstruction: false,
    personalCyber: false,
    personalCyberAmount: 25000,
    homeSharingParticipation: false,
    earthquakeCoverage: false,
    supplementaryBoatHull: "",
    identityTheft: false,
    identityTheftAmount: 15000,
    enhancedReplacement: false,
    enhancedReplacementPercentage: 25,
    ordinanceOrLaw: false,
    ordinanceOrLawAmount: 10000,

    // Blanket Contents
    jewelry: 0,
    furs: 0,
    cameras: 0,
    musicalInstruments: 0,
    computers: 0,
    silverware: 0,
    fineArts: 0,
    wine: 0,
    firearms: 0,
    fineChinaCrystal: 0,
    rareCoins: 0,
    stamps: 0,
    tradingCards: 0,
    otherCollectibles: 0,

    // Parties tab
    namedInsureds: [] as NamedInsured[],
    legalEntityNamedInsured: "",
    nonResidentTrustees: "",
    otherHouseholdMembers: "",
    additionalInsureds: "",
    mortgagees: "",
    additionalInterests: "",

    // Payment & Bind tab
    allowTextMessages: false,
    acceptElectronicDocuments: false,
    paymentPlan: "",
    paymentMethod: "",
    application: "",
    agentOfRecord: "Wael Mohammad (Myself)",

    // Documentation
    documents: [] as File[],
  })

  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([])

  // Generate quote number on component mount
  useEffect(() => {
    const generateQuoteNumber = () => {
      // Simulate quote number generation - in real app this would be from server
      const timestamp = Date.now().toString().slice(-6)
      const quoteNum = `HOQ01-${timestamp.padStart(7, "0")}`
      setQuoteNumber(quoteNum)
    }

    generateQuoteNumber()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] }))
  }

  const addScheduledItem = () => {
    const newItem: ScheduledItem = {
      id: Date.now().toString(),
      category: "",
      description: "",
      value: 0,
    }
    setScheduledItems((prev) => [...prev, newItem])
  }

  const removeScheduledItem = (id: string) => {
    setScheduledItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateScheduledItem = (id: string, field: string, value: string | number) => {
    setScheduledItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addNamedInsured = () => {
    const newInsured: NamedInsured = {
      id: Date.now().toString(),
      name: "",
      dateOfBirth: "",
      address: "",
    }
    setFormData((prev) => ({
      ...prev,
      namedInsureds: [...prev.namedInsureds, newInsured],
    }))
  }

  const removeNamedInsured = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      namedInsureds: prev.namedInsureds.filter((insured) => insured.id !== id),
    }))
  }

  const updateNamedInsured = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      namedInsureds: prev.namedInsureds.map((insured) =>
        insured.id === id ? { ...insured, [field]: value } : insured,
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare the final data with the correct dwelling and personal property amounts
      const finalData = {
        ...formData,
        dwellingReplacementCost: useCustomDwellingAmount
          ? Number.parseFloat(formData.customDwellingAmount) || formData.dwellingReplacementCost
          : formData.dwellingReplacementCost,
        personalProperty: useCustomPersonalPropertyAmount
          ? Number.parseFloat(formData.customPersonalPropertyAmount) || formData.personalProperty
          : formData.personalProperty,
      }

      // Generate submission number
      const generateSubmissionNumber = () => {
        return `SUB-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`
      }

      const submissionNumber = generateSubmissionNumber()

      // Create submission data matching database schema
      const submissionData = {
        submission_number: submissionNumber,
        insurance_type: "home-owners",
        status: "pending",
        created_at: new Date().toISOString(),
        form_data: {
          ...finalData,
          scheduledItems,
          hasCoApplicant,
          quoteNumber,
        },
      }

      const result = await submitApplication(submissionData)

      if (result.success) {
        toast({
          title: "Success!",
          description: `Home owners application submitted successfully. Submission #: ${result.submissionNumber}`,
        })
        router.push(`/submissions/success?submissionNumber=${result.submissionNumber}&submissionId=${result.submissionId}`)
      } else {
        throw new Error(result.error || "Failed to submit application")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "interview") setActiveTab("property-review")
    else if (activeTab === "property-review") setActiveTab("coverage")
    else if (activeTab === "coverage") setActiveTab("parties")
    else if (activeTab === "parties") setActiveTab("payment-bind")
    else if (activeTab === "payment-bind") setActiveTab("documentation")
  }

  const prevTab = () => {
    if (activeTab === "property-review") setActiveTab("interview")
    else if (activeTab === "coverage") setActiveTab("property-review")
    else if (activeTab === "parties") setActiveTab("coverage")
    else if (activeTab === "payment-bind") setActiveTab("parties")
    else if (activeTab === "documentation") setActiveTab("payment-bind")
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center mb-6">
        <div className="mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Home Owners Insurance Application</h1>
      </div>

      {/* Policy Header with Quote Number */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Quote #</Label>
              <p className="text-sm font-mono text-blue-600">{quoteNumber || "Generating..."}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Agent</Label>
              <p className="text-sm text-muted-foreground">{formData.agent}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Contract Term</Label>
              <p className="text-sm text-muted-foreground">{formData.contractTerm}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-sm text-yellow-600">Draft</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="interview">1. Interview</TabsTrigger>
          <TabsTrigger value="property-review">2. Property Review</TabsTrigger>
          <TabsTrigger value="coverage">3. Coverage</TabsTrigger>
          <TabsTrigger value="parties">4. Parties</TabsTrigger>
          <TabsTrigger value="payment-bind">5. Payment & Bind</TabsTrigger>
          <TabsTrigger value="documentation">6. Documentation</TabsTrigger>
        </TabsList>

        {/* Interview Tab */}
        <TabsContent value="interview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Applicant */}
              <div>
                <h3 className="text-lg font-medium mb-4">Primary Applicant</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" name="middleName" value={formData.middleName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="lastFourSSN">
                        Last 4 of SSN <span className="text-red-500">*</span>
                      </Label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="lastFourSSN"
                      name="lastFourSSN"
                      value={formData.lastFourSSN}
                      onChange={handleInputChange}
                      placeholder="••••"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Co-Applicant Toggle */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCoApplicant"
                      checked={hasCoApplicant}
                      onCheckedChange={(checked) => setHasCoApplicant(checked === true)}
                    />
                    <Label htmlFor="hasCoApplicant" className="font-medium">
                      Add Co-Applicant (Spouse, Partner, etc.)
                    </Label>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setHasCoApplicant(!hasCoApplicant)}>
                    {hasCoApplicant ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove Co-Applicant
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Co-Applicant
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Co-Applicant Information */}
              {hasCoApplicant && (
                <div className="border rounded-md p-4 bg-muted">
                  <h3 className="text-lg font-medium mb-4">Co-Applicant Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coFirstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="coFirstName"
                        name="coFirstName"
                        value={formData.coFirstName}
                        onChange={handleInputChange}
                        required={hasCoApplicant}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coMiddleName">Middle Name</Label>
                      <Input
                        id="coMiddleName"
                        name="coMiddleName"
                        value={formData.coMiddleName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coLastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="coLastName"
                        name="coLastName"
                        value={formData.coLastName}
                        onChange={handleInputChange}
                        required={hasCoApplicant}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="coDateOfBirth">
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="coDateOfBirth"
                        name="coDateOfBirth"
                        type="date"
                        value={formData.coDateOfBirth}
                        onChange={handleInputChange}
                        required={hasCoApplicant}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coLastFourSSN">
                        Last 4 of SSN <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="coLastFourSSN"
                        name="coLastFourSSN"
                        value={formData.coLastFourSSN}
                        onChange={handleInputChange}
                        placeholder="••••"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        required={hasCoApplicant}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="coEmail">Email Address</Label>
                      <Input
                        id="coEmail"
                        name="coEmail"
                        type="email"
                        value={formData.coEmail}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coPhoneNumber">Phone Number</Label>
                      <Input
                        id="coPhoneNumber"
                        name="coPhoneNumber"
                        value={formData.coPhoneNumber}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationshipToPrimary">
                        Relationship <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.relationshipToPrimary}
                        onValueChange={(value) => handleSelectChange("relationshipToPrimary", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="domestic-partner">Domestic Partner</SelectItem>
                          <SelectItem value="relative">Relative</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-1">
                  <Label htmlFor="propertyAddress">
                    Property Address <span className="text-red-500">*</span>
                  </Label>
                </div>
                <AddressInput
                  value={formData.propertyAddress}
                  onChange={(address) => handleSelectChange("propertyAddress", address)}
                  placeholder="Enter complete property address..."
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <Label>
                    Primary Use <span className="text-red-500">*</span>
                  </Label>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>

                <RadioGroup
                  value={formData.primaryUse}
                  onValueChange={(value) => handleSelectChange("primaryUse", value)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="main-residence" id="main-residence" />
                    <div className="flex-1">
                      <Label htmlFor="main-residence" className="font-medium">
                        Main Residence
                      </Label>
                      <p className="text-sm text-muted-foreground">HO-5 Policy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="secondary-seasonal" id="secondary-seasonal" />
                    <div className="flex-1">
                      <Label htmlFor="secondary-seasonal" className="font-medium">
                        Secondary/Seasonal
                      </Label>
                      <p className="text-sm text-muted-foreground">HO-5 Policy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="long-term-rental" id="long-term-rental" />
                    <div className="flex-1">
                      <Label htmlFor="long-term-rental" className="font-medium">
                        Long Term Rental
                      </Label>
                      <p className="text-sm text-muted-foreground">HO-3 Policy</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-yellow-500/10 border border-border p-4 rounded-md text-sm">
                <p>
                  <strong>Please note:</strong> As part of the quoting process we may use information from public
                  records and consumer reports to provide you a quote. This includes running claims loss history and
                  generating an insurance based credit score.
                </p>
              </div>

              <div className="bg-muted border border-border p-4 rounded-md text-sm">
                <p>
                  Before proceeding, please ensure that the applicable state disclosure has been read to the applicant.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Reset
              </Button>
              <Button
                onClick={nextTab}
                disabled={!formData.firstName || !formData.lastName || !formData.propertyAddress}
              >
                Continue
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Property Review Tab */}
        <TabsContent value="property-review" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>2. Property Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="squareFootage">
                    Square Footage <span className="text-red-500">*</span>
                  </Label>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">This should not include the size of a basement.</p>
                <Input
                  id="squareFootage"
                  name="squareFootage"
                  type="number"
                  value={formData.squareFootage}
                  onChange={handleInputChange}
                  placeholder="e.g., 2000"
                  min="500"
                  max="10000"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="stories">
                      Stories <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select value={formData.stories} onValueChange={(value) => handleSelectChange("stories", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Story</SelectItem>
                      <SelectItem value="2">2 Stories</SelectItem>
                      <SelectItem value="3">3 Stories</SelectItem>
                      <SelectItem value="4">4+ Stories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="bathrooms">
                      Bathrooms <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select value={formData.bathrooms} onValueChange={(value) => handleSelectChange("bathrooms", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bathroom</SelectItem>
                      <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                      <SelectItem value="2">2 Bathrooms</SelectItem>
                      <SelectItem value="2.5">2.5 Bathrooms</SelectItem>
                      <SelectItem value="3">3 Bathrooms</SelectItem>
                      <SelectItem value="3.5">3.5 Bathrooms</SelectItem>
                      <SelectItem value="4">4+ Bathrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="yearBuilt">
                      Year Built <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={handleInputChange}
                    placeholder="e.g., 1990"
                    min="1800"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label>
                    Building Material <span className="text-red-500">*</span>
                  </Label>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <Select
                  value={formData.buildingMaterial}
                  onValueChange={(value) => handleSelectChange("buildingMaterial", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select building material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wood-frame-non-masonry">
                      Wood Frame, with Non-Masonry Veneer (incl. Stucco)
                    </SelectItem>
                    <SelectItem value="masonry">Masonry</SelectItem>
                    <SelectItem value="brick-veneer">Brick Veneer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="roofYearBuilt">
                      Roof Year Built <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="roofYearBuilt"
                    name="roofYearBuilt"
                    type="number"
                    value={formData.roofYearBuilt}
                    onChange={handleInputChange}
                    placeholder="e.g., 2010"
                    min="1800"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Roof Material <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={formData.roofMaterial}
                    onValueChange={(value) => handleSelectChange("roofMaterial", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select roof material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="three-tab">Three-Tab</SelectItem>
                      <SelectItem value="architectural">Architectural Shingles</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                      <SelectItem value="tile">Tile</SelectItem>
                      <SelectItem value="slate">Slate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Roof Shape <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select value={formData.roofShape} onValueChange={(value) => handleSelectChange("roofShape", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select roof shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gable">Gable</SelectItem>
                      <SelectItem value="hip">Hip</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Foundation Type <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={formData.foundationType}
                    onValueChange={(value) => handleSelectChange("foundationType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select foundation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basement">Basement</SelectItem>
                      <SelectItem value="slab">Slab</SelectItem>
                      <SelectItem value="crawlspace">Crawlspace</SelectItem>
                      <SelectItem value="pier">Pier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Building Quality <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={formData.buildingQuality}
                    onValueChange={(value) => handleSelectChange("buildingQuality", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select building quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above-average">Above Average</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="below-average">Below Average</SelectItem>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Yes/No Questions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Is the basement at least partially finished?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.isBasementFinished ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("isBasementFinished", false)}
                    >
                      No
                    </Button>
                    <Button
                      type="button"
                      variant={formData.isBasementFinished ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("isBasementFinished", true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Has a garage?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.hasGarage ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasGarage", false)}
                    >
                      No
                    </Button>
                    <Button
                      type="button"
                      variant={formData.hasGarage ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasGarage", true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-border p-3 rounded-md text-sm">
                  <p>
                    <strong>Please note:</strong> There are no Trampoline restrictions.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Has a swimming pool?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.hasSwimmingPool ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasSwimmingPool", false)}
                    >
                      No
                    </Button>
                    <Button
                      type="button"
                      variant={formData.hasSwimmingPool ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasSwimmingPool", true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Has solar panels?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.hasSolarPanels ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasSolarPanels", false)}
                    >
                      No
                    </Button>
                    <Button
                      type="button"
                      variant={formData.hasSolarPanels ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasSolarPanels", true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Is this a single family home? <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={formData.isSingleFamily ? "yes-detached" : "no"}
                    onValueChange={(value) => handleCheckboxChange("isSingleFamily", value === "yes-detached")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes-detached">Yes, detached single family</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Is this an unconventional home? <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Is the home mobile, on a historical registry, a log cabin, or built on stilts?
                  </p>
                  <Select
                    value={formData.isUnconventionalHome ? "unconventional" : "conventional"}
                    onValueChange={(value) => handleCheckboxChange("isUnconventionalHome", value === "unconventional")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="unconventional">Mobile/Log Cabin/Stilts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Is the home currently insured? <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.isCurrentlyInsured ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("isCurrentlyInsured", false)}
                    >
                      No
                    </Button>
                    <Button
                      type="button"
                      variant={formData.isCurrentlyInsured ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("isCurrentlyInsured", true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Has client had home, condo, or renters insurance cancelled in last 3 years?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.hasPriorCancellations ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasPriorCancellations", false)}
                    >
                      No
                    </Button>
                    <Button
                      type="button"
                      variant={formData.hasPriorCancellations ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasPriorCancellations", true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Any dogs? <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">There are no dog breed restrictions.</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.hasDogs ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasDogs", false)}
                    >
                      No
                    </Button>
                    <Button
                      type="button"
                      variant={formData.hasDogs ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasDogs", true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Is primary heating a stove? <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Is a non-thermostatically controlled wood, kerosene, pellet, or similar stove used as the primary
                    heating source?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.isPrimaryHeatingStove ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("isPrimaryHeatingStove", false)}
                    >
                      No
                    </Button>
                    <Button
                      type="button"
                      variant={formData.isPrimaryHeatingStove ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("isPrimaryHeatingStove", true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Is there a business with customers on site (including daycare)?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Only include businesses that involve customer foot traffic at the house.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.hasBusinessOnSite ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasBusinessOnSite", false)}
                    >
                      No
                    </Button>
                    <Button
                      type="button"
                      variant={formData.hasBusinessOnSite ? "default" : "outline"}
                      onClick={() => handleCheckboxChange("hasBusinessOnSite", true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevTab}>
                Back
              </Button>
              <Button onClick={nextTab} disabled={!formData.squareFootage || !formData.yearBuilt}>
                Continue
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Coverage Tab - Enhanced with more options */}
        <TabsContent value="coverage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>3. Coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">
                  Effective Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label>
                    Auto in agency? <span className="text-red-500">*</span>
                  </Label>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">May be with a different carrier.</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!formData.autoInAgency ? "default" : "outline"}
                    onClick={() => handleCheckboxChange("autoInAgency", false)}
                  >
                    No
                  </Button>
                  <Button
                    type="button"
                    variant={formData.autoInAgency ? "default" : "outline"}
                    onClick={() => handleCheckboxChange("autoInAgency", true)}
                  >
                    Yes
                  </Button>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-border p-4 rounded-md">
                <p className="text-sm">
                  <strong>Dwelling replacement cost is estimated</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Some of the coverages and deductibles are shown as percentage of replacement cost.
                </p>
              </div>

              {/* Main Coverage Amounts */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label>
                        Main Dwelling <span className="text-red-500">*</span>
                      </Label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="useCustomDwellingAmount"
                        checked={useCustomDwellingAmount}
                        onCheckedChange={(checked) => setUseCustomDwellingAmount(checked === true)}
                      />
                      <Label htmlFor="useCustomDwellingAmount" className="text-sm">
                        Custom Amount
                      </Label>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Guaranteed replacement of main dwelling structure up to $5 million.
                  </p>

                  {useCustomDwellingAmount ? (
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        id="customDwellingAmount"
                        name="customDwellingAmount"
                        type="number"
                        value={formData.customDwellingAmount}
                        onChange={handleInputChange}
                        placeholder="Enter custom amount"
                        min="100000"
                        max="5000000"
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm mb-1">
                        <span>$100,000</span>
                        <span>${formData.dwellingReplacementCost.toLocaleString()}</span>
                        <span>$5,000,000</span>
                      </div>
                      <Slider
                        value={[formData.dwellingReplacementCost]}
                        min={100000}
                        max={5000000}
                        step={10000}
                        onValueChange={(value) => handleSliderChange("dwellingReplacementCost", value)}
                        className="w-full"
                      />
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label>
                        Other Structures <span className="text-red-500">*</span>
                      </Label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">${formData.otherStructures.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Typically 10% of dwelling coverage (detached garage, shed, fence, etc.)
                  </p>
                  <div className="flex justify-between text-sm mb-1">
                    <span>$0</span>
                    <span>$500,000</span>
                  </div>
                  <Slider
                    value={[formData.otherStructures]}
                    min={0}
                    max={500000}
                    step={5000}
                    onValueChange={(value) => handleSliderChange("otherStructures", value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label>
                        Personal Property <span className="text-red-500">*</span>
                      </Label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="useCustomPersonalPropertyAmount"
                        checked={useCustomPersonalPropertyAmount}
                        onCheckedChange={(checked) => setUseCustomPersonalPropertyAmount(checked === true)}
                      />
                      <Label htmlFor="useCustomPersonalPropertyAmount" className="text-sm">
                        Custom Amount
                      </Label>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Typically 50% of dwelling coverage (furniture, clothing, appliances, etc.)
                  </p>

                  {useCustomPersonalPropertyAmount ? (
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        id="customPersonalPropertyAmount"
                        name="customPersonalPropertyAmount"
                        type="number"
                        value={formData.customPersonalPropertyAmount}
                        onChange={handleInputChange}
                        placeholder="Enter custom amount"
                        min="25000"
                        max="2500000"
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm mb-1">
                        <span>$25,000</span>
                        <span>${formData.personalProperty.toLocaleString()}</span>
                        <span>$2,500,000</span>
                      </div>
                      <Slider
                        value={[formData.personalProperty]}
                        min={25000}
                        max={2500000}
                        step={5000}
                        onValueChange={(value) => handleSliderChange("personalProperty", value)}
                        className="w-full"
                      />
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label>
                        Loss of Use <span className="text-red-500">*</span>
                      </Label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">${formData.lossOfUse.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Typically 20% of dwelling coverage (additional living expenses if home is uninhabitable)
                  </p>
                  <div className="flex justify-between text-sm mb-1">
                    <span>$10,000</span>
                    <span>$1,000,000</span>
                  </div>
                  <Slider
                    value={[formData.lossOfUse]}
                    min={10000}
                    max={1000000}
                    step={10000}
                    onValueChange={(value) => handleSliderChange("lossOfUse", value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label>
                        Liability <span className="text-red-500">*</span>
                      </Label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">${formData.liability.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Protection if you're legally responsible for injury or property damage
                  </p>
                  <Select
                    value={formData.liability.toString()}
                    onValueChange={(value) => handleSliderChange("liability", [Number.parseInt(value)])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select liability limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100000">$100,000</SelectItem>
                      <SelectItem value="300000">$300,000</SelectItem>
                      <SelectItem value="500000">$500,000</SelectItem>
                      <SelectItem value="1000000">$1,000,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label>
                        Medical Payments <span className="text-red-500">*</span>
                      </Label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">${formData.medicalPayments.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Medical expenses for guests injured on your property, regardless of fault
                  </p>
                  <Select
                    value={formData.medicalPayments.toString()}
                    onValueChange={(value) => handleSliderChange("medicalPayments", [Number.parseInt(value)])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select medical payments limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">$1,000</SelectItem>
                      <SelectItem value="2500">$2,500</SelectItem>
                      <SelectItem value="5000">$5,000</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Deductibles Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Deductibles</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label>
                        Standard Perils <span className="text-red-500">*</span>
                      </Label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">${formData.standardPerilsDeductible.toLocaleString()}</span>
                  </div>
                  <Select
                    value={formData.standardPerilsDeductible.toString()}
                    onValueChange={(value) => handleSliderChange("standardPerilsDeductible", [Number.parseInt(value)])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select standard deductible" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">$500</SelectItem>
                      <SelectItem value="1000">$1,000</SelectItem>
                      <SelectItem value="2500">$2,500</SelectItem>
                      <SelectItem value="5000">$5,000</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Wind/Hail <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={formData.windHailDeductible.toString()}
                    onValueChange={(value) => handleSliderChange("windHailDeductible", [Number.parseInt(value)])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select wind/hail deductible" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">$500</SelectItem>
                      <SelectItem value="1000">$1,000</SelectItem>
                      <SelectItem value="2500">$2,500</SelectItem>
                      <SelectItem value="5000">$5,000</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Wind/Hail Roof Settlement <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={formData.windHailRoofSettlement}
                    onValueChange={(value) => handleSelectChange("windHailRoofSettlement", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select settlement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replacement-cost">Replacement Cost</SelectItem>
                      <SelectItem value="actual-cash-value">Actual Cash Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label>
                      Roof Payment Schedule <span className="text-red-500">*</span>
                    </Label>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={formData.roofPaymentSchedule}
                    onValueChange={(value) => handleSelectChange("roofPaymentSchedule", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-payment">Single Payment</SelectItem>
                      <SelectItem value="multi-payment">Multi-Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional Coverages */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Optional Coverages</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="waterBackup">Water Backup</Label>
                    <Checkbox
                      id="waterBackup"
                      checked={formData.waterBackup}
                      onCheckedChange={(checked) => handleCheckboxChange("waterBackup", checked === true)}
                    />
                  </div>
                  {formData.waterBackup && (
                    <div className="space-y-2">
                      <Label htmlFor="waterBackupAmount">Water Backup Amount</Label>
                      <Select
                        value={formData.waterBackupAmount.toString()}
                        onValueChange={(value) => handleSliderChange("waterBackupAmount", [Number.parseInt(value)])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5000">$5,000</SelectItem>
                          <SelectItem value="10000">$10,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="equipmentBreakdown">Equipment Breakdown</Label>
                    <Checkbox
                      id="equipmentBreakdown"
                      checked={formData.equipmentBreakdown}
                      onCheckedChange={(checked) => handleCheckboxChange("equipmentBreakdown", checked === true)}
                    />
                  </div>
                  {formData.equipmentBreakdown && (
                    <div className="space-y-2">
                      <Label htmlFor="equipmentBreakdownAmount">Equipment Breakdown Amount</Label>
                      <Select
                        value={formData.equipmentBreakdownAmount.toString()}
                        onValueChange={(value) =>
                          handleSliderChange("equipmentBreakdownAmount", [Number.parseInt(value)])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50000">$50,000</SelectItem>
                          <SelectItem value="100000">$100,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="buriedServiceLines">Buried Service Lines</Label>
                    <Checkbox
                      id="buriedServiceLines"
                      checked={formData.buriedServiceLines}
                      onCheckedChange={(checked) => handleCheckboxChange("buriedServiceLines", checked === true)}
                    />
                  </div>
                  {formData.buriedServiceLines && (
                    <div className="space-y-2">
                      <Label htmlFor="buriedServiceLinesAmount">Buried Service Lines Amount</Label>
                      <Select
                        value={formData.buriedServiceLinesAmount.toString()}
                        onValueChange={(value) =>
                          handleSliderChange("buriedServiceLinesAmount", [Number.parseInt(value)])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10000">$10,000</SelectItem>
                          <SelectItem value="20000">$20,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="underConstruction">Under Construction</Label>
                    <Checkbox
                      id="underConstruction"
                      checked={formData.underConstruction}
                      onCheckedChange={(checked) => handleCheckboxChange("underConstruction", checked === true)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="personalCyber">Personal Cyber</Label>
                    <Checkbox
                      id="personalCyber"
                      checked={formData.personalCyber}
                      onCheckedChange={(checked) => handleCheckboxChange("personalCyber", checked === true)}
                    />
                  </div>
                  {formData.personalCyber && (
                    <div className="space-y-2">
                      <Label htmlFor="personalCyberAmount">Personal Cyber Amount</Label>
                      <Select
                        value={formData.personalCyberAmount.toString()}
                        onValueChange={(value) => handleSliderChange("personalCyberAmount", [Number.parseInt(value)])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25000">$25,000</SelectItem>
                          <SelectItem value="50000">$50,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="homeSharingParticipation">Home Sharing Participation</Label>
                    <Checkbox
                      id="homeSharingParticipation"
                      checked={formData.homeSharingParticipation}
                      onCheckedChange={(checked) => handleCheckboxChange("homeSharingParticipation", checked === true)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="earthquakeCoverage">Earthquake Coverage</Label>
                    <Checkbox
                      id="earthquakeCoverage"
                      checked={formData.earthquakeCoverage}
                      onCheckedChange={(checked) => handleCheckboxChange("earthquakeCoverage", checked === true)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplementaryBoatHull">Supplementary Boat Hull</Label>
                  <Input
                    id="supplementaryBoatHull"
                    name="supplementaryBoatHull"
                    type="text"
                    value={formData.supplementaryBoatHull}
                    onChange={handleInputChange}
                    placeholder="Enter boat hull information"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="identityTheft">Identity Theft</Label>
                    <Checkbox
                      id="identityTheft"
                      checked={formData.identityTheft}
                      onCheckedChange={(checked) => handleCheckboxChange("identityTheft", checked === true)}
                    />
                  </div>
                  {formData.identityTheft && (
                    <div className="space-y-2">
                      <Label htmlFor="identityTheftAmount">Identity Theft Amount</Label>
                      <Select
                        value={formData.identityTheftAmount.toString()}
                        onValueChange={(value) => handleSliderChange("identityTheftAmount", [Number.parseInt(value)])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15000">$15,000</SelectItem>
                          <SelectItem value="25000">$25,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enhancedReplacement">Enhanced Replacement</Label>
                    <Checkbox
                      id="enhancedReplacement"
                      checked={formData.enhancedReplacement}
                      onCheckedChange={(checked) => handleCheckboxChange("enhancedReplacement", checked === true)}
                    />
                  </div>
                  {formData.enhancedReplacement && (
                    <div className="space-y-2">
                      <Label htmlFor="enhancedReplacementPercentage">Enhanced Replacement Percentage</Label>
                      <Select
                        value={formData.enhancedReplacementPercentage.toString()}
                        onValueChange={(value) =>
                          handleSliderChange("enhancedReplacementPercentage", [Number.parseInt(value)])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select percentage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25%</SelectItem>
                          <SelectItem value="50">50%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ordinanceOrLaw">Ordinance or Law</Label>
                    <Checkbox
                      id="ordinanceOrLaw"
                      checked={formData.ordinanceOrLaw}
                      onCheckedChange={(checked) => handleCheckboxChange("ordinanceOrLaw", checked === true)}
                    />
                  </div>
                  {formData.ordinanceOrLaw && (
                    <div className="space-y-2">
                      <Label htmlFor="ordinanceOrLawAmount">Ordinance or Law Amount</Label>
                      <Select
                        value={formData.ordinanceOrLawAmount.toString()}
                        onValueChange={(value) => handleSliderChange("ordinanceOrLawAmount", [Number.parseInt(value)])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10000">$10,000</SelectItem>
                          <SelectItem value="25000">$25,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduled Items Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Scheduled Items</h3>
                <p className="text-sm text-muted-foreground">
                  Add items such as jewelry, fine arts, or collectibles that require specific coverage.
                </p>

                {scheduledItems.map((item) => (
                  <div key={item.id} className="border rounded-md p-4 bg-muted">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`category-${item.id}`}>Category</Label>
                        <Input
                          id={`category-${item.id}`}
                          type="text"
                          value={item.category}
                          onChange={(e) => updateScheduledItem(item.id, "category", e.target.value)}
                          placeholder="e.g., Jewelry"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${item.id}`}>Description</Label>
                        <Input
                          id={`description-${item.id}`}
                          type="text"
                          value={item.description}
                          onChange={(e) => updateScheduledItem(item.id, "description", e.target.value)}
                          placeholder="Detailed description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`value-${item.id}`}>Value</Label>
                        <Input
                          id={`value-${item.id}`}
                          type="number"
                          value={item.value}
                          onChange={(e) => updateScheduledItem(item.id, "value", Number.parseFloat(e.target.value))}
                          placeholder="e.g., 5000"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-4"
                      onClick={() => removeScheduledItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Item
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="secondary" onClick={addScheduledItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scheduled Item
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevTab}>
                Back
              </Button>
              <Button onClick={nextTab} disabled={!formData.effectiveDate}>
                Continue
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Parties Tab */}
        <TabsContent value="parties" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>4. Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Named Insureds Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Named Insureds</h3>
                <p className="text-sm text-muted-foreground">List all individuals who are insured under this policy.</p>

                {formData.namedInsureds.map((insured) => (
                  <div key={insured.id} className="border rounded-md p-4 bg-muted">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${insured.id}`}>Name</Label>
                        <Input
                          id={`name-${insured.id}`}
                          type="text"
                          value={insured.name}
                          onChange={(e) => updateNamedInsured(insured.id, "name", e.target.value)}
                          placeholder="e.g., John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`dateOfBirth-${insured.id}`}>Date of Birth</Label>
                        <Input
                          id={`dateOfBirth-${insured.id}`}
                          type="date"
                          value={insured.dateOfBirth}
                          onChange={(e) => updateNamedInsured(insured.id, "dateOfBirth", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`address-${insured.id}`}>Address</Label>
                        <Input
                          id={`address-${insured.id}`}
                          type="text"
                          value={insured.address}
                          onChange={(e) => updateNamedInsured(insured.id, "address", e.target.value)}
                          placeholder="e.g., 123 Main St"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-4"
                      onClick={() => removeNamedInsured(insured.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Insured
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="secondary" onClick={addNamedInsured}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Named Insured
                </Button>
              </div>

              {/* Other Parties Sections */}
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="legalEntityNamedInsured">Legal Entity Named Insured</Label>
                  <Input
                    id="legalEntityNamedInsured"
                    name="legalEntityNamedInsured"
                    value={formData.legalEntityNamedInsured}
                    onChange={handleInputChange}
                    placeholder="Enter legal entity name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nonResidentTrustees">Non-Resident Trustees</Label>
                  <Input
                    id="nonResidentTrustees"
                    name="nonResidentTrustees"
                    value={formData.nonResidentTrustees}
                    onChange={handleInputChange}
                    placeholder="Enter trustee names"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherHouseholdMembers">Other Household Members</Label>
                  <Input
                    id="otherHouseholdMembers"
                    name="otherHouseholdMembers"
                    value={formData.otherHouseholdMembers}
                    onChange={handleInputChange}
                    placeholder="List other household members"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInsureds">Additional Insureds</Label>
                  <Input
                    id="additionalInsureds"
                    name="additionalInsureds"
                    value={formData.additionalInsureds}
                    onChange={handleInputChange}
                    placeholder="List additional insureds"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mortgagees">Mortgagees</Label>
                  <Input
                    id="mortgagees"
                    name="mortgagees"
                    value={formData.mortgagees}
                    onChange={handleInputChange}
                    placeholder="Enter mortgagee information"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInterests">Additional Interests</Label>
                  <Input
                    id="additionalInterests"
                    name="additionalInterests"
                    value={formData.additionalInterests}
                    onChange={handleInputChange}
                    placeholder="List additional interests"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevTab}>
                Back
              </Button>
              <Button onClick={nextTab}>Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payment & Bind Tab */}
        <TabsContent value="payment-bind" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>5. Payment & Bind</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowTextMessages">Allow Text Messages</Label>
                  <Checkbox
                    id="allowTextMessages"
                    checked={formData.allowTextMessages}
                    onCheckedChange={(checked) => handleCheckboxChange("allowTextMessages", checked === true)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="acceptElectronicDocuments">Accept Electronic Documents</Label>
                  <Checkbox
                    id="acceptElectronicDocuments"
                    checked={formData.acceptElectronicDocuments}
                    onCheckedChange={(checked) => handleCheckboxChange("acceptElectronicDocuments", checked === true)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentPlan">Payment Plan</Label>
                  <Select
                    value={formData.paymentPlan}
                    onValueChange={(value) => handleSelectChange("paymentPlan", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="application">Application</Label>
                <Input
                  id="application"
                  name="application"
                  value={formData.application}
                  onChange={handleInputChange}
                  placeholder="Enter application details"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentOfRecord">Agent of Record</Label>
                <Input
                  id="agentOfRecord"
                  name="agentOfRecord"
                  value={formData.agentOfRecord}
                  onChange={handleInputChange}
                  placeholder="Enter agent of record"
                  disabled
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevTab}>
                Back
              </Button>
              <Button onClick={nextTab}>Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>6. Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="documents">Upload Documents</Label>
                <Input
                  id="documents"
                  name="documents"
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setFormData((prev) => ({
                        ...prev,
                        documents: [...prev.documents, ...Array.from(e.target.files as FileList)],
                      }))
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Upload any relevant documents, such as prior insurance policies or property appraisals.
                </p>
              </div>

              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-semibold">Uploaded Documents</h4>
                  <ul>
                    {formData.documents.map((file, index) => (
                      <li key={index} className="flex items-center justify-between border rounded-md p-2">
                        <span>{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              documents: prev.documents.filter((_, i) => i !== index),
                            }))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevTab}>
                Back
              </Button>
              <Button type="submit" disabled={loading} onClick={handleSubmit}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
