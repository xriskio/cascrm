
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { ImportPreviewTable } from "./import-preview-table"

interface ImportResult {
  success: boolean
  message: string
  imported: number
  errors: string[]
}

export function ImportLeadsForm() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    setResult(null)
    setShowPreview(false)

    // Parse first file for preview
    if (acceptedFiles.length > 0) {
      parseFileForPreview(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    multiple: true,
  })

  const parseFileForPreview = async (file: File) => {
    try {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const text = await file.text()
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
        const data = lines.slice(1, 6).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })
          return row
        })
        setPreviewData(data)
        setShowPreview(true)
      }
    } catch (error) {
      console.error("Error parsing file:", error)
    }
  }

  const handleImport = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/leads/import", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const result = await response.json()
      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        message: "Import failed: " + (error as Error).message,
        imported: 0,
        errors: [(error as Error).message],
      })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.includes("csv") || file.name.endsWith(".csv")) return "📊"
    if (file.type.includes("excel") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) return "📈"
    if (file.type.includes("pdf")) return "📄"
    if (file.type.includes("word") || file.name.endsWith(".docx")) return "📝"
    return "📁"
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop your files here, or click to browse. Supports CSV, Excel, PDF, and Word documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag & drop files here, or click to select files</p>
                <p className="text-sm text-gray-500">Supports: CSV, Excel (.xlsx, .xls), PDF, Word (.docx)</p>
              </div>
            )}
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(file)}</span>
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <Badge variant="outline">{file.type || "Unknown"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Data */}
      {showPreview && previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>Preview of the first 5 rows from your file</CardDescription>
          </CardHeader>
          <CardContent>
            <ImportPreviewTable data={previewData} />
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {uploading && (
        <Card>
          <CardHeader>
            <CardTitle>Importing...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {result && (
        <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            <div className="font-medium mb-2">{result.message}</div>
            {result.success && (
              <div className="text-sm text-green-700">Successfully imported {result.imported} leads</div>
            )}
            {result.errors.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium text-red-700 mb-1">Errors:</div>
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Import Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleImport}
          disabled={files.length === 0 || uploading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {uploading ? (
            <>
              <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import {files.length} File{files.length !== 1 ? "s" : ""}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
