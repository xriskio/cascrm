import { supabase } from '@/lib/supabase/client'

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  window.location.href = '/dashboard'
  return { success: true }
}
