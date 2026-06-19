"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ColumnMapping {
  csvColumn: string
  dbField: string
}

interface ImportData {
  headers: string[]
  rows: string[][]
}

export default function ImportQuotesPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [importData, setImportData] = useState<ImportData | null>(null)
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Upload, 2: Map, 3: Preview, 4: Import
  const [importResults, setImportResults] = useState<any>(null)

  const dbFields = [
    { value: "", label: "-- Skip Column --" },
    { value: "quote_number", label: "Quote Number" },
    { value: "submission_type", label: "Submission Type" },
    { value: "insurance_type", label: "Insurance Type" },
    { value: "contact_name", label: "Contact Name" },
    { value: "contact_phone", label: "Contact Phone" },
    { value: "contact_email", label: "Contact Email" },
    { value: "insured_name", label: "Insured Name" },
    { value: "insured_address", label: "Insured Address" },
    { value: "follow_up_2_date", label: "Follow-Up 2 Date" },
    { value: "follow_up_final_date", label: "Final Follow-Up Date" },
    { value: "disposition_status", label: "Disposition Status" },
    { value: "total_premium", label: "Total Premium" },
    { value: "total_monthly_payment", label: "Monthly Payment" },
    { value: "total_down_payment", label: "Down Payment" },
    { value: "number_of_installments", label: "Number of Installments" },
    { value: "notes", label: "Notes" },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    parseFile(uploadedFile)
  }

  const parseFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim() !== "")

      if (lines.length === 0) return

      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
      const rows = lines.slice(1).map((line) => line.split(",").map((cell) => cell.trim().replace(/"/g, "")))

      setImportData({ headers, rows })

      // Initialize column mappings
      const mappings = headers.map((header) => ({
        csvColumn: header,
        dbField: autoMapField(header),
      }))
      setColumnMappings(mappings)
      setStep(2)
    }
    reader.readAsText(file)
  }

  const autoMapField = (header: string): string => {
    const headerLower = header.toLowerCase()

    if (headerLower.includes("quote") && headerLower.includes("number")) return "quote_number"
    if (headerLower.includes("submission") && headerLower.includes("type")) return "submission_type"
    if (headerLower.includes("insurance") && headerLower.includes("type")) return "insurance_type"
    if (headerLower.includes("contact") && headerLower.includes("name")) return "contact_name"
    if (headerLower.includes("contact") && headerLower.includes("phone")) return "contact_phone"
    if (headerLower.includes("contact") && headerLower.includes("email")) return "contact_email"
    if (headerLower.includes("insured") && headerLower.includes("name")) return "insured_name"
    if (headerLower.includes("insured") && headerLower.includes("address")) return "insured_address"
    if (headerLower.includes("premium")) return "total_premium"
    if (headerLower.includes("monthly")) return "total_monthly_payment"
    if (headerLower.includes("down")) return "total_down_payment"
    if (headerLower.includes("installment")) return "number_of_installments"
    if (headerLower.includes("note")) return "notes"
    if (headerLower.includes("status")) return "disposition_status"

    return ""
  }

  const updateMapping = (csvColumn: string, dbField: string) => {
    setColumnMappings((prev) =>
      prev.map((mapping) => (mapping.csvColumn === csvColumn ? { ...mapping, dbField } : mapping)),
    )
  }

  const handleImport = async () => {
    if (!importData) return

    setLoading(true)
    try {
      const mappedData = importData.rows.map((row) => {
        const quote: any = {}

        columnMappings.forEach((mapping, index) => {
          if (mapping.dbField && row[index]) {
            quote[mapping.dbField] = row[index]
          }
        })

        // Generate quote number if not provided
        if (!quote.quote_number) {
          quote.quote_number = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        }

        return quote
      })

      const response = await fetch("/api/quotes/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quotes: mappedData }),
      })

      if (response.ok) {
        const results = await response.json()
        setImportResults(results)
        setStep(4)
      } else {
        throw new Error("Import failed")
      }
    } catch (error) {
      console.error("Import error:", error)
      alert("Import failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      "Quote Number",
      "Submission Type",
      "Insurance Type",
      "Contact Name",
      "Contact Phone",
      "Contact Email",
      "Insured Name",
      "Insured Address",
      "Follow-Up 2 Date",
      "Final Follow-Up Date",
      "Disposition Status",
      "Total Premium",
      "Monthly Payment",
      "Down Payment",
      "Number of Installments",
      "Notes",
    ]

    const sampleData = [
      "QT-SAMPLE-001",
      "Commercial Auto",
      "Commercial Auto",
      "John Doe",
      "555-123-4567",
      "john@example.com",
      "ABC Company",
      "123 Main St, City, State 12345",
      "2025-06-01",
      "2025-06-15",
      "pending",
      "15000.00",
      "1250.00",
      "2500.00",
      "12",
      "Sample quote for import",
    ]

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "quotes_import_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/quotes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Import Quotes</h1>
          <p className="text-muted-foreground">Upload and map CSV/Excel files to import quotes</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 4 && <div className={`w-16 h-1 ${step > stepNum ? "bg-blue-600" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Upload File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium mb-2">Download Template</h3>
                <p className="text-sm text-muted-foreground">Download a sample CSV template with the correct format</p>
              </div>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Upload your quotes file</p>
                <p className="text-sm text-muted-foreground">Supports CSV and Excel files (.csv, .xlsx, .xls)</p>
              </div>
              <div className="mt-4">
                <Input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="max-w-xs mx-auto" />
              </div>
            </div>

            {file && (
              <div className="bg-green-500/10 border border-border rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-300">
                    File uploaded: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && importData && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Map Columns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-500/10 border border-border rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-300">
                  Map your CSV columns to database fields. Columns can be skipped if not needed.
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {columnMappings.map((mapping, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <Label className="text-sm font-medium">CSV Column</Label>
                    <div className="p-2 bg-muted rounded border">{mapping.csvColumn}</div>
                  </div>
                  <div className="text-center text-muted-foreground">→</div>
                  <div>
                    <Label className="text-sm font-medium">Database Field</Label>
                    <Select value={mapping.dbField} onValueChange={(value) => updateMapping(mapping.csvColumn, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {dbFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Preview Import</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && importData && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Preview Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-500/10 border border-border rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-300">
                  Review the data below before importing. {importData.rows.length} quotes will be imported.
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full border border-border">
                <thead className="bg-muted">
                  <tr>
                    {columnMappings
                      .filter((m) => m.dbField)
                      .map((mapping) => (
                        <th key={mapping.dbField} className="p-2 text-left border-b">
                          {dbFields.find((f) => f.value === mapping.dbField)?.label}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {importData.rows.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {columnMappings
                        .filter((m) => m.dbField)
                        .map((mapping) => {
                          const columnIndex = columnMappings.findIndex((m) => m.csvColumn === mapping.csvColumn)
                          return (
                            <td key={mapping.dbField} className="p-2 text-sm">
                              {row[columnIndex] || "-"}
                            </td>
                          )
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importData.rows.length > 10 && (
              <p className="text-sm text-muted-foreground">
                Showing first 10 rows. {importData.rows.length - 10} more rows will be imported.
              </p>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back to Mapping
              </Button>
              <Button onClick={handleImport} disabled={loading}>
                {loading ? "Importing..." : "Import Quotes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && importResults && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Import Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-500/10 border border-border rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-300">
                  Import completed successfully! {importResults.imported} quotes imported.
                </span>
              </div>
            </div>

            {importResults.errors && importResults.errors.length > 0 && (
              <div className="bg-red-500/10 border border-border rounded-lg p-4">
                <h4 className="font-medium text-red-300 mb-2">Errors:</h4>
                <ul className="text-sm text-red-400 space-y-1">
                  {importResults.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center">
              <Button asChild>
                <Link href="/quotes">View Imported Quotes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
