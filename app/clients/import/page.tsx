"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, Download, FileSpreadsheet, CheckCircle, File, AlertTriangle } from "lucide-react"
import Link from "next/link"

const clientFields = [
  { key: "account_name", label: "Account Name *", required: true },
  { key: "uid", label: "UID", required: false },
  { key: "customer_type", label: "Customer Type", required: false },
  { key: "zip", label: "Zip", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "secondary_phone", label: "Secondary Phone", required: false },
  { key: "email", label: "Email", required: false },
  { key: "secondary_email", label: "Secondary Email", required: false },
  { key: "street_address", label: "Street Address", required: false },
  { key: "street_address_line_2", label: "Street Address Line 2", required: false },
  { key: "city", label: "City", required: false },
  { key: "country", label: "Country", required: false },
  { key: "state", label: "State", required: false },
  { key: "csr", label: "CSR", required: false },
  { key: "broker_fee", label: "Broker Fee", required: false },
  { key: "producer", label: "Producer", required: false },
  { key: "carrier", label: "Carrier", required: false },
  { key: "lead_source", label: "Lead Source", required: false },
  { key: "policy_type", label: "Policy Type", required: false },
  { key: "policy_line", label: "Policy Line", required: false },
  { key: "policy_number", label: "Policy Number", required: false },
  { key: "policy_status", label: "Policy Status", required: false },
  { key: "premium", label: "Premium", required: false },
  { key: "items", label: "Items", required: false },
  { key: "effective_date", label: "Effective Date", required: false },
  { key: "expiration_date", label: "Expiration Date", required: false },
  { key: "sold_date", label: "Sold Date", required: false },
  { key: "create_date", label: "Create Date", required: false },
  { key: "birth_date", label: "Birth Date", required: false },
  { key: "customer_since", label: "Customer Since", required: false },
  { key: "nickname", label: "Nickname", required: false },
  { key: "marital_status", label: "Marital Status", required: false },
  { key: "business_entity", label: "Business Entity", required: false },
  { key: "fein_number", label: "FEIN Number", required: false },
  { key: "business_classification", label: "Business Classification", required: false },
  { key: "naics_code", label: "NAICS Code", required: false },
  { key: "year_business_started", label: "Year Business Started", required: false },
  { key: "number_of_employees", label: "Number of Employees", required: false },
  { key: "annual_revenue", label: "Annual Revenue", required: false },
  { key: "total_payroll", label: "Total Payroll", required: false },
  { key: "customer_tag_1", label: "Customer Tag 1", required: false },
  { key: "customer_tag_2", label: "Customer Tag 2", required: false },
  { key: "customer_tag_3", label: "Customer Tag 3", required: false },
  { key: "customer_tag_4", label: "Customer Tag 4", required: false },
  { key: "customer_tag_5", label: "Customer Tag 5", required: false },
  { key: "customer_tag_6", label: "Customer Tag 6", required: false },
  { key: "customer_tag_7", label: "Customer Tag 7", required: false },
  { key: "customer_tag_8", label: "Customer Tag 8", required: false },
  { key: "customer_tag_9", label: "Customer Tag 9", required: false },
]

