export function extractErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error
  }

  if (error?.message) {
    return error.message
  }

  if (error?.error) {
    return typeof error.error === "string" ? error.error : JSON.stringify(error.error)
  }

  if (error?.code && error?.details) {
    return `${error.code}: ${error.details}`
  }

  return "An unexpected error occurred"
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    message: message || "Operation completed successfully",
  }
}

export function createErrorResponse(error: any) {
  return {
    success: false as const,
    error: extractErrorMessage(error),
    data: null,
  }
}

export function handleAsyncError(error: any) {
  console.error("Async operation error:", extractErrorMessage(error))
  return createErrorResponse(error)
}

export function generateTrackingNumber(prefix = "REN"): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function formatCurrency(amount: string | number | null | undefined): string {
  if (!amount) return "$0.00"
  const num = typeof amount === "string" ? Number.parseFloat(amount.replace(/[$,]/g, "")) : amount
  if (isNaN(num)) return "$0.00"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Invalid Date"
  }
}
