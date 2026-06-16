"use client"

import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block">
          <div className="bg-white p-6 rounded-md shadow hover:shadow-lg transition-shadow">
            <h2 className="font-bold text-lg mb-2">User Management</h2>
            <p className="text-gray-500">Add, edit, and delete user accounts</p>
          </div>
        </Link>

        <Link href="/admin/permissions" className="block">
          <div className="bg-white p-6 rounded-md shadow hover:shadow-lg transition-shadow">
            <h2 className="font-bold text-lg mb-2">Permissions & Authorization</h2>
            <p className="text-gray-500">View and manage user roles and access control</p>
          </div>
        </Link>

        <Link href="/admin/schema-check" className="block">
          <div className="bg-white p-6 rounded-md shadow hover:shadow-lg transition-shadow">
            <h2 className="font-bold text-lg mb-2">Database Schema Check</h2>
            <p className="text-gray-500">Check if database tables match expected schemas</p>
          </div>
        </Link>

        <Link href="/admin/settings" className="block">
          <div className="bg-white p-6 rounded-md shadow hover:shadow-lg transition-shadow">
            <h2 className="font-bold text-lg mb-2">System Settings</h2>
            <p className="text-gray-500">Configure system-wide settings</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
