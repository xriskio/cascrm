"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserById, updateUser } from "@/app/actions/user-actions"
import { toast } from "sonner"

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getUserById(params.id)
        setUser(userData)
      } catch (err) {
        console.error("Error loading user:", err)
        setError("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [params.id])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const userData = {
      id: params.id,
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
    }

    try {
      const result = await updateUser(userData)
      if (result.success) {
        toast.success("User updated successfully")
        router.push("/admin/users")
        router.refresh()
      } else {
        throw new Error("Failed to update user")
      }
    } catch (err) {
      console.error("Error updating user:", err)
      setError(err instanceof Error ? err.message : "Failed to update user")
      toast.error(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

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
                defaultValue={user?.email || ""}
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
                  defaultValue={user?.firstName || ""}
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
                  defaultValue={user?.lastName || ""}
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
                defaultValue={user?.role || "user"}
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
                disabled={isSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
