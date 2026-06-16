"use client"

import { createClient } from "@/lib/supabase/client"
import { useMemo } from "react"

export function useSupabase() {
  // Use useMemo to ensure we always return the same instance
  const supabase = useMemo(() => createClient(), [])

  return supabase
}
