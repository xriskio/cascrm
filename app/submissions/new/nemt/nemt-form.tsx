"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Plus } from "lucide-react"
import { DatePicker as DatePickerBase } from "@/components/ui/date-picker"
const DatePicker: any = DatePickerBase
import { US_STATES } from "@/lib/states"
import { submitApplication } from "@/app/actions/submit-application"

interface NemtFormProps {
  insuranceType: string
}

export default function NemtForm({ insuranceType }: NemtFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [effectiveDate, setEffectiveDate] = useState<Date>()
  const [expirationDate, setExpirationDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [claimDate, setClaimDate] = useState<Date>()
  const [claims, setClaims] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [urbanDriving, setUrbanDriving] = useState(0)
  const [interstateDriving, setInterstateDriving] = useState(0)

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

      // Add claims, vehicles, and drivers data
      formData.append("claims", JSON.stringify(claims))
      formData.append("vehicles", JSON.stringify(vehicles))
      formData.append("drivers", JSON.stringify(drivers))

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

  const addClaim = () => {
    if (!claimDate) return

    const newClaim = {
      date: claimDate,
      amount: (document.getElementById("claimAmount") as HTMLInputElement)?.value || "0",
      description: (document.getElementById("claimDescription") as HTMLTextAreaElement)?.value || "",
      status: (document.getElementById("claimStatus") as HTMLSelectElement)?.value || "Open",
    }

    setClaims([...claims, newClaim])
    setClaimDate(undefined)

    // Reset form fields
    if (document.getElementById("claimAmount") as HTMLInputElement)
      (document.getElementById("claimAmount") as HTMLInputElement).value = ""
    if (document.getElementById("claimDescription") as HTMLTextAreaElement)
      (document.getElementById("claimDescription") as HTMLTextAreaElement).value = ""
    if (document.getElementById("claimStatus") as HTMLSelectElement)
      (document.getElementById("claimStatus") as HTMLSelectElement).value = "Open"
  }

  const addVehicle = () => {
    const newVehicle = {
      year: (document.getElementById("vehicleYear") as HTMLInputElement)?.value || "",
      make: (document.getElementById("vehicleMake") as HTMLInputElement)?.value || "",
      model: (document.getElementById("vehicleModel") as HTMLInputElement)?.value || "",
      vin: (document.getElementById("vehicleVin") as HTMLInputElement)?.value || "",
      seatingCapacity: (document.getElementById("vehicleSeatingCapacity") as HTMLInputElement)?.value || "0",
      value: (document.getElementById("vehicleValue") as HTMLInputElement)?.value || "0",
      primaryUsage: (document.getElementById("vehiclePrimaryUsage") as HTMLSelectElement)?.value || "",
      wheelchairCapacity: (document.getElementById("wheelchairCapacity") as HTMLInputElement)?.value || "0",
      stretcherCapacity: (document.getElementById("stretcherCapacity") as HTMLInputElement)?.value || "0",
    }

    setVehicles([...vehicles, newVehicle])

    // Reset form fields
    if (document.getElementById("vehicleYear") as HTMLInputElement)
      (document.getElementById("vehicleYear") as HTMLInputElement).value = ""
    if (document.getElementById("vehicleMake") as HTMLInputElement)
      (document.getElementById("vehicleMake") as HTMLInputElement).value = ""
    if (document.getElementById("vehicleModel") as HTMLInputElement)
      (document.getElementById("vehicleModel") as HTMLInputElement).value = ""
    if (document.getElementById("vehicleVin") as HTMLInputElement)
      (document.getElementById("vehicleVin") as HTMLInputElement).value = ""
    if (document.getElementById("vehicleSeatingCapacity") as HTMLInputElement)
      (document.getElementById("vehicleSeatingCapacity") as HTMLInputElement).value = "0"
    if (document.getElementById("vehicleValue") as HTMLInputElement)
      (document.getElementById("vehicleValue") as HTMLInputElement).value = "0"
    if (document.getElementById("vehiclePrimaryUsage") as HTMLSelectElement)
      (document.getElementById("vehiclePrimaryUsage") as HTMLSelectElement).value = ""
    if (document.getElementById("wheelchairCapacity") as HTMLInputElement)
      (document.getElementById("wheelchairCapacity") as HTMLInputElement).value = "0"
    if (document.getElementById("stretcherCapacity") as HTMLInputElement)
      (document.getElementById("stretcherCapacity") as HTMLInputElement).value = "0"
  }

  const handleUrbanDrivingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setUrbanDriving(value)
    setInterstateDriving(100 - value)
  }

  const handleInterstateDrivingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setInterstateDriving(value)
    setUrbanDriving(100 - value)
  }

  const addDriver = () => {
    const newDriver = {
      firstName: (document.getElementById("driverFirstName") as HTMLInputElement)?.value || "",
      lastName: (document.getElementById("driverLastName") as HTMLInputElement)?.value || "",
      dateOfBirth: (document.getElementById("driverDOB") as HTMLInputElement)?.value || "",
      hireDate: (document.getElementById("driverHireDate") as HTMLInputElement)?.value || "",
      licenseNumber: (document.getElementById("driverLicenseNumber") as HTMLInputElement)?.value || "",
      licenseState: (document.getElementById("driverLicenseState") as HTMLSelectElement)?.value || "",
      experience: (document.getElementById("driverExperience") as HTMLInputElement)?.value || "0",
      violations: (document.getElementById("driverViolations") as HTMLSelectElement)?.selectedOptions || [],
      nemtCertified: (document.getElementById("nemtCertified") as HTMLInputElement)?.checked || false,
      cprCertified: (document.getElementById("cprCertified") as HTMLInputElement)?.checked || false,
    }

    setDrivers([...drivers, newDriver])

    // Reset form fields
    if (document.getElementById("driverFirstName") as HTMLInputElement)
      (document.getElementById("driverFirstName") as HTMLInputElement).value = ""
    if (document.getElementById("driverLastName") as HTMLInputElement)
      (document.getElementById("driverLastName") as HTMLInputElement).value = ""
    if (document.getElementById("driverDOB") as HTMLInputElement)
      (document.getElementById("driverDOB") as HTMLInputElement).value = ""
    if (document.getElementById("driverHireDate") as HTMLInputElement)
      (document.getElementById("driverHireDate") as HTMLInputElement).value = ""
    if (document.getElementById("driverLicenseNumber") as HTMLInputElement)
      (document.getElementById("driverLicenseNumber") as HTMLInputElement).value = ""
    if (document.getElementById("driverLicenseState") as HTMLSelectElement)
      (document.getElementById("driverLicenseState") as HTMLSelectElement).value = ""
    if (document.getElementById("driverExperience") as HTMLInputElement)
      (document.getElementById("driverExperience") as HTMLInputElement).value = "0"
    if (document.getElementById("nemtCertified") as HTMLInputElement)
      (document.getElementById("nemtCertified") as HTMLInputElement).checked = false
    if (document.getElementById("cprCertified") as HTMLInputElement)
      (document.getElementById("cprCertified") as HTMLInputElement).checked = false
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
            <p className="text-gray-600 mb-6">Basic information about your NEMT business</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name<span className="text-red-500">*</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email<span className="text-red-500">*</span>
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
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Business Website
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  https://
                </span>
                <input
                  type="text"
                  id="website"
                  name="website"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                Business Type<span className="text-red-500">*</span>
              </label>
              <select
                id="businessType"
                name="businessType"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Business Type</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="LLC">LLC</option>
                <option value="Corporation">Corporation</option>
                <option value="S-Corporation">S-Corporation</option>
                <option value="Non-Profit">Non-Profit</option>
              </select>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Mailing Address</h3>

            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Mailing Address<span className="text-red-500">*</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="medicaidProvider" className="block text-sm font-medium text-gray-700 mb-1">
                  Medicaid Provider Number
                </label>
                <input
                  type="text"
                  id="medicaidProvider"
                  name="medicaidProvider"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="nemtLicense" className="block text-sm font-medium text-gray-700 mb-1">
                  NEMT License Number
                </label>
                <input
                  type="text"
                  id="nemtLicense"
                  name="nemtLicense"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  currentStep === 1 ? "invisible" : ""
                }`}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="professionalLiability"
                  name="professionalLiability"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="professionalLiability" className="ml-2 block text-sm text-gray-700">
                  Professional Liability
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="generalLiability"
                  name="generalLiability"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="generalLiability" className="ml-2 block text-sm text-gray-700">
                  General Liability
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

            <h3 className="text-lg font-semibold mt-8 mb-4">Claims History</h3>

            {claims.length > 0 && (
              <div className="mb-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.date instanceof Date ? claim.date.toLocaleDateString() : claim.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${claim.amount}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{claim.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border border-gray-300 rounded-md p-4 mb-6">
              <h4 className="text-md font-medium mb-4">Add New Claim</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DatePicker
                  date={claimDate}
                  setDate={setClaimDate}
                  label="Date"
                  placeholder="Select date"
                  name="claimDate"
                />

                <div>
                  <label htmlFor="claimAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="claimAmount"
                    name="claimAmount"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="claimDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="claimDescription"
                  name="claimDescription"
                  rows={2}
                  placeholder="Brief description of the claim"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="mb-4">
                <label htmlFor="claimStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="claimStatus"
                  name="claimStatus"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addClaim}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Claim
                </button>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Operations & Risk */}
        {currentStep === 3 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Operations & Risk</h2>
            <p className="text-gray-600 mb-6">Business operations and risk details</p>

            <h3 className="text-lg font-semibold mb-4">NEMT Operations</h3>

            <div className="mb-6">
              <label htmlFor="serviceTypes" className="block text-sm font-medium text-gray-700 mb-1">
                Types of Services Provided<span className="text-red-500">*</span>
              </label>
              <select
                id="serviceTypes"
                name="serviceTypes"
                multiple
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                <option value="Ambulatory">Ambulatory (Walking)</option>
                <option value="Wheelchair">Wheelchair</option>
                <option value="Stretcher">Stretcher</option>
                <option value="Basic Life Support">Basic Life Support</option>
                <option value="Advanced Life Support">Advanced Life Support</option>
                <option value="Bariatric">Bariatric</option>
                <option value="Dialysis">Dialysis</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Substance Abuse">Substance Abuse</option>
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
              <label htmlFor="clientTypes" className="block text-sm font-medium text-gray-700 mb-1">
                Client Types<span className="text-red-500">*</span>
              </label>
              <select
                id="clientTypes"
                name="clientTypes"
                multiple
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                <option value="Medicaid">Medicaid</option>
                <option value="Medicare">Medicare</option>
                <option value="Private Insurance">Private Insurance</option>
                <option value="Self-Pay">Self-Pay</option>
                <option value="Veterans Affairs">Veterans Affairs</option>
                <option value="Workers Compensation">Workers Compensation</option>
                <option value="Managed Care Organizations">Managed Care Organizations</option>
                <option value="Hospitals">Hospitals</option>
                <option value="Nursing Homes">Nursing Homes</option>
                <option value="Rehabilitation Centers">Rehabilitation Centers</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
            </div>

            <div className="mb-6">
              <label htmlFor="contractedFacilities" className="block text-sm font-medium text-gray-700 mb-1">
                Contracted Facilities
              </label>
              <textarea
                id="contractedFacilities"
                name="contractedFacilities"
                rows={3}
                placeholder="List major facilities you have contracts with"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
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
                    value={urbanDriving}
                    onChange={handleUrbanDrivingChange}
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
                    value={interstateDriving}
                    onChange={handleInterstateDrivingChange}
                    required
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Current total: {urbanDriving + interstateDriving}%</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4">Risk Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="driverTraining"
                  name="driverTraining"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="driverTraining" className="ml-2 block text-sm text-gray-700">
                  Driver Training Program
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="patientHandlingTraining"
                  name="patientHandlingTraining"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="patientHandlingTraining" className="ml-2 block text-sm text-gray-700">
                  Patient Handling Training
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="backgroundChecks"
                  name="backgroundChecks"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="backgroundChecks" className="ml-2 block text-sm text-gray-700">
                  Background Checks for All Employees
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="drugTesting"
                  name="drugTesting"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="drugTesting" className="ml-2 block text-sm text-gray-700">
                  Drug Testing Program
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="safetyProgram" className="block text-sm font-medium text-gray-700 mb-1">
                Safety Program Description
              </label>
              <textarea
                id="safetyProgram"
                name="safetyProgram"
                rows={3}
                placeholder="Describe your safety program and protocols"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
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

            {vehicles.length > 0 && (
              <div className="mb-6 overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Vehicles</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Year
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Make
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Model
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        VIN
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Capacity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicles.map((vehicle, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.make}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.vin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.seatingCapacity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vehicle.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
                    placeholder="e.g., Ford"
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
                    placeholder="e.g., Transit"
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
                    placeholder="e.g., 1HGCM82633A123456"
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
                    placeholder="e.g., 12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="vehicleValue" className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Value
                  </label>
                  <input
                    type="number"
                    id="vehicleValue"
                    name="vehicleValue"
                    placeholder="e.g., 50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="vehiclePrimaryUsage" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Usage
                  </label>
                  <select
                    id="vehiclePrimaryUsage"
                    name="vehiclePrimaryUsage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Urban">Urban</option>
                    <option value="Interstate">Interstate</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="wheelchairCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Wheelchair Capacity
                  </label>
                  <input
                    type="number"
                    id="wheelchairCapacity"
                    name="wheelchairCapacity"
                    placeholder="e.g., 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="stretcherCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Stretcher Capacity
                  </label>
                  <input
                    type="number"
                    id="stretcherCapacity"
                    name="stretcherCapacity"
                    placeholder="e.g., 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addVehicle}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Vehicle
                </button>
              </div>
            </div>

            {drivers.length > 0 && (
              <div className="mb-6 overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Drivers</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        First Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Last Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date of Birth
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Hire Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        License Number
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        License State
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Experience (years)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Violations
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        NEMT Certified
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        CPR Certified
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.map((driver, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.firstName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driver.dateOfBirth instanceof Date
                            ? driver.dateOfBirth.toLocaleDateString()
                            : driver.dateOfBirth}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driver.hireDate instanceof Date ? driver.hireDate.toLocaleDateString() : driver.hireDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.licenseNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.licenseState}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.experience}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Array.from(driver.violations)
                            .map((violation: any) => violation.value)
                            .join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driver.nemtCertified ? "Yes" : "No"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {driver.cprCertified ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border border-gray-300 rounded-md p-4 mb-8">
              <h3 className="text-lg font-semibold mb-4">Add New Driver</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="driverFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="driverFirstName"
                    name="driverFirstName"
                    placeholder="e.g., John"
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
                    placeholder="e.g., Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="driverDOB" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    id="driverDOB"
                    name="driverDOB"
                    placeholder="MM/DD/YYYY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="driverHireDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Hire Date
                  </label>
                  <input
                    type="text"
                    id="driverHireDate"
                    name="driverHireDate"
                    placeholder="MM/DD/YYYY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="driverLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    id="driverLicenseNumber"
                    name="driverLicenseNumber"
                    placeholder="e.g., 123456789"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="driverExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    id="driverExperience"
                    name="driverExperience"
                    placeholder="e.g., 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="driverViolations" className="block text-sm font-medium text-gray-700 mb-1">
                    Violations
                  </label>
                  <select />
                </div>

                <div>
                  <label htmlFor="driverViolations" className="block text-sm font-medium text-gray-700 mb-1">
                    Violations
                  </label>
                  <select
                    id="driverViolations"
                    name="driverViolations"
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    size={4}
                  >
                    <option value="Speeding">Speeding</option>
                    <option value="Reckless Driving">Reckless Driving</option>
                    <option value="DUI">DUI</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
                </div>

                <div>
                  <label htmlFor="nemtCertified" className="block text-sm font-medium text-gray-700 mb-1">
                    NEMT Certified
                  </label>
                  <input
                    type="checkbox"
                    id="nemtCertified"
                    name="nemtCertified"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="cprCertified" className="block text-sm font-medium text-gray-700 mb-1">
                    CPR Certified
                  </label>
                  <input
                    type="checkbox"
                    id="cprCertified"
                    name="cprCertified"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addDriver}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Driver
                </button>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
            <p className="text-gray-600 mb-6">Review your application and submit</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Application Summary</h3>
              <p className="text-sm text-gray-700">
                Please review the information provided below before submitting your application.
              </p>
              {/* Summary content goes here */}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
