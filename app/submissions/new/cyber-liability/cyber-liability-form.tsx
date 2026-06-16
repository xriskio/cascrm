"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitApplication } from "@/app/actions/submit-application"
import Link from "next/link"

// Function to generate a unique submission number
function generateSubmissionNumber() {
  const prefix = "SUB"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}

export default function CyberLiabilityForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Prepare the data object
      const formDataObj: Record<string, any> = {}
      formData.forEach((value, key) => {
        formDataObj[key] = value
      })

      // Generate submission number
      const submissionNumber = generateSubmissionNumber()

      // Create submission data matching database schema
      const submissionData = {
        submission_number: submissionNumber,
        insurance_type: "cyber-liability",
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
        throw new Error(`Submission failed: ${result.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error("Error submitting cyber liability form:", err)
      alert("There was a problem submitting the form.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cyber Liability Submission</h1>
        <Link href="/submissions/new" className="text-blue-600 hover:text-blue-800">
          Change Insurance Type
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700">
            Effective Date *
          </label>
          <input
            type="date"
            id="effectiveDate"
            name="effectiveDate"
            required
            className="w-full p-2 border rounded"
            placeholder="mm/dd/yyyy"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
            Expiration Date (if applicable)
          </label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            className="w-full p-2 border rounded"
            placeholder="mm/dd/yyyy"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="currentCarrier" className="block text-sm font-medium text-gray-700">
            Current Cyber Liability Carrier
          </label>
          <input
            type="text"
            id="currentCarrier"
            name="currentCarrier"
            className="w-full p-2 border rounded"
            placeholder="Enter current carrier"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="currentPremium" className="block text-sm font-medium text-gray-700">
            Current Premium
          </label>
          <input
            type="number"
            id="currentPremium"
            name="currentPremium"
            className="w-full p-2 border rounded"
            placeholder="Enter current premium"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <fieldset className="border p-4 rounded-md">
        <legend className="font-semibold px-2">Business Information</legend>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
              Business Description *
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              required
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Describe the nature of your business operations"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700">
                Years in Business *
              </label>
              <input
                type="number"
                id="yearsInBusiness"
                name="yearsInBusiness"
                required
                className="w-full p-2 border rounded"
                placeholder="Enter years in business"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700">
                Annual Revenue *
              </label>
              <input
                type="number"
                id="annualRevenue"
                name="annualRevenue"
                required
                className="w-full p-2 border rounded"
                placeholder="Enter annual revenue"
                min="0"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700">
                Number of Employees *
              </label>
              <input
                type="number"
                id="numberOfEmployees"
                name="numberOfEmployees"
                required
                className="w-full p-2 border rounded"
                placeholder="Enter number of employees"
                min="0"
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="border p-4 rounded-md">
        <legend className="font-semibold px-2">Coverage Information</legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="coverageLimit" className="block text-sm font-medium text-gray-700">
              Coverage Limit *
            </label>
            <select id="coverageLimit" name="coverageLimit" required className="w-full p-2 border rounded">
              <option value="">Select coverage limit</option>
              <option value="250000">$250,000</option>
              <option value="500000">$500,000</option>
              <option value="1000000">$1,000,000</option>
              <option value="2000000">$2,000,000</option>
              <option value="5000000">$5,000,000</option>
              <option value="10000000">$10,000,000</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="deductible" className="block text-sm font-medium text-gray-700">
              Deductible *
            </label>
            <select id="deductible" name="deductible" required className="w-full p-2 border rounded">
              <option value="">Select deductible</option>
              <option value="1000">$1,000</option>
              <option value="2500">$2,500</option>
              <option value="5000">$5,000</option>
              <option value="10000">$10,000</option>
              <option value="25000">$25,000</option>
              <option value="50000">$50,000</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="border p-4 rounded-md">
        <legend className="font-semibold px-2">Security Measures</legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="dataEncryption" className="block text-sm font-medium text-gray-700">
              Data Encryption *
            </label>
            <select id="dataEncryption" name="dataEncryption" required className="w-full p-2 border rounded">
              <option value="">Select option</option>
              <option value="full">Full encryption</option>
              <option value="partial">Partial encryption</option>
              <option value="none">No encryption</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="multiFactorAuth" className="block text-sm font-medium text-gray-700">
              Multi-Factor Authentication *
            </label>
            <select id="multiFactorAuth" name="multiFactorAuth" required className="w-full p-2 border rounded">
              <option value="">Select option</option>
              <option value="all">All systems</option>
              <option value="critical">Critical systems only</option>
              <option value="none">Not implemented</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="securityTraining" className="block text-sm font-medium text-gray-700">
              Employee Security Training *
            </label>
            <select id="securityTraining" name="securityTraining" required className="w-full p-2 border rounded">
              <option value="">Select option</option>
              <option value="quarterly">Quarterly</option>
              <option value="biannual">Bi-annual</option>
              <option value="annual">Annual</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="incidentResponsePlan" className="block text-sm font-medium text-gray-700">
              Incident Response Plan *
            </label>
            <select
              id="incidentResponsePlan"
              name="incidentResponsePlan"
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select option</option>
              <option value="formal">Formal plan with regular testing</option>
              <option value="documented">Documented but not tested</option>
              <option value="informal">Informal plan</option>
              <option value="none">No plan</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="dataBackupFrequency" className="block text-sm font-medium text-gray-700">
              Data Backup Frequency *
            </label>
            <select id="dataBackupFrequency" name="dataBackupFrequency" required className="w-full p-2 border rounded">
              <option value="">Select option</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="irregular">Irregular</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="sensitiveDataStored" className="block text-sm font-medium text-gray-700">
              Sensitive Data Stored *
            </label>
            <select id="sensitiveDataStored" name="sensitiveDataStored" required className="w-full p-2 border rounded">
              <option value="">Select option</option>
              <option value="pii">Personal Identifiable Information (PII)</option>
              <option value="phi">Protected Health Information (PHI)</option>
              <option value="pci">Payment Card Information (PCI)</option>
              <option value="multiple">Multiple types</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="border p-4 rounded-md">
        <legend className="font-semibold px-2">Compliance</legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="pciCompliant" className="block text-sm font-medium text-gray-700">
              PCI DSS Compliant *
            </label>
            <select id="pciCompliant" name="pciCompliant" required className="w-full p-2 border rounded">
              <option value="">Select option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="na">Not Applicable</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="hipaaCompliant" className="block text-sm font-medium text-gray-700">
              HIPAA Compliant *
            </label>
            <select id="hipaaCompliant" name="hipaaCompliant" required className="w-full p-2 border rounded">
              <option value="">Select option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="na">Not Applicable</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="border p-4 rounded-md">
        <legend className="font-semibold px-2">Claims History</legend>

        <div className="space-y-2">
          <label htmlFor="claimsHistory" className="block text-sm font-medium text-gray-700">
            Claims History (Last 5 Years)
          </label>
          <textarea
            id="claimsHistory"
            name="claimsHistory"
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Provide details of any cyber incidents or claims in the last 5 years"
          ></textarea>
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
          Additional Information
        </label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Enter any additional information about this submission"
        ></textarea>
      </div>

      <div className="flex justify-between">
        <Link
          href="/submissions/new"
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Cyber Liability Application"}
        </button>
      </div>
    </form>
  )
}
