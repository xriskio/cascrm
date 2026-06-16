"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile/profile-form"
import { PasswordForm } from "@/components/profile/password-form"
import { NotificationPreferences } from "@/components/profile/notification-preferences"
import { CompanyInformation } from "@/components/profile/company-information"
import { UserManagement } from "@/components/profile/user-management"
import { Suspense } from "react"

interface ProfileTabsProps {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
    created_at: string
  }
}

function ProfileTabsContent({ user }: ProfileTabsProps) {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"
  const isAdmin = user.role === "admin"

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-2 md:grid-cols-7' : 'grid-cols-2 md:grid-cols-6'}`}>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="hours">Hours</TabsTrigger>
        <TabsTrigger value="websites">Websites</TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="users">Users</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information and how it appears on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm userId={user.id} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferences userId={user.id} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="company">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>View your company's contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyInformation />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hours">
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>View your company's operating hours</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyInformation showHoursOnly={true} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="websites">
        <Card>
          <CardHeader>
            <CardTitle>Company Websites</CardTitle>
            <CardDescription>View and access your company's online presence</CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyInformation showWebsitesOnly={true} />
          </CardContent>
        </Card>
      </TabsContent>

      {isAdmin && (
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Create and manage user accounts with role-based permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  )
}

export function ProfileTabs(props: ProfileTabsProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileTabsContent {...props} />
    </Suspense>
  )
}
