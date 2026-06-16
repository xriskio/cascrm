"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { US_STATES } from "@/lib/states"
import { submitApplication } from "@/app/actions/submit-application"

interface CommercialAutoFormProps {
  insuranceType: string
}

export default function CommercialAutoForm({ insuranceType }: CommercialAutoFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [effectiveDate, setEffectiveDate] = useState<Date>()
  const [expirationDate, setExpirationDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 5
  const steps = [
    { id: 1, name: "Business Information" },
    { id: 2, name: "Coverage & History" },
    { id: 3, name: "Operations & Risk" },
    { id: 4, name: "Fleet & Drivers" },
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
        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Business Information</h2>
            <p className="text-gray-600 mb-6">Basic information and filing details</p>

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
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Location & Contact Information</h3>

            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Contact Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="(555) 555-5555"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label htmlFor="dotNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  DOT Number
                </label>
                <input
                  type="text"
                  id="dotNumber"
                  name="dotNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="mcNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  MC Number
                </label>
                <input
                  type="text"
                  id="mcNumber"
                  name="mcNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="pucNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  PUC Number
                </label>
                <input
                  type="text"
                  id="pucNumber"
                  name="pucNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID / EIN<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="docketNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Docket Number
                </label>
                <input
                  type="text"
                  id="docketNumber"
                  name="docketNumber"
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

        {/* Step 2: Coverage & History */}
        {currentStep === 2 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Coverage & History</h2>
            <p className="text-gray-600 mb-6">Coverage needs and insurance history</p>

            <h3 className="text-lg font-semibold mb-4">Liability Coverage</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="liabilityLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Liability Limit<span className="text-red-500">*</span>
                </label>
                <select
                  id="liabilityLimit"
                  name="liabilityLimit"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="$750,000">$750,000</option>
                  <option value="$1,000,000">$1,000,000</option>
                  <option value="$1,500,000">$1,500,000</option>
                  <option value="$2,000,000">$2,000,000</option>
                  <option value="$5,000,000">$5,000,000</option>
                </select>
              </div>

              <div>
                <label htmlFor="uninsuredMotoristLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Uninsured Motorist Limit<span className="text-red-500">*</span>
                </label>
                <select
                  id="uninsuredMotoristLimit"
                  name="uninsuredMotoristLimit"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="$100,000">$100,000</option>
                  <option value="$300,000">$300,000</option>
                  <option value="$500,000">$500,000</option>
                  <option value="$750,000">$750,000</option>
                  <option value="$1,000,000">$1,000,000</option>
                </select>
              </div>

              <div>
                <label htmlFor="medicalPaymentLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Payment Limit<span className="text-red-500">*</span>
                </label>
                <select
                  id="medicalPaymentLimit"
                  name="medicalPaymentLimit"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="$5,000">$5,000</option>
                  <option value="$10,000">$10,000</option>
                  <option value="$25,000">$25,000</option>
                  <option value="$50,000">$50,000</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Physical Damage Coverage</h3>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includePhysicalDamage"
                  name="includePhysicalDamage"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includePhysicalDamage" className="ml-2 block text-sm text-gray-700">
                  Include Physical Damage Coverage
                </label>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Additional Coverages</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hiredAutoCoverage"
                  name="hiredAutoCoverage"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hiredAutoCoverage" className="ml-2 block text-sm text-gray-700">
                  Hired Auto Coverage
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nonOwnedAutoCoverage"
                  name="nonOwnedAutoCoverage"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="nonOwnedAutoCoverage" className="ml-2 block text-sm text-gray-700">
                  Non-Owned Auto Coverage
                </label>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-2">Loss Runs Required</h3>
            <p className="text-gray-600 mb-4">
              Please provide loss runs for the past 5 years or indicate if this is a new venture
            </p>

            <div className="mb-6">
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

            <div className="mb-6">
              <label htmlFor="lossRuns" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Loss Runs
              </label>
              <p className="text-xs text-gray-500 mb-2">Upload loss runs for the past 5 years</p>
              <input
                type="file"
                id="lossRuns"
                name="lossRuns"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <label htmlFor="currentInsuranceCarrier" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Insurance Carrier<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="currentInsuranceCarrier"
                  name="currentInsuranceCarrier"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="currentAnnualPremium" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Annual Premium<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="currentAnnualPremium"
                  name="currentAnnualPremium"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="priorInsuranceCarrier" className="block text-sm font-medium text-gray-700 mb-1">
                  Prior Insurance Carrier
                </label>
                <input
                  type="text"
                  id="priorInsuranceCarrier"
                  name="priorInsuranceCarrier"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="reasonForChange" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Change
                </label>
                <input
                  type="text"
                  id="reasonForChange"
                  name="reasonForChange"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Operations & Risk */}
        {currentStep === 3 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Operations & Risk</h2>
            <p className="text-gray-600 mb-6">Business operations and risk details</p>

            <h3 className="text-lg font-semibold mb-4">Business Operations</h3>

            <div className="mb-6">
              <label htmlFor="operationsType" className="block text-sm font-medium text-gray-700 mb-1">
                Type of Operations<span className="text-red-500">*</span>
              </label>
              <select
                id="operationsType"
                name="operationsType"
                multiple
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                <option value="Airport Shuttle">Airport Shuttle</option>
                <option value="Charter">Charter</option>
                <option value="Employee Transportation">Employee Transportation</option>
                <option value="Hotel Shuttle">Hotel Shuttle</option>
                <option value="Limousine">Limousine</option>
                <option value="NEMT">NEMT (Non-Emergency Medical Transportation)</option>
                <option value="Paratransit">Paratransit</option>
                <option value="School Transportation">School Transportation</option>
                <option value="Sightseeing Tours">Sightseeing Tours</option>
                <option value="Taxi">Taxi</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="serviceArea" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Area<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="serviceArea"
                  name="serviceArea"
                  placeholder="e.g., Greater Los Angeles Area"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="operatingRadius" className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Radius (miles)<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="operatingRadius"
                  name="operatingRadius"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 mb-6">
              <label htmlFor="tripTypes" className="block text-sm font-medium text-gray-700 mb-1">
                Trip Types<span className="text-red-500">*</span>
              </label>
              <select
                id="tripTypes"
                name="tripTypes"
                multiple
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                <option value="Airport Transfers">Airport Transfers</option>
                <option value="Corporate Events">Corporate Events</option>
                <option value="Medical Appointments">Medical Appointments</option>
                <option value="Point-to-Point">Point-to-Point</option>
                <option value="Proms/Weddings">Proms/Weddings</option>
                <option value="Regular Routes">Regular Routes</option>
                <option value="School Transportation">School Transportation</option>
                <option value="Sightseeing Tours">Sightseeing Tours</option>
                <option value="Special Events">Special Events</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
            </div>

            <div className="mb-6">
              <label htmlFor="airportTransportationPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                Percentage of Airport Transportation<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="airportTransportationPercentage"
                  name="airportTransportationPercentage"
                  min="0"
                  max="100"
                  required
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter a percentage between 0 and 100</p>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Passenger Capacity</h3>

            <div className="mb-6">
              <label htmlFor="passengerCapacities" className="block text-sm font-medium text-gray-700 mb-1">
                Passenger Capacities<span className="text-red-500">*</span>
              </label>
              <select
                id="passengerCapacities"
                name="passengerCapacities"
                multiple
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                <option value="1-4 passengers">1-4 passengers</option>
                <option value="5-8 passengers">5-8 passengers</option>
                <option value="9-15 passengers">9-15 passengers</option>
                <option value="16-20 passengers">16-20 passengers</option>
                <option value="21-30 passengers">21-30 passengers</option>
                <option value="31+ passengers">31+ passengers</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="annualMiles" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Miles<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="annualMiles"
                  name="annualMiles"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="percentageUrbanDriving" className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage Urban Driving<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="percentageUrbanDriving"
                    name="percentageUrbanDriving"
                    min="0"
                    max="100"
                    required
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Urban + Interstate should total 100%</p>
              </div>

              <div>
                <label htmlFor="percentageInterstateDriving" className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage Interstate Driving<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="percentageInterstateDriving"
                    name="percentageInterstateDriving"
                    min="0"
                    max="100"
                    required
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Special Risk Considerations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nighttimeOperations"
                  name="nighttimeOperations"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="nighttimeOperations" className="ml-2 block text-sm text-gray-700">
                  Nighttime Operations (after 10 PM)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="specialEvents"
                  name="specialEvents"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="specialEvents" className="ml-2 block text-sm text-gray-700">
                  Special Events (concerts, sporting events, etc.)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Fleet & Drivers */}
        {currentStep === 4 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Fleet & Drivers</h2>
            <p className="text-gray-600 mb-6">Vehicle and driver information</p>

            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <h3 className="text-lg font-semibold mb-2">Bulk Upload Available</h3>
              <p className="text-sm text-gray-700 mb-4">
                For multiple vehicles, you can use our bulk upload feature. Download the template and upload your
                completed file.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Download Template
                </button>

                <div className="flex-1">
                  <label htmlFor="vehicleList" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Vehicle List
                  </label>
                  <input
                    type="file"
                    id="vehicleList"
                    name="vehicleList"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported formats: Excel, CSV</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 rounded-md p-4 mb-8">
              <h3 className="text-lg font-semibold mb-4">Add New Vehicle</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    id="vehicleYear"
                    name="vehicleYear"
                    placeholder="2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    id="vehicleMake"
                    name="vehicleMake"
                    placeholder="e.g., Mercedes-Benz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    id="vehicleModel"
                    name="vehicleModel"
                    placeholder="e.g., Sprinter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="vehicleVin" className="block text-sm font-medium text-gray-700 mb-1">
                    VIN
                  </label>
                  <input
                    type="text"
                    id="vehicleVin"
                    name="vehicleVin"
                    placeholder="17-character VIN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="vehicleSeatingCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    id="vehicleSeatingCapacity"
                    name="vehicleSeatingCapacity"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="vehicleValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    id="vehicleValue"
                    name="vehicleValue"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="vehiclePrimaryUsage" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Usage
                </label>
                <select
                  id="vehiclePrimaryUsage"
                  name="vehiclePrimaryUsage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="Airport Shuttle">Airport Shuttle</option>
                  <option value="Charter">Charter</option>
                  <option value="Limousine">Limousine</option>
                  <option value="Medical Transport">Medical Transport</option>
                  <option value="Paratransit">Paratransit</option>
                  <option value="School Bus">School Bus</option>
                  <option value="Taxi">Taxi</option>
                  <option value="Tour Bus">Tour Bus</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Vehicle
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <h3 className="text-lg font-semibold mb-2">Bulk Upload Available</h3>
              <p className="text-sm text-gray-700 mb-4">
                For multiple drivers, you can use our bulk upload feature. Download the template and upload your
                completed file.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Download Template
                </button>

                <div className="flex-1">
                  <label htmlFor="driverList" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Driver List
                  </label>
                  <input
                    type="file"
                    id="driverList"
                    name="driverList"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported formats: Excel, CSV</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 rounded-md p-4">
              <h3 className="text-lg font-semibold mb-4">Add New Driver</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="driverFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="driverFirstName"
                    name="driverFirstName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="driverLastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="driverLastName"
                    name="driverLastName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DatePicker
                  date={undefined}
                  setDate={() => {}}
                  label="Date of Birth"
                  placeholder="Select date of birth"
                  name="driverDateOfBirth"
                />

                <DatePicker
                  date={undefined}
                  setDate={() => {}}
                  label="Hire Date"
                  placeholder="Select hire date"
                  name="driverHireDate"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="driverLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    id="driverLicenseNumber"
                    name="driverLicenseNumber"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="driverLicenseState" className="block text-sm font-medium text-gray-700 mb-1">
                    License State
                  </label>
                  <select
                    id="driverLicenseState"
                    name="driverLicenseState"
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
                  <label htmlFor="driverExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="driverExperience"
                    name="driverExperience"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="driverViolations" className="block text-sm font-medium text-gray-700 mb-1">
                  Traffic Violations (Last 3 Years)
                </label>
                <select
                  id="driverViolations"
                  name="driverViolations"
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size={4}
                >
                  <option value="None">None</option>
                  <option value="Speeding">Speeding</option>
                  <option value="Failure to Yield">Failure to Yield</option>
                  <option value="Running Red Light">Running Red Light</option>
                  <option value="Improper Lane Change">Improper Lane Change</option>
                  <option value="Distracted Driving">Distracted Driving</option>
                  <option value="DUI/DWI">DUI/DWI</option>
                  <option value="Reckless Driving">Reckless Driving</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Driver
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
            <p className="text-gray-600 mb-6">Review and submit your application</p>

            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <p className="mb-2">Monday - Friday: 8:00 AM - 6:00 PM EST</p>
              <p className="text-lg font-bold">888-254-0089 ext. 1</p>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Departments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">New Business</p>
                    <p className="text-sm text-gray-600">For new insurance inquiries</p>
                  </div>
                  <div>
                    <p className="font-medium">Quotes</p>
                    <p className="text-sm text-gray-600">quotes@insurelimos.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
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
