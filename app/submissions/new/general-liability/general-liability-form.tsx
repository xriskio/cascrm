"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { DatePicker as DatePickerBase } from "@/components/ui/date-picker"
const DatePicker: any = DatePickerBase
import { US_STATES } from "@/lib/states"
import { submitApplication } from "@/app/actions/submit-application"

interface GeneralLiabilityFormProps {
  insuranceType: string
}

export default function GeneralLiabilityForm({ insuranceType }: GeneralLiabilityFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [effectiveDate, setEffectiveDate] = useState<Date>()
  const [expirationDate, setExpirationDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 5
  const steps = [
    { id: 1, name: "Business Information" },
    { id: 2, name: "Coverage Information" },
    { id: 3, name: "Claims & Additional Info" },
    { id: 4, name: "Hazards & Questions" },
    { id: 5, name: "Review & Submit" },
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
                      : "border-border text-gray-300"
                }`}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : <span>{step.id}</span>}
              </div>
              <span
                className={`hidden md:block ml-2 text-sm ${currentStep >= step.id ? "text-blue-600" : "text-muted-foreground"}`}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`hidden md:block w-12 h-0.5 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-muted"}`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-md">
        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Business Information</h2>
            <p className="text-muted-foreground mb-6">Basic information about your business and operations</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-muted-foreground mb-1">
                  Company Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-muted-foreground mb-1">
                  Years in Business<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="yearsInBusiness"
                  name="yearsInBusiness"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="businessDescription" className="block text-sm font-medium text-muted-foreground mb-1">
                Business Description<span className="text-red-500">*</span>
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                rows={4}
                placeholder="Describe the nature of your business operations"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Location & Contact Information</h3>

            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-muted-foreground mb-1">
                Address<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-muted-foreground mb-1">
                  City<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-muted-foreground mb-1">
                  State<span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label htmlFor="zipCode" className="block text-sm font-medium text-muted-foreground mb-1">
                  ZIP Code<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Contact Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-muted-foreground mb-1">
                  Contact Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-muted-foreground mb-1">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="(555) 555-5555"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-muted-foreground mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Business Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="annualGrossReceipts" className="block text-sm font-medium text-muted-foreground mb-1">
                  Annual Gross Receipts<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="annualGrossReceipts"
                  name="annualGrossReceipts"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="annualPayroll" className="block text-sm font-medium text-muted-foreground mb-1">
                  Annual Payroll<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="annualPayroll"
                  name="annualPayroll"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-muted-foreground mb-1">
                  Number of Employees<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="numberOfEmployees"
                  name="numberOfEmployees"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="currentInsuranceCarrier" className="block text-sm font-medium text-muted-foreground mb-1">
                  Current Insurance Carrier
                </label>
                <input
                  type="text"
                  id="currentInsuranceCarrier"
                  name="currentInsuranceCarrier"
                  placeholder="Enter current carrier"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="currentPremium" className="block text-sm font-medium text-muted-foreground mb-1">
                  Current Premium
                </label>
                <input
                  type="number"
                  id="currentPremium"
                  name="currentPremium"
                  min="0"
                  placeholder="Enter current premium"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Coverage Information */}
        {currentStep === 2 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Coverage Information</h2>
            <p className="text-muted-foreground mb-6">Details about the coverage you need</p>

            <h3 className="text-lg font-semibold mb-4">Coverages, Deductibles and Limits</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Coverage Type</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="occurrenceCoverage"
                    name="coverageType"
                    value="occurrence"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                  />
                  <label htmlFor="occurrenceCoverage" className="ml-2 block text-sm text-muted-foreground">
                    Occurrence
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="claimsMadeCoverage"
                    name="coverageType"
                    value="claimsMade"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                  />
                  <label htmlFor="claimsMadeCoverage" className="ml-2 block text-sm text-muted-foreground">
                    Claims Made
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Liability Limit</label>
              <select
                id="liabilityLimit"
                name="liabilityLimit"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select liability limit</option>
                <option value="$500,000">$500,000</option>
                <option value="$1,000,000" selected>
                  $1,000,000
                </option>
                <option value="$2,000,000">$2,000,000</option>
                <option value="$3,000,000">$3,000,000</option>
                <option value="$4,000,000">$4,000,000</option>
                <option value="$5,000,000">$5,000,000</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">General Aggregate</label>
              <select
                id="generalAggregate"
                name="generalAggregate"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select general aggregate</option>
                <option value="$1,000,000">$1,000,000</option>
                <option value="$2,000,000" selected>
                  $2,000,000
                </option>
                <option value="$3,000,000">$3,000,000</option>
                <option value="$4,000,000">$4,000,000</option>
                <option value="$5,000,000">$5,000,000</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Products & Completed Operations Aggregate
              </label>
              <select
                id="productsCompletedOperationsAggregate"
                name="productsCompletedOperationsAggregate"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select products & completed operations aggregate</option>
                <option value="$1,000,000">$1,000,000</option>
                <option value="$2,000,000" selected>
                  $2,000,000
                </option>
                <option value="$3,000,000">$3,000,000</option>
                <option value="$4,000,000">$4,000,000</option>
                <option value="$5,000,000">$5,000,000</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Personal & Advertising Injury</label>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="includePersonalAdvertisingInjury"
                  name="includePersonalAdvertisingInjury"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <label htmlFor="includePersonalAdvertisingInjury" className="ml-2 block text-sm text-muted-foreground">
                  Include
                </label>
              </div>
              <select
                id="personalAdvertisingInjuryLimit"
                name="personalAdvertisingInjuryLimit"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Please choose</option>
                <option value="$500,000">$500,000</option>
                <option value="$1,000,000" selected>
                  $1,000,000
                </option>
                <option value="$2,000,000">$2,000,000</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Medical Expense</label>
              <select
                id="medicalExpenseLimit"
                name="medicalExpenseLimit"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Please choose</option>
                <option value="$5,000">$5,000</option>
                <option value="$10,000">$10,000</option>
                <option value="$15,000">$15,000</option>
                <option value="$20,000">$20,000</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Damage to Rented Premises (each occurrence)
              </label>
              <select
                id="damageToPremisesLimit"
                name="damageToPremisesLimit"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Please choose</option>
                <option value="$50,000" selected>
                  $50,000
                </option>
                <option value="$100,000">$100,000</option>
                <option value="$300,000">$300,000</option>
                <option value="$500,000">$500,000</option>
              </select>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Deductibles</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Property Damage Deductible</label>
              <select
                id="propertyDamageDeductible"
                name="propertyDamageDeductible"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="">Select deductible amount</option>
                <option value="$500">$500</option>
                <option value="$1,000">$1,000</option>
                <option value="$2,500">$2,500</option>
                <option value="$5,000">$5,000</option>
                <option value="$10,000">$10,000</option>
              </select>

              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="perClaimDeductible"
                    name="deductibleBasis"
                    value="perClaim"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                  />
                  <label htmlFor="perClaimDeductible" className="ml-2 block text-sm text-muted-foreground">
                    Per Claim
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="perOccurrenceDeductible"
                    name="deductibleBasis"
                    value="perOccurrence"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                  />
                  <label htmlFor="perOccurrenceDeductible" className="ml-2 block text-sm text-muted-foreground">
                    Per Occurrence
                  </label>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Additional Coverages</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="productsCompletedOperations"
                  name="productsCompletedOperations"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <label htmlFor="productsCompletedOperations" className="ml-2 block text-sm text-muted-foreground">
                  Products/Completed Operations
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="contractorsEquipment"
                  name="contractorsEquipment"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <label htmlFor="contractorsEquipment" className="ml-2 block text-sm text-muted-foreground">
                  Contractors Equipment
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="additionalInsured"
                  name="additionalInsured"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <label htmlFor="additionalInsured" className="ml-2 block text-sm text-muted-foreground">
                  Additional Insured Endorsements
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="otherCoverages" className="block text-sm font-medium text-muted-foreground mb-1">
                Other Coverages, Restrictions and/or Endorsements
              </label>
              <textarea
                id="otherCoverages"
                name="otherCoverages"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any other coverages, restrictions or endorsements"
              ></textarea>
            </div>
          </div>
        )}

        {/* Step 3: Claims History & Additional Information */}
        {currentStep === 3 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Claims History & Additional Information</h2>
            <p className="text-muted-foreground mb-6">Details about past claims and additional information</p>

            <div className="mb-6">
              <label htmlFor="claimsHistory" className="block text-sm font-medium text-muted-foreground mb-1">
                Claims History (Last 5 Years)<span className="text-red-500">*</span>
              </label>
              <textarea
                id="claimsHistory"
                name="claimsHistory"
                rows={5}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide details of any liability claims in the last 5 years. If none, please state 'No claims'."
              ></textarea>
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noClaimsHistory"
                  name="noClaimsHistory"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <label htmlFor="noClaimsHistory" className="ml-2 block text-sm text-muted-foreground">
                  No claims in the past 5 years
                </label>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Schedule of Hazards</h3>

            <div className="mb-6">
              <label htmlFor="hazardClassification" className="block text-sm font-medium text-muted-foreground mb-1">
                Hazard Classification
              </label>
              <select
                id="hazardClassification"
                name="hazardClassification"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Please choose</option>
                <option value="Construction">Construction</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Service">Service</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="totalGrossReceipts" className="block text-sm font-medium text-muted-foreground mb-1">
                Total Gross Receipts
              </label>
              <input
                type="number"
                id="totalGrossReceipts"
                name="totalGrossReceipts"
                min="0"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="scheduleOfHazards" className="block text-sm font-medium text-muted-foreground mb-1">
                Schedule of Hazards - Additional Details
              </label>
              <textarea
                id="scheduleOfHazards"
                name="scheduleOfHazards"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please include owner and employee payroll per state guidelines"
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="lossRuns" className="block text-sm font-medium text-muted-foreground mb-1">
                Upload Loss Runs
              </label>
              <p className="text-xs text-muted-foreground mb-2">Upload loss runs for the past 5 years</p>
              <input
                type="file"
                id="lossRuns"
                name="lossRuns"
                multiple
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 4: Hazards & Questions */}
        {currentStep === 4 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">ACORD Questions</h2>
            <p className="text-muted-foreground mb-6">General information about your operations</p>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="defaultNoAnswers"
                  name="defaultNoAnswers"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <label htmlFor="defaultNoAnswers" className="ml-2 block text-sm text-muted-foreground">
                  Please check here to default all answers below to 'No'. You may then edit each response to a 'Yes' if
                  applicable.
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Any medical facilities provided or medical professionals employed or contracted?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="medicalFacilitiesYes"
                      name="medicalFacilities"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="medicalFacilitiesYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="medicalFacilitiesNo"
                      name="medicalFacilities"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="medicalFacilitiesNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Any exposure to radioactive/nuclear materials?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="radioactiveExposureYes"
                      name="radioactiveExposure"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="radioactiveExposureYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="radioactiveExposureNo"
                      name="radioactiveExposure"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="radioactiveExposureNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Do/have past, present or discontinued operations involve(d) storing, treating, discharging, applying,
                  disposing, or transporting of hazardous material?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hazardousMaterialYes"
                      name="hazardousMaterial"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="hazardousMaterialYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hazardousMaterialNo"
                      name="hazardousMaterial"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="hazardousMaterialNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Any operations sold, acquired, or discontinued in last five (5) years?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="operationsChangedYes"
                      name="operationsChanged"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="operationsChangedYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="operationsChangedNo"
                      name="operationsChanged"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="operationsChangedNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Do you rent or loan equipment to others?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="equipmentRentalYes"
                      name="equipmentRental"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="equipmentRentalYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="equipmentRentalNo"
                      name="equipmentRental"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="equipmentRentalNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Any watercraft, docks, floats owned, hired or leased?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="watercraftYes"
                      name="watercraft"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="watercraftYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="watercraftNo"
                      name="watercraft"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="watercraftNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Any parking facilities owned/rented?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="parkingFacilitiesYes"
                      name="parkingFacilities"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="parkingFacilitiesYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="parkingFacilitiesNo"
                      name="parkingFacilities"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="parkingFacilitiesNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Is there a swimming pool on the premises?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="swimmingPoolYes"
                      name="swimmingPool"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="swimmingPoolYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="swimmingPoolNo"
                      name="swimmingPool"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="swimmingPoolNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Are social events sponsored?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="socialEventsYes"
                      name="socialEvents"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="socialEventsYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="socialEventsNo"
                      name="socialEvents"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="socialEventsNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Are athletic teams sponsored?</p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="athleticTeamsYes"
                      name="athleticTeams"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="athleticTeamsYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="athleticTeamsNo"
                      name="athleticTeams"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="athleticTeamsNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Is there a formal, written safety and security policy in effect?
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="safetyPolicyYes"
                      name="safetyPolicy"
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="safetyPolicyYes" className="ml-2 block text-sm text-muted-foreground">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="safetyPolicyNo"
                      name="safetyPolicy"
                      value="no"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border"
                    />
                    <label htmlFor="safetyPolicyNo" className="ml-2 block text-sm text-muted-foreground">
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
            <p className="text-muted-foreground mb-6">Review and submit your application</p>

            <div className="bg-blue-500/10 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <p className="mb-2">Monday - Friday: 8:00 AM - 6:00 PM EST</p>
              <p className="text-lg font-bold">888-254-0089 ext. 1</p>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Departments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">New Business</p>
                    <p className="text-sm text-muted-foreground">For new insurance inquiries</p>
                  </div>
                  <div>
                    <p className="font-medium">Quotes</p>
                    <p className="text-sm text-muted-foreground">quotes@insurelimos.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Upload Supporting Documents</h3>
              <p className="text-sm text-muted-foreground mb-2">Upload any additional documents (PDF preferred)</p>
              <input
                type="file"
                id="supportingDocuments"
                name="supportingDocuments"
                multiple
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="flex justify-between p-6 border-t border-border">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
