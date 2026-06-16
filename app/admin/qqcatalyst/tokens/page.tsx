"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Key, Plus, RefreshCw, Trash2, Eye, EyeOff, TestTube, CheckCircle, XCircle, Clock, Copy } from "lucide-react"
import {
  getQQCatalystTokens,
  createQQCatalystToken,
  deleteQQCatalystToken,
  refreshQQCatalystToken,
  testQQCatalystToken,
  type QQCatalystToken,
} from "@/app/actions/qqcatalyst-token-actions"

function getTokenStatus(token: QQCatalystToken) {
  if (!token.expires_at) return "active"
  return isTokenExpired(token.expires_at) ? "expired" : "active"
}

function isTokenExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date()
}

export default function QQCatalystTokensPage() {
  const [tokens, setTokens] = useState<QQCatalystToken[]>([])
  const [loading, setLoading] = useState(true)
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  const [selectedToken, setSelectedToken] = useState<QQCatalystToken | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  useEffect(() => {
    loadTokens()
  }, [])

  const loadTokens = async () => {
    setLoading(true)
    try {
      const result = await getQQCatalystTokens()
      if (result.success) {
        setTokens(result.data)
      }
    } catch (error) {
      console.error("Error loading tokens:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshToken = async (id: string) => {
    try {
      const result = await refreshQQCatalystToken(id)
      if (result.success) {
        await loadTokens()
      }
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
  }

  const handleTestToken = async (id: string) => {
    try {
      const result = await testQQCatalystToken(id)
      setTestResults((prev) => ({ ...prev, [id]: result }))
    } catch (error) {
      console.error("Error testing token:", error)
    }
  }

  const handleDeleteToken = async (id: string) => {
    if (confirm("Are you sure you want to delete this token?")) {
      try {
        const result = await deleteQQCatalystToken(id)
        if (result.success) {
          await loadTokens()
        }
      } catch (error) {
        console.error("Error deleting token:", error)
      }
    }
  }

  const toggleTokenVisibility = (id: string) => {
    setShowTokens((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">QQCatalyst Access Tokens</h1>
          <p className="text-muted-foreground mt-2">Manage your QQCatalyst API access tokens</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Token
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New QQCatalyst Token</DialogTitle>
              <DialogDescription>Create a new access token for QQCatalyst API</DialogDescription>
            </DialogHeader>
            <TokenForm
              onSuccess={() => {
                setIsCreateModalOpen(false)
                loadTokens()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Tokens</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <TokensTable
            tokens={tokens}
            loading={loading}
            showTokens={showTokens}
            testResults={testResults}
            onToggleVisibility={toggleTokenVisibility}
            onRefresh={handleRefreshToken}
            onTest={handleTestToken}
            onDelete={handleDeleteToken}
            onCopy={copyToClipboard}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <TokensTable
            tokens={tokens.filter((token) => getTokenStatus(token) === "active")}
            loading={loading}
            showTokens={showTokens}
            testResults={testResults}
            onToggleVisibility={toggleTokenVisibility}
            onRefresh={handleRefreshToken}
            onTest={handleTestToken}
            onDelete={handleDeleteToken}
            onCopy={copyToClipboard}
          />
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          <TokensTable
            tokens={tokens.filter((token) => getTokenStatus(token) === "expired")}
            loading={loading}
            showTokens={showTokens}
            testResults={testResults}
            onToggleVisibility={toggleTokenVisibility}
            onRefresh={handleRefreshToken}
            onTest={handleTestToken}
            onDelete={handleDeleteToken}
            onCopy={copyToClipboard}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TokensTable({
  tokens,
  loading,
  showTokens,
  testResults,
  onToggleVisibility,
  onRefresh,
  onTest,
  onDelete,
  onCopy,
}: {
  tokens: QQCatalystToken[]
  loading: boolean
  showTokens: Record<string, boolean>
  testResults: Record<string, any>
  onToggleVisibility: (id: string) => void
  onRefresh: (id: string) => void
  onTest: (id: string) => void
  onDelete: (id: string) => void
  onCopy: (text: string) => void
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading tokens...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tokens.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tokens found</h3>
            <p className="text-muted-foreground">Create your first QQCatalyst access token to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Tokens</CardTitle>
        <CardDescription>Manage and test your QQCatalyst API tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => {
              const status = getTokenStatus(token)
              const testResult = testResults[token.id]

              return (
                <TableRow key={token.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{token.token_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {showTokens[token.id] ? (
                          <code className="text-xs">{token.access_token.substring(0, 50)}...</code>
                        ) : (
                          "••••••••••••••••••••••••••••••••••••••••••••••••••"
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={status === "active" ? "default" : "destructive"}>
                        {status === "active" ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            Expired
                          </>
                        )}
                      </Badge>
                      {testResult && (
                        <Badge variant={testResult.success ? "default" : "destructive"} className="text-xs">
                          {testResult.success ? "API OK" : "API Error"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{token.client_id}</code>
                  </TableCell>
                  <TableCell>
                    {token.expires_at ? (
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(token.expires_at).toLocaleDateString()}
                      </div>
                    ) : (
                      "Never"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onToggleVisibility(token.id)}>
                        {showTokens[token.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onCopy(token.access_token)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onTest(token.id)}>
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onRefresh(token.id)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(token.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TokenForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    token_name: "",
    access_token: "",
    refresh_token: "",
    token_type: "bearer",
    expires_in: "",
    client_id: "44c42186-c1b7-49ae-afd4-73d77527acc1",
    client_secret: "f3f28807-ed94-409c-9e99-6e69cbec5e3e",
    username: "wael@casurance.com",
    password: "Think0202!!!",
    grant_type: "password_credentials",
    scope: "read write",
    access_token_url: "https://login.qqcatalyst.com/oauth/token",
    client_authentication: "header",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await createQQCatalystToken({
        ...formData,
        expires_in: formData.expires_in ? Number.parseInt(formData.expires_in) : undefined,
      })

      if (result.success) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating token:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="token_name">Token Name</Label>
          <Input
            id="token_name"
            value={formData.token_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, token_name: e.target.value }))}
            placeholder="My QQCatalyst Token"
            required
          />
        </div>
        <div>
          <Label htmlFor="token_type">Token Type</Label>
          <Input
            id="token_type"
            value={formData.token_type}
            onChange={(e) => setFormData((prev) => ({ ...prev, token_type: e.target.value }))}
            placeholder="bearer"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="access_token">Access Token</Label>
        <Textarea
          id="access_token"
          value={formData.access_token}
          onChange={(e) => setFormData((prev) => ({ ...prev, access_token: e.target.value }))}
          placeholder="Paste your access token here..."
          required
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="refresh_token">Refresh Token (Optional)</Label>
        <Textarea
          id="refresh_token"
          value={formData.refresh_token}
          onChange={(e) => setFormData((prev) => ({ ...prev, refresh_token: e.target.value }))}
          placeholder="Paste your refresh token here..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client_id">Client ID</Label>
          <Input
            id="client_id"
            value={formData.client_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, client_id: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="expires_in">Expires In (seconds)</Label>
          <Input
            id="expires_in"
            type="number"
            value={formData.expires_in}
            onChange={(e) => setFormData((prev) => ({ ...prev, expires_in: e.target.value }))}
            placeholder="604800"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">Create Token</Button>
      </div>
    </form>
  )
}
