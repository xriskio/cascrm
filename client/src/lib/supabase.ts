import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey && !supabaseServiceKey) {
  throw new Error("Missing SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable")
}

export function createClient(options?: { useServiceRole?: boolean }) {
  const key = options?.useServiceRole ? supabaseServiceKey : supabaseAnonKey

  if (!supabaseUrl || !key) {
    throw new Error(`Missing Supabase credentials for ${options?.useServiceRole ? "service role" : "anon"} client`)
  }

  return createSupabaseClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: !options?.useServiceRole,
      persistSession: !options?.useServiceRole,
    },
  })
}

// Default export for backward compatibility
export default createClient()
