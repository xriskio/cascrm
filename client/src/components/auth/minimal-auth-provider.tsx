import { supabase } from "@/lib/supabase/client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useNavigate } from "react-router-dom"

type User = {
  id: string
  email?: string
  role?: "admin" | "agent" | "user"
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function MinimalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase/client")
      // supabase imported at top of file

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          role: "admin",
        })
        navigate("/dashboard")
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase/client")
      // supabase imported at top of file
      await supabase.auth.signOut()
      setUser(null)
      navigate("/login")
    } catch (error) {
      console.error("Sign out error:", error)
      setUser(null)
      navigate("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
