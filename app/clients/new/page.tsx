"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, X } from "lucide-react"
import { useRouter } from "next/navigation"

const steps = [
  { id: "customer", title: "Customer", icon: "1" },
  { id: "tags", title: "Tags", icon: "2" },
  { id: "management", title: "Management Info", icon: "3" },
  { id: "carrier", title: "Carrier & Policy Type", icon: "4" },
  { id: "policy", title: "Policy Data", icon: "5" },
]

const businessEntities = ["Corporation", "LLC", "Partnership", "Sole Proprietorship", "Non-Profit", "Government Entity"]

const businessClassifications = [
  "Retail",
  "Manufacturing",
  "Construction",
  "Professional Services",
  "Healthcare",
  "Transportation",
  "Technology",
  "Food Service",
  "Real Estate",
  "Other",
]

export default function CreatePolicyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [policyType, setPolicyType] = useState<"personal" | "commercial">("commercial")
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: "",
    dba: "",
    businessEntity: "",
    federalEin: "",
    businessClassification: "",
    yearBusinessStarted: "",
    yearsManagementExperience: "",
    numberOfEmployees: "",
    annualRevenue: "",
    totalPayroll: "",
    phoneNumber: "",
    email: "",

    // Contact Information
    contactType: "customers",
    customerType: "commercial",
    currentStatus: "active",
    location: "CASURANCE AGENCY INSURANCE",
    businessName: "",
    contactFirstName: "",
    contactLastName: "",
    primaryPhone: "",
    primaryEmail: "",

    // Policy Information
    policyType: "monoline",
    policyNumber: "Pending",
    effectiveDate: "",
    term: "annual",
    estimatedPremium: "0",
    carrier: "",
    insuranceType: "commercial",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Submit client data
      const clientResponse = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.customerName,
          dba: formData.dba,
          business_entity: formData.businessEntity,
          federal_ein: formData.federalEin,
          business_classification: formData.businessClassification,
          year_business_started: Number.parseInt(formData.yearBusinessStarted) || null,
          years_management_experience: Number.parseInt(formData.yearsManagementExperience) || null,
          number_of_employees: Number.parseInt(formData.numberOfEmployees) || null,
          annual_revenue: Number.parseFloat(formData.annualRevenue) || null,
          total_payroll: Number.parseFloat(formData.totalPayroll) || null,
          phone: formData.phoneNumber,
          email: formData.email,
          contact_type: formData.contactType,
          customer_type: formData.customerType,
          current_status: formData.currentStatus,
          location: formData.location,
          business_name: formData.businessName,
          contact_first_name: formData.contactFirstName,
          contact_last_name: formData.contactLastName,
          primary_phone: formData.primaryPhone,
          primary_email: formData.primaryEmail,
        }),
      })

      if (!clientResponse.ok) throw new Error("Failed to create client")

      const client = await clientResponse.json()

      // Submit policy data
      const policyResponse = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: client.id,
          policy_type: formData.policyType,
          policy_number: formData.policyNumber,
          effective_date: formData.effectiveDate || null,
          term: formData.term,
          estimated_premium: Number.parseFloat(formData.estimatedPremium) || 0,
          carrier: formData.carrier,
          insurance_type: formData.insuranceType,
        }),
      })

      if (!policyResponse.ok) throw new Error("Failed to create policy")

      router.push("/clients")
    } catch (error) {
      console.error("Error creating client/policy:", error)
      alert("Error creating client and policy. Please try again.")
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Customer Information
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Customer Information</h2>
              <div className="flex gap-2">
                <Button
                  variant={policyType === "personal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPolicyType("personal")}
                >
                  Personal
                </Button>
                <Button
                  variant={policyType === "commercial" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPolicyType("commercial")}
                >
                  Commercial
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name(s) *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => updateFormData("customerName", e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="dba">DBA</Label>
                <Input
                  id="dba"
                  value={formData.dba}
                  onChange={(e) => updateFormData("dba", e.target.value)}
                  placeholder="Doing business as"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessEntity">Business Entity</Label>
                <Select
                  value={formData.businessEntity}
                  onValueChange={(value) => updateFormData("businessEntity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select One" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessEntities.map((entity) => (
                      <SelectItem key={entity} value={entity}>
                        {entity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="federalEin">Federal EIN</Label>
                <Input
                  id="federalEin"
                  value={formData.federalEin}
                  onChange={(e) => updateFormData("federalEin", e.target.value)}
                  placeholder="XX-XXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessClassification">Business Classification</Label>
                <Select
                  value={formData.businessClassification}
                  onValueChange={(value) => updateFormData("businessClassification", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select One" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessClassifications.map((classification) => (
                      <SelectItem key={classification} value={classification}>
                        {classification}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="yearBusinessStarted">Year Business Started</Label>
                <Input
                  id="yearBusinessStarted"
                  type="number"
                  value={formData.yearBusinessStarted}
                  onChange={(e) => updateFormData("yearBusinessStarted", e.target.value)}
                  placeholder="YYYY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearsManagementExperience">Years Of Management Experience</Label>
                <Input
                  id="yearsManagementExperience"
                  type="number"
                  value={formData.yearsManagementExperience}
                  onChange={(e) => updateFormData("yearsManagementExperience", e.target.value)}
                  placeholder="Years"
                />
              </div>
              <div>
                <Label htmlFor="numberOfEmployees">Number Of Employees</Label>
                <Input
                  id="numberOfEmployees"
                  type="number"
                  value={formData.numberOfEmployees}
                  onChange={(e) => updateFormData("numberOfEmployees", e.target.value)}
                  placeholder="Number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annualRevenue">Annual Revenue $</Label>
                <Input
                  id="annualRevenue"
                  type="number"
                  value={formData.annualRevenue}
                  onChange={(e) => updateFormData("annualRevenue", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="totalPayroll">Total Payroll $</Label>
                <Input
                  id="totalPayroll"
                  type="number"
                  value={formData.totalPayroll}
                  onChange={(e) => updateFormData("totalPayroll", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                  placeholder="(XXX) XXX-XXXX"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>
        )

      case 1: // Tags
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Contact Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactType">Contact Type</Label>
                <Select value={formData.contactType} onValueChange={(value) => updateFormData("contactType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="prospects">Prospects</SelectItem>
                    <SelectItem value="vendors">Vendors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="customerType">Customer Type</Label>
                <Select value={formData.customerType} onValueChange={(value) => updateFormData("customerType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStatus">Current Status</Label>
                <Select
                  value={formData.currentStatus}
                  onValueChange={(value) => updateFormData("currentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => updateFormData("location", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASURANCE AGENCY INSURANCE">CASURANCE AGENCY INSURANCE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => updateFormData("businessName", e.target.value)}
                placeholder="Business name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactFirstName">Contact First Name</Label>
                <Input
                  id="contactFirstName"
                  value={formData.contactFirstName}
                  onChange={(e) => updateFormData("contactFirstName", e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="contactLastName">Contact Last Name</Label>
                <Input
                  id="contactLastName"
                  value={formData.contactLastName}
                  onChange={(e) => updateFormData("contactLastName", e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryPhone">Primary Phone</Label>
                <Input
                  id="primaryPhone"
                  value={formData.primaryPhone}
                  onChange={(e) => updateFormData("primaryPhone", e.target.value)}
                  placeholder="(XXX) XXX-XXXX"
                />
              </div>
              <div>
                <Label htmlFor="primaryEmail">Primary Email</Label>
                <Input
                  id="primaryEmail"
                  type="email"
                  value={formData.primaryEmail}
                  onChange={(e) => updateFormData("primaryEmail", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>
        )

      case 4: // Policy Data
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Policy Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyType">Policy Type</Label>
                <Select value={formData.policyType} onValueChange={(value) => updateFormData("policyType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monoline">Monoline</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="carrier">Carrier</Label>
                <Input
                  id="carrier"
                  value={formData.carrier}
                  onChange={(e) => updateFormData("carrier", e.target.value)}
                  placeholder="Insurance carrier"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => updateFormData("effectiveDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={formData.policyNumber}
                  onChange={(e) => updateFormData("policyNumber", e.target.value)}
                  placeholder="Pending"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="term">Term</Label>
                <Select value={formData.term} onValueChange={(value) => updateFormData("term", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimatedPremium">Estimated Premium</Label>
                <Input
                  id="estimatedPremium"
                  type="number"
                  value={formData.estimatedPremium}
                  onChange={(e) => updateFormData("estimatedPremium", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Create Policy</h1>
              <div className="flex gap-2">
                <Button
                  variant={policyType === "personal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPolicyType("personal")}
                >
                  Personal
                </Button>
                <Button
                  variant={policyType === "commercial" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPolicyType("commercial")}
                >
                  Commercial
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className={`w-8 h-2 rounded ${i <= currentStep ? "bg-blue-500" : "bg-muted"}`} />
                ))}
              </div>
              <span>{currentStep + 1}/5</span>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted">
              <div className="p-4 space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      currentStep === index
                        ? "bg-blue-500/15 text-blue-400 font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {step.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {renderStepContent()}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => router.push("/clients")}>
                    Cancel
                  </Button>
                  {currentStep === steps.length - 1 ? (
                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                      Save
                    </Button>
                  ) : (
                    <Button onClick={nextStep}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
