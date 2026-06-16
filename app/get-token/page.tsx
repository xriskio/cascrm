"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Key } from "lucide-react"

export default function GetTokenPage() {
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generateToken = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/qqcatalyst/get-token", {
        method: "POST",
      })
      
      const data = await response.json()
      
      if (data.access_token) {
        setToken(data.access_token)
      } else {
        setError(data.error || "Failed to generate token")
      }
    } catch (err) {
      setError("Failed to connect to API")
    } finally {
      setLoading(false)
    }
  }

  const copyToken = () => {
    navigator.clipboard.writeText(token)
    alert("Token copied to clipboard!")
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Get QQCatalyst Access Token
          </CardTitle>
          <CardDescription>
            Generate your QQCatalyst API access token for import operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateToken} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Access Token"}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md">
              {error}
            </div>
          )}

          {token && (
            <div className="space-y-2">
              <Label>Your Access Token</Label>
              <div className="flex gap-2">
                <Input
                  value={token}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button onClick={copyToken} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Copy this token and paste it into the Access Token field in your QQCatalyst Integration page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
