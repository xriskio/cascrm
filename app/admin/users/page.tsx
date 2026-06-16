"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getAllUsers, deleteUser } from "@/app/actions/user-actions"

type User = {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  role: string
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAllUsers()
        setUsers(data)
      } catch (err) {
        console.error("Error loading users:", err)
        setError(err instanceof Error ? err.message : "Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    setDeleteId(id)

    try {
      await deleteUser(id)
      setUsers(users.filter((user) => user.id !== id))
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(err instanceof Error ? err.message : "Failed to delete user")
    } finally {
      setDeleteId(null)
    }
  }

  if (loading) return <div className="p-6">Loading users...</div>

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <Link href="/admin">
          <span className="text-blue-500 hover:underline">Back to Admin</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Link
          href="/admin/users/add"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Add User
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No users found. Click "Add User" to create a new user.</p>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/users/${user.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={`text-red-600 hover:text-red-900 ${
                        deleteId === user.id ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={deleteId === user.id}
                    >
                      {deleteId === user.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
