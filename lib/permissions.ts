export type UserRole = "admin" | "agent" | "user"

export type Permission = "read" | "write" | "delete"

// Define permissions for each role
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: ["read", "write", "delete"],
  agent: ["read", "write"],
  user: ["read"],
}

// Define which routes each role can access
export const roleRouteAccess: Record<UserRole, string[]> = {
  admin: [
    "/dashboard",
    "/submissions",
    "/renewals",
    "/leads",
    "/clients",
    "/call-log",
    "/quotes",
    "/carrier-contacts",
    "/service-requests",
    "/agency-resources",
    "/admin",
    "/reports",
    "/documents",
    "/inspections",
    "/missing-documents",
    "/settings",
    "/profile",
  ],
  agent: [
    "/dashboard",
    "/submissions",
    "/renewals",
    "/leads",
    "/clients",
    "/call-log",
    "/quotes",
    "/carrier-contacts",
    "/service-requests",
    "/agency-resources",
    "/reports",
    "/documents",
    "/inspections",
    "/missing-documents",
    "/profile",
  ],
  user: [
    "/dashboard",
    "/submissions",
    "/renewals",
    "/clients",
    "/quotes",
    "/service-requests",
    "/agency-resources",
    "/documents",
    "/profile",
  ],
}

// Check if a user has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission)
}

// Check if a user can access a specific route
export function canAccessRoute(role: UserRole, route: string): boolean {
  // Check if the route or any parent route is accessible
  return roleRouteAccess[role].some(
    (accessibleRoute) => route === accessibleRoute || route.startsWith(`${accessibleRoute}/`),
  )
}
