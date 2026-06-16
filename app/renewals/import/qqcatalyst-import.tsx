"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function QQCatalystImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [importResult, setImportResult] = useState<{ count: number; message: string } | null>(null)
  const [progress, setProgress] = useState(0)
  const [startDate, setStartDate] = useState("2026-03-01")
  const [endDate, setEndDate] = useState("2026-07-01")
  const { toast } = useToast()

  const startImport = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Missing Dates",
        description: "Please select both start and end dates",
      })
      return
    }

    try {
      setIsImporting(true)
      setImportStatus("loading")
      setProgress(10)

      // Simulate progress while waiting for API
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 5
        })
      }, 1000)

      const response = await fetch("/api/qqcatalyst/renewals/import-filtered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate,
          endDate: endDate,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (response.ok && data.success) {
        setImportStatus("success")
        setImportResult({
          count: data.count,
          message: data.message,
        })
        toast({
          title: "Import Successful",
          description: `Successfully imported ${data.count} renewals from QQCatalyst`,
        })
      } else {
        setImportStatus("error")
        setImportResult({
          count: 0,
          message: data.message || "Failed to import renewals from QQCatalyst",
        })
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: data.message || "Failed to import renewals from QQCatalyst",
        })
      }
    } catch (error) {
      setImportStatus("error")
      setImportResult({
        count: 0,
        message: "An unexpected error occurred during import",
      })
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "An unexpected error occurred during import",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Import Renewals from QQCatalyst
        </CardTitle>
        <CardDescription>
          Import policy renewals directly from your QQCatalyst account. This will fetch all policies with upcoming
          renewal dates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {importStatus === "idle" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isImporting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isImporting}
                />
              </div>
            </div>
          </div>
        )}

        {importStatus === "loading" && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2 w-full" />
            <p className="text-sm text-[#8A8A96]">
              Importing renewals from QQCatalyst for {startDate} to {endDate}... This may take a few minutes.
            </p>
          </div>
        )}

        {importStatus === "success" && (
          <Alert variant="default" className="bg-[#1A3A1A] border-[#22C55E]/30">
            <CheckCircle className="h-4 w-4 text-[#22C55E]" />
            <AlertTitle className="text-[#22C55E]">Import Successful</AlertTitle>
            <AlertDescription className="text-[#8A8A96]">
              {importResult?.message || `Successfully imported ${importResult?.count} renewals from QQCatalyst.`}
            </AlertDescription>
          </Alert>
        )}

        {importStatus === "error" && (
          <Alert variant="destructive" className="bg-[#3A1A1A] border-[#EF4444]/30">
            <AlertCircle className="h-4 w-4 text-[#EF4444]" />
            <AlertTitle className="text-[#EF4444]">Import Failed</AlertTitle>
            <AlertDescription className="text-[#8A8A96]">{importResult?.message || "Failed to import renewals from QQCatalyst."}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={startImport} disabled={isImporting} className="w-full md:w-auto">
          {isImporting ? "Importing..." : "Import from QQCatalyst"}
        </Button>
      </CardFooter>
    </Card>
  )
}
