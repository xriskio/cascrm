"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { updateProfile } from "@/app/actions/profile-actions"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
    created_at: string
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Default values from the user object
  const defaultValues: Partial<ProfileFormValues> = {
    first_name: user.first_name || "",
    last_name: user.last_name || "",
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      await updateProfile({
        userId: user.id,
        first_name: data.first_name,
        last_name: data.last_name,
      })
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    const first = user.first_name?.[0] || ""
    const last = user.last_name?.[0] || ""
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "U"
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          {/* Remove the problematic image and use only the fallback */}
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-medium">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground capitalize">Role: {user.role}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <p className="text-sm font-medium">Email</p>
            </div>
            <Input value={user.email} disabled />
            <p className="text-xs text-muted-foreground">
              Your email address is associated with your account and cannot be changed.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <p className="text-sm font-medium">Account Created</p>
            </div>
            <Input value={new Date(user.created_at).toLocaleDateString()} disabled />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
