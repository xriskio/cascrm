"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { login } from "@/app/login/actions"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const cookiesToClear = document.cookie.split(";")
    for (let cookie of cookiesToClear) {
      const cookieName = cookie.split("=")[0].trim()
      if (cookieName.includes("supabase") || cookieName.includes("sb-")) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const result = await login(email, password)
        if (result?.error) {
          setError(result.error)
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during login")
      }
    })
  }

  return (
    <div className="mt-8 bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full appearance-none rounded-md border border-border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full appearance-none rounded-md border border-border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-500/10 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">Login Error</h3>
                <div className="mt-2 text-sm text-red-400">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full justify-center rounded-md border border-transparent bg-orange-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-75"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted-foreground">Need help?</span>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Contact your administrator for access.</p>
        </div>
      </div>
    </div>
  )
}
