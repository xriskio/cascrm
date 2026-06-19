"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Users, Download, CheckCircle, AlertCircle, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportResult {
  success: boolean
  imported: number
  total: number
  message: string
  error?: string
}

export default function ClientImportEnhancedPage() {
  const [maxPages, setMaxPages] = useState(50)
  const [modifiedSince, setModifiedSince] = useState("")
  const [includeInactive, setIncludeInactive] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const { toast } = useToast()

  const handleImport = async () => {
    setIsImporting(true)
    setProgress(0)
    setResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 8, 90))
      }, 600)

      const { importClientsFromQQCatalyst } = await import("@/app/actions/client-import-enhanced-actions")

      const importResult = await importClientsFromQQCatalyst({
        maxPages,
        modifiedSince: modifiedSince || undefined,
      })

      clearInterval(progressInterval)
      setProgress(100)
      setResult(importResult as any)

      if (importResult.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${importResult.imported} clients`,
        })
      } else {
        toast({
          title: "Import Failed",
          description: importResult.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      setResult({
        success: false,
        imported: 0,
        total: 0,
        message: "Import failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
      toast({
        title: "Import Error",
        description: "Failed to import clients",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Enhanced Clients</h1>
          <p className="text-muted-foreground">Import clients with comprehensive field mapping from QQCatalyst</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Users className="h-4 w-4 mr-2" />
          Enhanced Import
        </Badge>
      </div>

      {/* Import Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Import Configuration</CardTitle>
          <CardDescription>Configure the client import parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxPages">Maximum Pages to Import</Label>
              <Input
                id="maxPages"
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number.parseInt(e.target.value) || 50)}
                min="1"
                max="200"
                disabled={isImporting}
              />
              <p className="text-sm text-muted-foreground">
                Each page contains up to 100 clients. Adjust based on your needs.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modifiedSince">Modified Since (Optional)</Label>
              <Input
                id="modifiedSince"
                type="date"
                value={modifiedSince}
                onChange={(e) => setModifiedSince(e.target.value)}
                disabled={isImporting}
              />
              <p className="text-sm text-muted-foreground">Only import clients modified after this date.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeInactive"
              checked={includeInactive}
              onCheckedChange={setIncludeInactive as any}
              disabled={isImporting}
            />
            <Label htmlFor="includeInactive">Include inactive clients</Label>
          </div>

          <Button onClick={handleImport} disabled={isImporting} size="lg" className="w-full">
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing Clients...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import Enhanced Clients
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress */}
      {isImporting && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {progress}% complete - Fetching client data from QQCatalyst API...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${result.success ? "text-green-600" : "text-red-600"}`}>
              {result.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              Import {result.success ? "Completed" : "Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                    <div className="text-sm text-muted-foreground">Clients Imported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                    <div className="text-sm text-muted-foreground">Total Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.total > 0 ? Math.round((result.imported / result.total) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>

                <div className="flex justify-center space-x-4">
                  <Button variant="outline" asChild>
                    <a href="/clients">
                      <Users className="mr-2 h-4 w-4" />
                      View Clients
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/admin/qqcatalyst/dashboard">
                      <Database className="mr-2 h-4 w-4" />
                      QQ Dashboard
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Failed</AlertTitle>
                <AlertDescription>{result.error || result.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Fields Information */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Client Fields</CardTitle>
          <CardDescription>Comprehensive field mapping from QQCatalyst</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Personal Information</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Full name components</li>
                <li>• Date of birth</li>
                <li>• SSN and driver's license</li>
                <li>• Marital status & gender</li>
                <li>• Contact preferences</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Business Information</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Business name & DBA</li>
                <li>• Federal tax ID</li>
                <li>• Industry classification</li>
                <li>• Years in business</li>
                <li>• Employee count</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Account Management</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Agent & CSR assignments</li>
                <li>• Customer status & type</li>
                <li>• Account history</li>
                <li>• Communication logs</li>
                <li>• Raw QQ data preservation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
