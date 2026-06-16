"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Plus, Trash } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { US_STATES } from "@/lib/states"
import { submitApplication } from "@/app/actions/submit-application"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface WorkersCompFormProps {
  insuranceType: string
}

export default function WorkersCompForm({ insuranceType }: WorkersCompFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [effectiveDate, setEffectiveDate] = useState<Date>()
  const [expirationDate, setExpirationDate] = useState<Date>()
  const [anniversaryRatingDate, setAnniversaryRatingDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultNoAnswers, setDefaultNoAnswers] = useState(false)
  const [locations, setLocations] = useState<any[]>([
    { address: "", classCodes: [{ code: "", description: "", remuneration: 0 }] },
  ])
  const [officers, setOfficers] = useState<any[]>([
    { name: "", title: "", ownership: "", includeExclude: "Include", dob: null, ssn: "" },
  ])
  const [priorPolicies, setPriorPolicies] = useState<any[]>([
    {
      carrier: "",
      policyNumber: "",
      effectiveDate: null,
      expirationDate: null,
      premium: 0,
      losses: 0,
      numberOfClaims: 0,
    },
  ])
  const [largeClaimsHistory, setLargeClaimsHistory] = useState<any[]>([
    { date: null, claimType: "", status: "Open", totalIncurred: 0, description: "" },
  ])

  const totalSteps = 6
  const steps = [
    { id: 1, name: "General Information" },
    { id: 2, name: "Business Details" },
    { id: 3, name: "Locations & Classes" },
    { id: 4, name: "Policy Information" },
    { id: 5, name: "ACORD Questions" },
    { id: 6, name: "Review & Submit" },
  ]

  const legalEntityOptions = [
    "Individual",
    "Partnership",
    "Corporation",
    "Subchapter S Corporation",
    "Limited Liability Company",
    "Joint Venture",
    "Trust",
    "Other",
  ]

  const natureOfBusinessOptions = [
    "Apartments",
    "Condominiums",
    "Contractor",
    "Institutional",
    "Manufacturing",
    "Office",
    "Restaurant",
    "Retail",
    "Service",
    "Wholesale",
    "Other",
  ]

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      formData.append("insuranceType", insuranceType)

      // Add structured data
      formData.append("locations", JSON.stringify(locations))
      formData.append("officers", JSON.stringify(officers))
      formData.append("priorPolicies", JSON.stringify(priorPolicies))
      formData.append("largeClaimsHistory", JSON.stringify(largeClaimsHistory))

      // Submit the form using the server action
      const result = await submitApplication(formData)

      if (result?.submissionNumber) {
        router.push(`/submissions/success?submissionNumber=${result.submissionNumber}`)
      } else {
        throw new Error("Submission failed without a submission number")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDefaultNoAnswers = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultNoAnswers(e.target.checked)
  }

  const addLocation = () => {
    setLocations([...locations, { address: "", classCodes: [{ code: "", description: "", remuneration: 0 }] }])
  }

  const removeLocation = (index: number) => {
    const newLocations = [...locations]
    newLocations.splice(index, 1)
    setLocations(newLocations)
  }

  const addClassCode = (locationIndex: number) => {
    const newLocations = [...locations]
    newLocations[locationIndex].classCodes.push({ code: "", description: "", remuneration: 0 })
    setLocations(newLocations)
  }

  const removeClassCode = (locationIndex: number, classIndex: number) => {
    const newLocations = [...locations]
    newLocations[locationIndex].classCodes.splice(classIndex, 1)
    setLocations(newLocations)
  }

  const updateLocation = (index: number, field: string, value: any) => {
    const newLocations = [...locations]
    newLocations[index][field] = value
    setLocations(newLocations)
  }

  const updateClassCode = (locationIndex: number, classIndex: number, field: string, value: any) => {
    const newLocations = [...locations]
    newLocations[locationIndex].classCodes[classIndex][field] = value
    setLocations(newLocations)
  }

  const addOfficer = () => {
    setOfficers([...officers, { name: "", title: "", ownership: "", includeExclude: "Include", dob: null, ssn: "" }])
  }

  const removeOfficer = (index: number) => {
    const newOfficers = [...officers]
    newOfficers.splice(index, 1)
    setOfficers(newOfficers)
  }

  const updateOfficer = (index: number, field: string, value: any) => {
    const newOfficers = [...officers]
    newOfficers[index][field] = value
    setOfficers(newOfficers)
  }

  const addPriorPolicy = () => {
    setPriorPolicies([
      ...priorPolicies,
      {
        carrier: "",
        policyNumber: "",
        effectiveDate: null,
        expirationDate: null,
        premium: 0,
        losses: 0,
        numberOfClaims: 0,
      },
    ])
  }

  const removePriorPolicy = (index: number) => {
    const newPriorPolicies = [...priorPolicies]
    newPriorPolicies.splice(index, 1)
    setPriorPolicies(newPriorPolicies)
  }

  const updatePriorPolicy = (index: number, field: string, value: any) => {
    const newPriorPolicies = [...priorPolicies]
    newPriorPolicies[index][field] = value
    setPriorPolicies(newPriorPolicies)
  }

  const addLargeClaim = () => {
    setLargeClaimsHistory([
      ...largeClaimsHistory,
      { date: null, claimType: "", status: "Open", totalIncurred: 0, description: "" },
    ])
  }

  const removeLargeClaim = (index: number) => {
    const newLargeClaimsHistory = [...largeClaimsHistory]
    newLargeClaimsHistory.splice(index, 1)
    setLargeClaimsHistory(newLargeClaimsHistory)
  }

  const updateLargeClaim = (index: number, field: string, value: any) => {
    const newLargeClaimsHistory = [...largeClaimsHistory]
    newLargeClaimsHistory[index][field] = value
    setLargeClaimsHistory(newLargeClaimsHistory)
  }

  const calculateTotalPremium = () => {
    return priorPolicies.reduce((total, policy) => total + (Number(policy.premium) || 0), 0)
  }

  const calculateTotalLosses = () => {
    return priorPolicies.reduce((total, policy) => total + (Number(policy.losses) || 0), 0)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep > step.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : currentStep === step.id
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-300 text-gray-300"
                }`}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : <span>{step.id}</span>}
              </div>
              <span
                className={`hidden md:block ml-2 text-sm ${currentStep >= step.id ? "text-blue-600" : "text-gray-400"}`}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`hidden md:block w-12 h-0.5 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
        {/* Step 1: General Information */}
        {currentStep === 1 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">General Information</h2>
            <p className="text-gray-600 mb-6">Basic information about your business</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="dba" className="block text-sm font-medium text-gray-700 mb-1">
                  DBA (if applicable)
                </label>
                <input
                  type="text"
                  id="dba"
                  name="dba"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Insured Mailing Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="street1" className="block text-sm font-medium text-gray-700 mb-1">
                  Street 1<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="street1"
                  name="street1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="street2" className="block text-sm font-medium text-gray-700 mb-1">
                  Street 2
                </label>
                <input
                  type="text"
                  id="street2"
                  name="street2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State<span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                County<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="county"
                name="county"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="officePhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Office Phone<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="officePhone"
                  name="officePhone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="mobilePhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  id="mobilePhone"
                  name="mobilePhone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Coverage Dates</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DatePicker
                date={effectiveDate}
                setDate={setEffectiveDate}
                label="Effective Date"
                placeholder="Select effective date"
                name="effectiveDate"
                required
              />

              <DatePicker
                date={expirationDate}
                setDate={setExpirationDate}
                label="Expiration Date"
                placeholder="Select expiration date"
                name="expirationDate"
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {currentStep === 2 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Business Details</h2>
            <p className="text-gray-600 mb-6">Information about your business operations</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                  Years in Business<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="yearsInBusiness"
                  name="yearsInBusiness"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="sicCode" className="block text-sm font-medium text-gray-700 mb-1">
                  SIC Code
                </label>
                <input
                  type="text"
                  id="sicCode"
                  name="sicCode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="naicsCode" className="block text-sm font-medium text-gray-700 mb-1">
                  NAICS Code
                </label>
                <input
                  type="text"
                  id="naicsCode"
                  name="naicsCode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label htmlFor="legalEntity" className="block text-sm font-medium text-gray-700 mb-1">
                  Legal Entity<span className="text-red-500">*</span>
                </label>
                <select
                  id="legalEntity"
                  name="legalEntity"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {legalEntityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="fein" className="block text-sm font-medium text-gray-700 mb-1">
                  FEIN (Federal Employer Identification Number)<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fein"
                  name="fein"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bureauId" className="block text-sm font-medium text-gray-700 mb-1">
                  Bureau ID
                </label>
                <input
                  type="text"
                  id="bureauId"
                  name="bureauId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Nature of Business / Description of Operations<span className="text-red-500">*</span>
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                rows={4}
                required
                placeholder="Please be as detailed as possible"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Nature of Business</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {natureOfBusinessOptions.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`natureOfBusiness_${option}`}
                    name="natureOfBusiness"
                    value={option}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`natureOfBusiness_${option}`} className="ml-2 block text-sm text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Contact Information</h3>

            <div className="border border-gray-200 rounded-md p-4 mb-6">
              <h4 className="text-md font-medium mb-4">Inspection Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="inspectionName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="inspectionName"
                    name="inspectionName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="inspectionPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="inspectionPhone"
                    name="inspectionPhone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="inspectionExt" className="block text-sm font-medium text-gray-700 mb-1">
                    Ext.
                  </label>
                  <input
                    type="text"
                    id="inspectionExt"
                    name="inspectionExt"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="inspectionMobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    id="inspectionMobile"
                    name="inspectionMobile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="inspectionEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="inspectionEmail"
                    name="inspectionEmail"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium">Accounting Contact</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sameAsInspection"
                    name="sameAsInspection"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sameAsInspection" className="ml-2 block text-sm text-gray-700">
                    Same as Inspection
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="accountingName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="accountingName"
                    name="accountingName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="accountingPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="accountingPhone"
                    name="accountingPhone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="accountingExt" className="block text-sm font-medium text-gray-700 mb-1">
                    Ext.
                  </label>
                  <input
                    type="text"
                    id="accountingExt"
                    name="accountingExt"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="accountingMobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    id="accountingMobile"
                    name="accountingMobile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="accountingEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="accountingEmail"
                    name="accountingEmail"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium">Claims Contact</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="claimsSameAsInspection"
                    name="claimsSameAsInspection"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="claimsSameAsInspection" className="ml-2 block text-sm text-gray-700">
                    Same as Inspection
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="claimsName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="claimsName"
                    name="claimsName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="claimsPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="claimsPhone"
                    name="claimsPhone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="claimsExt" className="block text-sm font-medium text-gray-700 mb-1">
                    Ext.
                  </label>
                  <input
                    type="text"
                    id="claimsExt"
                    name="claimsExt"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="claimsMobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    id="claimsMobile"
                    name="claimsMobile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="claimsEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="claimsEmail"
                    name="claimsEmail"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks / Process Instructions
              </label>
              <textarea
                id="remarks"
                name="remarks"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional remarks or special instructions"
              ></textarea>
            </div>
          </div>
        )}

        {/* Step 3: Locations & Class Codes */}
        {currentStep === 3 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Locations & Class Codes</h2>
            <p className="text-gray-600 mb-6">Enter your business locations and applicable class codes</p>

            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useMailingAddress"
                  name="useMailingAddress"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="useMailingAddress" className="ml-2 block text-sm text-gray-700">
                  Set first location to Insured's mailing address
                </label>
              </div>
            </div>

            {locations.map((location, locationIndex) => (
              <div key={locationIndex} className="border border-gray-200 rounded-md p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Location {locationIndex + 1}</h3>
                  {locationIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => removeLocation(locationIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor={`location_${locationIndex}_street1`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Street 1<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`location_${locationIndex}_street1`}
                      name={`location_${locationIndex}_street1`}
                      value={location.street1 || ""}
                      onChange={(e) => updateLocation(locationIndex, "street1", e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`location_${locationIndex}_street2`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Street 2
                    </label>
                    <input
                      type="text"
                      id={`location_${locationIndex}_street2`}
                      name={`location_${locationIndex}_street2`}
                      value={location.street2 || ""}
                      onChange={(e) => updateLocation(locationIndex, "street2", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor={`location_${locationIndex}_city`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`location_${locationIndex}_city`}
                      name={`location_${locationIndex}_city`}
                      value={location.city || ""}
                      onChange={(e) => updateLocation(locationIndex, "city", e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`location_${locationIndex}_state`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State<span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`location_${locationIndex}_state`}
                      name={`location_${locationIndex}_state`}
                      value={location.state || ""}
                      onChange={(e) => updateLocation(locationIndex, "state", e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      {US_STATES.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={`location_${locationIndex}_zipCode`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ZIP Code<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`location_${locationIndex}_zipCode`}
                      name={`location_${locationIndex}_zipCode`}
                      value={location.zipCode || ""}
                      onChange={(e) => updateLocation(locationIndex, "zipCode", e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <h4 className="text-md font-medium mb-4">Class Codes</h4>

                {location.classCodes.map((classCode, classIndex) => (
                  <div key={classIndex} className="border border-gray-100 rounded p-4 mb-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-sm font-medium">Class Code {classIndex + 1}</h5>
                      {classIndex > 0 && (
                        <button
                          type="button"
                          onClick={() => removeClassCode(locationIndex, classIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor={`location_${locationIndex}_class_${classIndex}_code`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Class Code<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`location_${locationIndex}_class_${classIndex}_code`}
                          name={`location_${locationIndex}_class_${classIndex}_code`}
                          value={classCode.code || ""}
                          onChange={(e) => updateClassCode(locationIndex, classIndex, "code", e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`location_${locationIndex}_class_${classIndex}_description`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Description
                        </label>
                        <input
                          type="text"
                          id={`location_${locationIndex}_class_${classIndex}_description`}
                          name={`location_${locationIndex}_class_${classIndex}_description`}
                          value={classCode.description || ""}
                          onChange={(e) => updateClassCode(locationIndex, classIndex, "description", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`location_${locationIndex}_class_${classIndex}_remuneration`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Estimated Annual Remuneration<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id={`location_${locationIndex}_class_${classIndex}_remuneration`}
                          name={`location_${locationIndex}_class_${classIndex}_remuneration`}
                          value={classCode.remuneration || ""}
                          onChange={(e) => updateClassCode(locationIndex, classIndex, "remuneration", e.target.value)}
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => addClassCode(locationIndex)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Class Code
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addLocation}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Location
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Policy Information */}
        {currentStep === 4 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Policy Information</h2>
            <p className="text-gray-600 mb-6">Coverage details and policy information</p>

            <h3 className="text-lg font-semibold mb-4">Rating Bureau Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <DatePicker
                date={anniversaryRatingDate}
                setDate={setAnniversaryRatingDate}
                label="Anniversary Rating Date"
                placeholder="Select date"
                name="anniversaryRatingDate"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ncciId" className="block text-sm font-medium text-gray-700 mb-1">
                  NCCI ID
                </label>
                <input
                  type="text"
                  id="ncciId"
                  name="ncciId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="californiaWcirbId" className="block text-sm font-medium text-gray-700 mb-1">
                  California WCIRB ID
                </label>
                <input
                  type="text"
                  id="californiaWcirbId"
                  name="californiaWcirbId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Coverage Information</h3>

            <div className="mb-6">
              <label htmlFor="part1States" className="block text-sm font-medium text-gray-700 mb-1">
                Part 1 - Workers' Compensation (States)
              </label>
              <select
                id="part1States"
                name="part1States"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                {US_STATES.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple states</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="employersLiabilityLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Part 2 - Employer's Liability
                </label>
                <select
                  id="employersLiabilityLimit"
                  name="employersLiabilityLimit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="100/100/500">$100,000/$100,000/$500,000</option>
                  <option value="500/500/500">$500,000/$500,000/$500,000</option>
                  <option value="1000/1000/1000">$1,000,000/$1,000,000/$1,000,000</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="part3OtherStates"
                  name="part3OtherStates"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="part3OtherStates" className="ml-2 block text-sm text-gray-700">
                  Part 3 - Other States Insurance (All states except those listed in Item 3.A and ND, OH, WA and WY)
                </label>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Plan Information</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="guaranteedCost"
                    name="planType"
                    value="Guaranteed Cost"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="guaranteedCost" className="ml-2 block text-sm text-gray-700">
                    Guaranteed Cost
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="participating"
                    name="planType"
                    value="Participating"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="participating" className="ml-2 block text-sm text-gray-700">
                    Participating
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="nonParticipating"
                    name="planType"
                    value="Non-Participating"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="nonParticipating" className="ml-2 block text-sm text-gray-700">
                    Non-Participating
                  </label>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Billing & Audit Information</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Type</label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="directBill"
                    name="billingType"
                    value="Direct Bill"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="directBill" className="ml-2 block text-sm text-gray-700">
                    Direct Bill
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="agencyBill"
                    name="billingType"
                    value="Agency/Broker Bill"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="agencyBill" className="ml-2 block text-sm text-gray-700">
                    Agency/Broker Bill
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="paymentPlan" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Plan
                </label>
                <select
                  id="paymentPlan"
                  name="paymentPlan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="Annual">Annual</option>
                  <option value="Semi-Annual">Semi-Annual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="percentDown" className="block text-sm font-medium text-gray-700 mb-1">
                  Percent Down
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="percentDown"
                    name="percentDown"
                    min="0"
                    max="100"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>

              <div>
                <label htmlFor="auditType" className="block text-sm font-medium text-gray-700 mb-1">
                  Audit
                </label>
                <select
                  id="auditType"
                  name="auditType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="Annual">Annual</option>
                  <option value="Semi-Annual">Semi-Annual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Deductibles</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="indemnityDeductible" className="block text-sm font-medium text-gray-700 mb-1">
                  Indemnity
                </label>
                <input
                  type="number"
                  id="indemnityDeductible"
                  name="indemnityDeductible"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="medicalDeductible" className="block text-sm font-medium text-gray-700 mb-1">
                  Medical
                </label>
                <input
                  type="number"
                  id="medicalDeductible"
                  name="medicalDeductible"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="otherDeductible" className="block text-sm font-medium text-gray-700 mb-1">
                  Other
                </label>
                <input
                  type="number"
                  id="otherDeductible"
                  name="otherDeductible"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label htmlFor="otherDeductibleType" className="block text-sm font-medium text-gray-700 mb-1">
                  Other deductible type
                </label>
                <input
                  type="text"
                  id="otherDeductibleType"
                  name="otherDeductibleType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Other Coverages</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="uslAndH"
                  name="uslAndH"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="uslAndH" className="ml-2 block text-sm text-gray-700">
                  U.S.L. & H.
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="voluntaryComp"
                  name="voluntaryComp"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="voluntaryComp" className="ml-2 block text-sm text-gray-700">
                  Voluntary Comp
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="foreignCoverage"
                  name="foreignCoverage"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="foreignCoverage" className="ml-2 block text-sm text-gray-700">
                  Foreign Coverage
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="managedCareOption"
                  name="managedCareOption"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="managedCareOption" className="ml-2 block text-sm text-gray-700">
                  Managed Care Option
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="otherCoverage"
                  name="otherCoverage"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="otherCoverage" className="ml-2 block text-sm text-gray-700">
                  Other (must specify)
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="additionalCoverages" className="block text-sm font-medium text-gray-700 mb-1">
                Specify Additional Coverages / Endorsements
              </label>
              <textarea
                id="additionalCoverages"
                name="additionalCoverages"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any additional coverages or endorsements needed"
              ></textarea>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Officers, Partners & Owners</h3>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isTrust"
                  name="isTrust"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isTrust" className="ml-2 block text-sm text-gray-700">
                  Is this a Revocable/Irrevocable Trust or Non-Profit?
                </label>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Partners, Officers, Relatives to be Included or Excluded. (Remuneration to be included must be part of
                payroll section.)
              </p>

              {officers.map((officer, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium">Officer/Partner {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeOfficer(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor={`officer_${index}_name`} className="block text-sm font-medium text-gray-700 mb-1">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`officer_${index}_name`}
                        name={`officer_${index}_name`}
                        value={officer.name || ""}
                        onChange={(e) => updateOfficer(index, "name", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`officer_${index}_title`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Title<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`officer_${index}_title`}
                        name={`officer_${index}_title`}
                        value={officer.title || ""}
                        onChange={(e) => updateOfficer(index, "title", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor={`officer_${index}_ownership`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Ownership %
                      </label>
                      <input
                        type="number"
                        id={`officer_${index}_ownership`}
                        name={`officer_${index}_ownership`}
                        value={officer.ownership || ""}
                        onChange={(e) => updateOfficer(index, "ownership", e.target.value)}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`officer_${index}_includeExclude`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Include/Exclude<span className="text-red-500">*</span>
                      </label>
                      <select
                        id={`officer_${index}_includeExclude`}
                        name={`officer_${index}_includeExclude`}
                        value={officer.includeExclude || "Include"}
                        onChange={(e) => updateOfficer(index, "includeExclude", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Include">Include</option>
                        <option value="Exclude">Exclude</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addOfficer}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Officer/Partner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: ACORD Questions */}
        {currentStep === 5 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">ACORD Questions</h2>
            <p className="text-gray-600 mb-6">Standard questions required for workers compensation coverage</p>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="defaultNoAnswers"
                  name="defaultNoAnswers"
                  checked={defaultNoAnswers}
                  onChange={handleDefaultNoAnswers}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="defaultNoAnswers" className="ml-2 block text-sm text-gray-700">
                  Please check here to default all answers below to 'No'. You may then edit each response to a 'Yes' if
                  applicable.
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  1. Does applicant own, operate or lease aircraft/watercraft?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="aircraft_yes"
                      name="aircraft"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("aircraft_yes")?.checked}
                    />
                    <label htmlFor="aircraft_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="aircraft_no"
                      name="aircraft"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("aircraft_no")?.checked}
                    />
                    <label htmlFor="aircraft_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  2. Do/have past, present or discontinued operations involve(d) storing, treating, discharging,
                  applying, disposing, or transporting of hazardous material?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hazardous_yes"
                      name="hazardous"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("hazardous_yes")?.checked}
                    />
                    <label htmlFor="hazardous_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hazardous_no"
                      name="hazardous"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("hazardous_no")?.checked}
                    />
                    <label htmlFor="hazardous_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  3. Any work performed underground or above 15 feet?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="underground_yes"
                      name="underground"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("underground_yes")?.checked}
                    />
                    <label htmlFor="underground_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="underground_no"
                      name="underground"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("underground_no")?.checked}
                    />
                    <label htmlFor="underground_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  4. Any work performed on barges, vessels, docks, bridges over water?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="barges_yes"
                      name="barges"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("barges_yes")?.checked}
                    />
                    <label htmlFor="barges_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="barges_no"
                      name="barges"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("barges_no")?.checked}
                    />
                    <label htmlFor="barges_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  5. Is applicant engaged in any other type of business?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="otherBusiness_yes"
                      name="otherBusiness"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("otherBusiness_yes")?.checked}
                    />
                    <label htmlFor="otherBusiness_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="otherBusiness_no"
                      name="otherBusiness"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("otherBusiness_no")?.checked}
                    />
                    <label htmlFor="otherBusiness_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  6. Are sub-contractors used? (if yes, give % of work subcontracted)
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="subcontractors_yes"
                      name="subcontractors"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("subcontractors_yes")?.checked}
                    />
                    <label htmlFor="subcontractors_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="subcontractors_no"
                      name="subcontractors"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("subcontractors_no")?.checked}
                    />
                    <label htmlFor="subcontractors_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  7. Any work sublet without certificates of insurance?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="workSublet_yes"
                      name="workSublet"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("workSublet_yes")?.checked}
                    />
                    <label htmlFor="workSublet_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="workSublet_no"
                      name="workSublet"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("workSublet_no")?.checked}
                    />
                    <label htmlFor="workSublet_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">8. Is a written safety program in operation?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="safetyProgram_yes"
                      name="safetyProgram"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("safetyProgram_yes")?.checked}
                    />
                    <label htmlFor="safetyProgram_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="safetyProgram_no"
                      name="safetyProgram"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("safetyProgram_no")?.checked}
                    />
                    <label htmlFor="safetyProgram_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">9. Any group transportation provided?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="groupTransportation_yes"
                      name="groupTransportation"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("groupTransportation_yes")?.checked}
                    />
                    <label htmlFor="groupTransportation_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="groupTransportation_no"
                      name="groupTransportation"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("groupTransportation_no")?.checked}
                    />
                    <label htmlFor="groupTransportation_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">10. Any seasonal employees?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="seasonalEmployees_yes"
                      name="seasonalEmployees"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("seasonalEmployees_yes")?.checked}
                    />
                    <label htmlFor="seasonalEmployees_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="seasonalEmployees_no"
                      name="seasonalEmployees"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("seasonalEmployees_no")?.checked}
                    />
                    <label htmlFor="seasonalEmployees_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">11. Is there any volunteer or donated labor?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="volunteerLabor_yes"
                      name="volunteerLabor"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("volunteerLabor_yes")?.checked}
                    />
                    <label htmlFor="volunteerLabor_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="volunteerLabor_no"
                      name="volunteerLabor"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("volunteerLabor_no")?.checked}
                    />
                    <label htmlFor="volunteerLabor_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">12. Do employees travel out of state?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="travelOutOfState_yes"
                      name="travelOutOfState"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("travelOutOfState_yes")?.checked}
                    />
                    <label htmlFor="travelOutOfState_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="travelOutOfState_no"
                      name="travelOutOfState"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("travelOutOfState_no")?.checked}
                    />
                    <label htmlFor="travelOutOfState_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">13. Are athletic teams sponsored?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="athleticTeams_yes"
                      name="athleticTeams"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("athleticTeams_yes")?.checked}
                    />
                    <label htmlFor="athleticTeams_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="athleticTeams_no"
                      name="athleticTeams"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("athleticTeams_no")?.checked}
                    />
                    <label htmlFor="athleticTeams_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  14. Are physicals required after offers of employment are made?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="physicals_yes"
                      name="physicals"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("physicals_yes")?.checked}
                    />
                    <label htmlFor="physicals_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="physicals_no"
                      name="physicals"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("physicals_no")?.checked}
                    />
                    <label htmlFor="physicals_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">15. Any other insurance with this insurer?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="otherInsurance_yes"
                      name="otherInsurance"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("otherInsurance_yes")?.checked}
                    />
                    <label htmlFor="otherInsurance_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="otherInsurance_no"
                      name="otherInsurance"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("otherInsurance_no")?.checked}
                    />
                    <label htmlFor="otherInsurance_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  16. Any prior coverage declined / cancelled / non-renewed in last 3 years? (not applicable in MO)
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="priorCoverage_yes"
                      name="priorCoverage"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("priorCoverage_yes")?.checked}
                    />
                    <label htmlFor="priorCoverage_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="priorCoverage_no"
                      name="priorCoverage"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("priorCoverage_no")?.checked}
                    />
                    <label htmlFor="priorCoverage_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">17. Are employee health plans provided?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="healthPlans_yes"
                      name="healthPlans"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("healthPlans_yes")?.checked}
                    />
                    <label htmlFor="healthPlans_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="healthPlans_no"
                      name="healthPlans"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("healthPlans_no")?.checked}
                    />
                    <label htmlFor="healthPlans_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  18. Is there a labor interchange with any other business/subsidiary?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="laborInterchange_yes"
                      name="laborInterchange"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("laborInterchange_yes")?.checked}
                    />
                    <label htmlFor="laborInterchange_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="laborInterchange_no"
                      name="laborInterchange"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("laborInterchange_no")?.checked}
                    />
                    <label htmlFor="laborInterchange_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  19. Do you lease employees to or from other employers?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="leaseEmployees_yes"
                      name="leaseEmployees"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("leaseEmployees_yes")?.checked}
                    />
                    <label htmlFor="leaseEmployees_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="leaseEmployees_no"
                      name="leaseEmployees"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("leaseEmployees_no")?.checked}
                    />
                    <label htmlFor="leaseEmployees_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  20. Do any employees predominantly work at home?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="workAtHome_yes"
                      name="workAtHome"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("workAtHome_yes")?.checked}
                    />
                    <label htmlFor="workAtHome_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="workAtHome_no"
                      name="workAtHome"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("workAtHome_no")?.checked}
                    />
                    <label htmlFor="workAtHome_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  21. Any tax liens or bankruptcy within the last 5 years?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="taxLiens_yes"
                      name="taxLiens"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("taxLiens_yes")?.checked}
                    />
                    <label htmlFor="taxLiens_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="taxLiens_no"
                      name="taxLiens"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("taxLiens_no")?.checked}
                    />
                    <label htmlFor="taxLiens_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  22. Any undisputed and unpaid workers compensation premium due from you or any commonly managed or
                  owned enterprises? If yes, explain including entity name(s) and policy number(s).
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="unpaidPremium_yes"
                      name="unpaidPremium"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!defaultNoAnswers && document.getElementById("unpaidPremium_yes")?.checked}
                    />
                    <label htmlFor="unpaidPremium_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="unpaidPremium_no"
                      name="unpaidPremium"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={defaultNoAnswers || document.getElementById("unpaidPremium_no")?.checked}
                    />
                    <label htmlFor="unpaidPremium_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Is the expiring premium less than $25,000?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="expiringPremium_yes"
                      name="expiringPremium"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="expiringPremium_yes" className="ml-2 block text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="expiringPremium_no"
                      name="expiringPremium"
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="expiringPremium_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newVenture"
                    name="newVenture"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="newVenture" className="ml-2 block text-sm text-gray-700">
                    New Venture
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
            <p className="text-gray-600 mb-6">Review your application and submit</p>

            <Tabs defaultValue="prior-carrier" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prior-carrier">Prior Carrier Information</TabsTrigger>
                <TabsTrigger value="loss-history">Loss History</TabsTrigger>
              </TabsList>
              <TabsContent value="prior-carrier" className="p-4 border rounded-md mt-4">
                <h3 className="text-lg font-semibold mb-4">Prior Carrier Information</h3>

                {priorPolicies.map((policy, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium">Prior Policy {index + 1}</h4>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removePriorPolicy(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor={`policy_${index}_carrier`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Carrier
                        </label>
                        <input
                          type="text"
                          id={`policy_${index}_carrier`}
                          name={`policy_${index}_carrier`}
                          value={policy.carrier || ""}
                          onChange={(e) => updatePriorPolicy(index, "carrier", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`policy_${index}_policyNumber`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Policy Number
                        </label>
                        <input
                          type="text"
                          id={`policy_${index}_policyNumber`}
                          name={`policy_${index}_policyNumber`}
                          value={policy.policyNumber || ""}
                          onChange={(e) => updatePriorPolicy(index, "policyNumber", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <DatePicker
                        date={policy.effectiveDate}
                        setDate={(date) => updatePriorPolicy(index, "effectiveDate", date)}
                        label="Effective Date"
                        placeholder="Select date"
                        name={`policy_${index}_effectiveDate`}
                      />
                      <DatePicker
                        date={policy.expirationDate}
                        setDate={(date) => updatePriorPolicy(index, "expirationDate", date)}
                        label="Expiration Date"
                        placeholder="Select date"
                        name={`policy_${index}_expirationDate`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor={`policy_${index}_premium`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Premium
                        </label>
                        <input
                          type="number"
                          id={`policy_${index}_premium`}
                          name={`policy_${index}_premium`}
                          value={policy.premium || ""}
                          onChange={(e) => updatePriorPolicy(index, "premium", e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`policy_${index}_losses`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Losses
                        </label>
                        <input
                          type="number"
                          id={`policy_${index}_losses`}
                          name={`policy_${index}_losses`}
                          value={policy.losses || ""}
                          onChange={(e) => updatePriorPolicy(index, "losses", e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`policy_${index}_numberOfClaims`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Number of Claims
                        </label>
                        <input
                          type="number"
                          id={`policy_${index}_numberOfClaims`}
                          name={`policy_${index}_numberOfClaims`}
                          value={policy.numberOfClaims || ""}
                          onChange={(e) => updatePriorPolicy(index, "numberOfClaims", e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={addPriorPolicy}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Prior Policy
                  </button>

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">Total Premium: ${calculateTotalPremium()}</p>
                    <p className="text-sm font-medium text-gray-700">Total Losses: ${calculateTotalLosses()}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="loss-history" className="p-4 border rounded-md mt-4">
                <h3 className="text-lg font-semibold mb-4">Large Claims History</h3>
                <p className="text-sm text-gray-600 mb-4">
                  List each loss with an incurred value of $100,000 or greater within the last 5 years
                </p>

                {largeClaimsHistory.map((claim, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium">Large Claim {index + 1}</h4>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeLargeClaim(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <DatePicker
                        date={claim.date}
                        setDate={(date) => updateLargeClaim(index, "date", date)}
                        label="Date of Loss"
                        placeholder="Select date"
                        name={`claim_${index}_date`}
                      />
                      <div>
                        <label
                          htmlFor={`claim_${index}_claimType`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Claim Type
                        </label>
                        <input
                          type="text"
                          id={`claim_${index}_claimType`}
                          name={`claim_${index}_claimType`}
                          value={claim.claimType || ""}
                          onChange={(e) => updateLargeClaim(index, "claimType", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor={`claim_${index}_status`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Status
                        </label>
                        <select
                          id={`claim_${index}_status`}
                          name={`claim_${index}_status`}
                          value={claim.status || "Open"}
                          onChange={(e) => updateLargeClaim(index, "status", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                          <option value="Reopened">Reopened</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor={`claim_${index}_totalIncurred`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Total Incurred
                        </label>
                        <input
                          type="number"
                          id={`claim_${index}_totalIncurred`}
                          name={`claim_${index}_totalIncurred`}
                          value={claim.totalIncurred || ""}
                          onChange={(e) => updateLargeClaim(index, "totalIncurred", e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`claim_${index}_description`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id={`claim_${index}_description`}
                        name={`claim_${index}_description`}
                        value={claim.description || ""}
                        onChange={(e) => updateLargeClaim(index, "description", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addLargeClaim}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Large Claim
                  </button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8">
              <label htmlFor="agentRemarks" className="block text-sm font-medium text-gray-700 mb-1">
                Agent Remarks
              </label>
              <textarea
                id="agentRemarks"
                name="agentRemarks"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional remarks regarding exposures, coverages, marketing, pricing, loss prevention, claims, etc."
              ></textarea>
            </div>

            <div className="mt-8 mb-6">
              <h3 className="text-lg font-semibold mb-4">Upload Supporting Documents</h3>
              <p className="text-sm text-gray-600 mb-2">Upload any additional documents (PDF preferred)</p>
              <input
                type="file"
                id="supportingDocuments"
                name="supportingDocuments"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
          )}
          {currentStep < totalSteps && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
