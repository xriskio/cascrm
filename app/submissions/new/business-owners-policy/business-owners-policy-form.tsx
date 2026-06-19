"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { US_STATES } from "@/lib/states"
import { submitApplication } from "@/app/actions/submit-application"

export default function BusinessOwnersPolicyForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("policy")
  const [formData, setFormData] = useState({
    // Policy Information
    effectiveDate: "",
    expirationDate: "",
    targetPremium: "",
    inspectionFee: "",
    administrationFee: "",

    // Insured Information
    businessName: "",
    dba: "",
    mailingAddress: "",
    mailingAddressLine2: "",
    mailingCity: "",
    mailingState: "",
    mailingZip: "",
    legalEntityType: "",
    isLessorsRiskOnly: "",
    website: "",
    newBusiness: "",
    fein: "",
    gapInCoverage: "",
    financialInterest: "",
    isSubsidiary: "",
    bankruptcy: "",
    prohibitedOperations: "",

    // Claims
    hasClaims: "",

    // Location Information
    locationAddress: "",
    locationAddressLine2: "",
    locationCity: "",
    locationState: "",
    locationZip: "",
    aopDeductible: "",
    isFirstFloor: "",
    squareFeet: "",
    constructionType: "",
    yearBuilt: "",
    isSprinklered: "",
    roofUpdated: "",
    plumbingUpdated: "",
    electricalUpdated: "",
    hvacUpdated: "",
    vacantNeighbors: "",
    hasBurglarAlarm: "",
    hasFireAlarm: "",
    closesAfterMidnight: "",

    // Building Coverage
    buildingValuation: "Replacement Cost",
    buildingLimit: "",
    vacancyPercentage: "",
    roofType: "",
    tenantCount: "",
    wantsSignCoverage: "",
    financialInterestInBuilding: "",
    hasMortgageHolder: "",
    buildingPremium: "0",

    // Business Personal Property
    bppLimit: "",
    bppValuation: "Replacement Cost",
    hasAdditionalInterest: "",
    bppPremium: "0",

    // Additional Coverages
    businessIncomeLimit: "",
    districtLimitCoverage: "50000",
    utilityServicesDirect: "",
    utilityServicesTime: "",
    backupWater: "",
    perishableProduct: "",
    equipmentBreakdown: "",
    employeeDishonesty: "",
    contractorsTools: "",
    terrorism: "",
    additionalCoveragePremium: "0",

    // Liability Coverages
    liabilityCoverage: "1000000/2000000",
    liabilityDeductible: "0",
    isAdditionalInsured: "",
    liabilityPremium: "0",
    additionalInsured: "",
    employeeBenefits: "",
    waiverOfSubrogation: "",

    // Submission Type
    submissionType: "Business Owners Policy",
  })

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleRadioChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const nextTab = () => {
    const tabs = [
      "policy",
      "insured",
      "claims",
      "location",
      "building",
      "property",
      "additional",
      "liability",
      "review",
    ]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const prevTab = () => {
    const tabs = [
      "policy",
      "insured",
      "claims",
      "location",
      "building",
      "property",
      "additional",
      "liability",
      "review",
    ]
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
        insurance_type: "business-owners-policy",
        status: "pending",
        created_at: new Date().toISOString(),
        form_data: formData,
      }

      const result = await submitApplication(submissionData)
      if (result.success) {
        router.push(`/submissions/success?submissionNumber=${result.submissionNumber}&submissionId=${result.submissionId}`)
      } else {
        console.error("Submission failed:", result.error)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 mb-4">
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="insured">Insured</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="building">Building</TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="additional">Add'l Coverage</TabsTrigger>
          <TabsTrigger value="liability">Liability</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        {/* Policy Information Tab */}
        <TabsContent value="policy">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Policy Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="effectiveDate" className="block text-sm font-medium mb-1">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    id="effectiveDate"
                    name="effectiveDate"
                    value={formData.effectiveDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="expirationDate" className="block text-sm font-medium mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    id="expirationDate"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="targetPremium" className="block text-sm font-medium mb-1">
                    Target Premium (Insert dollar amount)
                  </label>
                  <input
                    type="text"
                    id="targetPremium"
                    name="targetPremium"
                    value={formData.targetPremium}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="inspectionFee" className="block text-sm font-medium mb-1">
                    Inspection Fee
                  </label>
                  <input
                    type="text"
                    id="inspectionFee"
                    name="inspectionFee"
                    value={formData.inspectionFee}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="administrationFee" className="block text-sm font-medium mb-1">
                    Administration Fee
                  </label>
                  <input
                    type="text"
                    id="administrationFee"
                    name="administrationFee"
                    value={formData.administrationFee}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insured Information Tab */}
        <TabsContent value="insured">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Insured Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium mb-1">
                    Full Legal Name of the Business *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="dba" className="block text-sm font-medium mb-1">
                    Doing Business As
                  </label>
                  <input
                    type="text"
                    id="dba"
                    name="dba"
                    value={formData.dba}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="mailingAddress" className="block text-sm font-medium mb-1">
                  Mailing Address *
                </label>
                <input
                  type="text"
                  id="mailingAddress"
                  name="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Street address"
                />
                <input
                  type="text"
                  id="mailingAddressLine2"
                  name="mailingAddressLine2"
                  value={formData.mailingAddressLine2}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Line 2"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    id="mailingCity"
                    name="mailingCity"
                    value={formData.mailingCity}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                    placeholder="City *"
                  />
                  <select
                    id="mailingState"
                    name="mailingState"
                    value={formData.mailingState}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select State *</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    id="mailingZip"
                    name="mailingZip"
                    value={formData.mailingZip}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                    placeholder="Postcode *"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="legalEntityType" className="block text-sm font-medium mb-1">
                    Select the Legal Entity type of the business *
                  </label>
                  <select
                    id="legalEntityType"
                    name="legalEntityType"
                    value={formData.legalEntityType}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Legal Entity Type</option>
                    <option value="Individual">Individual</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Corporation">Corporation</option>
                    <option value="LLC">LLC</option>
                    <option value="LLP">LLP</option>
                    <option value="Non-Profit">Non-Profit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="isLessorsRiskOnly" className="block text-sm font-medium mb-1">
                    Is this Lessor's Risk Only? *
                  </label>
                  <select
                    id="isLessorsRiskOnly"
                    name="isLessorsRiskOnly"
                    value={formData.isLessorsRiskOnly}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium mb-1">
                    Please provide the website address of the business
                  </label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="newBusiness" className="block text-sm font-medium mb-1">
                    Did this business begin under the applicants ownership within the last 3 years? *
                  </label>
                  <select
                    id="newBusiness"
                    name="newBusiness"
                    value={formData.newBusiness}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="fein" className="block text-sm font-medium mb-1">
                  FEIN # (please no SSN's)
                </label>
                <input
                  type="text"
                  id="fein"
                  name="fein"
                  value={formData.fein}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="gapInCoverage" className="block text-sm font-medium mb-1">
                  At any time over the past (5) five years, has the applicant experienced a gap of coverage, been
                  cancelled or nonrenewed due to underwriting reasons including failure to comply with safety or
                  inspection recommendations? *
                </label>
                <select
                  id="gapInCoverage"
                  name="gapInCoverage"
                  value={formData.gapInCoverage}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Does the applicant have a financial interest of 50% or more in other businesses requiring additional
                  named insured status under this policy? *
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="financialInterest"
                      value="Yes"
                      checked={formData.financialInterest === "Yes"}
                      onChange={() => handleRadioChange("financialInterest", "Yes")}
                      required
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="financialInterest"
                      value="No"
                      checked={formData.financialInterest === "No"}
                      onChange={() => handleRadioChange("financialInterest", "No")}
                      required
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Is the applicant a subsidiary of another entity? *
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isSubsidiary"
                      value="Yes"
                      checked={formData.isSubsidiary === "Yes"}
                      onChange={() => handleRadioChange("isSubsidiary", "Yes")}
                      required
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isSubsidiary"
                      value="No"
                      checked={formData.isSubsidiary === "No"}
                      onChange={() => handleRadioChange("isSubsidiary", "No")}
                      required
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Has the applicant had a judgement or lien, unpaid taxes, suffered foreclosure, bankruptcy or filed for
                  bankruptcy during the past five (5) years? *
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bankruptcy"
                      value="Yes"
                      checked={formData.bankruptcy === "Yes"}
                      onChange={() => handleRadioChange("bankruptcy", "Yes")}
                      required
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bankruptcy"
                      value="No"
                      checked={formData.bankruptcy === "No"}
                      onChange={() => handleRadioChange("bankruptcy", "No")}
                      required
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  We cannot insure operations performing exposures resembling any of the following. Does the applicant's
                  operation perform any of the following businesses, in whole or in any amount: Daycare, concert/arenas,
                  kids clubs, shelters, general contractor, habitational tenants, assisted living, nursing, mentoring,
                  trade contractors performing work on roads, highways, fence work for prisons, foundation or structural
                  repair OR SELL any of the following products: Adult entertainment products, gun or ammunition, private
                  label or repackaged goods, car/vehicles, heavy equipment, gas, fuel, children's toys, children's
                  clothing? *
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="prohibitedOperations"
                      value="Yes"
                      checked={formData.prohibitedOperations === "Yes"}
                      onChange={() => handleRadioChange("prohibitedOperations", "Yes")}
                      required
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="prohibitedOperations"
                      value="No"
                      checked={formData.prohibitedOperations === "No"}
                      onChange={() => handleRadioChange("prohibitedOperations", "No")}
                      required
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={prevTab} variant="outline">
                  Previous
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Claims</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Have you made any claims on this address, or any other risk you are/were responsible for, in the last
                  3 years? *
                </label>
                <select
                  id="hasClaims"
                  name="hasClaims"
                  value={formData.hasClaims}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {formData.hasClaims === "Yes" && (
                <div className="mb-4">
                  <label htmlFor="claimsDetails" className="block text-sm font-medium mb-1">
                    Please provide details about your claims history
                  </label>
                  <textarea
                    id="claimsDetails"
                    name="claimsDetails"
                    value={(formData as any).claimsDetails || ""}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={prevTab} variant="outline">
                  Previous
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Information Tab */}
        <TabsContent value="location">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Location Information</h2>

              <div className="mb-4">
                <label htmlFor="locationAddress" className="block text-sm font-medium mb-1">
                  Street *
                </label>
                <input
                  type="text"
                  id="locationAddress"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  id="locationAddressLine2"
                  name="locationAddressLine2"
                  value={formData.locationAddressLine2}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Line 2"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    id="locationCity"
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                    placeholder="City *"
                  />
                  <select
                    id="locationState"
                    name="locationState"
                    value={formData.locationState}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select State *</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    id="locationZip"
                    name="locationZip"
                    value={formData.locationZip}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                    placeholder="Risk Zip Code *"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="aopDeductible" className="block text-sm font-medium mb-1">
                    All Other Perils/AOP Deductible *
                  </label>
                  <select
                    id="aopDeductible"
                    name="aopDeductible"
                    value={formData.aopDeductible}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Deductible</option>
                    <option value="500">$500</option>
                    <option value="1000">$1,000</option>
                    <option value="2500">$2,500</option>
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Is the applicant's business located on the first floor? *
                  </label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isFirstFloor"
                        value="Yes"
                        checked={formData.isFirstFloor === "Yes"}
                        onChange={() => handleRadioChange("isFirstFloor", "Yes")}
                        required
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isFirstFloor"
                        value="No"
                        checked={formData.isFirstFloor === "No"}
                        onChange={() => handleRadioChange("isFirstFloor", "No")}
                        required
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="squareFeet" className="block text-sm font-medium mb-1">
                    Square Feet *
                  </label>
                  <input
                    type="text"
                    id="squareFeet"
                    name="squareFeet"
                    value={formData.squareFeet}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="constructionType" className="block text-sm font-medium mb-1">
                    Building Construction Type *
                  </label>
                  <select
                    id="constructionType"
                    name="constructionType"
                    value={formData.constructionType}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Construction Type</option>
                    <option value="Frame">Frame</option>
                    <option value="Joisted Masonry">Joisted Masonry</option>
                    <option value="Non-Combustible">Non-Combustible</option>
                    <option value="Masonry Non-Combustible">Masonry Non-Combustible</option>
                    <option value="Modified Fire Resistive">Modified Fire Resistive</option>
                    <option value="Fire Resistive">Fire Resistive</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="yearBuilt" className="block text-sm font-medium mb-1">
                    Year Built *
                  </label>
                  <input
                    type="text"
                    id="yearBuilt"
                    name="yearBuilt"
                    value={formData.yearBuilt}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="isSprinklered" className="block text-sm font-medium mb-1">
                  Is the premises sprinklered? *
                </label>
                <select
                  id="isSprinklered"
                  name="isSprinklered"
                  value={formData.isSprinklered}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor="roofUpdated" className="block text-sm font-medium mb-1">
                    In what year was the Roof last updated?
                  </label>
                  <input
                    type="text"
                    id="roofUpdated"
                    name="roofUpdated"
                    value={formData.roofUpdated}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="If not updated or unknown, leave blank"
                  />
                </div>
                <div>
                  <label htmlFor="plumbingUpdated" className="block text-sm font-medium mb-1">
                    In what year was the Plumbing last updated?
                  </label>
                  <input
                    type="text"
                    id="plumbingUpdated"
                    name="plumbingUpdated"
                    value={formData.plumbingUpdated}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="If not updated or unknown, leave blank"
                  />
                </div>
                <div>
                  <label htmlFor="electricalUpdated" className="block text-sm font-medium mb-1">
                    In what year was the Electrical/Wiring updated?
                  </label>
                  <input
                    type="text"
                    id="electricalUpdated"
                    name="electricalUpdated"
                    value={formData.electricalUpdated}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="If not updated or unknown, leave blank"
                  />
                </div>
                <div>
                  <label htmlFor="hvacUpdated" className="block text-sm font-medium mb-1">
                    In what year was the Heating/HVAC updated?
                  </label>
                  <input
                    type="text"
                    id="hvacUpdated"
                    name="hvacUpdated"
                    value={formData.hvacUpdated}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="If not updated or unknown, leave blank"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Are the applicant's immediate neighboring properties vacant, or demonstrate evidence of vacancy? *
                  </label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vacantNeighbors"
                        value="Yes"
                        checked={formData.vacantNeighbors === "Yes"}
                        onChange={() => handleRadioChange("vacantNeighbors", "Yes")}
                        required
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vacantNeighbors"
                        value="No"
                        checked={formData.vacantNeighbors === "No"}
                        onChange={() => handleRadioChange("vacantNeighbors", "No")}
                        required
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Does the applicant have a burglar alarm? *</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasBurglarAlarm"
                        value="Yes"
                        checked={formData.hasBurglarAlarm === "Yes"}
                        onChange={() => handleRadioChange("hasBurglarAlarm", "Yes")}
                        required
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasBurglarAlarm"
                        value="No"
                        checked={formData.hasBurglarAlarm === "No"}
                        onChange={() => handleRadioChange("hasBurglarAlarm", "No")}
                        required
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Does the applicant have a fire alarm? *</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasFireAlarm"
                        value="Yes"
                        checked={formData.hasFireAlarm === "Yes"}
                        onChange={() => handleRadioChange("hasFireAlarm", "Yes")}
                        required
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasFireAlarm"
                        value="No"
                        checked={formData.hasFireAlarm === "No"}
                        onChange={() => handleRadioChange("hasFireAlarm", "No")}
                        required
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Does the applicant's business close after midnight?
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="closesAfterMidnight"
                      value="Yes"
                      checked={formData.closesAfterMidnight === "Yes"}
                      onChange={() => handleRadioChange("closesAfterMidnight", "Yes")}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="closesAfterMidnight"
                      value="No"
                      checked={formData.closesAfterMidnight === "No"}
                      onChange={() => handleRadioChange("closesAfterMidnight", "No")}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={prevTab} variant="outline">
                  Previous
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Building Coverage Tab */}
        <TabsContent value="building">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Building Coverage</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Building Valuation</label>
                <select
                  id="buildingValuation"
                  name="buildingValuation"
                  value={formData.buildingValuation}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Replacement Cost">Replacement Cost</option>
                  <option value="Actual Cash Value">Actual Cash Value</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="buildingLimit" className="block text-sm font-medium mb-1">
                  Building Limit *
                </label>
                <input
                  type="text"
                  id="buildingLimit"
                  name="buildingLimit"
                  value={formData.buildingLimit}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="vacancyPercentage" className="block text-sm font-medium mb-1">
                    What is or will be the vacancy percentage now, or within the next 30 days? *
                  </label>
                  <select
                    id="vacancyPercentage"
                    name="vacancyPercentage"
                    value={formData.vacancyPercentage}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="0">0%</option>
                    <option value="1-10">1-10%</option>
                    <option value="11-20">11-20%</option>
                    <option value="21-30">21-30%</option>
                    <option value="31-40">31-40%</option>
                    <option value="41-50">41-50%</option>
                    <option value="51-60">51-60%</option>
                    <option value="61-70">61-70%</option>
                    <option value="71-80">71-80%</option>
                    <option value="81-90">81-90%</option>
                    <option value="91-100">91-100%</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="roofType" className="block text-sm font-medium mb-1">
                    What type of roof does the applicant have? *
                  </label>
                  <select
                    id="roofType"
                    name="roofType"
                    value={formData.roofType}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="Asphalt Shingles">Asphalt Shingles</option>
                    <option value="Metal">Metal</option>
                    <option value="Tile">Tile</option>
                    <option value="Slate">Slate</option>
                    <option value="Wood Shake">Wood Shake</option>
                    <option value="Built-up">Built-up</option>
                    <option value="Modified Bitumen">Modified Bitumen</option>
                    <option value="EPDM (Rubber)">EPDM (Rubber)</option>
                    <option value="TPO">TPO</option>
                    <option value="PVC">PVC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="tenantCount" className="block text-sm font-medium mb-1">
                    How many tenants (separate units) make up the occupancy of the building?
                  </label>
                  <input
                    type="text"
                    id="tenantCount"
                    name="tenantCount"
                    value={formData.tenantCount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Does the applicant wish to add outdoor/detached sign coverage (Limit per sign - $1,000)? *
                  </label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wantsSignCoverage"
                        value="Yes"
                        checked={formData.wantsSignCoverage === "Yes"}
                        onChange={() => handleRadioChange("wantsSignCoverage", "Yes")}
                        required
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wantsSignCoverage"
                        value="No"
                        checked={formData.wantsSignCoverage === "No"}
                        onChange={() => handleRadioChange("wantsSignCoverage", "No")}
                        required
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="financialInterestInBuilding" className="block text-sm font-medium mb-1">
                  Please select the applicant's financial interest in the BUILDING the business operations is being
                  performed: *
                </label>
                <select
                  id="financialInterestInBuilding"
                  name="financialInterestInBuilding"
                  value={formData.financialInterestInBuilding}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Owner">Owner</option>
                  <option value="Tenant">Tenant</option>
                  <option value="Owner/Tenant">Owner/Tenant</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Is there a Mortgage Holder on the Building? *</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasMortgageHolder"
                      value="Yes"
                      checked={formData.hasMortgageHolder === "Yes"}
                      onChange={() => handleRadioChange("hasMortgageHolder", "Yes")}
                      required
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasMortgageHolder"
                      value="No"
                      checked={formData.hasMortgageHolder === "No"}
                      onChange={() => handleRadioChange("hasMortgageHolder", "No")}
                      required
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              {formData.hasMortgageHolder === "Yes" && (
                <div className="mb-4 p-4 border rounded bg-muted">
                  <h3 className="text-md font-medium mb-2">Mortgage Holder Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="mortgageName" className="block text-sm font-medium mb-1">
                        Mortgage Holder Name
                      </label>
                      <input
                        type="text"
                        id="mortgageName"
                        name="mortgageName"
                        value={(formData as any).mortgageName || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="mortgageAddress" className="block text-sm font-medium mb-1">
                        Mortgage Holder Address
                      </label>
                      <input
                        type="text"
                        id="mortgageAddress"
                        name="mortgageAddress"
                        value={(formData as any).mortgageAddress || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="buildingPremium" className="block text-sm font-medium mb-1">
                  Premium *
                </label>
                <input
                  type="text"
                  id="buildingPremium"
                  name="buildingPremium"
                  value={formData.buildingPremium}
                  onChange={handleInputChange}
                  readOnly
                  className="w-full p-2 border rounded bg-muted"
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={prevTab} variant="outline">
                  Previous
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Personal Property Tab */}
        <TabsContent value="property">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Business Personal Property (Contents)</h2>

              <div className="mb-4">
                <label htmlFor="bppLimit" className="block text-sm font-medium mb-1">
                  Requested Business Personal Property Limit: *
                </label>
                <input
                  type="text"
                  id="bppLimit"
                  name="bppLimit"
                  value={formData.bppLimit}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="bppValuation" className="block text-sm font-medium mb-1">
                  Business Personal Property Valuation *
                </label>
                <select
                  id="bppValuation"
                  name="bppValuation"
                  value={formData.bppValuation}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="Replacement Cost">Replacement Cost</option>
                  <option value="Actual Cash Value">Actual Cash Value</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Is there an additional interest or loss payee for the BPP?
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasAdditionalInterest"
                      value="Yes"
                      checked={formData.hasAdditionalInterest === "Yes"}
                      onChange={() => handleRadioChange("hasAdditionalInterest", "Yes")}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasAdditionalInterest"
                      value="No"
                      checked={formData.hasAdditionalInterest === "No"}
                      onChange={() => handleRadioChange("hasAdditionalInterest", "No")}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              {formData.hasAdditionalInterest === "Yes" && (
                <div className="mb-4 p-4 border rounded bg-muted">
                  <h3 className="text-md font-medium mb-2">Additional Interest Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="additionalInterestName" className="block text-sm font-medium mb-1">
                        Additional Interest Name
                      </label>
                      <input
                        type="text"
                        id="additionalInterestName"
                        name="additionalInterestName"
                        value={(formData as any).additionalInterestName || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="additionalInterestAddress" className="block text-sm font-medium mb-1">
                        Additional Interest Address
                      </label>
                      <input
                        type="text"
                        id="additionalInterestAddress"
                        name="additionalInterestAddress"
                        value={(formData as any).additionalInterestAddress || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="bppPremium" className="block text-sm font-medium mb-1">
                  Premium *
                </label>
                <input
                  type="text"
                  id="bppPremium"
                  name="bppPremium"
                  value={formData.bppPremium}
                  onChange={handleInputChange}
                  readOnly
                  className="w-full p-2 border rounded bg-muted"
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={prevTab} variant="outline">
                  Previous
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Coverages Tab */}
        <TabsContent value="additional">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Additional Coverages</h2>

              <div className="mb-4">
                <label htmlFor="businessIncomeLimit" className="block text-sm font-medium mb-1">
                  Business Income with Extra Expense
                </label>
                <select
                  id="businessIncomeLimit"
                  name="businessIncomeLimit"
                  value={formData.businessIncomeLimit}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Limit</option>
                  <option value="50000">$50,000</option>
                  <option value="100000">$100,000</option>
                  <option value="150000">$150,000</option>
                  <option value="200000">$200,000</option>
                  <option value="250000">$250,000</option>
                  <option value="300000">$300,000</option>
                  <option value="350000">$350,000</option>
                  <option value="400000">$400,000</option>
                  <option value="450000">$450,000</option>
                  <option value="500000">$500,000</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="districtLimitCoverage" className="block text-sm font-medium mb-1">
                  District Limit Coverage (Coverage enhancement including items like debris removal, accounts
                  receivable, etc.) *
                </label>
                <select
                  id="districtLimitCoverage"
                  name="districtLimitCoverage"
                  value={formData.districtLimitCoverage}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="50000">$50,000</option>
                  <option value="100000">$100,000</option>
                  <option value="150000">$150,000</option>
                  <option value="200000">$200,000</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="utilityServicesDirect" className="block text-sm font-medium mb-1">
                    Utility Services Direct Damage
                  </label>
                  <select
                    id="utilityServicesDirect"
                    name="utilityServicesDirect"
                    value={formData.utilityServicesDirect}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Limit</option>
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                    <option value="15000">$15,000</option>
                    <option value="20000">$20,000</option>
                    <option value="25000">$25,000</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="utilityServicesTime" className="block text-sm font-medium mb-1">
                    Utility Services Time Element
                  </label>
                  <select
                    id="utilityServicesTime"
                    name="utilityServicesTime"
                    value={formData.utilityServicesTime}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Limit</option>
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                    <option value="15000">$15,000</option>
                    <option value="20000">$20,000</option>
                    <option value="25000">$25,000</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="backupWater" className="block text-sm font-medium mb-1">
                    Back up Water and Sump
                  </label>
                  <select
                    id="backupWater"
                    name="backupWater"
                    value={formData.backupWater}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Limit</option>
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                    <option value="15000">$15,000</option>
                    <option value="20000">$20,000</option>
                    <option value="25000">$25,000</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="perishableProduct" className="block text-sm font-medium mb-1">
                    Perishable Product
                  </label>
                  <select
                    id="perishableProduct"
                    name="perishableProduct"
                    value={formData.perishableProduct}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Limit</option>
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                    <option value="15000">$15,000</option>
                    <option value="20000">$20,000</option>
                    <option value="25000">$25,000</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="equipmentBreakdown" className="block text-sm font-medium mb-1">
                    Equipment Breakdown - Excluding Regulated Pressure Vessels and Boilers
                  </label>
                  <select
                    id="equipmentBreakdown"
                    name="equipmentBreakdown"
                    value={formData.equipmentBreakdown}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Limit</option>
                    <option value="50000">$50,000</option>
                    <option value="100000">$100,000</option>
                    <option value="150000">$150,000</option>
                    <option value="200000">$200,000</option>
                    <option value="250000">$250,000</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="employeeDishonesty" className="block text-sm font-medium mb-1">
                    Employee Dishonesty
                  </label>
                  <select
                    id="employeeDishonesty"
                    name="employeeDishonesty"
                    value={formData.employeeDishonesty}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Limit</option>
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                    <option value="15000">$15,000</option>
                    <option value="20000">$20,000</option>
                    <option value="25000">$25,000</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="contractorsTools" className="block text-sm font-medium mb-1">
                  Contractor's Installation, Tools and Equipment
                </label>
                <select
                  id="contractorsTools"
                  name="contractorsTools"
                  value={formData.contractorsTools}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Limit</option>
                  <option value="5000">$5,000</option>
                  <option value="10000">$10,000</option>
                  <option value="15000">$15,000</option>
                  <option value="20000">$20,000</option>
                  <option value="25000">$25,000</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="terrorism" className="block text-sm font-medium mb-1">
                  Terrorism (TRIA) Coverage
                </label>
                <select
                  id="terrorism"
                  name="terrorism"
                  value={formData.terrorism}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="additionalCoveragePremium" className="block text-sm font-medium mb-1">
                  Premium *
                </label>
                <input
                  type="text"
                  id="additionalCoveragePremium"
                  name="additionalCoveragePremium"
                  value={formData.additionalCoveragePremium}
                  onChange={handleInputChange}
                  readOnly
                  className="w-full p-2 border rounded bg-muted"
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={prevTab} variant="outline">
                  Previous
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Liability Coverages Tab */}
        <TabsContent value="liability">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Liability Coverages</h2>

              <div className="mb-4">
                <label htmlFor="liabilityCoverage" className="block text-sm font-medium mb-1">
                  Liability Coverage $1M/$2M
                </label>
                <select
                  id="liabilityCoverage"
                  name="liabilityCoverage"
                  value={formData.liabilityCoverage}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="1000000/2000000">$1,000,000/$2,000,000</option>
                  <option value="2000000/4000000">$2,000,000/$4,000,000</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="liabilityDeductible" className="block text-sm font-medium mb-1">
                  BI/PD Deductible
                </label>
                <select
                  id="liabilityDeductible"
                  name="liabilityDeductible"
                  value={formData.liabilityDeductible}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="0">$0</option>
                  <option value="500">$500</option>
                  <option value="1000">$1,000</option>
                  <option value="2500">$2,500</option>
                  <option value="5000">$5,000</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Is the applicant named as an additional insured and/or held harmless on any vendor, subcontractor,
                  maintenance provider or entity's insurance policy? *
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isAdditionalInsured"
                      value="Yes"
                      checked={formData.isAdditionalInsured === "Yes"}
                      onChange={() => handleRadioChange("isAdditionalInsured", "Yes")}
                      required
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isAdditionalInsured"
                      value="No"
                      checked={formData.isAdditionalInsured === "No"}
                      onChange={() => handleRadioChange("isAdditionalInsured", "No")}
                      required
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="liabilityPremium" className="block text-sm font-medium mb-1">
                  Premium *
                </label>
                <input
                  type="text"
                  id="liabilityPremium"
                  name="liabilityPremium"
                  value={formData.liabilityPremium}
                  onChange={handleInputChange}
                  readOnly
                  className="w-full p-2 border rounded bg-muted"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Additional Insured (Blanket AI will be added; you have the option to add specific AI forms below)
                </label>
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="additionalInsured"
                    name="additionalInsured"
                    checked={formData.additionalInsured === "Yes"}
                    onChange={(e) => handleRadioChange("additionalInsured", e.target.checked ? "Yes" : "No")}
                    className="mr-2"
                  />
                  <label htmlFor="additionalInsured">Add Additional Insured</label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Employee Benefits Liability</label>
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="employeeBenefits"
                    name="employeeBenefits"
                    checked={formData.employeeBenefits === "Yes"}
                    onChange={(e) => handleRadioChange("employeeBenefits", e.target.checked ? "Yes" : "No")}
                    className="mr-2"
                  />
                  <label htmlFor="employeeBenefits">Add Employee Benefits Liability</label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Waiver of Subrogation</label>
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="waiverOfSubrogation"
                    name="waiverOfSubrogation"
                    checked={formData.waiverOfSubrogation === "Yes"}
                    onChange={(e) => handleRadioChange("waiverOfSubrogation", e.target.checked ? "Yes" : "No")}
                    className="mr-2"
                  />
                  <label htmlFor="waiverOfSubrogation">Add Waiver of Subrogation</label>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={prevTab} variant="outline">
                  Previous
                </Button>
                <Button type="button" onClick={nextTab}>
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
              <h2 className="text-xl font-semibold mb-4">Review Submission</h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Policy Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded">
                  <div>
                    <p className="text-sm font-medium">Effective Date:</p>
                    <p>{formData.effectiveDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expiration Date:</p>
                    <p>{formData.expirationDate}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Insured Information</h3>
                <div className="bg-muted p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Business Name:</p>
                      <p>{formData.businessName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">DBA:</p>
                      <p>{formData.dba || "N/A"}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Mailing Address:</p>
                    <p>
                      {formData.mailingAddress}
                      {formData.mailingAddressLine2 && <span>, {formData.mailingAddressLine2}</span>}
                      <br />
                      {formData.mailingCity}, {formData.mailingState} {formData.mailingZip}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Location Information</h3>
                <div className="bg-muted p-4 rounded">
                  <div className="mt-2">
                    <p className="text-sm font-medium">Location Address:</p>
                    <p>
                      {formData.locationAddress}
                      {formData.locationAddressLine2 && <span>, {formData.locationAddressLine2}</span>}
                      <br />
                      {formData.locationCity}, {formData.locationState} {formData.locationZip}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-sm font-medium">Square Feet:</p>
                      <p>{formData.squareFeet}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Year Built:</p>
                      <p>{formData.yearBuilt}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Construction Type:</p>
                      <p>{formData.constructionType}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Coverage Information</h3>
                <div className="bg-muted p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Building Limit:</p>
                      <p>${formData.buildingLimit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">BPP Limit:</p>
                      <p>${formData.bppLimit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Liability Coverage:</p>
                      <p>${formData.liabilityCoverage.replace("/", "/$")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">AOP Deductible:</p>
                      <p>${formData.aopDeductible}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={prevTab} variant="outline">
                  Previous
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
