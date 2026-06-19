"use client"

import { useState, useCallback } from "react"
import { Upload, X, CheckCircle, AlertCircle, FileSpreadsheet, FileText, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface ExtractedData {
  [key: string]: any
}

interface FileUploadExtractorProps {
  onDataExtracted: (data: ExtractedData) => void
}

export default function FileUploadExtractor({ onDataExtracted }: FileUploadExtractorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [showMapping, setShowMapping] = useState(false)

  // Field mapping configuration
  const fieldMappings = {
    // Business Information
    "business name": "businessName",
    "legal business name": "businessName",
    "company name": "businessName",
    "dba": "dba",
    "doing business as": "dba",
    "contact name": "contactName",
    "contact": "contactName",
    "phone": "phoneNumber",
    "phone number": "phoneNumber",
    "telephone": "phoneNumber",
    "email": "email",
    "email address": "email",
    "website": "website",
    "web site": "website",
    "url": "website",
    "years in business": "yearsInBusiness",
    "business years": "yearsInBusiness",
    "business type": "businessType",
    "address": "address",
    "street address": "address",
    "mailing address": "address",
    "city": "city",
    "state": "state",
    "zip": "zipCode",
    "zip code": "zipCode",
    "postal code": "zipCode",
    
    // Sales & Operations
    "new car sales": "newCarSales",
    "new vehicle sales": "newCarSales",
    "used car sales": "usedCarSales",
    "used vehicle sales": "usedCarSales",
    "service receipts": "serviceReceipts",
    "service revenue": "serviceReceipts",
    "parts sales": "partsSales",
    "parts revenue": "partsSales",
    "dealer license": "dealerLicense",
    "dealer license number": "dealerLicense",
    "license number": "dealerLicense",
    "dealer plates": "dealerPlates",
    "number of plates": "dealerPlates",
    
    // Coverage
    "dealer open lot limit": "dealerOpenLotLimit",
    "open lot limit": "dealerOpenLotLimit",
    "dealer open lot deductible": "dealerOpenLotDeductible",
    "open lot deductible": "dealerOpenLotDeductible",
    "garage liability limit": "garageLiabilityLimit",
    "liability limit": "garageLiabilityLimit",
    "garage liability deductible": "garageLiabilityDeductible",
    "liability deductible": "garageLiabilityDeductible",
    "e&o limit": "dealersEOLimit",
    "eo limit": "dealersEOLimit",
    "errors and omissions limit": "dealersEOLimit",
    "e&o deductible": "dealersEODeductible",
    "eo deductible": "dealersEODeductible",
    
    // Inventory
    "max vehicle value": "maxVehicleValue",
    "maximum vehicle value": "maxVehicleValue",
    "avg vehicle value": "avgVehicleValue",
    "average vehicle value": "avgVehicleValue",
    "max vehicles": "maxVehicles",
    "maximum vehicles": "maxVehicles",
    "vehicles on lot": "maxVehicles",
    
    // Insurance
    "current carrier": "currentCarrier",
    "current insurance carrier": "currentCarrier",
    "insurance carrier": "currentCarrier",
    "current premium": "currentPremium",
    "annual premium": "currentPremium",
    "premium": "currentPremium",
  }

  const normalizeFieldName = (name: string): string => {
    return name.toLowerCase().trim().replace(/[_\s]+/g, " ")
  }

  const findFieldMapping = (extractedKey: string): string | null => {
    const normalized = normalizeFieldName(extractedKey)
    return (fieldMappings as Record<string, string>)[normalized] || null
  }

  const parseCSV = (file: File): Promise<ExtractedData> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          try {
            const data: ExtractedData = {}
            
            // Handle CSV with two columns: Field Name, Value
            if (results.data.length > 0) {
              const firstRow = results.data[0] as any
              const keys = Object.keys(firstRow)
              
              // Check if it's a key-value format (2 columns)
              if (keys.length === 2) {
                const [keyCol, valueCol] = keys
                results.data.forEach((row: any) => {
                  const fieldName = row[keyCol]
                  const value = row[valueCol]
                  if (fieldName && value) {
                    const mappedField = findFieldMapping(fieldName)
                    if (mappedField) {
                      data[mappedField] = value
                    }
                  }
                })
              } else {
                // Standard CSV format - map headers to fields
                results.data.forEach((row: any) => {
                  Object.keys(row).forEach(key => {
                    const mappedField = findFieldMapping(key)
                    if (mappedField && row[key]) {
                      data[mappedField] = row[key]
                    }
                  })
                })
              }
            }
            
            resolve(data)
          } catch (err) {
            reject(err)
          }
        },
        error: (error: any) => {
          reject(error)
        }
      })
    })
  }

  const parseExcel = (file: File): Promise<ExtractedData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]
          
          const extractedData: ExtractedData = {}
          
          // Try to detect format
          if (jsonData.length > 0) {
            const firstRow = jsonData[0]
            
            // Check if it's a two-column key-value format
            if (firstRow.length === 2) {
              // Skip header row if it exists
              const startRow = (firstRow[0]?.toString().toLowerCase().includes("field") || 
                               firstRow[0]?.toString().toLowerCase().includes("name")) ? 1 : 0
              
              for (let i = startRow; i < jsonData.length; i++) {
                const row = jsonData[i]
                if (row[0] && row[1]) {
                  const mappedField = findFieldMapping(row[0].toString())
                  if (mappedField) {
                    extractedData[mappedField] = row[1]
                  }
                }
              }
            } else {
              // Standard table format with headers in first row
              const headers = firstRow.map((h: any) => h?.toString() || "")
              
              for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i]
                headers.forEach((header: string, index: number) => {
                  if (header && row[index]) {
                    const mappedField = findFieldMapping(header)
                    if (mappedField) {
                      extractedData[mappedField] = row[index]
                    }
                  }
                })
              }
            }
          }
          
          resolve(extractedData)
        } catch (err) {
          reject(err)
        }
      }
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  const parsePDF = async (file: File): Promise<ExtractedData> => {
    try {
      // Dynamic import for PDF.js
      const pdfjsLib = await import("pdfjs-dist")
      
      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let fullText = ""
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")
        fullText += pageText + "\n"
      }
      
      // Parse text to extract key-value pairs
      const extractedData: ExtractedData = {}
      const lines = fullText.split("\n")
      
      lines.forEach(line => {
        // Look for patterns like "Field Name: Value" or "Field Name - Value"
        const colonMatch = line.match(/^([^:]+):\s*(.+)$/)
        const dashMatch = line.match(/^([^-]+)-\s*(.+)$/)
        
        if (colonMatch && colonMatch[1] && colonMatch[2]) {
          const mappedField = findFieldMapping(colonMatch[1].trim())
          if (mappedField) {
            extractedData[mappedField] = colonMatch[2].trim()
          }
        } else if (dashMatch && dashMatch[1] && dashMatch[2]) {
          const mappedField = findFieldMapping(dashMatch[1].trim())
          if (mappedField) {
            extractedData[mappedField] = dashMatch[2].trim()
          }
        }
      })
      
      return extractedData
    } catch (err) {
      throw new Error("Failed to parse PDF: " + (err as Error).message)
    }
  }

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile)
    setError(null)
    setSuccess(false)
    setLoading(true)
    setExtractedData(null)
    setShowMapping(false)

    try {
      const fileExtension = uploadedFile.name.split(".").pop()?.toLowerCase()
      let data: ExtractedData = {}

      if (fileExtension === "csv") {
        data = await parseCSV(uploadedFile)
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        data = await parseExcel(uploadedFile)
      } else if (fileExtension === "pdf") {
        data = await parsePDF(uploadedFile)
      } else {
        throw new Error("Unsupported file format. Please upload CSV, Excel (XLSX/XLS), or PDF files.")
      }

      setExtractedData(data)
      setSuccess(true)
      setShowMapping(true)
      
    } catch (err) {
      console.error("Error parsing file:", err)
      setError((err as Error).message || "Failed to parse file")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileUpload(droppedFile)
    }
  }, [handleFileUpload])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileUpload(selectedFile)
    }
  }

  const handleApplyData = () => {
    if (extractedData) {
      onDataExtracted(extractedData)
      setSuccess(true)
      setError(null)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      return <FileSpreadsheet className="h-8 w-8 text-green-600" />
    } else if (ext === "pdf") {
      return <FileText className="h-8 w-8 text-red-600" />
    }
    return <File className="h-8 w-8 text-muted-foreground" />
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Quick Fill from File
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a CSV, Excel, or PDF file to automatically populate form fields
        </p>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
            <p className="text-sm text-muted-foreground">Supports CSV, Excel (XLSX/XLS), and PDF files</p>
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              {getFileIcon(file.name)}
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setExtractedData(null)
                  setShowMapping(false)
                  setSuccess(false)
                  setError(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {loading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Extracting data from file...</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && extractedData && showMapping && (
              <div className="space-y-4">
                <Alert className="bg-green-500/10 border-border">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-300">
                    Successfully extracted {Object.keys(extractedData).length} fields from the file
                  </AlertDescription>
                </Alert>

                <div className="bg-blue-500/10 border border-border rounded-lg p-4">
                  <h4 className="font-medium text-blue-300 mb-3">Extracted Fields Preview:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-blue-300">{key}:</span>{" "}
                        <span className="text-muted-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleApplyData} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply to Form
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null)
                      setExtractedData(null)
                      setShowMapping(false)
                      setSuccess(false)
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
