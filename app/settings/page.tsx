import { PageHeader } from "@/components/ui/page-header"
import { User, Lock, Bell, Palette, Shield, Database, Globe, Users } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the user role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const isAdmin = userData?.role === "admin"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="Settings" subtitle="Customize your experience and manage account preferences" />

      <div className="p-6">
        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/profile?tab=profile">
            <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold ml-4 text-foreground">Profile Settings</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Update your personal information, contact details, and profile preferences.
              </p>
              <div className="flex items-center text-blue-500 font-medium group-hover:text-blue-600 transition-colors duration-200">
                Manage Profile →
              </div>
            </div>
          </Link>

          <Link href="/profile?tab=security">
            <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold ml-4 text-foreground">Security</h3>
              </div>
              <p className="text-muted-foreground mb-4">Manage passwords, two-factor authentication, and security preferences.</p>
              <div className="flex items-center text-green-500 font-medium group-hover:text-green-600 transition-colors duration-200">
                Security Settings →
              </div>
            </div>
          </Link>

          <Link href="/profile?tab=notifications">
            <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold ml-4 text-foreground">Notifications</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Configure email alerts, push notifications, and communication preferences.
              </p>
              <div className="flex items-center text-orange-500 font-medium group-hover:text-orange-600 transition-colors duration-200">
                Notification Settings →
              </div>
            </div>
          </Link>

          <Link href="/profile?tab=company">
            <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold ml-4 text-foreground">Company Info</h3>
              </div>
              <p className="text-muted-foreground mb-4">View company contact information and business details.</p>
              <div className="flex items-center text-purple-500 font-medium group-hover:text-purple-600 transition-colors duration-200">
                Company Settings →
              </div>
            </div>
          </Link>

          <Link href="/profile?tab=hours">
            <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold ml-4 text-foreground">Business Hours</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                View your company's operating hours and availability.
              </p>
              <div className="flex items-center text-indigo-500 font-medium group-hover:text-indigo-600 transition-colors duration-200">
                View Hours →
              </div>
            </div>
          </Link>

          <Link href="/profile?tab=websites">
            <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold ml-4 text-foreground">Company Websites</h3>
              </div>
              <p className="text-muted-foreground mb-4">View and access your company's online presence.</p>
              <div className="flex items-center text-teal-500 font-medium group-hover:text-teal-600 transition-colors duration-200">
                View Websites →
              </div>
            </div>
          </Link>

          {isAdmin && (
            <Link href="/profile?tab=users">
              <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold ml-4 text-foreground">User Management</h3>
                </div>
                <p className="text-muted-foreground mb-4">Create and manage user accounts with role-based permissions.</p>
                <div className="flex items-center text-red-500 font-medium group-hover:text-red-600 transition-colors duration-200">
                  Manage Users →
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Quick Settings Panel */}
        <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Quick Settings
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Account Information
                  </h3>
                  <p className="text-muted-foreground mb-4">Update your account profile information and contact details.</p>
                  <Link href="/profile?tab=profile">
                    <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                      Edit Profile
                    </button>
                  </Link>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-green-500" />
                    Password & Security
                  </h3>
                  <p className="text-muted-foreground mb-4">Change your password and configure security settings.</p>
                  <Link href="/profile?tab=security">
                    <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                      Change Password
                    </button>
                  </Link>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    Notifications
                  </h3>
                  <p className="text-muted-foreground mb-4">Manage your notification preferences and communication settings.</p>
                  <Link href="/profile?tab=notifications">
                    <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                      Notification Settings
                    </button>
                  </Link>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-500" />
                    Company Information
                  </h3>
                  <p className="text-muted-foreground mb-4">View company contact information and business hours.</p>
                  <Link href="/profile?tab=company">
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                      View Company Info
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
