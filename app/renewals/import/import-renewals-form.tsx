"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { processExcelFile, processCsvFile, importRenewals } from "../../actions/renewal-import-actions"
import { AlertCircle, FileSpreadsheet, FileText, FileUp, Upload, CheckCircle } from "lucide-react"
import { extractErrorMessage } from "@/lib/error-utils"

export default function ImportRenewalsForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("csv")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({})
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [importCount, setImportCount] = useState(0)

  const requiredFields = ["insured_name", "expiration_date", "insurance_carrier"]
  const allFields = [
    { key: "date_entered", label: "Date Entered" },
    { key: "business_name", label: "Business Name" },
    { key: "customer_first_name", label: "Customer First Name" },
    { key: "customer_last_name", label: "Customer Last Name" },
    { key: "customer_primary_phone", label: "Customer Primary Phone" },
    { key: "customer_primary_email", label: "Customer Primary Email" },
    { key: "insured_name", label: "Insured Name", required: true },
    { key: "client_name", label: "Client Name" },
    { key: "retail_agency_name", label: "Retail Agency Name" },
    { key: "producer", label: "Producer" },
    { key: "policy_type", label: "Policy Type" },
    { key: "line_of_business", label: "Line of Business" },
    { key: "policy_number", label: "Policy Number" },
    { key: "effective_date", label: "Effective Date" },
    { key: "expiration_date", label: "Expiration Date", required: true },
    { key: "insurance_carrier", label: "Insurance Carrier", required: true },
    { key: "writing_carrier", label: "Writing Carrier" },
    { key: "policy_premium", label: "Policy Premium" },
    { key: "expiring_premium", label: "Expiring Premium" },
    { key: "expiring_commission", label: "Expiring Commission" },
    { key: "agency_commission_total", label: "Agency Commission Total" },
    { key: "wholesaler_mga", label: "Wholesaler or MGA" },
    { key: "renewal_premium", label: "Renewal Premium" },
    { key: "renewal_commission", label: "Renewal Commission" },
    { key: "csr_on_policy", label: "CSR On Policy" },
    { key: "agent_on_policy", label: "Agent On Policy" },
    { key: "client_email", label: "Client Email" },
    { key: "client_phone", label: "Client Phone" },
    { key: "preferred_contact_method", label: "Preferred Contact Method" },
    { key: "status", label: "Status" },
    { key: "policy_status", label: "Policy Status" },
    { key: "notes", label: "Notes" },
    { key: "reason_lost", label: "Reason Lost" },
    { key: "task", label: "Task" },
  ]

  // Auto-mapping for the specific renewal report format
  const autoMapColumns = (headers: string[]) => {
    const mappings: Record<string, string> = {}

    headers.forEach((header) => {
      const cleanHeader = header.trim().replace(/"/g, "")

      // Specific mappings for the renewal report
      switch (cleanHeader) {
        case "Location":
          mappings[header] = "retail_agency_name"
          break
        case "Customer First Name":
          mappings[header] = "customer_first_name"
          break
        case "Customer Last Name":
          mappings[header] = "customer_last_name"
          break
        case "Customer Primary Phone":
          mappings[header] = "customer_primary_phone"
          break
        case "Customer Primary Email":
          mappings[header] = "customer_primary_email"
          break
        case "Policy Number":
          mappings[header] = "policy_number"
          break
        case "Effective Date":
          mappings[header] = "effective_date"
          break
        case "Expiration Date":
          mappings[header] = "expiration_date"
          break
        case "Line of Business":
          mappings[header] = "line_of_business"
          break
        case "Writing Carrier":
          mappings[header] = "writing_carrier"
          break
        case "Policy Premium":
          mappings[header] = "policy_premium"
          break
        case "Agency Commission Total":
          mappings[header] = "agency_commission_total"
          break
        case "CSR On Policy":
          mappings[header] = "csr_on_policy"
          break
        case "Agent On Policy":
          mappings[header] = "agent_on_policy"
          break
        case "Policy Status":
          mappings[header] = "policy_status"
          break
        default:
          // Try generic matching for other fields
          const normalizedHeader = cleanHeader.toLowerCase().trim().replace(/\s+/g, "_")
          const exactMatch = allFields.find((field) => field.key.toLowerCase() === normalizedHeader)
          if (exactMatch) {
            mappings[header] = exactMatch.key
          }
      }
    })

    return mappings
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setPreviewData(null)
    setError(null)
    setColumnMappings({})
    setImportSuccess(false)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      let result

      if (activeTab === "excel") {
        result = await processExcelFile(file)
      } else if (activeTab === "csv") {
        result = await processCsvFile(file)
      } else {
        setError("Unsupported file type")
        setIsUploading(false)
        return
      }

      if (result.success) {
        setPreviewData(result.data.slice(0, 5)) // Preview first 5 rows

        // Auto-map columns using the specific renewal report format
        const mappings = autoMapColumns(result.headers)
        setColumnMappings(mappings)
      } else {
        const errorMessage =
          typeof (result as any).error === "string" ? (result as any).error : (result as any).error?.message || "Failed to process file"
        setError(errorMessage)
      }
    } catch (err: any) {
      setError(extractErrorMessage(err))
    } finally {
      setIsUploading(false)
    }
  }

  const handleMappingChange = (header: string, value: string) => {
    setColumnMappings((prev) => ({
      ...prev,
      [header]: value,
    }))
  }

  const handleImport = async () => {
    // Check if required fields are mapped
    const mappedFields = Object.values(columnMappings)

    // For renewal report, we need at least customer name and expiration date
    const hasCustomerName = mappedFields.includes("customer_first_name") && mappedFields.includes("customer_last_name")
    const hasExpirationDate = mappedFields.includes("expiration_date")
    const hasCarrier = mappedFields.includes("writing_carrier")

    if (!hasCustomerName || !hasExpirationDate || !hasCarrier) {
      setError(
        "Missing required fields: Customer First Name, Customer Last Name, Expiration Date, and Writing Carrier are required",
      )
      return
    }

    setIsImporting(true)
    setError(null)

    try {
      let result

      if (activeTab === "excel") {
        result = await importRenewals(file!, columnMappings, "excel")
      } else if (activeTab === "csv") {
        result = await importRenewals(file!, columnMappings, "csv")
      } else {
        setError("Unsupported file type")
        setIsImporting(false)
        return
      }

      if (result.success) {
        setImportSuccess(true)
        setImportCount(result.count)
        setTimeout(() => {
          router.push("/renewals")
        }, 3000)
      } else {
        const errorMessage =
          typeof (result as any).error === "string" ? (result as any).error : (result as any).error?.message || "Failed to import renewals"
        setError(errorMessage)
      }
    } catch (err: any) {
      setError(extractErrorMessage(err))
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Import Renewals
        </CardTitle>
        <CardDescription>
          Import renewals from Excel or CSV files. Each renewal will automatically receive a unique tracking number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="csv">
              <FileText className="mr-2 h-4 w-4" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="excel">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </TabsTrigger>
            <TabsTrigger value="pdf" disabled>
              <FileUp className="mr-2 h-4 w-4" />
              PDF (Coming Soon)
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {importSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Successfully imported {importCount} renewals with tracking numbers. Redirecting to renewals list...
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading || isImporting}
              />
              <p className="text-sm text-gray-500">Upload a CSV file containing renewal information</p>
            </div>
          </TabsContent>

          <TabsContent value="excel" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excel-file">Select Excel File</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isUploading || isImporting}
              />
              <p className="text-sm text-gray-500">
                Upload an Excel file (.xlsx or .xls) containing renewal information
              </p>
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-file">Select PDF File</Label>
              <Input id="pdf-file" type="file" accept=".pdf" disabled={true} />
              <p className="text-sm text-gray-500">PDF import functionality is coming soon</p>
            </div>
          </TabsContent>

          {!previewData && (
            <Button onClick={handleUpload} disabled={!file || isUploading || isImporting} className="mt-6">
              {isUploading ? "Processing..." : "Upload and Preview"}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          )}

          {previewData && (
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Preview Data (First 5 rows)</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(previewData[0]).map((header) => (
                          <TableHead key={header} className="whitespace-nowrap">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.values(row).map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="whitespace-nowrap">
                              {String(cell)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Column Mappings (Auto-detected)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Columns have been automatically mapped based on the renewal report format. You can adjust if needed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(previewData[0]).map((header) => (
                    <div key={header} className="space-y-2">
                      <Label htmlFor={`mapping-${header}`} className="text-sm font-medium">
                        {header}
                      </Label>
                      <select
                        id={`mapping-${header}`}
                        value={columnMappings[header] || ""}
                        onChange={(e) => handleMappingChange(header, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">-- Skip this column --</option>
                        {allFields.map((field) => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                            {field.required ? " *" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewData(null)
                    setColumnMappings({})
                  }}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? "Importing..." : `Import ${previewData.length}+ Renewals`}
                </Button>
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
