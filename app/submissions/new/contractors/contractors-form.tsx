"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { US_STATES } from "@/lib/states"
import { submitApplication } from "@/app/actions/submit-application"
import { toast } from "@/components/ui/use-toast"

export default function ContractorsForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("insured-info")
  const [mailingAddressSameAsPhysical, setMailingAddressSameAsPhysical] = useState(true)
  const [ownerAddressSameAsPhysical, setOwnerAddressSameAsPhysical] = useState(true)
  const [hasContractorsLicense, setHasContractorsLicense] = useState(false)
  const [hiresSubcontractors, setHiresSubcontractors] = useState(false)
  const [performsNewResidentialWork, setPerformsNewResidentialWork] = useState(false)
  const [hasClaims, setHasClaims] = useState(false)

  // Generate a unique submission number
  const generateSubmissionNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-8)
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    return `CONT-${timestamp}-${random}`
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.target)

      // Convert FormData to a regular object
      const formDataObj: Record<string, any> = {}
      formData.forEach((value, key) => {
        formDataObj[key] = value
      })

      // Generate submission number
      const submissionNumber = generateSubmissionNumber()

      // Create the submission data object matching database schema
      const submissionData = {
        submission_number: submissionNumber,
        insurance_type: "contractors",
        status: "pending",
        created_at: new Date().toISOString(),
        form_data: formDataObj,
      }

      const result = await submitApplication(submissionData)

      if (result.success) {
        router.push(
          `/submissions/success?submissionNumber=${result.submissionNumber}&submissionId=${result.submissionId}`,
        )
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit the form. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting contractors form:", error)
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "insured-info") setActiveTab("owner-info")
    else if (activeTab === "owner-info") setActiveTab("rating-info")
    else if (activeTab === "rating-info") setActiveTab("general-liability")
    else if (activeTab === "general-liability") setActiveTab("claims-history")
  }

  const prevTab = () => {
    if (activeTab === "claims-history") setActiveTab("general-liability")
    else if (activeTab === "general-liability") setActiveTab("rating-info")
    else if (activeTab === "rating-info") setActiveTab("owner-info")
    else if (activeTab === "owner-info") setActiveTab("insured-info")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insured-info">Insured Information</TabsTrigger>
          <TabsTrigger value="owner-info">Owner Information</TabsTrigger>
          <TabsTrigger value="rating-info">Rating Information</TabsTrigger>
          <TabsTrigger value="general-liability">General Liability</TabsTrigger>
          <TabsTrigger value="claims-history">Claims History</TabsTrigger>
        </TabsList>

        {/* Insured Information Tab */}
        <TabsContent value="insured-info">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label>Does the insured have a contractor's license number?</Label>
                    <RadioGroup
                      defaultValue={hasContractorsLicense ? "yes" : "no"}
                      onValueChange={(value) => setHasContractorsLicense(value === "yes")}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="license-yes" />
                        <Label htmlFor="license-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="license-no" />
                        <Label htmlFor="license-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {hasContractorsLicense && (
                    <div className="mt-2">
                      <Label htmlFor="license-number">Contractors License or App. Fee Number</Label>
                      <Input id="license-number" name="license_number" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legal-name">Exact Name Required on Policy</Label>
                    <Input id="legal-name" name="legal_name" required />
                  </div>
                  <div>
                    <Label htmlFor="dba">DBA</Label>
                    <Input id="dba" name="dba" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-type">Business Type</Label>
                    <Select name="business_type" defaultValue="sole_proprietorship">
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="effective-date">Effective Date</Label>
                    <Input id="effective-date" name="effective_date" type="date" defaultValue="2025-05-20" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="years-experience">Years of Experience</Label>
                    <Select name="years_experience" defaultValue="19+">
                      <SelectTrigger>
                        <SelectValue placeholder="Select years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-3">0-3 years</SelectItem>
                        <SelectItem value="4-9">4-9 years</SelectItem>
                        <SelectItem value="10-18">10-18 years</SelectItem>
                        <SelectItem value="19+">19+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="years-business">Years in Business</Label>
                    <Select name="years_business" defaultValue="15+">
                      <SelectTrigger>
                        <SelectValue placeholder="Select years in business" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="2-3">2-3 years</SelectItem>
                        <SelectItem value="4-14">4-14 years</SelectItem>
                        <SelectItem value="15+">15+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Physical Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="physical-address">Street Address</Label>
                      <Input id="physical-address" name="physical_address" required />
                    </div>
                    <div>
                      <Label htmlFor="physical-city">City</Label>
                      <Input id="physical-city" name="physical_city" required />
                    </div>
                    <div>
                      <Label htmlFor="physical-state">State</Label>
                      <Select name="physical_state">
                        <SelectTrigger>
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
                    <div>
                      <Label htmlFor="physical-zip">Zip Code</Label>
                      <Input id="physical-zip" name="physical_zip" required />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mailing-same"
                    checked={mailingAddressSameAsPhysical}
                    onCheckedChange={setMailingAddressSameAsPhysical as any}
                    name="mailing_same_as_physical"
                  />
                  <Label htmlFor="mailing-same">Mailing address same as physical address</Label>
                </div>

                {!mailingAddressSameAsPhysical && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Mailing Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mailing-address">Street Address</Label>
                        <Input id="mailing-address" name="mailing_address" />
                      </div>
                      <div>
                        <Label htmlFor="mailing-city">City</Label>
                        <Input id="mailing-city" name="mailing_city" />
                      </div>
                      <div>
                        <Label htmlFor="mailing-state">State</Label>
                        <Select name="mailing_state">
                          <SelectTrigger>
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
                      <div>
                        <Label htmlFor="mailing-zip">Zip Code</Label>
                        <Input id="mailing-zip" name="mailing_zip" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telephone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="(___) ___-____" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextTab}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owner/Officer Information Tab */}
        <TabsContent value="owner-info">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Owner / Officer Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="owner-first-name">First Name</Label>
                    <Input id="owner-first-name" name="owner_first_name" required />
                  </div>
                  <div>
                    <Label htmlFor="owner-middle-name">Middle Name</Label>
                    <Input id="owner-middle-name" name="owner_middle_name" />
                  </div>
                  <div>
                    <Label htmlFor="owner-last-name">Last Name</Label>
                    <Input id="owner-last-name" name="owner_last_name" required />
                  </div>
                  <div>
                    <Label htmlFor="owner-suffix">Suffix</Label>
                    <Input id="owner-suffix" name="owner_suffix" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="owner-ssn">Social Security Number</Label>
                  <Input id="owner-ssn" name="owner_ssn" placeholder="XXX-XX-XXXX" />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="owner-address-same"
                    checked={ownerAddressSameAsPhysical}
                    onCheckedChange={setOwnerAddressSameAsPhysical as any}
                    name="owner_address_same_as_physical"
                  />
                  <Label htmlFor="owner-address-same">Owner / Officer address same as physical address</Label>
                </div>

                {!ownerAddressSameAsPhysical && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Owner Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="owner-address">Street Address</Label>
                        <Input id="owner-address" name="owner_address" />
                      </div>
                      <div>
                        <Label htmlFor="owner-city">City</Label>
                        <Input id="owner-city" name="owner_city" />
                      </div>
                      <div>
                        <Label htmlFor="owner-state">State</Label>
                        <Select name="owner_state">
                          <SelectTrigger>
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
                      <div>
                        <Label htmlFor="owner-zip">Zip Code</Label>
                        <Input id="owner-zip" name="owner_zip" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox id="credit-consent" name="credit_consent" required />
                  <Label htmlFor="credit-consent" className="text-sm">
                    By initiating this application for insurance, the company is permitted to request and has requested
                    a copy of the applicant's credit report pursuant to state and federal law.
                  </Label>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevTab}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextTab}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rating Information Tab */}
        <TabsContent value="rating-info">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Rating Information</h3>

                <div>
                  <h4 className="font-medium mb-2">Classifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="classification-1">Classification 1</Label>
                      <Select name="classification_1" defaultValue="drywall">
                        <SelectTrigger>
                          <SelectValue placeholder="Select classification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="drywall">Drywall Contractor</SelectItem>
                          <SelectItem value="electrical">Electrical Contractor</SelectItem>
                          <SelectItem value="plumbing">Plumbing Contractor</SelectItem>
                          <SelectItem value="carpentry">Carpentry Contractor</SelectItem>
                          <SelectItem value="painting">Painting Contractor</SelectItem>
                          <SelectItem value="roofing">Roofing Contractor</SelectItem>
                          <SelectItem value="masonry">Masonry Contractor</SelectItem>
                          <SelectItem value="concrete">Concrete Contractor</SelectItem>
                          <SelectItem value="hvac">HVAC Contractor</SelectItem>
                          <SelectItem value="landscaping">Landscaping Contractor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="classification-1-percent">% of Operations</Label>
                      <div className="flex items-center">
                        <Input
                          id="classification-1-percent"
                          name="classification_1_percent"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue="100"
                          required
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Exposure Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="active-owners">Number of Active Owners in the Field</Label>
                      <Input id="active-owners" name="active_owners" type="number" min="0" required />
                    </div>
                    <div>
                      <Label htmlFor="total-payroll">Total Payroll (excluding owners, clerical and sales staff)</Label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <Input id="total-payroll" name="total_payroll" type="number" min="0" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="gross-receipts">Gross Receipts</Label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <Input id="gross-receipts" name="gross_receipts" type="number" min="0" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subcontracted-costs">Subcontracted Costs</Label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <Input id="subcontracted-costs" name="subcontracted_costs" type="number" min="0" required />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="operations-description">Description of Operations</Label>
                  <Textarea id="operations-description" name="operations_description" rows={3} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label>Does the applicant hire subcontractors?</Label>
                    <RadioGroup
                      defaultValue={hiresSubcontractors ? "yes" : "no"}
                      onValueChange={(value) => setHiresSubcontractors(value === "yes")}
                      className="flex space-x-4"
                      name="hires_subcontractors"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="subcontractors-yes" />
                        <Label htmlFor="subcontractors-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="subcontractors-no" />
                        <Label htmlFor="subcontractors-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {hiresSubcontractors && (
                    <div>
                      <Label htmlFor="residential-subcontract-percent">
                        What % of sub-contracted work is done on single family or duplex dwellings?
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="residential-subcontract-percent"
                          name="residential_subcontract_percent"
                          type="number"
                          min="0"
                          max="100"
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Label>Does the applicant perform new residential work prior to Certificate of Occupancy?</Label>
                  <RadioGroup
                    defaultValue={performsNewResidentialWork ? "yes" : "no"}
                    onValueChange={(value) => setPerformsNewResidentialWork(value === "yes")}
                    className="flex space-x-4"
                    name="performs_new_residential_work"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="new-residential-yes" />
                      <Label htmlFor="new-residential-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="new-residential-no" />
                      <Label htmlFor="new-residential-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevTab}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextTab}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Liability Tab */}
        <TabsContent value="general-liability">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">General Liability</h3>

                <div>
                  <Label htmlFor="deductible">Policy Deductible</Label>
                  <Select name="deductible" defaultValue="5000">
                    <SelectTrigger>
                      <SelectValue placeholder="Select deductible" />
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

                <div>
                  <Label htmlFor="residential-construction-option">Residential Construction Options</Label>
                  <Select name="residential_construction_option" defaultValue="repair_remodel_condo">
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repair_remodel_condo">Repair & Remodel – Condo Work Allowed</SelectItem>
                      <SelectItem value="repair_remodel_no_condo">Repair & Remodel – No Condo Work</SelectItem>
                      <SelectItem value="new_construction">New Construction</SelectItem>
                      <SelectItem value="no_residential">No Residential Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Percent of Operations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="residential-nonstructural">
                        Residential - non-structural remodel, repair, or maintenance
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="residential-nonstructural"
                          name="residential_nonstructural_percent"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue="0"
                          required
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="residential-structural">Residential - structural remodel</Label>
                      <div className="flex items-center">
                        <Input
                          id="residential-structural"
                          name="residential_structural_percent"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue="0"
                          required
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="residential-new">Residential - new construction</Label>
                      <div className="flex items-center">
                        <Input
                          id="residential-new"
                          name="residential_new_percent"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue="0"
                          required
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="apartments">Apartments</Label>
                      <div className="flex items-center">
                        <Input
                          id="apartments"
                          name="apartments_percent"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue="0"
                          required
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="commercial">Commercial</Label>
                      <div className="flex items-center">
                        <Input
                          id="commercial"
                          name="commercial_percent"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue="0"
                          required
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="industrial">Industrial</Label>
                      <div className="flex items-center">
                        <Input
                          id="industrial"
                          name="industrial_percent"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue="0"
                          required
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Coverage Options</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="prior-completed-exclusion" name="prior_completed_exclusion" />
                      <Label htmlFor="prior-completed-exclusion">Prior Completed or Abandoned Work Exclusion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bodily-injury-exclusion" name="bodily_injury_exclusion" />
                      <Label htmlFor="bodily-injury-exclusion">Absolute Bodily Injury to Employees Exclusion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="earth-movement-exclusion" name="earth_movement_exclusion" />
                      <Label htmlFor="earth-movement-exclusion">Earth Movement Exclusion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="aggregate-per-project" name="aggregate_per_project" />
                      <Label htmlFor="aggregate-per-project">
                        General Aggregate Limit Applies Per Project with and Overall General Aggregate Limit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sunset-provision" name="sunset_provision" />
                      <Label htmlFor="sunset-provision">Sunset Provision - 3 Year</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="employee-benefits-liability" name="employee_benefits_liability" />
                      <Label htmlFor="employee-benefits-liability">Employee Benefits Liability Coverage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="blanket-additional-insured" name="blanket_additional_insured" />
                      <Label htmlFor="blanket-additional-insured">Blanket Additional Insured CG 20 37</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="scheduled-additional-insured" name="scheduled_additional_insured" />
                      <Label htmlFor="scheduled-additional-insured">
                        Scheduled Additional Insured CG 20 10 11 85 is available post-bind for commercial work only
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevTab}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextTab}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims History Tab */}
        <TabsContent value="claims-history">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Claims History</h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label>
                      Has the applicant or applicant's entity had any general liability claims or losses within the last
                      three years?
                    </Label>
                    <RadioGroup
                      defaultValue={hasClaims ? "yes" : "no"}
                      onValueChange={(value) => setHasClaims(value === "yes")}
                      className="flex space-x-4"
                      name="has_claims"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="claims-yes" />
                        <Label htmlFor="claims-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="claims-no" />
                        <Label htmlFor="claims-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {hasClaims && (
                    <div>
                      <Label htmlFor="claims-details">Please provide details of all claims or losses:</Label>
                      <Textarea
                        id="claims-details"
                        name="claims_details"
                        rows={5}
                        placeholder="Include date, description, amount paid, and current status for each claim"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevTab}>
                    Previous
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
