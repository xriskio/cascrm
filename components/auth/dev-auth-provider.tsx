"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface DevUser {
  id: string
  email: string
  name: string
}

interface DevAuthContextType {
  user: DevUser | null
  signIn: (email: string) => void
  signOut: () => void
}

const DevAuthContext = createContext<DevAuthContextType | undefined>(undefined)

export function DevAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DevUser | null>(null)

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem("dev-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // Auto-login with default user for development
      const defaultUser = {
        id: "00000000-0000-0000-0000-000000000000",
        email: "dev@casurance.com",
        name: "Development User",
      }
      setUser(defaultUser)
      localStorage.setItem("dev-user", JSON.stringify(defaultUser))
    }
  }, [])

  const signIn = (email: string) => {
    const newUser = {
      id: "00000000-0000-0000-0000-000000000000",
      email,
      name: "Development User",
    }
    setUser(newUser)
    localStorage.setItem("dev-user", JSON.stringify(newUser))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("dev-user")
  }

  return <DevAuthContext.Provider value={{ user, signIn, signOut }}>{children}</DevAuthContext.Provider>
}

export function useDevAuth() {
  const context = useContext(DevAuthContext)
  if (context === undefined) {
    throw new Error("useDevAuth must be used within a DevAuthProvider")
  }
  return context
}
