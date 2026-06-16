"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

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
        router.push("/dashboard")
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
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
      setUser(null)
      router.push("/login")
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
