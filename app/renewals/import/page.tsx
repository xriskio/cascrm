"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, Calendar, FileText, Table, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ImportRenewalsPage() {
  // Calculate default date range: Today to 4 months from now
  const getDefaultDates = () => {
    const today = new Date()
    const fourMonthsFromNow = new Date(today)
    fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4)
    
    return {
      start: today.toISOString().split('T')[0],
      end: fourMonthsFromNow.toISOString().split('T')[0]
    }
  }
  
  const defaultDates = getDefaultDates()
  
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [startDate, setStartDate] = useState(defaultDates.start)
  const [endDate, setEndDate] = useState(defaultDates.end)
  const [policyNumber, setPolicyNumber] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [namedInsured, setNamedInsured] = useState("")
  const { toast } = useToast()

  const handleQQCatalystImport = async () => {
    try {
      setIsImporting(true)
      setImportProgress(10)
      setImportResult(null)

      const response = await fetch("/api/qqcatalyst/policies/fetch-renewals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          startDate, 
          endDate,
          policyNumber: policyNumber || undefined,
          accountNumber: accountNumber || undefined,
          namedInsured: namedInsured || undefined,
        }),
      })

      setImportProgress(90)
      const data = await response.json()
      setImportProgress(100)

      if (data.success) {
        setImportResult(data)
        
        // Show warning toast if safety limit was hit
        if (data.hitSafetyLimit) {
          toast({
            variant: "destructive",
            title: "Import Completed with Warning",
            description: data.message,
            duration: 10000, // Show for 10 seconds
          })
        } else {
          toast({
            title: "Import Successful",
            description: data.message || `Imported ${data.imported} renewals from QQCatalyst`,
          })
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a CSV or Excel file to upload",
      })
      return
    }

    try {
      setIsImporting(true)
      setImportProgress(10)

      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/renewals/import", {
        method: "POST",
        body: formData,
      })

      setImportProgress(90)
      const data = await response.json()
      setImportProgress(100)

      if (data.success) {
        setImportResult(data)
        toast({
          title: "Import Successful",
          description: `Imported ${data.imported} renewals from file`,
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Renewals</h1>
        <p className="text-muted-foreground">
          Import renewal data from QQCatalyst or Excel/CSV files. The system will automatically generate tracking
          numbers for each renewal.
        </p>
      </div>

      <Tabs defaultValue="qqcatalyst" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qqcatalyst">QQCatalyst Import</TabsTrigger>
          <TabsTrigger value="file">File Import</TabsTrigger>
        </TabsList>

        <TabsContent value="qqcatalyst">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Import from QQCatalyst
              </CardTitle>
              <CardDescription>
                Import policies expiring between specific dates from your QQCatalyst account. Change the dates below to import any custom date range.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Filter by Date Range</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date (Expiration)</Label>
                      <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="cursor-pointer" />
                      <p className="text-xs text-muted-foreground mt-1">Default: Today</p>
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date (Expiration)</Label>
                      <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="cursor-pointer" />
                      <p className="text-xs text-muted-foreground mt-1">Default: 4 months from today</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Optional Filters (leave blank to import all)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="policy-number">Policy Number</Label>
                      <Input 
                        id="policy-number" 
                        type="text" 
                        placeholder="e.g. POL-12345" 
                        value={policyNumber} 
                        onChange={(e) => setPolicyNumber(e.target.value)} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Exact match</p>
                    </div>
                    <div>
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input 
                        id="account-number" 
                        type="text" 
                        placeholder="e.g. ACC-789" 
                        value={accountNumber} 
                        onChange={(e) => setAccountNumber(e.target.value)} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Exact match</p>
                    </div>
                    <div>
                      <Label htmlFor="named-insured">Named Insured</Label>
                      <Input 
                        id="named-insured" 
                        type="text" 
                        placeholder="e.g. John Doe" 
                        value={namedInsured} 
                        onChange={(e) => setNamedInsured(e.target.value)} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Partial match</p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  {policyNumber || accountNumber || namedInsured 
                    ? `Filtering by: ${[
                        policyNumber && `Policy: ${policyNumber}`,
                        accountNumber && `Account: ${accountNumber}`,
                        namedInsured && `Insured: ${namedInsured}`
                      ].filter(Boolean).join(", ")} (${startDate} to ${endDate})`
                    : `Importing all policies expiring between ${startDate} and ${endDate}`
                  }
                </AlertDescription>
              </Alert>

              {isImporting && (
                <div className="space-y-2">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">Importing renewals from QQCatalyst...</p>
                </div>
              )}

              {importResult && (
                <Alert className={importResult.hitSafetyLimit ? "bg-yellow-500/10 border-yellow-500" : "bg-green-500/10 border-border"}>
                  <AlertDescription>
                    {importResult.message || `Successfully imported ${importResult.imported} of ${importResult.total} renewals`}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleQQCatalystImport} disabled={isImporting} className="w-full">
                {isImporting ? "Importing..." : "Import from QQCatalyst"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Renewals
              </CardTitle>
              <CardDescription>
                Import renewals from Excel or CSV files. Each renewal will automatically receive a unique tracking
                number.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
                  <a href="/templates/renewals-import-template.csv" download>
                    <Download className="h-4 w-4" />
                    Download CSV Template
                  </a>
                </Button>
              </div>

              <div>
                <Label htmlFor="file-upload">Select CSV File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">Upload a CSV file containing renewal information</p>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">Processing file upload...</p>
                </div>
              )}

              {importResult && (
                <Alert className="bg-green-500/10 border-border">
                  <AlertDescription>Successfully imported {importResult.imported} renewals from file</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleFileUpload} disabled={isImporting || !selectedFile} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? "Uploading..." : "Upload and Preview"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}
