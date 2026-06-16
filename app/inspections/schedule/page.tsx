"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createInspection } from "@/app/actions/inspection-actions"

export default function ScheduleInspectionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>()
  const [nocDate, setNocDate] = useState<Date | undefined>()

  const policyTypes = [
    "Commercial Property",
    "General Liability",
    "Commercial Auto",
    "Workers' Compensation",
    "Professional Liability",
    "Cyber Liability",
    "Business Owners Policy",
    "Umbrella/Excess Liability",
    "Inland Marine",
    "Crime",
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const formValues = Object.fromEntries(formData.entries())

      // Prepare inspection data
      const inspectionData = {
        namedInsured: formValues.namedInsured,
        policyNumber: formValues.policyNumber,
        effectiveDate: effectiveDate ? format(effectiveDate, "yyyy-MM-dd") : null,
        nocDate: nocDate ? format(nocDate, "yyyy-MM-dd") : null,
        insuranceCompany: formValues.insuranceCompany,
        policyType: formValues.policyType,
        contactCompany: formValues.contactCompany,
        contactName: formValues.contactName,
        contactPhone: formValues.contactPhone,
        contactEmail: formValues.contactEmail,
        notes: formValues.notes,
      }

      // Create inspection request
      const result = await createInspection(inspectionData)

      if (result.success) {
        toast.success(`Inspection scheduled successfully! Tracking #: ${result.inspectionNumber}`)
        router.push("/inspections")
      } else {
        throw new Error(result.error || "Failed to create inspection")
      }
    } catch (error) {
      console.error("Error scheduling inspection:", error)
      toast.error(error instanceof Error ? error.message : "Failed to schedule inspection. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Schedule New Inspection</h1>
        <button
          onClick={() => router.push("/inspections")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          Back to Inspections
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="namedInsured" className="block text-sm font-medium text-gray-700">
                Named Insured *
              </label>
              <input
                id="namedInsured"
                name="namedInsured"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">
                Policy Number *
              </label>
              <input
                id="policyNumber"
                name="policyNumber"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700">
                Effective Date *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="effectiveDate"
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-start px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                      !effectiveDate && "text-gray-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {effectiveDate ? format(effectiveDate, "PPP") : "Select date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={effectiveDate} onSelect={setEffectiveDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label htmlFor="nocDate" className="block text-sm font-medium text-gray-700">
                NOC Date (Notice of Cancellation)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    id="nocDate"
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-start px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                      !nocDate && "text-gray-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nocDate ? format(nocDate, "PPP") : "Select date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={nocDate} onSelect={setNocDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label htmlFor="insuranceCompany" className="block text-sm font-medium text-gray-700">
                Insurance Company Name *
              </label>
              <input
                id="insuranceCompany"
                name="insuranceCompany"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="policyType" className="block text-sm font-medium text-gray-700">
                Type of Policy *
              </label>
              <select
                id="policyType"
                name="policyType"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select Policy Type</option>
                {policyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium mb-4">Inspection Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="contactCompany" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  id="contactCompany"
                  name="contactCompany"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                  Contact Name *
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/inspections")}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Inspection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
