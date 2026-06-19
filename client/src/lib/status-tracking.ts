import { createClient } from "./supabase"

const supabase = createClient({ useServiceRole: true })
