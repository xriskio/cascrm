"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Settings, Copy, ExternalLink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EnvSetupPage() {
  const [envStatus, setEnvStatus] = useState<{
    QQ_CLIENT_ID: boolean
    QQ_CLIENT_SECRET: boolean
    QQ_USERNAME: boolean
    QQ_PASSWORD: boolean
    QQ_TOKEN_URL: boolean
  }>({
    QQ_CLIENT_ID: false,
    QQ_CLIENT_SECRET: false,
    QQ_USERNAME: false,
    QQ_PASSWORD: false,
    QQ_TOKEN_URL: false,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkEnvVariables = async () => {
      try {
        const response = await fetch("/api/auth/qqcatalyst/env-check")
        const data = await response.json()
        setEnvStatus(data.status)
      } catch (error) {
        console.error("Error checking environment variables:", error)
      } finally {
        setLoading(false)
      }
    }

    checkEnvVariables()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Environment Variables Setup</h1>
          <p className="text-muted-foreground mt-2">Configure QQCatalyst credentials in your environment variables</p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Environment Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Environment Variables Status
              </CardTitle>
              <CardDescription>Current status of your QQCatalyst environment variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(envStatus).map(([key, isSet]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <div className="font-mono text-sm">{key}</div>
                      <Badge variant={isSet ? "default" : "destructive"}>{isSet ? "Set" : "Missing"}</Badge>
                    </div>
                  ))}
                </div>

                {Object.values(envStatus).every(Boolean) ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>All Environment Variables Set</AlertTitle>
                    <AlertDescription>Your QQCatalyst environment variables are properly configured.</AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing Environment Variables</AlertTitle>
                    <AlertDescription>
                      Some required environment variables are missing. Please set them in your Vercel project settings
                      or .env file.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>How to set up your QQCatalyst environment variables</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="vercel">
                <TabsList className="mb-4">
                  <TabsTrigger value="vercel">Vercel</TabsTrigger>
                  <TabsTrigger value="local">.env File</TabsTrigger>
                </TabsList>

                <TabsContent value="vercel" className="space-y-4">
                  <ol className="list-decimal list-inside space-y-4">
                    <li>
                      Go to your Vercel project dashboard
                      <Button
                        variant="link"
                        className="px-2"
                        onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open Vercel Dashboard
                      </Button>
                    </li>
                    <li>Select your project and go to "Settings" tab</li>
                    <li>Click on "Environment Variables" in the left sidebar</li>
                    <li>Add the following environment variables:</li>
                  </ol>

                  <div className="bg-muted p-4 rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <code className="text-sm">QQ_CLIENT_ID=44c42186-c1b7-49ae-afd4-73d77527acc1</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("QQ_CLIENT_ID=44c42186-c1b7-49ae-afd4-73d77527acc1")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">QQ_CLIENT_SECRET=f3f28807-ed94-409c-9e99-6e69cbec5e3e</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("QQ_CLIENT_SECRET=f3f28807-ed94-409c-9e99-6e69cbec5e3e")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">QQ_USERNAME=wael@casurance.com</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("QQ_USERNAME=wael@casurance.com")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">QQ_PASSWORD=Think0202!!!</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard("QQ_PASSWORD=Think0202!!!")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">QQ_TOKEN_URL=https://login.qqcatalyst.com/oauth/token</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("QQ_TOKEN_URL=https://login.qqcatalyst.com/oauth/token")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={() =>
                        copyToClipboard(`QQ_CLIENT_ID=44c42186-c1b7-49ae-afd4-73d77527acc1
QQ_CLIENT_SECRET=f3f28807-ed94-409c-9e99-6e69cbec5e3e
QQ_USERNAME=wael@casurance.com
QQ_PASSWORD=Think0202!!!
QQ_TOKEN_URL=https://login.qqcatalyst.com/oauth/token`)
                      }
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy All Variables
                    </Button>
                  </div>

                  <Alert>
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      After adding environment variables in Vercel, you need to redeploy your application for the
                      changes to take effect.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="local" className="space-y-4">
                  <p>
                    For local development, create or update your <code>.env.local</code> file in the root of your
                    project with the following variables:
                  </p>

                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                      {`QQ_CLIENT_ID=44c42186-c1b7-49ae-afd4-73d77527acc1
QQ_CLIENT_SECRET=f3f28807-ed94-409c-9e99-6e69cbec5e3e
QQ_USERNAME=wael@casurance.com
QQ_PASSWORD=Think0202!!!
QQ_TOKEN_URL=https://login.qqcatalyst.com/oauth/token`}
                    </pre>
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={() =>
                        copyToClipboard(`QQ_CLIENT_ID=44c42186-c1b7-49ae-afd4-73d77527acc1
QQ_CLIENT_SECRET=f3f28807-ed94-409c-9e99-6e69cbec5e3e
QQ_USERNAME=wael@casurance.com
QQ_PASSWORD=Think0202!!!
QQ_TOKEN_URL=https://login.qqcatalyst.com/oauth/token`)
                      }
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                  </div>

                  <Alert>
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      After adding environment variables to your .env.local file, you need to restart your development
                      server for the changes to take effect.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>What to do after setting up environment variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-medium">Verify Environment Variables</h4>
                    <p className="text-sm text-muted-foreground">
                      Check if your environment variables are properly set
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <a href="/api/auth/qqcatalyst/env-check">Verify Now</a>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-medium">Test API Connection</h4>
                    <p className="text-sm text-muted-foreground">Verify your token works with the QQCatalyst API</p>
                  </div>
                  <Button asChild size="sm">
                    <a href="/admin/qqcatalyst/test">Test Now</a>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-medium">Run Data Sync</h4>
                    <p className="text-sm text-muted-foreground">Import contacts and policies from QQCatalyst</p>
                  </div>
                  <Button asChild size="sm">
                    <a href="/admin/qqcatalyst/sync">Sync Data</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
