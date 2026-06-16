"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, XCircle, Users, Lock, Key } from "lucide-react"
import { rolePermissions, roleRouteAccess, type UserRole, type Permission } from "@/lib/permissions"

export default function PermissionsManagementPage() {
  const roles: UserRole[] = ["admin", "agent", "user"]
  const permissions: Permission[] = ["read", "write", "delete"]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-orange-500" />
            Permissions & Authorization
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user roles and control access to different parts of the application
          </p>
        </div>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Key className="h-5 w-5" />
              Admin
            </CardTitle>
            <CardDescription>Full system access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">All Permissions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">User Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">System Configuration</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Users className="h-5 w-5" />
              Agent
            </CardTitle>
            <CardDescription>Standard operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Read & Write Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Client Management</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-400">No Admin Access</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-600">
              <Lock className="h-5 w-5" />
              User
            </CardTitle>
            <CardDescription>Read-only access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Read Only Access</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-400">No Write Access</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-400">No Delete Access</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            View which permissions are granted to each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permission
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role}
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permissions.map((permission) => (
                  <tr key={permission}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {permission}
                    </td>
                    {roles.map((role) => (
                      <td key={`${role}-${permission}`} className="px-6 py-4 whitespace-nowrap text-center">
                        {rolePermissions[role].includes(permission) ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Route Access per Role */}
      <Card>
        <CardHeader>
          <CardTitle>Route Access Control</CardTitle>
          <CardDescription>
            Pages and features accessible to each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role} className="space-y-3">
                <h3 className="font-semibold capitalize flex items-center gap-2">
                  {role === "admin" && <Key className="h-4 w-4 text-red-600" />}
                  {role === "agent" && <Users className="h-4 w-4 text-blue-600" />}
                  {role === "user" && <Lock className="h-4 w-4 text-gray-600" />}
                  {role}
                </h3>
                <div className="space-y-1">
                  {roleRouteAccess[role].map((route) => (
                    <Badge key={route} variant="outline" className="mr-2 mb-2">
                      {route}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Manage Permissions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How to Manage User Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900">To change a user's permissions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Go to <a href="/admin/users" className="underline font-medium">Users Management</a></li>
              <li>Click "Edit" next to the user you want to modify</li>
              <li>Select the appropriate role (Admin, Agent, or User)</li>
              <li>Save the changes</li>
            </ol>
          </div>
          
          <div className="space-y-2 pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-blue-900">Role Definitions:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                <strong>Admin:</strong> Full access to all features including user management and system configuration
              </li>
              <li>
                <strong>Agent:</strong> Can read and write data, manage clients and policies, but cannot access admin features
              </li>
              <li>
                <strong>User:</strong> Read-only access to view data, suitable for limited access users
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
