
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate,  useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

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
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // supabase imported at top of file

  const clearAuthAndRedirect = () => {
    setUser(null)
    if (
      pathname !== "/login" &&
      pathname !== "/" &&
      !pathname.startsWith("/reset-password") &&
      !pathname.startsWith("/forgot-password")
    ) {
      navigate("/login")
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
          navigate("/login")
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
            navigate("/dashboard")
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
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      }
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
