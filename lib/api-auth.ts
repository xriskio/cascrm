import { NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { hasPermission, type Permission, type UserRole } from "@/lib/permissions"

type AuthorizedApiUser = {
  user: User
  role: UserRole
}

type ApiPermissionResult =
  | { authorized: true; user: AuthorizedApiUser }
  | { authorized: false; response: NextResponse }

export async function requireApiPermission(permission: Permission): Promise<ApiPermissionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    }
  }

  const { data: userData, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = userData?.role as UserRole | undefined

  if (roleError || !role || !hasPermission(role, permission)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
    }
  }

  return {
    authorized: true,
    user: {
      user,
      role,
    },
  }
}
