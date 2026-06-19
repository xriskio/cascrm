"use client"

import { useEffect } from "react"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTime, setLockTime] = useState<number | null>(null)
  const router = useRouter()
  const { signIn } = useAuth()

  // Check if account is locked
  const checkLock = () => {
    const storedLockTime = localStorage.getItem("loginLockTime")
    const storedAttempts = localStorage.getItem("loginAttempts")

    if (storedLockTime) {
      const lockTimeValue = Number.parseInt(storedLockTime)
      if (Date.now() < lockTimeValue) {
        setIsLocked(true)
        setLockTime(lockTimeValue)
        return true
      } else {
        // Lock expired
        localStorage.removeItem("loginLockTime")
        localStorage.removeItem("loginAttempts")
        setIsLocked(false)
        setAttempts(0)
        return false
      }
    }

    if (storedAttempts) {
      setAttempts(Number.parseInt(storedAttempts))
    }

    return false
  }

  // Update login attempts
  const updateAttempts = () => {
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    localStorage.setItem("loginAttempts", newAttempts.toString())

    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      const lockTimeValue = Date.now() + 15 * 60 * 1000 // 15 minutes
      localStorage.setItem("loginLockTime", lockTimeValue.toString())
      setIsLocked(true)
      setLockTime(lockTimeValue)
    }
  }

  // Format remaining lock time
  const formatRemainingTime = () => {
    if (!lockTime) return ""
    const remaining = Math.max(0, lockTime - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if account is locked
    if (checkLock()) {
      setError("Too many failed attempts. Please try again later.")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Basic validation
      if (!email || !password) {
        throw new Error("Email and password are required")
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Password strength validation
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters")
      }

      await signIn(email, password)

      // Reset attempts on successful login
      localStorage.removeItem("loginAttempts")
      localStorage.removeItem("loginLockTime")

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      updateAttempts()
      setError(err instanceof Error ? err.message : "An error occurred during sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Update lock timer
  useEffect(() => {
    if (isLocked && lockTime) {
      const interval = setInterval(() => {
        if (Date.now() >= lockTime) {
          setIsLocked(false)
          localStorage.removeItem("loginLockTime")
          clearInterval(interval)
        } else {
          // Force re-render to update timer
          setLockTime((prev) => prev)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isLocked, lockTime])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>Enter your email and password to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLocked ? (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Account temporarily locked due to too many failed attempts. Please try again in {formatRemainingTime()}.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">Contact your administrator if you need access</p>
      </CardFooter>
    </Card>
  )
}
