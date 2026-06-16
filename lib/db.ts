import { createClient as createBrowserClient } from "@/lib/supabase/client"

export const db = createBrowserClient()

export default db
