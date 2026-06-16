import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, XCircle } from "lucide-react"

export default function EmailTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold">Email Notification Testing</h1>
          <p className="text-gray-600">Email functionality has been disabled</p>
        </div>
      </div>

      {/* Email Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Email Service Configuration
          </CardTitle>
          <CardDescription>Email service has been removed from the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Email Service Disabled</span>
            </div>
            <p className="text-red-700">
              All email functionality has been removed from the system. Email notifications are no longer available.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disabled Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-gray-400" />
            Email Testing (Disabled)
          </CardTitle>
          <CardDescription>Email testing is no longer available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Email Functionality Removed</h3>
            <p className="text-gray-500">
              All email services and testing capabilities have been disabled and removed from the system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
