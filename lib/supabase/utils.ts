// Utility to reset the Supabase client instance (useful for testing or auth changes)
export function resetSupabaseClient() {
  // This will force a new instance to be created on next access
  if (typeof window !== "undefined") {
    // Clear any stored auth tokens that might be causing conflicts
    localStorage.removeItem("supabase.auth.token")

    // Clear session storage as well
    sessionStorage.removeItem("supabase.auth.token")

    // Force reload of the singleton
    window.location.reload()
  }
}

// Utility to check if we're in a browser environment
export function isBrowser() {
  return typeof window !== "undefined"
}
