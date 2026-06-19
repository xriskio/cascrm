import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TestTube, Users, Search, Mail, Database } from "lucide-react"

export default function TestSuitePage() {
  const testSuites = [
    {
      title: "Client Navigation Test",
      description: "Test client detail page navigation and authentication flow",
      icon: Users,
      href: "/test/client-navigation",
      status: "Ready",
    },
    {
      title: "Search Functionality Test",
      description: "Test global search across all data types",
      icon: Search,
      href: "/test/search",
      status: "Coming Soon",
    },
    {
      title: "Email System Test",
      description: "Test email templates and delivery system",
      icon: Mail,
      href: "/test/email",
      status: "Coming Soon",
    },
    {
      title: "Database Connection Test",
      description: "Test database connectivity and query performance",
      icon: Database,
      href: "/test/database",
      status: "Coming Soon",
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TestTube className="h-8 w-8" />
            Test Suite Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing tools to verify application functionality after deployment
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testSuites.map((suite) => {
            const Icon = suite.icon
            return (
              <Card key={suite.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {suite.title}
                  </CardTitle>
                  <CardDescription>{suite.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        suite.status === "Ready" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"
                      }`}
                    >
                      {suite.status}
                    </span>
                    {suite.status === "Ready" ? (
                      <Link href={suite.href}>
                        <Button>Run Test</Button>
                      </Link>
                    ) : (
                      <Button disabled>Coming Soon</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 p-6 bg-blue-500/10 rounded-lg border border-border">
          <h2 className="text-lg font-semibold text-blue-300 mb-2">How to Use</h2>
          <ul className="text-blue-300 space-y-1 text-sm">
            <li>• Run tests before and after deployment to verify functionality</li>
            <li>• Check authentication flows and data access permissions</li>
            <li>• Verify that all features work correctly in production environment</li>
            <li>• Use test results to identify and fix deployment-related issues</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
