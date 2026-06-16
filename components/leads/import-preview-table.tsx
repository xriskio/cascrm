"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface ImportPreviewTableProps {
  data: any[]
}

export function ImportPreviewTable({ data }: ImportPreviewTableProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-gray-500">No data to preview</div>
  }

  const headers = Object.keys(data[0])

  const validateField = (header: string, value: string) => {
    if (!value || value.trim() === "") return "empty"

    if (header.toLowerCase().includes("email")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) ? "valid" : "invalid"
    }

    if (header.toLowerCase().includes("phone")) {
      const phoneRegex = /[\d\-$$$$+\s]{10,}/
      return phoneRegex.test(value) ? "valid" : "invalid"
    }

    return "valid"
  }

  const getValidationIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "invalid":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "empty":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {headers.map((header) => (
              <TableHead key={header} className="font-medium">
                {header}
              </TableHead>
            ))}
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const rowErrors = headers.filter((header) => validateField(header, row[header]) === "invalid").length
            const rowWarnings = headers.filter((header) => validateField(header, row[header]) === "empty").length

            return (
              <TableRow key={index} className={rowErrors > 0 ? "bg-red-50" : rowWarnings > 0 ? "bg-yellow-50" : ""}>
                {headers.map((header) => {
                  const validation = validateField(header, row[header])
                  return (
                    <TableCell key={header} className="relative">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            validation === "invalid" ? "text-red-600" : validation === "empty" ? "text-yellow-600" : ""
                          }
                        >
                          {row[header] || "-"}
                        </span>
                        {getValidationIcon(validation)}
                      </div>
                    </TableCell>
                  )
                })}
                <TableCell>
                  {rowErrors > 0 ? (
                    <Badge variant="destructive">Errors: {rowErrors}</Badge>
                  ) : rowWarnings > 0 ? (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      Warnings: {rowWarnings}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Valid
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
