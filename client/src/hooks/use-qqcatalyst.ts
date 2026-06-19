
import { useState, useEffect } from "react"

interface UseQQCatalystOptions {
  endpoint: string
  params?: Record<string, string>
  enabled?: boolean
}

export function useQQCatalyst<T = any>({ endpoint, params = {}, enabled = true }: UseQQCatalystOptions) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams(params).toString()
        const url = `/api/qqcatalyst/${endpoint}${queryParams ? `?${queryParams}` : ""}`

        const response = await fetch(url)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch data")
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("QQCatalyst hook error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint, JSON.stringify(params), enabled])

  return { data, loading, error, refetch: () => setData(null) }
}

// Specific hooks for common operations
export function useAccountInfo(customerID: string) {
  return useQQCatalyst({
    endpoint: "account-info",
    params: { customerID },
    enabled: !!customerID,
  })
}

export function usePolicies(customerId: string, options: { keyword?: string; page?: string; rowCount?: string } = {}) {
  return useQQCatalyst({
    endpoint: "policies",
    params: { customerId, ...options },
    enabled: !!customerId,
  })
}

export function useFiles(contactId: string, options: { policyId?: string; dlFileType?: string } = {}) {
  return useQQCatalyst({
    endpoint: "files",
    params: { contactId, ...options },
    enabled: !!contactId,
  })
}