export default function ImportClientsPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")
  const [importResults, setImportResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")
    setIsProcessing(true)

    try {
      const extension = file.name.split(".").pop()?.toLowerCase()

      if (extension === "csv") {
        await handleCSV(file)
      } else if (extension === "xlsx" || extension === "xls") {
        await handleExcel(file)
      } else {
        throw new Error("Please select a CSV or Excel file")
      }

      setCurrentStep(2)
    } catch (err: any) {
      setError(err.message || "Error processing file")
      console.error("File processing error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCSV = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n").filter((line) => line.trim())

          if (lines.length < 2) {
            throw new Error("CSV file must have at least a header row and one data row")
          }

          // Simple CSV parsing - split by comma
          const headerRow = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
          const dataRows = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
            const row: any = {}
            headerRow.forEach((header, index) => {
              row[header] = values[index] || ""
            })
            return row
          })

          setHeaders(headerRow)
          setFileData(dataRows)

          // Enhanced auto-mapping for all fields
          const mapping = generateAutoMapping(headerRow)
          setFieldMapping(mapping)

          resolve()
        } catch (err) {
          reject(err)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  const handleExcel = async (file: File): Promise<void> => {
    try {
      const XLSX = await import("xlsx")

      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

            if (jsonData.length < 2) {
              throw new Error("Excel file must have at least a header row and one data row")
            }

            const headerRow = jsonData[0].map((h) => String(h || "").trim())
            const dataRows = jsonData
              .slice(1)
              .map((row) => {
                const rowData: any = {}
                headerRow.forEach((header, index) => {
                  rowData[header] = String(row[index] || "").trim()
                })
                return rowData
              })
              .filter((row) => Object.values(row).some((val) => val))

            setHeaders(headerRow)
            setFileData(dataRows)

            const mapping = generateAutoMapping(headerRow)
            setFieldMapping(mapping)

            resolve()
          } catch (err) {
            reject(err)
          }
        }

        reader.onerror = () => reject(new Error("Failed to read Excel file"))
        reader.readAsArrayBuffer(file)
      })
    } catch (err) {
      throw new Error("Failed to load Excel processing library")
    }
  }

  const generateAutoMapping = (headerRow: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {}

    headerRow.forEach((header) => {
      const lower = header.toLowerCase().replace(/[^a-z0-9]/g, "")

      // Direct matches
      if (lower === "accountname") mapping[header] = "account_name"
      else if (lower === "uid") mapping[header] = "uid"
      else if (lower === "customertype") mapping[header] = "customer_type"
      else if (lower === "zip" || lower === "zipcode" || lower === "postalcode") mapping[header] = "zip"
      else if (lower === "phone" || lower === "phonenumber") mapping[header] = "phone"
      else if (lower === "secondaryphone") mapping[header] = "secondary_phone"
      else if (lower === "email" || lower === "emailaddress") mapping[header] = "email"
      else if (lower === "secondaryemail") mapping[header] = "secondary_email"
      else if (lower === "streetaddress" || lower === "address") mapping[header] = "street_address"
      else if (lower === "streetaddressline2" || lower === "address2") mapping[header] = "street_address_line_2"
      else if (lower === "city") mapping[header] = "city"
      else if (lower === "country") mapping[header] = "country"
      else if (lower === "state") mapping[header] = "state"
      else if (lower === "csr") mapping[header] = "csr"
      else if (lower === "brokerfee") mapping[header] = "broker_fee"
      else if (lower === "producer") mapping[header] = "producer"
      else if (lower === "carrier") mapping[header] = "carrier"
      else if (lower === "leadsource") mapping[header] = "lead_source"
      else if (lower === "policytype") mapping[header] = "policy_type"
      else if (lower === "policyline") mapping[header] = "policy_line"
      else if (lower === "policynumber") mapping[header] = "policy_number"
      else if (lower === "policystatus") mapping[header] = "policy_status"
      else if (lower === "premium") mapping[header] = "premium"
      else if (lower === "items") mapping[header] = "items"
      else if (lower === "effectivedate") mapping[header] = "effective_date"
      else if (lower === "expirationdate") mapping[header] = "expiration_date"
      else if (lower === "solddate") mapping[header] = "sold_date"
      else if (lower === "createdate") mapping[header] = "create_date"
      else if (lower === "birthdate") mapping[header] = "birth_date"
      else if (lower === "customersince") mapping[header] = "customer_since"
      else if (lower === "nickname") mapping[header] = "nickname"
      else if (lower === "maritalstatus") mapping[header] = "marital_status"
      else if (lower === "businessentity") mapping[header] = "business_entity"
      else if (lower === "feinnumber" || lower === "ein") mapping[header] = "fein_number"
      else if (lower === "businessclassification") mapping[header] = "business_classification"
      else if (lower === "naicscode") mapping[header] = "naics_code"
      else if (lower === "yearbusinessstarted") mapping[header] = "year_business_started"
      else if (lower === "numberofemployees") mapping[header] = "number_of_employees"
      else if (lower === "annualrevenue") mapping[header] = "annual_revenue"
      else if (lower === "totalpayroll") mapping[header] = "total_payroll"
      else if (lower === "customertag1") mapping[header] = "customer_tag_1"
      else if (lower === "customertag2") mapping[header] = "customer_tag_2"
      else if (lower === "customertag3") mapping[header] = "customer_tag_3"
      else if (lower === "customertag4") mapping[header] = "customer_tag_4"
      else if (lower === "customertag5") mapping[header] = "customer_tag_5"
      else if (lower === "customertag6") mapping[header] = "customer_tag_6"
      else if (lower === "customertag7") mapping[header] = "customer_tag_7"
      else if (lower === "customertag8") mapping[header] = "customer_tag_8"
      else if (lower === "customertag9") mapping[header] = "customer_tag_9"
      // Partial matches for common variations
      else if (lower.includes("name") && !lower.includes("business")) mapping[header] = "account_name"
      else if (lower.includes("customer") && lower.includes("type")) mapping[header] = "customer_type"
      else if (lower.includes("phone") && !lower.includes("secondary")) mapping[header] = "phone"
      else if (lower.includes("email") && !lower.includes("secondary")) mapping[header] = "email"
    })

    return mapping
  }

  const generatePreview = () => {
    const preview = fileData.slice(0, 5).map((row) => {
      const mappedRow: any = {}
      Object.entries(fieldMapping).forEach(([csvField, clientField]) => {
        if (clientField && clientField !== "skip") {
          mappedRow[clientField] = row[csvField]
        }
      })
      return mappedRow
    })
    setPreviewData(preview)
    setCurrentStep(3)
  }

  const executeImport = async () => {
    setIsProcessing(true)
    setImportResults({
      success: 0,
      errors: 0,
      skipped: 0,
      total: fileData.length,
      errorDetails: [],
      skippedDetails: [],
    })

    try {
      const mappedData = fileData.map((row) => {
        const mappedRow: any = {}
        Object.entries(fieldMapping).forEach(([csvField, clientField]) => {
          if (clientField && clientField !== "skip") {
            mappedRow[clientField] = row[csvField]
          }
        })
        return mappedRow
      })

      // Process in smaller batches to avoid overwhelming the API
      const batchSize = 100
      const totalResults = {
        success: 0,
        errors: 0,
        skipped: 0,
        total: mappedData.length,
        errorDetails: [] as string[],
        skippedDetails: [] as string[],
      }

      for (let i = 0; i < mappedData.length; i += batchSize) {
        const batch = mappedData.slice(i, i + batchSize)
        const batchNumber = Math.floor(i / batchSize) + 1
        const totalBatches = Math.ceil(mappedData.length / batchSize)

        console.log(`Processing batch ${batchNumber} of ${totalBatches} (${batch.length} records)`)

        try {
          const response = await fetch("/api/clients/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clients: batch }),
          })

          if (!response.ok) {
            throw new Error(`Batch ${batchNumber} failed: ${response.statusText}`)
          }

          const batchResults = await response.json()

          // Accumulate results
          totalResults.success += batchResults.success || 0
          totalResults.errors += batchResults.errors || 0
          totalResults.skipped += batchResults.skipped || 0

          if (batchResults.errorDetails) {
            totalResults.errorDetails.push(
              ...batchResults.errorDetails.map((error: string) => `Batch ${batchNumber}: ${error}`),
            )
          }

          if (batchResults.skippedDetails) {
            totalResults.skippedDetails.push(
              ...batchResults.skippedDetails.map((skipped: string) => `Batch ${batchNumber}: ${skipped}`),
            )
          }

          // Update progress in real-time
          setImportResults({ ...totalResults })
        } catch (batchError: any) {
          console.error(`Batch ${batchNumber} error:`, batchError)
          totalResults.errors += batch.length
          totalResults.errorDetails.push(`Batch ${batchNumber}: ${batchError.message}`)
          setImportResults({ ...totalResults })
        }

        // Give the API a breather between batches
        if (i + batchSize < mappedData.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      setImportResults(totalResults)
      setCurrentStep(4)
    } catch (error: any) {
      setError("Import failed. Please try again.")
      console.error("Import error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      "Account Name",
      "UID",
      "Customer Type",
      "Zip",
      "Phone",
      "Secondary Phone",
      "Email",
      "Secondary Email",
      "Street Address",
      "Street Address Line 2",
      "City",
      "Country",
      "State",
      "CSR",
      "Broker Fee",
      "Producer",
      "Carrier",
      "Lead Source",
      "Policy Type",
      "Policy Line",
      "Policy Number",
      "Policy Status",
      "Premium",
      "Items",
      "Effective Date",
      "Expiration Date",
      "Sold Date",
      "Create Date",
      "Birth Date",
      "Customer Since",
      "Nickname",
      "Marital Status",
      "Business Entity",
      "FEIN Number",
      "Business Classification",
      "NAICS Code",
      "Year Business Started",
      "Number of Employees",
      "Annual Revenue",
      "Total Payroll",
      "Customer Tag 1",
      "Customer Tag 2",
      "Customer Tag 3",
      "Customer Tag 4",
      "Customer Tag 5",
      "Customer Tag 6",
      "Customer Tag 7",
      "Customer Tag 8",
      "Customer Tag 9",
    ]

    const sampleData = [
      "John Doe Insurance",
      "UID001",
      "Commercial",
      "90210",
      "555-123-4567",
      "555-987-6543",
      "john@example.com",
      "john.alt@example.com",
      "123 Main St",
      "Suite 100",
      "Beverly Hills",
      "USA",
      "CA",
      "Mary Johnson",
      "500.00",
      "Jane Smith",
      "State Farm",
      "Website",
      "Commercial Auto",
      "Auto",
      "CA123456789",
      "Active",
      "5000.00",
      "2 Vehicles",
      "2024-01-01",
      "2025-01-01",
      "2023-12-15",
      "2023-12-01",
      "1980-05-15",
      "2020-01-01",
      "Johnny",
      "Married",
      "LLC",
      "12-3456789",
      "Transportation",
      "484110",
      "2010",
      "25",
      "1500000",
      "800000",
      "VIP",
      "High Value",
      "Referral",
      "",
      "",
      "",
      "",
      "",
      "",
    ]

    const csvContent = headers.join(",") + "\n" + sampleData.join(",")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "client_import_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFileData([])
    setHeaders([])
    setFieldMapping({})
    setPreviewData([])
    setError("")
    setImportResults(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/clients">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Import Clients</h1>
          <p className="text-muted-foreground">Import comprehensive client data from CSV or Excel files</p>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Progress value={(currentStep / 4) * 100} className="w-full" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Step {currentStep} of 4</span>
              <span>
                {currentStep === 1 && "Upload File"}
                {currentStep === 2 && "Map Fields"}
                {currentStep === 3 && "Preview Data"}
                {currentStep === 4 && "Import Complete"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Upload Your File</h3>

                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-border rounded text-red-600 text-sm">{error}</div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <FileSpreadsheet className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">CSV File</h4>
                      <p className="text-sm text-muted-foreground mb-4">Upload a CSV file with client data</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="csv-input"
                        disabled={isProcessing}
                      />
                      <label htmlFor="csv-input">
                        <Button variant="outline" disabled={isProcessing} asChild>
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose CSV File
                          </span>
                        </Button>
                      </label>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                      <File className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">Excel File</h4>
                      <p className="text-sm text-muted-foreground mb-4">Upload an Excel file (.xlsx/.xls)</p>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="excel-input"
                        disabled={isProcessing}
                      />
                      <label htmlFor="excel-input">
                        <Button variant="outline" disabled={isProcessing} asChild>
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Excel File
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template (49 Fields)
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      <strong>Supported Fields:</strong> Account Name, UID, Customer Type, Contact Info, Address, Policy
                      Details, Financial Data, Business Info, Customer Tags, and more.
                    </p>
                    <p>Download the template to see all 49 available fields.</p>
                  </div>

                  {isProcessing && (
                    <div className="mt-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Processing file...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Map Fields */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Map Your Fields</h3>
                  <p className="text-muted-foreground mb-4">
                    Found {headers.length} columns and {fileData.length} rows. Map your columns to client fields:
                  </p>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {headers.map((header) => (
                      <div key={header} className="flex items-center gap-4 p-3 border rounded">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{header}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            Sample: {fileData[0]?.[header] || "No data"}
                          </div>
                        </div>
                        <div className="flex-1">
                          <Select
                            value={fieldMapping[header] || ""}
                            onValueChange={(value) => setFieldMapping((prev) => ({ ...prev, [header]: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skip">Skip this column</SelectItem>
                              {clientFields.map((field) => (
                                <SelectItem key={field.key} value={field.key}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={resetForm}>
                      Start Over
                    </Button>
                    <Button onClick={generatePreview}>Preview Data</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Preview Data</h3>
                  <p className="text-muted-foreground mb-4">Preview of first 5 records (importing {fileData.length} total):</p>

                  <div className="overflow-x-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {Object.keys(previewData[0] || {}).map((key) => (
                            <th key={key} className="text-left p-2 font-medium min-w-32">
                              {clientFields.find((f) => f.key === key)?.label || key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index} className="border-t">
                            {Object.values(row).map((value: any, cellIndex) => (
                              <td key={cellIndex} className="p-2">
                                {value || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back to Mapping
                    </Button>
                    <div className="flex flex-col items-end gap-2">
                      {isProcessing && importResults && (
                        <div className="text-sm text-muted-foreground">
                          Progress: {importResults.success + importResults.errors + importResults.skipped} /{" "}
                          {importResults.total} processed
                        </div>
                      )}
                      <Button onClick={executeImport} disabled={isProcessing}>
                        {isProcessing ? "Importing..." : `Import ${fileData.length} Clients`}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Import Complete</h3>

                  {importResults && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                            <div className="text-sm text-muted-foreground">Successful</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{importResults.errors}</div>
                            <div className="text-sm text-muted-foreground">Errors</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{importResults.skipped || 0}</div>
                            <div className="text-sm text-muted-foreground">Skipped</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                            <div className="text-sm text-muted-foreground">Total</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Show error details if any */}
                      {importResults.errorDetails && importResults.errorDetails.length > 0 && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <h4 className="font-semibold text-red-600">Error Details</h4>
                            </div>
                            <div className="max-h-32 overflow-y-auto text-sm">
                              {importResults.errorDetails.map((error: string, index: number) => (
                                <div key={index} className="text-red-600 mb-1">
                                  {error}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Show skipped details if any */}
                      {importResults.skippedDetails && importResults.skippedDetails.length > 0 && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <h4 className="font-semibold text-yellow-600">Skipped Records</h4>
                            </div>
                            <div className="max-h-32 overflow-y-auto text-sm">
                              {importResults.skippedDetails.map((skipped: string, index: number) => (
                                <div key={index} className="text-yellow-600 mb-1">
                                  {skipped}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="flex gap-2 justify-center">
                        <Link href="/clients">
                          <Button>View Clients</Button>
                        </Link>
                        <Button variant="outline" onClick={resetForm}>
                          Import More
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
