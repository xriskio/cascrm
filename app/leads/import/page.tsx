"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Copy, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ImportLeadsForm } from "@/components/leads/import-leads-form"
import { PasteImportModal } from "@/components/leads/paste-import-modal"

export default function ImportLeadsPage() {
  const [showPasteModal, setShowPasteModal] = useState(false)

  const downloadTemplate = () => {
    // Create CSV template
    const headers = ["Contact Name", "Company Name", "Email", "Phone", "Source", "Priority", "Notes"]
    const sampleRow = ["John Doe", "Acme Corp", "john@acme.com", "555-1234", "Website", "high", "Interested in commercial auto"]
    
    const csvContent = [
      headers.join(","),
      sampleRow.join(",")
    ].join("\n")
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lead_import_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Leads</h1>
          <p className="text-gray-600 mt-1">Import leads from various sources and formats</p>
        </div>
      </div>

      {/* Import Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setShowPasteModal(true)}
        >
          <CardHeader className="text-center">
            <Copy className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-blue-900">Cut & Paste</CardTitle>
            <CardDescription className="text-blue-700">Paste data directly from clipboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Paste Data</Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Upload className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-green-900">File Upload</CardTitle>
            <CardDescription className="text-green-700">Upload CSV, Excel, PDF, or Word files</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="bg-green-600 hover:bg-green-700 text-white">Upload Files</Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={downloadTemplate}>
          <CardHeader className="text-center">
            <Download className="w-12 h-12 text-purple-600 mx-auto mb-2" />
            <CardTitle className="text-purple-900">Download Template</CardTitle>
            <CardDescription className="text-purple-700">Get CSV template for lead imports</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={downloadTemplate}>Download Template</Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Leads
          </CardTitle>
          <CardDescription>Choose your import method and upload your lead data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">File Upload</TabsTrigger>
              <TabsTrigger value="paste">Paste Data</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-6">
              <ImportLeadsForm />
            </TabsContent>

            <TabsContent value="paste" className="mt-6">
              <div className="text-center py-8">
                <Copy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Paste Your Data</h3>
                <p className="text-gray-600 mb-4">Click the button below to open the paste import dialog</p>
                <Button onClick={() => setShowPasteModal(true)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Open Paste Dialog
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Supported Formats */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Formats</CardTitle>
          <CardDescription>We support the following file formats and data sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium">CSV</div>
              <div className="text-sm text-gray-500">Comma-separated</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium">Excel</div>
              <div className="text-sm text-gray-500">.xlsx, .xls</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="font-medium">PDF</div>
              <div className="text-sm text-gray-500">Text extraction</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-medium">Word</div>
              <div className="text-sm text-gray-500">.docx</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Copy className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="font-medium">Text</div>
              <div className="text-sm text-gray-500">Copy & paste</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paste Import Modal */}
      <PasteImportModal isOpen={showPasteModal} onClose={() => setShowPasteModal(false)} />
    </div>
  )
}
