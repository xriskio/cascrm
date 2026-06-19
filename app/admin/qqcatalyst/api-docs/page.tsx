import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Book, Code, Database } from "lucide-react"
import Link from "next/link"

export default function QQCatalystApiDocsPage() {
  const apiEndpoints = [
    {
      category: "Authentication",
      endpoints: [{ method: "POST", path: "/oauth/token", description: "Get access token using password credentials" }],
    },
    {
      category: "Contacts",
      endpoints: [
        { method: "GET", path: "/Contacts/LastModifiedCreated", description: "Get contacts by date range" },
        { method: "GET", path: "/Contacts/{id}", description: "Get specific contact by ID" },
        { method: "GET", path: "/Contacts/{id}/Policies", description: "Get policies for a contact" },
      ],
    },
    {
      category: "Policies",
      endpoints: [
        { method: "GET", path: "/Policies/LastModifiedCreated", description: "Get policies by date range" },
        { method: "GET", path: "/Policies/{id}", description: "Get specific policy by ID" },
      ],
    },
    {
      category: "Customers",
      endpoints: [
        { method: "GET", path: "/Customers", description: "Get customer list" },
        { method: "GET", path: "/Customers/{id}", description: "Get specific customer by ID" },
      ],
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">QQCatalyst API Documentation</h1>
        <div className="flex gap-2">
          <Link href="https://api.qqcatalyst.com/help" target="_blank">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Official API Docs
            </Button>
          </Link>
          <Link href="https://api.qqcatalyst.com" target="_blank">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              API Base URL
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="mr-2 h-5 w-5" />
              Authentication Flow
            </CardTitle>
            <CardDescription>How authentication works with QQCatalyst API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">OAuth Callback URL</h4>
              <code className="text-sm">https://login.qqcatalyst.com/winformcallback/completed.htm</code>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Token Endpoint</h4>
              <code className="text-sm">https://login.qqcatalyst.com/oauth/token</code>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Grant Type</h4>
              <code className="text-sm">password_credentials</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Environment Variables
            </CardTitle>
            <CardDescription>Required environment variables for QQCatalyst integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 font-mono text-sm">
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>QQ_CLIENT_ID</span>
                <span className="text-muted-foreground">44c42186-c1b7-49ae-afd4-73d77527acc1</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>QQ_CLIENT_SECRET</span>
                <span className="text-muted-foreground">f3f28807-ed94-409c-9e99-6e69cbec5e3e</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>QQ_USERNAME</span>
                <span className="text-muted-foreground">wael@casurance.com</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>QQ_PASSWORD</span>
                <span className="text-muted-foreground">••••••••••••</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {apiEndpoints.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                {category.category} Endpoints
              </CardTitle>
              <CardDescription>Available API endpoints for {category.category.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.endpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          endpoint.method === "GET"
                            ? "bg-green-500/15 text-green-300"
                            : endpoint.method === "POST"
                              ? "bg-blue-500/15 text-blue-300"
                              : "bg-muted text-foreground"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>Current status of your QQCatalyst integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm font-medium">OAuth Authentication Completed</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Your application has successfully authenticated with QQCatalyst and can now access the API endpoints.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
