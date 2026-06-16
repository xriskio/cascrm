"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitApplication } from "@/app/actions/submit-application"

export default function ExcessLiabilityForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("insuranceType", "excess-liability")

      const result = await submitApplication(formData)

      if (result?.submissionNumber) {
        router.push(`/submissions/success?submissionNumber=${result.submissionNumber}`)
      } else {
        throw new Error("Submission failed without a submission number")
      }
    } catch (err) {
      console.error("Error submitting excess liability form:", err)
      alert("There was a problem submitting the form.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Submit Excess Insurance Risk</h1>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold">Insured Information</legend>
        <input name="insuredName" placeholder="Insured Name" required className="w-full p-2 border rounded" />
        <input name="dba" placeholder="DBA (if applicable)" className="w-full p-2 border rounded" />
        <input name="contactName" placeholder="Contact Name" required className="w-full p-2 border rounded" />
        <input
          type="email"
          name="contactEmail"
          placeholder="Contact Email"
          required
          className="w-full p-2 border rounded"
        />
        <input name="contactPhone" placeholder="Contact Phone" required className="w-full p-2 border rounded" />
        <input name="website" placeholder="Business Website (https://)" className="w-full p-2 border rounded" />
        <input
          name="yearsInBusiness"
          placeholder="Years in Business"
          type="number"
          className="w-full p-2 border rounded"
        />
        <input name="fein" placeholder="FEIN/Tax ID" className="w-full p-2 border rounded" />
        <input name="address" placeholder="Mailing Address" className="w-full p-2 border rounded" />
        <input name="city" placeholder="City" className="w-full p-2 border rounded" />
        <input name="state" placeholder="State" className="w-full p-2 border rounded" />
        <input name="zip" placeholder="ZIP Code" className="w-full p-2 border rounded" />
        <input name="businessType" placeholder="Type of Business" className="w-full p-2 border rounded" />
        <textarea
          name="businessDescription"
          placeholder="Business Description"
          className="w-full p-2 border rounded"
        ></textarea>
      </fieldset>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold">Auto Liability Policy</legend>
        <input name="autoCarrier" placeholder="Insurance Carrier" className="w-full p-2 border rounded" />
        <input name="autoLimit" placeholder="Policy Limit" className="w-full p-2 border rounded" />
        <input
          type="date"
          name="autoEffectiveDate"
          placeholder="Effective Date"
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          name="autoExpirationDate"
          placeholder="Expiration Date"
          className="w-full p-2 border rounded"
        />
        <input
          name="autoPremium"
          placeholder="Annual Premium ($)"
          type="number"
          className="w-full p-2 border rounded"
        />
        <input name="autoDeductible" placeholder="Deductible ($)" type="number" className="w-full p-2 border rounded" />
      </fieldset>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold">General Liability Policy</legend>
        <input name="glCarrier" placeholder="Insurance Carrier" className="w-full p-2 border rounded" />
        <input name="glLimit" placeholder="Policy Limit" className="w-full p-2 border rounded" />
        <input type="date" name="glEffectiveDate" className="w-full p-2 border rounded" />
        <input type="date" name="glExpirationDate" className="w-full p-2 border rounded" />
        <input name="glPremium" placeholder="Annual Premium ($)" type="number" className="w-full p-2 border rounded" />
        <input name="glDeductible" placeholder="Deductible ($)" type="number" className="w-full p-2 border rounded" />
      </fieldset>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold">Excess Coverage Information</legend>
        <input
          type="date"
          name="excessEffectiveDate"
          placeholder="Effective Date"
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          name="excessExpirationDate"
          placeholder="Expiration Date"
          className="w-full p-2 border rounded"
        />
        <input name="excessLimitRequested" placeholder="Excess Limit Requested" className="w-full p-2 border rounded" />
        <input
          name="currentExcessCarrier"
          placeholder="Current Excess Carrier (if any)"
          className="w-full p-2 border rounded"
        />
        <input
          name="currentExcessPremium"
          placeholder="Current Excess Premium ($)"
          type="number"
          className="w-full p-2 border rounded"
        />
        <input name="currentExcessLimit" placeholder="Current Excess Limit" className="w-full p-2 border rounded" />
      </fieldset>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold">Operations Information</legend>
        <input
          name="totalVehicles"
          placeholder="Total Number of Vehicles"
          type="number"
          className="w-full p-2 border rounded"
        />
        <input
          name="totalDrivers"
          placeholder="Total Number of Drivers"
          type="number"
          className="w-full p-2 border rounded"
        />
        <input
          name="operatingRadius"
          placeholder="Operating Radius (miles)"
          type="number"
          className="w-full p-2 border rounded"
        />
        <input
          name="statesOfOperation"
          placeholder="States of Operation (e.g., CA, NY)"
          className="w-full p-2 border rounded"
        />
        <input name="annualMileage" placeholder="Annual Mileage" type="number" className="w-full p-2 border rounded" />
        <input
          name="annualRevenue"
          placeholder="Annual Revenue ($)"
          type="number"
          className="w-full p-2 border rounded"
        />
      </fieldset>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold">Claims History</legend>
        <input
          name="numClaims"
          placeholder="Number of Claims in Last 5 Years"
          type="number"
          className="w-full p-2 border rounded"
        />
        <input
          name="totalIncurred"
          placeholder="Total Incurred Amount ($)"
          type="number"
          className="w-full p-2 border rounded"
        />
        <input
          name="largestClaim"
          placeholder="Largest Claim Amount ($)"
          type="number"
          className="w-full p-2 border rounded"
        />
        <textarea
          name="claimDescription"
          placeholder="Brief Description of Largest Claim"
          className="w-full p-2 border rounded"
        ></textarea>
      </fieldset>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold">Document Upload</legend>
        <input type="file" name="lossRuns" multiple className="w-full p-2 border rounded" />
        <input type="file" name="autoDeclarations" multiple className="w-full p-2 border rounded" />
        <input type="file" name="glDeclarations" multiple className="w-full p-2 border rounded" />
        <input type="file" name="excessDeclarations" multiple className="w-full p-2 border rounded" />
        <input type="file" name="vehicleSchedule" multiple className="w-full p-2 border rounded" />
        <input type="file" name="additionalDocs" multiple className="w-full p-2 border rounded" />
      </fieldset>

      <textarea
        name="additionalComments"
        placeholder="Additional Comments"
        className="w-full p-2 border rounded"
      ></textarea>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
      >
        {isSubmitting ? "Submitting..." : "Submit Excess Insurance Risk"}
      </button>
    </form>
  )
}
