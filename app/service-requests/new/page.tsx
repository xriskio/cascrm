"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  FileText,
  FileCheck,
  UserPlus,
  Building,
  Car,
  Users,
  DollarSign,
  XCircle,
  ArrowLeft,
  Plane,
} from "lucide-react"
import Link from "next/link"
import { createServiceRequest } from "@/app/actions/service-request-actions"

export default function NewServiceRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestType = searchParams.get("type") || ""

  const [formData, setFormData] = useState({
    clientName: "",
    policyNumber: "",
    effectiveDate: "",
    description: "",
    urgency: "normal",
    attachments: [],
    // Fields for specific request types
    certificateHolder: "",
    additionalInsured: "",
    locationAddress: "",
    vehicleInfo: "",
    driverInfo: "",
    billingDetails: "",
    cancellationReason: "",
    cancellationDate: "",
    airportDetails: "",
    aircraftDetails: "",
    operationsDescription: "",
    filingType: "",
    jurisdictions: "",
    operatingAuthority: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const requestTypeInfo = {
    endorsements: {
      title: "Request Endorsement",
      icon: <FileText className="h-8 w-8" />,
      description: "Use this form to request changes to your existing policy.",
      specificFields: ["description"],
    },
    certificates: {
      title: "Request Certificate of Insurance",
      icon: <FileCheck className="h-8 w-8" />,
      description: "Request a certificate of insurance to provide proof of coverage to a third party.",
      specificFields: ["certificateHolder", "description"],
    },
    "additional-insured": {
      title: "Add Additional Insured",
      icon: <UserPlus className="h-8 w-8" />,
      description: "Request to add another party as an additional insured to your policy.",
      specificFields: ["additionalInsured", "description"],
    },
    locations: {
      title: "Add/Remove Locations",
      icon: <Building className="h-8 w-8" />,
      description: "Update the locations covered by your policy.",
      specificFields: ["locationAddress", "description"],
    },
    vehicles: {
      title: "Add/Remove Vehicles",
      icon: <Car className="h-8 w-8" />,
      description: "Update the vehicles covered by your policy.",
      specificFields: ["vehicleInfo", "description"],
    },
    drivers: {
      title: "Add/Remove Drivers",
      icon: <Users className="h-8 w-8" />,
      description: "Update the authorized drivers on your policy.",
      specificFields: ["driverInfo", "description"],
    },
    billing: {
      title: "Report Billing Issue",
      icon: <DollarSign className="h-8 w-8" />,
      description: "Report and resolve issues with billing or payments.",
      specificFields: ["billingDetails", "description"],
    },
    cancel: {
      title: "Request Policy Cancellation",
      icon: <XCircle className="h-8 w-8" />,
      description: "Request to cancel your existing policy.",
      specificFields: ["cancellationReason", "cancellationDate", "description"],
    },
    "airport-endorsements": {
      title: "Request Airport Endorsement",
      icon: <Plane className="h-8 w-8" />,
      description: "Request endorsements for airport operations and aviation activities.",
      specificFields: ["airportDetails", "aircraftDetails", "operationsDescription", "description"],
    },
    "filing-request": {
      title: "Filing Request",
      icon: <FileText className="h-8 w-8" />,
      description: "Request insurance filings for regulatory compliance.",
      specificFields: ["filingType", "jurisdictions", "operatingAuthority", "description"],
    },
  }

  const currentTypeInfo = requestTypeInfo[requestType as keyof typeof requestTypeInfo] || {
    title: "New Service Request",
    icon: <FileText className="h-8 w-8" />,
    description: "Please select a request type from the previous page.",
    specificFields: [],
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const result = await createServiceRequest({
        type: requestType,
        clientName: formData.clientName,
        policyNumber: formData.policyNumber,
        effectiveDate: formData.effectiveDate,
        description: formData.description,
        urgency: formData.urgency,
        specificData: JSON.stringify({
          certificateHolder: formData.certificateHolder,
          additionalInsured: formData.additionalInsured,
          locationAddress: formData.locationAddress,
          vehicleInfo: formData.vehicleInfo,
          driverInfo: formData.driverInfo,
          billingDetails: formData.billingDetails,
          cancellationReason: formData.cancellationReason,
          cancellationDate: formData.cancellationDate,
          airportDetails: formData.airportDetails,
          aircraftDetails: formData.aircraftDetails,
          operationsDescription: formData.operationsDescription,
          filingType: formData.filingType,
          jurisdictions: formData.jurisdictions,
          operatingAuthority: formData.operatingAuthority,
        }),
      })

      if (result.success) {
        router.push("/service-requests/success?id=" + result.id)
      } else {
        setError(result.error || "Failed to submit request")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render specific fields based on request type
  const renderSpecificFields = () => {
    if (!requestType || !currentTypeInfo) return null

    return (
      <>
        {currentTypeInfo.specificFields.includes("certificateHolder") && (
          <div className="mb-4">
            <label htmlFor="certificateHolder" className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Holder
            </label>
            <input
              type="text"
              id="certificateHolder"
              name="certificateHolder"
              value={formData.certificateHolder}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter certificate holder name and address"
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("additionalInsured") && (
          <div className="mb-4">
            <label htmlFor="additionalInsured" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Insured Details
            </label>
            <input
              type="text"
              id="additionalInsured"
              name="additionalInsured"
              value={formData.additionalInsured}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter name and address of additional insured"
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("locationAddress") && (
          <div className="mb-4">
            <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Location Details
            </label>
            <textarea
              id="locationAddress"
              name="locationAddress"
              value={formData.locationAddress}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter location details to add or remove"
              rows={3}
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("vehicleInfo") && (
          <div className="mb-4">
            <label htmlFor="vehicleInfo" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Information
            </label>
            <textarea
              id="vehicleInfo"
              name="vehicleInfo"
              value={formData.vehicleInfo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter vehicle details (Year, Make, Model, VIN)"
              rows={3}
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("driverInfo") && (
          <div className="mb-4">
            <label htmlFor="driverInfo" className="block text-sm font-medium text-gray-700 mb-1">
              Driver Information
            </label>
            <textarea
              id="driverInfo"
              name="driverInfo"
              value={formData.driverInfo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter driver details (Name, DOB, License #)"
              rows={3}
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("billingDetails") && (
          <div className="mb-4">
            <label htmlFor="billingDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Billing Issue Details
            </label>
            <textarea
              id="billingDetails"
              name="billingDetails"
              value={formData.billingDetails}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Describe the billing issue in detail"
              rows={3}
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("cancellationReason") && (
          <div className="mb-4">
            <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Cancellation
            </label>
            <textarea
              id="cancellationReason"
              name="cancellationReason"
              value={formData.cancellationReason}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Explain why you want to cancel the policy"
              rows={3}
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("cancellationDate") && (
          <div className="mb-4">
            <label htmlFor="cancellationDate" className="block text-sm font-medium text-gray-700 mb-1">
              Requested Cancellation Date
            </label>
            <input
              type="date"
              id="cancellationDate"
              name="cancellationDate"
              value={formData.cancellationDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("airportDetails") && (
          <div className="mb-4">
            <label htmlFor="airportDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Airport Details
            </label>
            <textarea
              id="airportDetails"
              name="airportDetails"
              value={formData.airportDetails}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter airport name, location, and details"
              rows={3}
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("aircraftDetails") && (
          <div className="mb-4">
            <label htmlFor="aircraftDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Aircraft Details
            </label>
            <textarea
              id="aircraftDetails"
              name="aircraftDetails"
              value={formData.aircraftDetails}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter aircraft type, registration, and usage details"
              rows={3}
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("operationsDescription") && (
          <div className="mb-4">
            <label htmlFor="operationsDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Operations Description
            </label>
            <textarea
              id="operationsDescription"
              name="operationsDescription"
              value={formData.operationsDescription}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Describe the aviation operations requiring coverage"
              rows={3}
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("filingType") && (
          <div className="mb-4">
            <label htmlFor="filingType" className="block text-sm font-medium text-gray-700 mb-1">
              Filing Type
            </label>
            <select
              id="filingType"
              name="filingType"
              value={formData.filingType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Filing Type</option>
              <option value="MCS-90">MCS-90 (Motor Carrier)</option>
              <option value="Form E">Form E (Interstate Authority)</option>
              <option value="Form H">Form H (Cargo Insurance)</option>
              <option value="BMC-91X">BMC-91X (Federal)</option>
              <option value="SR-22">SR-22 (Financial Responsibility)</option>
              <option value="Other">Other (Please specify)</option>
            </select>
          </div>
        )}

        {currentTypeInfo.specificFields.includes("jurisdictions") && (
          <div className="mb-4">
            <label htmlFor="jurisdictions" className="block text-sm font-medium text-gray-700 mb-1">
              Jurisdictions
            </label>
            <textarea
              id="jurisdictions"
              name="jurisdictions"
              value={formData.jurisdictions}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter states or jurisdictions where filing is needed"
              rows={3}
            />
          </div>
        )}

        {currentTypeInfo.specificFields.includes("operatingAuthority") && (
          <div className="mb-4">
            <label htmlFor="operatingAuthority" className="block text-sm font-medium text-gray-700 mb-1">
              Operating Authority Number
            </label>
            <input
              type="text"
              id="operatingAuthority"
              name="operatingAuthority"
              value={formData.operatingAuthority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter MC, DOT, or other authority number"
            />
          </div>
        )}
      </>
    )
  }

  if (!requestType) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Please select a request type from the service requests page.</p>
            </div>
          </div>
        </div>
        <Link href="/service-requests" className="inline-flex items-center text-orange-500 hover:text-orange-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Service Requests
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/service-requests" className="inline-flex items-center text-orange-500 hover:text-orange-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Service Requests
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <div className="bg-orange-100 p-3 rounded-full mr-4">{currentTypeInfo.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{currentTypeInfo.title}</h1>
            <p className="text-gray-600">{currentTypeInfo.description}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter client name"
                required
              />
            </div>

            <div>
              <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Policy Number
              </label>
              <input
                type="text"
                id="policyNumber"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter policy number"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date
            </label>
            <input
              type="date"
              id="effectiveDate"
              name="effectiveDate"
              value={formData.effectiveDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {renderSpecificFields()}

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Provide any additional details about your request"
              rows={4}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="low">Low - Within 3-5 business days</option>
              <option value="normal">Normal - Within 1-2 business days</option>
              <option value="high">High - Same business day</option>
              <option value="urgent">Urgent - ASAP (within hours)</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-orange-500 hover:text-orange-400"
                  >
                    <span>Upload files</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/service-requests" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2">
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
