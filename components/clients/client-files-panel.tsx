"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Download, Search, FileImage, FileSpreadsheet, File, Folder, RefreshCw, Eye } from "lucide-react"
import { getClientFiles, refreshClientFiles } from "@/app/actions/client-files-actions"
import { FILE_TYPES, type BlobInfoDTO } from "@/types/qqcatalyst-files"
import { downloadFile } from "@/lib/qqcatalyst/api"
import { formatDistanceToNow } from "date-fns"

interface ClientFilesPanelProps {
  clientId: string
  contactId: string
}

export function ClientFilesPanel({ clientId, contactId }: ClientFilesPanelProps) {
  const [files, setFiles] = useState<BlobInfoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFileType, setSelectedFileType] = useState<string>(FILE_TYPES.ALL)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const fetchFiles = async (fileType: string = FILE_TYPES.ALL, page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await getClientFiles({
        contactId,
        dlFileType: fileType,
        pageNumber: page,
        pageSize: 20,
      })

      if (response.IsSuccess) {
        setFiles(response.Data || [])
        setCurrentPage(response.PageNumber)
        setTotalPages(response.PagesTotal)
        setTotalItems(response.TotalItems)
      } else {
        setError(response.ErrorMessage || "Failed to fetch files")
      }
    } catch (err) {
      setError("Failed to fetch client files")
      console.error("Error fetching files:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await refreshClientFiles(clientId)
      await fetchFiles(selectedFileType, currentPage)
    } catch (err) {
      setError("Failed to refresh files")
    } finally {
      setRefreshing(false)
    }
  }

  const handleDownload = async (file: BlobInfoDTO) => {
    try {
      if (file.BlobUrl) {
        await downloadFile(file.BlobUrl, file.FileName || file.DisplayName)
      } else {
        setError("File download URL not available")
      }
    } catch (err) {
      setError("Failed to download file")
      console.error("Download error:", err)
    }
  }

  const getFileIcon = (fileType: string) => {
    const type = fileType?.toLowerCase() || ""
    if (type.includes("image") || type.includes("jpg") || type.includes("png") || type.includes("gif")) {
      return <FileImage className="h-4 w-4" />
    }
    if (type.includes("excel") || type.includes("spreadsheet") || type.includes("csv")) {
      return <FileSpreadsheet className="h-4 w-4" />
    }
    if (type.includes("pdf") || type.includes("document") || type.includes("word")) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      !searchTerm ||
      file.FileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.DisplayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.Description?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  useEffect(() => {
    fetchFiles(selectedFileType, 1)
  }, [contactId, selectedFileType])

  if (loading && files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Client Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading files...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Client Files
            </CardTitle>
            <CardDescription>{totalItems} files found</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedFileType} onValueChange={setSelectedFileType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="File type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FILE_TYPES).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Files List */}
        <ScrollArea className="h-96">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No files found</p>
              {searchTerm && <p className="text-sm">Try adjusting your search criteria</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <div key={file.Id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file.FileType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.DisplayName || file.FileName}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatFileSize(file.FileSize)}</span>
                        <span>{file.FileType}</span>
                        {file.CreatedOn && (
                          <span>{formatDistanceToNow(new Date(file.CreatedOn), { addSuffix: true })}</span>
                        )}
                      </div>
                      {file.Description && <p className="text-xs text-gray-600 mt-1 truncate">{file.Description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.RelatedPolicyIDs && file.RelatedPolicyIDs.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {file.RelatedPolicyIDs.length} policies
                      </Badge>
                    )}

                    {file.BlobUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.BlobUrl, "_blank")}
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => handleDownload(file)} title="Download file">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFiles(selectedFileType, currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFiles(selectedFileType, currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
