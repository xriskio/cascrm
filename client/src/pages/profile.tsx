import { supabase } from "@/lib/supabase/client"
import { ProfileTabs } from "@/components/profile/profile-tabs"

export default async function ProfilePage() {
  const supabase = supabase

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get the user profile data - use maybeSingle() instead of single() to handle missing data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (userError) {
    console.error("Error fetching user data:", userError)
  }

  // Use auth user data as fallback if user data is not available
  const profileUser = {
    id: user.id,
    email: user.email || "",
    first_name: userData?.first_name || "",
    last_name: userData?.last_name || "",
    role: userData?.role || "user",
    created_at: userData?.created_at || user.created_at,
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      <ProfileTabs user={profileUser} />
    </div>
  )
}
