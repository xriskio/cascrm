"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Plus } from "lucide-react"
import { US_STATES } from "@/lib/states"
import { submitApplication } from "@/app/actions/submit-application"
import FileUploadExtractor from "./file-upload-extractor"

interface PublicAutoFormProps {
  insuranceType: string
}

export default function PublicAutoForm({ insuranceType }: PublicAutoFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Business Information
  const [companyName, setCompanyName] = useState("")
  const [dba, setDba] = useState("")
  const [contactName, setContactName] = useState("")
  const [yearsInBusiness, setYearsInBusiness] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [website, setWebsite] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [address, setAddress] = useState("")
  const [city, setState] = useState("")
  const [state, setState1] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [cpucNumber, setCpucNumber] = useState("")
  const [tcpNumber, setTcpNumber] = useState("")
  // Add DOT and MC numbers if they exist in state
  const [dotNumber, setDotNumber] = useState("")
  const [mcNumber, setMcNumber] = useState("")

  // Coverage & History
  const [liabilityLimit, setLiabilityLimit] = useState("")
  const [uninsuredMotoristLimit, setUninsuredMotoristLimit] = useState("")
  const [medicalPaymentLimit, setMedicalPaymentLimit] = useState("")
  const [includePhysicalDamage, setIncludePhysicalDamage] = useState(false)
  const [hiredAutoCoverage, setHiredAutoCoverage] = useState(false)
  const [nonOwnedAutoCoverage, setNonOwnedAutoCoverage] = useState(false)
  const [newVenture, setNewVenture] = useState(false)
  const [currentInsuranceCarrier, setCurrentInsuranceCarrier] = useState("")
  const [currentAnnualPremium, setCurrentAnnualPremium] = useState("")
  const [priorInsuranceCarrier, setPriorInsuranceCarrier] = useState("")
  const [reasonForChange, setReasonForChange] = useState("")
  // Add prior carrier if it exists
  const [priorCarrier, setPriorCarrier] = useState("")

  // Operations & Risk
  const [operationsType, setOperationsType] = useState<string[]>([])
  const [serviceArea, setServiceArea] = useState("")
  const [operatingRadius, setOperatingRadius] = useState("")
  const [tripTypes, setTripTypes] = useState<string[]>([])
  const [airportTransportationPercentage, setAirportTransportationPercentage] = useState("")
  const [passengerCapacities, setPassengerCapacities] = useState<string[]>([])
  const [annualMiles, setAnnualMiles] = useState("")
  const [urbanDriving, setUrbanDriving] = useState(0)
  const [interstateDriving, setInterstateDriving] = useState(0)
  const [nighttimeOperations, setNighttimeOperations] = useState(false)
  const [specialEvents, setSpecialEvents] = useState(false)

  // Claims, Vehicles, Drivers
  const [effectiveDate, setEffectiveDate] = useState<Date>()
  const [expirationDate, setExpirationDate] = useState<Date>()
  const [claimDate, setClaimDate] = useState<Date>()
  const [claims, setClaims] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  // Add coverage limits if they exist
  const [coverageLimits, setCoverageLimits] = useState<any>()

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
      const formData = new FormData()

      // Manually append all form data
      // Business Information
      formData.append("companyName", companyName)
      formData.append("dba", dba)
      formData.append("contactName", contactName)
      formData.append("yearsInBusiness", yearsInBusiness)
      formData.append("email", email)
      formData.append("phoneNumber", phoneNumber)
      formData.append("website", website)
      formData.append("businessType", businessType)
      formData.append("address", address)
      formData.append("city", city)
      formData.append("state", state)
      formData.append("zipCode", zipCode)
      formData.append("cpucNumber", cpucNumber)
      formData.append("tcpNumber", tcpNumber)
      // Add DOT and MC numbers if they exist in state
      formData.append("dotNumber", dotNumber || "")
      formData.append("mcNumber", mcNumber || "")

      // Coverage & History
      formData.append("liabilityLimit", liabilityLimit)
      formData.append("uninsuredMotoristLimit", uninsuredMotoristLimit)
      formData.append("medicalPaymentLimit", medicalPaymentLimit)
      formData.append("includePhysicalDamage", includePhysicalDamage.toString())
      formData.append("hiredAutoCoverage", hiredAutoCoverage.toString())
      formData.append("nonOwnedAutoCoverage", nonOwnedAutoCoverage.toString())
      formData.append("newVenture", newVenture.toString())
      formData.append("currentInsuranceCarrier", currentInsuranceCarrier)
      formData.append("currentAnnualPremium", currentAnnualPremium)
      formData.append("priorInsuranceCarrier", priorInsuranceCarrier)
      formData.append("reasonForChange", reasonForChange)
      // Add prior carrier if it exists
      formData.append("priorCarrier", priorCarrier || "")

      // Operations & Risk
      formData.append("operationsType", operationsType.join(","))
      formData.append("serviceArea", serviceArea)
      formData.append("operatingRadius", operatingRadius)
      formData.append("tripTypes", tripTypes.join(","))
      formData.append("airportTransportationPercentage", airportTransportationPercentage)
      formData.append("passengerCapacities", passengerCapacities.join(","))
      formData.append("annualMiles", annualMiles)
      formData.append("urbanDriving", urbanDriving.toString())
      formData.append("interstateDriving", interstateDriving.toString())
      formData.append("nighttimeOperations", nighttimeOperations.toString())
      formData.append("specialEvents", specialEvents.toString())

      // Dates
      formData.append("effectiveDate", effectiveDate ? effectiveDate.toISOString() : "")
      formData.append("expirationDate", expirationDate ? expirationDate.toISOString() : "")

      // Complex objects
      formData.append("claims", JSON.stringify(claims))
      formData.append("vehicles", JSON.stringify(vehicles))
      formData.append("drivers", JSON.stringify(drivers))
      formData.append("insuranceType", insuranceType)
      // Add coverage limits if they exist
      if (typeof coverageLimits !== "undefined") {
        formData.append("coverageLimits", JSON.stringify(coverageLimits))
      }

      // Generate a submission number
      const submissionNumber = `SUB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`

      // Convert FormData to a regular object and add required fields
      const submissionData = {
        submission_number: submissionNumber,
        insurance_type: insuranceType,
        status: "pending",
        form_data: Object.fromEntries(formData),
        created_at: new Date().toISOString(),
      }

      const result = await submitApplication(submissionData)

      if (result.success) {
        router.push(`/submissions/success?submissionNumber=${submissionNumber}&submissionId=${result.submissionId}`)
      } else {
        console.error("Submission error:", result.error)
        throw new Error(`Error submitting form: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("There was an error submitting the application.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addClaim = () => {
    if (!claimDate) return

    const newClaim = {
      date: claimDate,
      amount: ((document as any).getElementById("claimAmount") as HTMLInputElement)?.value || "0",
      description: ((document as any).getElementById("claimDescription") as HTMLTextAreaElement)?.value || "",
      status: ((document as any).getElementById("claimStatus") as HTMLSelectElement)?.value || "Open",
    }

    setClaims([...claims, newClaim])
    setClaimDate(undefined)

    // Reset form fields
    if ((document as any).getElementById("claimAmount") as HTMLInputElement)
      ((document as any).getElementById("claimAmount") as HTMLInputElement).value = ""
    if ((document as any).getElementById("claimDescription") as HTMLTextAreaElement)
      ((document as any).getElementById("claimDescription") as HTMLTextAreaElement).value = ""
    if ((document as any).getElementById("claimStatus") as HTMLSelectElement)
      ((document as any).getElementById("claimStatus") as HTMLSelectElement).value = "Open"
  }

  const addVehicle = () => {
    const newVehicle = {
      year: ((document as any).getElementById("vehicleYear") as HTMLInputElement)?.value || "",
      make: ((document as any).getElementById("vehicleMake") as HTMLInputElement)?.value || "",
      model: ((document as any).getElementById("vehicleModel") as HTMLInputElement)?.value || "",
      vin: ((document as any).getElementById("vehicleVin") as HTMLInputElement)?.value || "",
      seatingCapacity: ((document as any).getElementById("vehicleSeatingCapacity") as HTMLInputElement)?.value || "0",
      value: ((document as any).getElementById("vehicleValue") as HTMLInputElement)?.value || "0",
      primaryUsage: ((document as any).getElementById("vehiclePrimaryUsage") as HTMLSelectElement)?.value || "",
    }

    setVehicles([...vehicles, newVehicle])

    // Reset form fields
    if ((document as any).getElementById("vehicleYear") as HTMLInputElement)
      ((document as any).getElementById("vehicleYear") as HTMLInputElement).value = ""
    if ((document as any).getElementById("vehicleMake") as HTMLInputElement)
      ((document as any).getElementById("vehicleMake") as HTMLInputElement).value = ""
    if ((document as any).getElementById("vehicleModel") as HTMLInputElement)
      ((document as any).getElementById("vehicleModel") as HTMLInputElement).value = ""
    if ((document as any).getElementById("vehicleVin") as HTMLInputElement)
      ((document as any).getElementById("vehicleVin") as HTMLInputElement).value = ""
    if ((document as any).getElementById("vehicleSeatingCapacity") as HTMLInputElement)
      ((document as any).getElementById("vehicleSeatingCapacity") as HTMLInputElement).value = "0"
    if ((document as any).getElementById("vehicleValue") as HTMLInputElement)
      ((document as any).getElementById("vehicleValue") as HTMLInputElement).value = "0"
    if ((document as any).getElementById("vehiclePrimaryUsage") as HTMLSelectElement)
      ((document as any).getElementById("vehiclePrimaryUsage") as HTMLSelectElement).value = ""
  }

  const addDriver = () => {
    const newDriver = {
      firstName: ((document as any).getElementById("driverFirstName") as HTMLInputElement)?.value || "",
      lastName: ((document as any).getElementById("driverLastName") as HTMLInputElement)?.value || "",
      dateOfBirth: ((document as any).getElementById("driverDOB") as HTMLInputElement)?.value || "",
      hireDate: ((document as any).getElementById("driverHireDate") as HTMLInputElement)?.value || "",
      licenseNumber: ((document as any).getElementById("driverLicenseNumber") as HTMLInputElement)?.value || "",
      licenseState: ((document as any).getElementById("driverLicenseState") as HTMLSelectElement)?.value || "",
      experience: ((document as any).getElementById("driverExperience") as HTMLInputElement)?.value || "0",
      violations: ((document as any).getElementById("driverViolations") as HTMLSelectElement)?.selectedOptions || [],
    }

    setDrivers([...drivers, newDriver])

    // Reset form fields
    if ((document as any).getElementById("driverFirstName") as HTMLInputElement)
      ((document as any).getElementById("driverFirstName") as HTMLInputElement).value = ""
    if ((document as any).getElementById("driverLastName") as HTMLInputElement)
      ((document as any).getElementById("driverLastName") as HTMLInputElement).value = ""
    if ((document as any).getElementById("driverDOB") as HTMLInputElement)
      ((document as any).getElementById("driverDOB") as HTMLInputElement).value = ""
    if ((document as any).getElementById("driverHireDate") as HTMLInputElement)
      ((document as any).getElementById("driverHireDate") as HTMLInputElement).value = ""
    if ((document as any).getElementById("driverLicenseNumber") as HTMLInputElement)
      ((document as any).getElementById("driverLicenseNumber") as HTMLInputElement).value = ""
    if ((document as any).getElementById("driverLicenseState") as HTMLSelectElement)
      ((document as any).getElementById("driverLicenseState") as HTMLSelectElement).value = ""
    if ((document as any).getElementById("driverExperience") as HTMLInputElement)
      ((document as any).getElementById("driverExperience") as HTMLInputElement).value = "0"
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

  // Handle multi-select changes
  const handleOperationsTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((option) => option.value)
    setOperationsType(options)
  }

  const handleTripTypesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((option) => option.value)
    setTripTypes(options)
  }

  const handlePassengerCapacitiesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((option) => option.value)
    setPassengerCapacities(options)
  }

  // Handler for file upload extractor
  const handleDataExtracted = (extractedData: Record<string, any>) => {
    let fieldsPopulated = 0
    
    // Populate business information fields
    if (extractedData.businessName) { setCompanyName(extractedData.businessName); fieldsPopulated++ }
    if (extractedData.dba) { setDba(extractedData.dba); fieldsPopulated++ }
    if (extractedData.contactName) { setContactName(extractedData.contactName); fieldsPopulated++ }
    if (extractedData.yearsInBusiness) { setYearsInBusiness(extractedData.yearsInBusiness.toString()); fieldsPopulated++ }
    if (extractedData.email) { setEmail(extractedData.email); fieldsPopulated++ }
    if (extractedData.phoneNumber) { setPhoneNumber(extractedData.phoneNumber); fieldsPopulated++ }
    if (extractedData.website) { setWebsite(extractedData.website); fieldsPopulated++ }
    if (extractedData.businessType) { setBusinessType(extractedData.businessType); fieldsPopulated++ }
    if (extractedData.address) { setAddress(extractedData.address); fieldsPopulated++ }
    if (extractedData.city) { setState(extractedData.city); fieldsPopulated++ }
    if (extractedData.state) { setState1(extractedData.state); fieldsPopulated++ }
    if (extractedData.zipCode) { setZipCode(extractedData.zipCode); fieldsPopulated++ }
    
    // Coverage limits
    if (extractedData.dealerOpenLotLimit || extractedData.garageLiabilityLimit) {
      setLiabilityLimit(extractedData.dealerOpenLotLimit || extractedData.garageLiabilityLimit)
      fieldsPopulated++
    }
    if (extractedData.uninsuredMotoristLimit) { setUninsuredMotoristLimit(extractedData.uninsuredMotoristLimit); fieldsPopulated++ }
    if (extractedData.medicalPaymentLimit) { setMedicalPaymentLimit(extractedData.medicalPaymentLimit); fieldsPopulated++ }
    
    // Insurance information
    if (extractedData.currentCarrier) { setCurrentInsuranceCarrier(extractedData.currentCarrier); fieldsPopulated++ }
    if (extractedData.currentPremium) { setCurrentAnnualPremium(extractedData.currentPremium.toString()); fieldsPopulated++ }
    
    // Note: Sales figures, vehicle lists, and claims history are not yet supported
    // These would require additional state variables and more complex parsing
    
    // Show success message
    alert(`Successfully populated ${fieldsPopulated} fields from the uploaded file!\n\nNote: Currently supports business information and basic coverage fields only.`)
  }

  const [defaultNoAnswers, setDefaultNoAnswers] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* File Upload Extractor */}
      <FileUploadExtractor onDataExtracted={handleDataExtracted} />
      
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
            <p className="text-gray-600 mb-6">Basic information about your business</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
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
                  value={dba}
                  onChange={(e) => setDba(e.target.value)}
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
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
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
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
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
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
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
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
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
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
                  value={city}
                  onChange={(e) => setState(e.target.value)}
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
                  value={state}
                  onChange={(e) => setState1(e.target.value)}
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
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="cpucNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  CPUC Number (if applicable)
                </label>
                <input
                  type="text"
                  id="cpucNumber"
                  name="cpucNumber"
                  value={cpucNumber}
                  onChange={(e) => setCpucNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="tcpNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  TCP Number (if applicable)
                </label>
                <input
                  type="text"
                  id="tcpNumber"
                  name="tcpNumber"
                  value={tcpNumber}
                  onChange={(e) => setTcpNumber(e.target.value)}
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
                  value={liabilityLimit}
                  onChange={(e) => setLiabilityLimit(e.target.value)}
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
                  value={uninsuredMotoristLimit}
                  onChange={(e) => setUninsuredMotoristLimit(e.target.value)}
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
                  value={medicalPaymentLimit}
                  onChange={(e) => setMedicalPaymentLimit(e.target.value)}
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

            <h3 className="text-lg font-semibold mt-8 mb-2">Prior Carrier Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="priorInsuranceCarrier" className="block text-sm font-medium text-gray-700 mb-1">
                  Prior Insurance Carrier
                </label>
                <input
                  type="text"
                  id="priorInsuranceCarrier"
                  name="priorInsuranceCarrier"
                  value={priorInsuranceCarrier}
                  onChange={(e) => setPriorInsuranceCarrier(e.target.value)}
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
                  value={reasonForChange}
                  onChange={(e) => setReasonForChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

            <h3 className="text-lg font-semibold mb-4">Business Operations</h3>

            <div className="mb-6">
              <label htmlFor="operationsType" className="block text-sm font-medium text-gray-700 mb-1">
                Type of Operations<span className="text-red-500">*</span>
              </label>
              <select
                id="operationsType"
                name="operationsType"
                multiple
                value={operationsType}
                onChange={handleOperationsTypeChange}
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
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
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
                  value={operatingRadius}
                  onChange={(e) => setOperatingRadius(e.target.value)}
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
                value={tripTypes}
                onChange={handleTripTypesChange}
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
                  value={airportTransportationPercentage}
                  onChange={(e) => setAirportTransportationPercentage(e.target.value)}
                  min="0"
                  max="100"
                  required
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter a percentage between 0 and 100</p>
            </div>

            <div className="mb-6">
              <label htmlFor="passengerCapacities" className="block text-sm font-medium text-gray-700 mb-1">
                Passenger Capacities<span className="text-red-500">*</span>
              </label>
              <select
                id="passengerCapacities"
                name="passengerCapacities"
                multiple
                value={passengerCapacities}
                onChange={handlePassengerCapacitiesChange}
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
                  value={annualMiles}
                  onChange={(e) => setAnnualMiles(e.target.value)}
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

            <h3 className="text-lg font-semibold mt-8 mb-4">Special Risk Considerations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nighttimeOperations"
                  name="nighttimeOperations"
                  checked={nighttimeOperations}
                  onChange={(e) => setNighttimeOperations(e.target.checked)}
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
                  checked={specialEvents}
                  onChange={(e) => setSpecialEvents(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="specialEvents" className="ml-2 block text-sm text-gray-700">
                  Special Events (concerts, sporting events, etc.)
                </label>
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
                        Experience
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Violations
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
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    <option value="DWI">DWI</option>
                    <option value="Hit and Run">Hit and Run</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
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
                  onChange={(e) => setDefaultNoAnswers(e.target.checked)}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("aircraft_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("aircraft_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("hazardous_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("hazardous_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("underground_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("underground_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("barges_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("barges_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("otherBusiness_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("otherBusiness_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("subcontractors_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("subcontractors_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("workSublet_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("workSublet_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("safetyProgram_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("safetyProgram_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("groupTransportation_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("groupTransportation_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("seasonalEmployees_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("seasonalEmployees_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("volunteerLabor_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("volunteerLabor_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("travelOutOfState_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("travelOutOfState_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("athleticTeams_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("athleticTeams_yes")?.checked}
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
                      checked={!defaultNoAnswers && (document as any).getElementById("physicals_yes")?.checked}
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
                      checked={defaultNoAnswers || !(document as any).getElementById("physicals_yes")?.checked}
                    />
                    <label htmlFor="physicals_no" className="ml-2 block text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
          )}
          {currentStep < totalSteps && (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          )}
          {currentStep === totalSteps && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
