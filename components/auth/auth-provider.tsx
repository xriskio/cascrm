"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const clearAuthAndRedirect = () => {
    setUser(null)
    if (
      pathname !== "/login" &&
      pathname !== "/" &&
      !pathname.startsWith("/reset-password") &&
      !pathname.startsWith("/forgot-password")
    ) {
      router.push("/login")
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          console.error("Session error:", error)
          setUser(null)
          setIsLoading(false)
          return
        }

        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            role: "admin",
          })
          setIsLoading(false)
        } else {
          setUser(null)
          setIsLoading(false)
        }
      } catch (error: any) {
        console.error("Error in auth provider:", error)
        setUser(null)
        setIsLoading(false)
      }
    }

    fetchUser()

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        if (pathname === "/dashboard") {
          router.push("/login")
        }
        return
      }

      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: "admin",
          })

          if (pathname === "/login") {
            router.push("/dashboard")
          }
        }
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        const { data: userProfile } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single()

        setUser({
          id: data.user.id,
          email: data.user.email,
          role: (userProfile?.role as "admin" | "agent" | "user") || "user",
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
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
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
