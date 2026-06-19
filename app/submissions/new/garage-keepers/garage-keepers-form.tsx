"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { US_STATES } from "@/lib/states"

import { submitApplication } from "@/app/actions/submit-application"

export default function GarageKeepersForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("insured")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Insured Information
    insuredName: "",
    dba: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    businessWebsite: "",
    yearsInBusiness: "",
    feinTaxId: "",
    mailingAddress: "",
    city: "",
    state: "",
    zipCode: "",

    // Business Information
    businessType: "",
    annualRevenue: "",
    numberOfEmployees: "",
    numberOfMechanics: "",
    hoursOfOperation: "",
    averageVehiclesOnPremises: "",
    businessDescription: "",
    annualGrossReceipts: "",
    annualPayroll: "",

    // Property Information
    propertyAddress: "",
    squareFootage: "",
    yearBuilt: "",
    constructionType: "",
    numberOfServiceBays: "",
    sprinklered: "",
    alarmSystem: "",
    securityFeatures: "",

    // Operations Information
    servicesGeneralRepair: false,
    servicesBodyWork: false,
    servicesPainting: false,
    servicesOilChange: false,
    servicesTireService: false,
    servicesTransmission: false,
    servicesEngineRepair: false,
    servicesElectrical: false,
    servicesInspection: false,
    servicesOther: false,
    servicesOtherSpecify: "",

    vehiclesPrivatePassenger: false,
    vehiclesLightTrucks: false,
    vehiclesMediumTrucks: false,
    vehiclesHeavyTrucks: false,
    vehiclesExoticHighValue: false,
    vehiclesOther: false,
    vehiclesOtherSpecify: "",

    // Coverage Information
    effectiveDate: "",
    expirationDate: "",
    currentInsuranceCarrier: "",
    currentPremium: "",
    garageLiabilityLimit: "",
    garageLiabilityDeductible: "",
    garageKeepersLimit: "",
    garageKeepersDeductible: "",
    buildingValue: "",
    contentsValue: "",
    businessIncome: "",
    toolsEquipmentValue: "",

    coverageType: "Direct Primary",
    comprehensiveCoverage: false,
    collisionCoverage: false,
    fireTheftCoverage: false,

    // Vehicle Information
    maximumVehicleValue: "",
    averageVehicleValue: "",
    maximumVehiclesStored: "",
    lotProtection: "",

    // Claims History
    claimsHistory: "",

    // Additional Comments
    additionalComments: "",
  })

  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target

    // For date inputs, convert to ISO string format if it's a valid date
    if (type === "date" && value) {
      setFormData((prev) => ({ ...prev, [name]: new Date(value).toISOString() }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleCheckboxChange = (name: string, checked: any) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleDateChange = (name: string, date: any) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleNextTab = () => {
    const tabs = ["insured", "business", "property", "operations", "coverage", "documents", "review"]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const handlePrevTab = () => {
    const tabs = ["insured", "business", "property", "operations", "coverage", "documents", "review"]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate submission number
      const generateSubmissionNumber = () => {
        return `SUB-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`
      }

      const submissionNumber = generateSubmissionNumber()

      // Create submission data matching database schema
      const submissionData = {
        submission_number: submissionNumber,
        insurance_type: "garage-keepers",
        status: "pending",
        created_at: new Date().toISOString(),
        form_data: {
          ...formData,
          submissionDate: new Date().toISOString(),
        },
      }

      const result = await submitApplication(submissionData)

      if (result.success) {
        router.push(`/submissions/success?submissionNumber=${result.submissionNumber}&submissionId=${result.submissionId}`)
      } else {
        console.error("Submission failed:", result.error)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-7 mb-8">
          <TabsTrigger value="insured">Insured Info</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="property">Property Info</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        {/* Insured Information Tab */}
        <TabsContent value="insured">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Insured Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuredName">
                      Insured Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="insuredName"
                      name="insuredName"
                      value={formData.insuredName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dba">DBA (if applicable)</Label>
                    <Input id="dba" name="dba" value={formData.dba} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">
                      Contact Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">
                      Contact Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">
                      Contact Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessWebsite">Business Website</Label>
                    <Input
                      id="businessWebsite"
                      name="businessWebsite"
                      value={formData.businessWebsite}
                      onChange={handleInputChange}
                      placeholder="https://"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsInBusiness">
                      Years in Business <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="yearsInBusiness"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feinTaxId">FEIN/Tax ID</Label>
                    <Input id="feinTaxId" name="feinTaxId" value={formData.feinTaxId} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mailingAddress">
                    Mailing Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mailingAddress"
                    name="mailingAddress"
                    value={formData.mailingAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.state} onValueChange={(value) => handleSelectChange("state", value)}>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">
                      ZIP Code <span className="text-red-500">*</span>
                    </Label>
                    <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Information Tab */}
        <TabsContent value="business">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Business Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessType">
                      Type of Garage Business <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => handleSelectChange("businessType", value)}
                    >
                      <SelectTrigger id="businessType">
                        <SelectValue placeholder="Select Business Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto-repair">Auto Repair Shop</SelectItem>
                        <SelectItem value="body-shop">Body Shop</SelectItem>
                        <SelectItem value="service-station">Service Station</SelectItem>
                        <SelectItem value="quick-lube">Quick Lube</SelectItem>
                        <SelectItem value="tire-shop">Tire Shop</SelectItem>
                        <SelectItem value="transmission-shop">Transmission Shop</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualRevenue">
                      Annual Revenue ($) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="annualRevenue"
                      name="annualRevenue"
                      value={formData.annualRevenue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfEmployees">
                      Number of Employees <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="numberOfEmployees"
                      name="numberOfEmployees"
                      value={formData.numberOfEmployees}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfMechanics">Number of Mechanics</Label>
                    <Input
                      id="numberOfMechanics"
                      name="numberOfMechanics"
                      value={formData.numberOfMechanics}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hoursOfOperation">Hours of Operation</Label>
                    <Input
                      id="hoursOfOperation"
                      name="hoursOfOperation"
                      value={formData.hoursOfOperation}
                      onChange={handleInputChange}
                      placeholder="e.g., Mon-Fri 8am-6pm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="averageVehiclesOnPremises">
                      Average Number of Customer Vehicles on Premises <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="averageVehiclesOnPremises"
                      name="averageVehiclesOnPremises"
                      value={formData.averageVehiclesOnPremises}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualGrossReceipts">
                      Annual Gross Receipts <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="annualGrossReceipts"
                      name="annualGrossReceipts"
                      value={formData.annualGrossReceipts}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualPayroll">
                      Annual Payroll <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="annualPayroll"
                      name="annualPayroll"
                      value={formData.annualPayroll}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">
                    Business Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="businessDescription"
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    placeholder="Describe the nature of your garage operations"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePrevTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Information Tab */}
        <TabsContent value="property">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Property Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">
                    Property Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="propertyAddress"
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="squareFootage">
                      Square Footage <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="squareFootage"
                      name="squareFootage"
                      value={formData.squareFootage}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearBuilt">Year Built</Label>
                    <Input id="yearBuilt" name="yearBuilt" value={formData.yearBuilt} onChange={handleInputChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="constructionType">Construction Type</Label>
                    <Select
                      value={formData.constructionType}
                      onValueChange={(value) => handleSelectChange("constructionType", value)}
                    >
                      <SelectTrigger id="constructionType">
                        <SelectValue placeholder="Select Construction Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frame">Frame</SelectItem>
                        <SelectItem value="joisted-masonry">Joisted Masonry</SelectItem>
                        <SelectItem value="non-combustible">Non-Combustible</SelectItem>
                        <SelectItem value="masonry-non-combustible">Masonry Non-Combustible</SelectItem>
                        <SelectItem value="modified-fire-resistive">Modified Fire Resistive</SelectItem>
                        <SelectItem value="fire-resistive">Fire Resistive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfServiceBays">
                      Number of Service Bays <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="numberOfServiceBays"
                      name="numberOfServiceBays"
                      value={formData.numberOfServiceBays}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sprinklered">Sprinklered</Label>
                    <Select
                      value={formData.sprinklered}
                      onValueChange={(value) => handleSelectChange("sprinklered", value)}
                    >
                      <SelectTrigger id="sprinklered">
                        <SelectValue placeholder="Select Option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alarmSystem">Alarm System</Label>
                    <Select
                      value={formData.alarmSystem}
                      onValueChange={(value) => handleSelectChange("alarmSystem", value)}
                    >
                      <SelectTrigger id="alarmSystem">
                        <SelectValue placeholder="Select Option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="central-station">Central Station</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityFeatures">Security Features</Label>
                  <Textarea
                    id="securityFeatures"
                    name="securityFeatures"
                    value={formData.securityFeatures}
                    onChange={handleInputChange}
                    placeholder="e.g., cameras, fencing, lighting"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePrevTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Information Tab */}
        <TabsContent value="operations">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Operations Information</h2>

                <div className="space-y-2">
                  <Label className="text-base">Services Provided (check all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesGeneralRepair"
                        checked={formData.servicesGeneralRepair}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesGeneralRepair", checked)}
                      />
                      <Label htmlFor="servicesGeneralRepair" className="font-normal">
                        General Repair
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesBodyWork"
                        checked={formData.servicesBodyWork}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesBodyWork", checked)}
                      />
                      <Label htmlFor="servicesBodyWork" className="font-normal">
                        Body Work
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesPainting"
                        checked={formData.servicesPainting}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesPainting", checked)}
                      />
                      <Label htmlFor="servicesPainting" className="font-normal">
                        Painting
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesOilChange"
                        checked={formData.servicesOilChange}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesOilChange", checked)}
                      />
                      <Label htmlFor="servicesOilChange" className="font-normal">
                        Oil Change
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesTireService"
                        checked={formData.servicesTireService}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesTireService", checked)}
                      />
                      <Label htmlFor="servicesTireService" className="font-normal">
                        Tire Service
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesTransmission"
                        checked={formData.servicesTransmission}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesTransmission", checked)}
                      />
                      <Label htmlFor="servicesTransmission" className="font-normal">
                        Transmission
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesEngineRepair"
                        checked={formData.servicesEngineRepair}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesEngineRepair", checked)}
                      />
                      <Label htmlFor="servicesEngineRepair" className="font-normal">
                        Engine Repair
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesElectrical"
                        checked={formData.servicesElectrical}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesElectrical", checked)}
                      />
                      <Label htmlFor="servicesElectrical" className="font-normal">
                        Electrical
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesInspection"
                        checked={formData.servicesInspection}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesInspection", checked)}
                      />
                      <Label htmlFor="servicesInspection" className="font-normal">
                        Inspection
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="servicesOther"
                        checked={formData.servicesOther}
                        onCheckedChange={(checked) => handleCheckboxChange("servicesOther", checked)}
                      />
                      <Label htmlFor="servicesOther" className="font-normal">
                        Other
                      </Label>
                    </div>
                  </div>

                  {formData.servicesOther && (
                    <div className="mt-2">
                      <Label htmlFor="servicesOtherSpecify">If Other, please specify:</Label>
                      <Input
                        id="servicesOtherSpecify"
                        name="servicesOtherSpecify"
                        value={formData.servicesOtherSpecify}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 mt-6">
                  <Label className="text-base">Types of Vehicles Serviced (check all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vehiclesPrivatePassenger"
                        checked={formData.vehiclesPrivatePassenger}
                        onCheckedChange={(checked) => handleCheckboxChange("vehiclesPrivatePassenger", checked)}
                      />
                      <Label htmlFor="vehiclesPrivatePassenger" className="font-normal">
                        Private Passenger
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vehiclesLightTrucks"
                        checked={formData.vehiclesLightTrucks}
                        onCheckedChange={(checked) => handleCheckboxChange("vehiclesLightTrucks", checked)}
                      />
                      <Label htmlFor="vehiclesLightTrucks" className="font-normal">
                        Light Trucks
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vehiclesMediumTrucks"
                        checked={formData.vehiclesMediumTrucks}
                        onCheckedChange={(checked) => handleCheckboxChange("vehiclesMediumTrucks", checked)}
                      />
                      <Label htmlFor="vehiclesMediumTrucks" className="font-normal">
                        Medium Trucks
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vehiclesHeavyTrucks"
                        checked={formData.vehiclesHeavyTrucks}
                        onCheckedChange={(checked) => handleCheckboxChange("vehiclesHeavyTrucks", checked)}
                      />
                      <Label htmlFor="vehiclesHeavyTrucks" className="font-normal">
                        Heavy Trucks
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vehiclesExoticHighValue"
                        checked={formData.vehiclesExoticHighValue}
                        onCheckedChange={(checked) => handleCheckboxChange("vehiclesExoticHighValue", checked)}
                      />
                      <Label htmlFor="vehiclesExoticHighValue" className="font-normal">
                        Exotic/High Value
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vehiclesOther"
                        checked={formData.vehiclesOther}
                        onCheckedChange={(checked) => handleCheckboxChange("vehiclesOther", checked)}
                      />
                      <Label htmlFor="vehiclesOther" className="font-normal">
                        Other
                      </Label>
                    </div>
                  </div>

                  {formData.vehiclesOther && (
                    <div className="mt-2">
                      <Label htmlFor="vehiclesOtherSpecify">If Other, please specify:</Label>
                      <Input
                        id="vehiclesOtherSpecify"
                        name="vehiclesOtherSpecify"
                        value={formData.vehiclesOtherSpecify}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePrevTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coverage Information Tab */}
        <TabsContent value="coverage">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Coverage Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate">
                      Requested Effective Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      id="effectiveDate"
                      name="effectiveDate"
                      value={formData.effectiveDate ? formData.effectiveDate.split("T")[0] : ""}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      type="date"
                      id="expirationDate"
                      name="expirationDate"
                      value={formData.expirationDate ? formData.expirationDate.split("T")[0] : ""}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentInsuranceCarrier">Current Insurance Carrier</Label>
                    <Input
                      id="currentInsuranceCarrier"
                      name="currentInsuranceCarrier"
                      value={formData.currentInsuranceCarrier}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPremium">Current Premium</Label>
                    <Input
                      id="currentPremium"
                      name="currentPremium"
                      value={formData.currentPremium}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="garageLiabilityLimit">
                      Garage Liability Limit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.garageLiabilityLimit}
                      onValueChange={(value) => handleSelectChange("garageLiabilityLimit", value)}
                    >
                      <SelectTrigger id="garageLiabilityLimit">
                        <SelectValue placeholder="Select Liability Limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300000">$300,000</SelectItem>
                        <SelectItem value="500000">$500,000</SelectItem>
                        <SelectItem value="1000000">$1,000,000</SelectItem>
                        <SelectItem value="2000000">$2,000,000</SelectItem>
                        <SelectItem value="3000000">$3,000,000</SelectItem>
                        <SelectItem value="4000000">$4,000,000</SelectItem>
                        <SelectItem value="5000000">$5,000,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="garageLiabilityDeductible">
                      Garage Liability Deductible <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.garageLiabilityDeductible}
                      onValueChange={(value) => handleSelectChange("garageLiabilityDeductible", value)}
                    >
                      <SelectTrigger id="garageLiabilityDeductible">
                        <SelectValue placeholder="Select Deductible" />
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="garageKeepersLimit">
                      Garagekeepers Limit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.garageKeepersLimit}
                      onValueChange={(value) => handleSelectChange("garageKeepersLimit", value)}
                    >
                      <SelectTrigger id="garageKeepersLimit">
                        <SelectValue placeholder="Select Garagekeepers Limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25000">$25,000</SelectItem>
                        <SelectItem value="50000">$50,000</SelectItem>
                        <SelectItem value="100000">$100,000</SelectItem>
                        <SelectItem value="150000">$150,000</SelectItem>
                        <SelectItem value="200000">$200,000</SelectItem>
                        <SelectItem value="250000">$250,000</SelectItem>
                        <SelectItem value="300000">$300,000</SelectItem>
                        <SelectItem value="400000">$400,000</SelectItem>
                        <SelectItem value="500000">$500,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="garageKeepersDeductible">
                      Garagekeepers Deductible <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.garageKeepersDeductible}
                      onValueChange={(value) => handleSelectChange("garageKeepersDeductible", value)}
                    >
                      <SelectTrigger id="garageKeepersDeductible">
                        <SelectValue placeholder="Select Deductible" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500">$500</SelectItem>
                        <SelectItem value="1000">$1,000</SelectItem>
                        <SelectItem value="2500">$2,500</SelectItem>
                        <SelectItem value="5000">$5,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverageType">Coverage Type</Label>
                  <Select
                    value={formData.coverageType}
                    onValueChange={(value) => handleSelectChange("coverageType", value)}
                  >
                    <SelectTrigger id="coverageType">
                      <SelectValue placeholder="Select Coverage Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct Primary">Direct Primary</SelectItem>
                      <SelectItem value="Legal Liability">Legal Liability</SelectItem>
                      <SelectItem value="Direct Excess">Direct Excess</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Coverage Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="comprehensiveCoverage"
                        checked={formData.comprehensiveCoverage}
                        onCheckedChange={(checked) => handleCheckboxChange("comprehensiveCoverage", checked)}
                      />
                      <Label htmlFor="comprehensiveCoverage" className="font-normal">
                        Comprehensive Coverage
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="collisionCoverage"
                        checked={formData.collisionCoverage}
                        onCheckedChange={(checked) => handleCheckboxChange("collisionCoverage", checked)}
                      />
                      <Label htmlFor="collisionCoverage" className="font-normal">
                        Collision Coverage
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fireTheftCoverage"
                        checked={formData.fireTheftCoverage}
                        onCheckedChange={(checked) => handleCheckboxChange("fireTheftCoverage", checked)}
                      />
                      <Label htmlFor="fireTheftCoverage" className="font-normal">
                        Fire & Theft Coverage
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buildingValue">Building Value ($)</Label>
                    <Input
                      id="buildingValue"
                      name="buildingValue"
                      value={formData.buildingValue}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentsValue">Contents Value ($)</Label>
                    <Input
                      id="contentsValue"
                      name="contentsValue"
                      value={formData.contentsValue}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessIncome">Business Income ($)</Label>
                    <Input
                      id="businessIncome"
                      name="businessIncome"
                      value={formData.businessIncome}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toolsEquipmentValue">Tools & Equipment Value ($)</Label>
                    <Input
                      id="toolsEquipmentValue"
                      name="toolsEquipmentValue"
                      value={formData.toolsEquipmentValue}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6">Vehicle Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maximumVehicleValue">
                      Maximum Value of Any One Vehicle <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="maximumVehicleValue"
                      name="maximumVehicleValue"
                      value={formData.maximumVehicleValue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="averageVehicleValue">
                      Average Value Per Vehicle <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="averageVehicleValue"
                      name="averageVehicleValue"
                      value={formData.averageVehicleValue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maximumVehiclesStored">
                      Maximum Number of Vehicles Stored <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="maximumVehiclesStored"
                      name="maximumVehiclesStored"
                      value={formData.maximumVehiclesStored}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lotProtection">Lot Protection</Label>
                  <Select
                    value={formData.lotProtection}
                    onValueChange={(value) => handleSelectChange("lotProtection", value)}
                  >
                    <SelectTrigger id="lotProtection">
                      <SelectValue placeholder="Select Lot Protection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fenced">Fenced</SelectItem>
                      <SelectItem value="lighted">Lighted</SelectItem>
                      <SelectItem value="fenced-lighted">Fenced & Lighted</SelectItem>
                      <SelectItem value="security-guard">Security Guard</SelectItem>
                      <SelectItem value="security-cameras">Security Cameras</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="claimsHistory">Claims History (Last 5 Years)</Label>
                  <Textarea
                    id="claimsHistory"
                    name="claimsHistory"
                    value={formData.claimsHistory}
                    onChange={handleInputChange}
                    placeholder="Provide details of any claims in the last 5 years"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePrevTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Document Upload</h2>

                <div className="space-y-2">
                  <Label htmlFor="lossRunsUpload">Upload Loss Runs</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <p className="text-sm text-gray-500">Drag and drop your loss runs here or click to browse</p>
                    <input type="file" id="lossRunsUpload" className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => document.getElementById("lossRunsUpload")?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acordFormsUpload">Upload ACORD Forms</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <p className="text-sm text-gray-500">Drag and drop your ACORD forms here or click to browse</p>
                    <input type="file" id="acordFormsUpload" className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => document.getElementById("acordFormsUpload")?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyPhotosUpload">Upload Property Photos</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <p className="text-sm text-gray-500">Drag and drop your property photos here or click to browse</p>
                    <input type="file" id="propertyPhotosUpload" className="hidden" multiple />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => document.getElementById("propertyPhotosUpload")?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalComments">Additional Comments</Label>
                  <Textarea
                    id="additionalComments"
                    name="additionalComments"
                    value={formData.additionalComments}
                    onChange={handleInputChange}
                    placeholder="Please provide any additional information that may be helpful..."
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePrevTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Review Submission</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Insured Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Insured Name</p>
                        <p>{formData.insuredName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">DBA</p>
                        <p>{formData.dba || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Name</p>
                        <p>{formData.contactName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Email</p>
                        <p>{formData.contactEmail || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                        <p>{formData.contactPhone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Years in Business</p>
                        <p>{formData.yearsInBusiness || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Business Type</p>
                        <p>{formData.businessType || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Annual Revenue</p>
                        <p>{formData.annualRevenue ? `$${formData.annualRevenue}` : "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Number of Employees</p>
                        <p>{formData.numberOfEmployees || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Business Description</p>
                        <p>{formData.businessDescription || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Coverage Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Effective Date</p>
                        <p>
                          {formData.effectiveDate
                            ? new Date(formData.effectiveDate).toLocaleDateString()
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Garage Liability Limit</p>
                        <p>{formData.garageLiabilityLimit ? `$${formData.garageLiabilityLimit}` : "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Garagekeepers Limit</p>
                        <p>{formData.garageKeepersLimit ? `$${formData.garageKeepersLimit}` : "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Coverage Type</p>
                        <p>{formData.coverageType || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Please review all information before submitting. By submitting this form, you certify that all
                    information provided is accurate and complete.
                  </p>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePrevTab}>
                      Previous
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
