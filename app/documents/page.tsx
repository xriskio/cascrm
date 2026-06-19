import { PageHeader } from "@/components/ui/page-header"
import { Upload, Search, FileText, Folder, Filter, Grid, List } from "lucide-react"

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="Documents" subtitle="AI-powered document management and intelligent search">
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </PageHeader>

      <div className="p-6">
        {/* AI Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="🤖 AI-powered search across all documents, content, and metadata..."
                className="w-full pl-12 pr-4 py-4 bg-card backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-card backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option>All Types</option>
                <option>PDFs</option>
                <option>Images</option>
                <option>Spreadsheets</option>
                <option>Word Documents</option>
              </select>
              <button className="p-2 bg-card backdrop-blur-sm border border-border/50 rounded-lg hover:shadow-md transition-all duration-200">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex bg-card backdrop-blur-sm border border-border/50 rounded-lg p-1">
                <button className="p-2 bg-blue-500 text-white rounded-md">
                  <Grid className="h-4 w-4" />
                </button>
                <button className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors duration-200">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Document Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                247
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Policy Documents</h3>
            <p className="text-sm text-muted-foreground">Insurance policies and related documents</p>
          </div>

          <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Folder className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                89
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Client Files</h3>
            <p className="text-sm text-muted-foreground">Client applications and submissions</p>
          </div>

          <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                156
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Certificates</h3>
            <p className="text-sm text-muted-foreground">Insurance certificates and endorsements</p>
          </div>

          <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Folder className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                73
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Reports</h3>
            <p className="text-sm text-muted-foreground">Analytics and compliance reports</p>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Recent Documents
            </h2>
          </div>

          <div className="p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="p-6 bg-card rounded-full mb-6">
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">No documents found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Upload your first document to get started with AI-powered document management and intelligent search.
              </p>
              <div className="flex gap-3">
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </button>
                <button className="bg-card backdrop-blur-sm border border-border/50 text-muted-foreground px-6 py-3 rounded-lg hover:shadow-md transition-all duration-200">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
