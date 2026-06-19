"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUser } from "@/app/actions/user-actions"

export default function AddUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const userData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
    }

    try {
      await createUser(userData)
      router.push("/admin/users")
      router.refresh()
    } catch (err) {
      console.error("Error creating user:", err)
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New User</h1>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-card rounded-md shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-muted-foreground">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-muted-foreground">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-muted-foreground">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-card hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
