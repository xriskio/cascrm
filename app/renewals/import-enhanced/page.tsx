"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"

import { previewRenewalData, importRenewalData } from "@/lib/api"

export default function RenewalsImportPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalRecords, setTotalRecords] = useState(0)
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({})
  const [showMappingStep, setShowMappingStep] = useState(false)
  const [qqApiFields, setQqApiFields] = useState<string[]>([])
  const [sampleData, setSampleData] = useState<any[]>([])

  const renewalFields = [
    { key: "policy_number", label: "Policy Number", required: true },
    { key: "insured_name", label: "Insured Name", required: true },
    { key: "client_name", label: "Client Name", required: false },
    { key: "business_name", label: "Business Name", required: false },
    { key: "policy_type", label: "Policy Type", required: true },
    { key: "line_of_business", label: "Line of Business", required: false },
    { key: "effective_date", label: "Effective Date", required: false },
    { key: "expiration_date", label: "Expiration Date", required: true },
    { key: "insurance_carrier", label: "Insurance Carrier", required: true },
    { key: "writing_carrier", label: "Writing Carrier", required: false },
    { key: "policy_premium", label: "Policy Premium", required: false },
    { key: "expiring_premium", label: "Expiring Premium", required: false },
    { key: "expiring_commission", label: "Expiring Commission", required: false },
    { key: "agency_commission_total", label: "Agency Commission Total", required: false },
    { key: "renewal_premium", label: "Renewal Premium", required: false },
    { key: "renewal_commission", label: "Renewal Commission", required: false },
    { key: "producer", label: "Producer", required: false },
    { key: "csr_on_policy", label: "CSR On Policy", required: false },
    { key: "agent_on_policy", label: "Agent On Policy", required: false },
    { key: "retail_agency_name", label: "Retail Agency Name", required: false },
    { key: "wholesaler_mga", label: "Wholesaler or MGA", required: false },
    { key: "customer_first_name", label: "Customer First Name", required: false },
    { key: "customer_last_name", label: "Customer Last Name", required: false },
    { key: "customer_primary_phone", label: "Customer Primary Phone", required: false },
    { key: "customer_primary_email", label: "Customer Primary Email", required: false },
    { key: "client_email", label: "Client Email", required: false },
    { key: "client_phone", label: "Client Phone", required: false },
    { key: "preferred_contact_method", label: "Preferred Contact Method", required: false },
    { key: "status", label: "Status", required: false },
    { key: "policy_status", label: "Policy Status", required: false },
    { key: "notes", label: "Notes", required: false },
    { key: "reason_lost", label: "Reason Lost", required: false },
    { key: "task", label: "Task", required: false },
  ]

  const handleImport = async (fieldMappings: Record<string, string>) => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates")
      return
    }

    setIsImporting(true)
    setError(null)

    try {
      const result = await importRenewalData({
        startDate,
        endDate,
        fieldMappings,
      })

      if (result.success) {
        setTotalRecords(result.totalRecords)
        alert(`${result.totalRecords} renewals imported successfully!`)
      } else {
        setError(result.error || "Failed to import data")
      }
    } catch (error) {
      console.error("Error importing data:", error)
      setError("Failed to import data")
    } finally {
      setIsImporting(false)
    }
  }

  const handlePreviewData = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await previewRenewalData({
        startDate,
        endDate,
        pageSize: 5, // Preview first 5 records
      })

      if (result.success && result.data) {
        setSampleData(result.data)

        // Extract field names from the first record
        if (result.data.length > 0) {
          const fields = Object.keys(result.data[0])
          setQqApiFields(fields)
          setShowMappingStep(true)

          // Auto-map fields
          setTimeout(() => {
            autoMapFields()
          }, 100)
        }
      } else {
        setError(result.error || "Failed to preview data")
      }
    } catch (error) {
      console.error("Error previewing data:", error)
      setError("Failed to preview data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldMapping = (qqField: string, renewalField: string) => {
    setFieldMappings((prev) => ({
      ...prev,
      [qqField]: renewalField,
    }))
  }

  const autoMapFields = () => {
    const autoMappings: Record<string, string> = {}

    qqApiFields.forEach((qqField) => {
      const normalizedQqField = qqField.toLowerCase().replace(/[^a-z0-9]/g, "_")

      // Find exact or close matches
      const exactMatch = renewalFields.find(
        (rf) =>
          rf.key.toLowerCase() === normalizedQqField ||
          rf.label.toLowerCase().replace(/[^a-z0-9]/g, "_") === normalizedQqField,
      )

      if (exactMatch) {
        autoMappings[qqField] = exactMatch.key
      } else {
        // Try partial matches
        const partialMatch = renewalFields.find((rf) => {
          const rfKey = rf.key.toLowerCase()
          const rfLabel = rf.label.toLowerCase()
          return (
            rfKey.includes(normalizedQqField.split("_")[0]) ||
            normalizedQqField.includes(rfKey.split("_")[0]) ||
            rfLabel.includes(qqField.toLowerCase()) ||
            qqField.toLowerCase().includes(rfLabel.split(" ")[0].toLowerCase())
          )
        })

        if (partialMatch) {
          autoMappings[qqField] = partialMatch.key
        }
      }
    })

    setFieldMappings(autoMappings)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Renewals Import</h1>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[240px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date > new Date() || date < new Date("2023-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[240px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date > new Date() || date < new Date("2023-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <Button
          onClick={handlePreviewData}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? "Loading..." : "Preview Data"}
        </Button>

        {showMappingStep && sampleData.length > 0 && (
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Field Mapping</h3>
              <p className="text-sm text-gray-600 mb-4">
                Map QQCatalyst API fields to your renewal database fields. Required fields are marked with *.
              </p>

              <div className="flex justify-between items-center mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={autoMapFields}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Auto-Map Fields
                </Button>
                <span className="text-sm text-gray-500">
                  {Object.keys(fieldMappings).length} of {qqApiFields.length} fields mapped
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                {qqApiFields.map((qqField) => (
                  <div key={qqField} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      QQ Field: <span className="font-mono text-blue-600">{qqField}</span>
                    </Label>
                    <Select
                      value={fieldMappings[qqField] || ""}
                      onValueChange={(value) => handleFieldMapping(qqField, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Select renewal field --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Skip this field --</SelectItem>
                        {renewalFields.map((field) => (
                          <SelectItem key={field.key} value={field.key}>
                            {field.label}
                            {field.required ? " *" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {sampleData[0] && sampleData[0][qqField] && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        Sample: {String(sampleData[0][qqField]).substring(0, 50)}
                        {String(sampleData[0][qqField]).length > 50 ? "..." : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Preview Sample Data</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-blue-200">
                        {qqApiFields.slice(0, 6).map((field) => (
                          <th key={field} className="text-left py-2 px-2 text-blue-700">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.slice(0, 3).map((row, index) => (
                        <tr key={index} className="border-b border-blue-100">
                          {qqApiFields.slice(0, 6).map((field) => (
                            <td key={field} className="py-2 px-2 text-gray-700">
                              {String(row[field] || "").substring(0, 20)}
                              {String(row[field] || "").length > 20 ? "..." : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {qqApiFields.length > 6 && (
                  <p className="text-xs text-blue-600 mt-2">Showing first 6 of {qqApiFields.length} fields</p>
                )}
              </div>
            </div>
          </div>
        )}

        {showMappingStep && (
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowMappingStep(false)
                setSampleData([])
                setQqApiFields([])
                setFieldMappings({})
              }}
              disabled={isImporting}
            >
              Back to Preview
            </Button>
            <Button
              type="button"
              onClick={() => handleImport(fieldMappings)}
              disabled={isImporting || Object.keys(fieldMappings).length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? "Importing..." : `Import ${totalRecords} Renewals`}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
