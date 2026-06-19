import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// This client should ONLY be used in server components, server actions, or API
// routes. It is initialized lazily (on first use) so that importing this module
// never throws at build time / module-load time when the service-role env vars
// are not present (e.g. during `next build`). The env vars are required at
// request time, where they are available.

let _client: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (_client) return _client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return _client
}

// Proxy preserves the existing `supabaseAdmin.from(...)` call sites while
// deferring client creation (and the env-var check) until first actual use.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getAdminClient() as any
    const value = client[prop]
    return typeof value === "function" ? value.bind(client) : value
  },
})
