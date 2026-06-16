"use client"
import { useState, useCallback } from "react"

export function usePolicyForms() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Map policy types to their form routes
  const policyFormMap: Record<string, string> = {
    auto: "/renewals/forms/auto",
    "commercial auto": "/renewals/forms/commercial-auto",
    "general liability": "/renewals/forms/general-liability",
    "workers comp": "/renewals/forms/workers-comp",
    property: "/renewals/forms/property",
    "commercial property": "/renewals/forms/commercial-property",
    umbrella: "/renewals/forms/umbrella",
    "professional liability": "/renewals/forms/professional-liability",
    cyber: "/renewals/forms/cyber",
    bop: "/renewals/forms/business-owners-policy",
    "business owners policy": "/renewals/forms/business-owners-policy",
    // Add more policy types as needed
  }

  const getPolicyForm = useCallback((policyType: string) => {
    const normalizedType = policyType.toLowerCase()
    return policyFormMap[normalizedType] || "/renewals/forms/generic"
  }, [])

  const getPolicyFormFields = useCallback((policyType: string) => {
    const fieldMappings = {
      "commercial-auto": ["business_name", "vehicle_count", "driver_count", "coverage_limits", "deductible"],
      "general-liability": ["business_name", "business_type", "annual_revenue", "employee_count", "coverage_limits"],
      "commercial-property": [
        "business_name",
        "property_address",
        "building_value",
        "contents_value",
        "occupancy_type",
      ],
      "workers-comp": ["business_name", "employee_count", "payroll", "class_codes", "experience_mod"],
    }

    return fieldMappings[policyType as keyof typeof fieldMappings] || []
  }, [])

  return {
    getPolicyForm,
    getPolicyFormFields,
    loading,
    error,
  }
}
