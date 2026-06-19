"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { ImportPreviewTable } from "./import-preview-table"

interface PasteImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PasteImportModal({ isOpen, onClose }: PasteImportModalProps) {
  const [pastedData, setPastedData] = useState("")
  const [parsedData, setParsedData] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; imported: number } | null>(null)

  const handleParse = () => {
    try {
      const lines = pastedData.split("\n").filter((line) => line.trim())
      if (lines.length === 0) return

      // Detect delimiter
      const firstLine = lines[0]
      const delimiter = firstLine.includes("\t") ? "\t" : firstLine.includes(",") ? "," : ","

      // Parse headers
      const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/"/g, ""))

      // Parse data
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(delimiter).map((v) => v.trim().replace(/"/g, ""))
        const row: any = { id: index + 1 }
        headers.forEach((header, i) => {
          row[header] = values[i] || ""
        })
        return row
      })

      setParsedData(data)
    } catch (error) {
      console.error("Error parsing data:", error)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const response = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsedData }),
      })

      const result = await response.json()
      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        message: "Import failed: " + (error as Error).message,
        imported: 0,
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setPastedData("")
    setParsedData([])
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Paste Import Data
          </DialogTitle>
          <DialogDescription>
            Paste your lead data below. Supports CSV, TSV, or any delimited text format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Paste Area */}
          <div>
            <Label htmlFor="paste-data">Paste Your Data</Label>
            <Textarea
              id="paste-data"
              placeholder="Paste your lead data here... (CSV, TSV, or any delimited format)"
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-muted-foreground">
                {pastedData.split("\n").filter((line) => line.trim()).length} lines
              </div>
              <Button onClick={handleParse} disabled={!pastedData.trim()}>
                Parse Data
              </Button>
            </div>
          </div>

          {/* Format Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium text-sm mb-2">CSV Format Example:</div>
              <code className="text-xs text-muted-foreground">
                Name,Email,Phone,Company
                <br />
                John Doe,john@example.com,555-1234,ABC Corp
                <br />
                Jane Smith,jane@example.com,555-5678,XYZ Inc
              </code>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium text-sm mb-2">Tab-Separated Example:</div>
              <code className="text-xs text-muted-foreground">
                Name&nbsp;&nbsp;&nbsp;&nbsp;Email&nbsp;&nbsp;&nbsp;&nbsp;Phone&nbsp;&nbsp;&nbsp;&nbsp;Company
                <br />
                John
                Doe&nbsp;&nbsp;&nbsp;&nbsp;john@example.com&nbsp;&nbsp;&nbsp;&nbsp;555-1234&nbsp;&nbsp;&nbsp;&nbsp;ABC
                Corp
                <br />
                Jane
                Smith&nbsp;&nbsp;&nbsp;&nbsp;jane@example.com&nbsp;&nbsp;&nbsp;&nbsp;555-5678&nbsp;&nbsp;&nbsp;&nbsp;XYZ
                Inc
              </code>
            </div>
          </div>

          {/* Preview */}
          {parsedData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Data Preview ({parsedData.length} rows)</Label>
                <Badge variant="outline">Ready to Import</Badge>
              </div>
              <ImportPreviewTable data={parsedData.slice(0, 10)} />
              {parsedData.length > 10 && (
                <div className="text-sm text-muted-foreground mt-2">
                  Showing first 10 rows of {parsedData.length} total rows
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {result && (
            <Alert className={result.success ? "border-border bg-green-500/10" : "border-border bg-red-500/10"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="font-medium">{result.message}</div>
                {result.success && (
                  <div className="text-sm text-green-400 mt-1">Successfully imported {result.imported} leads</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={parsedData.length === 0 || importing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {importing ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {parsedData.length} Leads
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
