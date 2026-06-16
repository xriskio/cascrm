"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, FileText, ExternalLink, Plus, BookmarkIcon, ClipboardList } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SimpleDeleteButton } from "@/components/simple-delete-button"
import { PageHeader } from "@/components/ui/page-header"

interface AgencyResource {
  id: string
  title: string
  description: string
  file_url?: string
  external_url?: string
  category: string
  created_at: string
  file_type?: string
  resource_type?: string
}

export default function AgencyResourcesPage() {
  const [resources, setResources] = useState<AgencyResource[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchResources() {
      try {
        setIsLoading(true)
        const supabase = createClient()

        console.log("Fetching resources from agency_resources table")

        const { data, error } = await supabase
          .from("agency_resources")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching resources:", error)
          throw error
        }

        console.log("Fetched resources:", data)

        setResources(data || [])
      } catch (error) {
        console.error("Error fetching resources:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [])

  const filteredResources = resources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="Agency Resources" subtitle="AI-powered resource management and quick access tools">
        <Link href="/agency-resources/add">
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </button>
        </Link>
      </PageHeader>

      <div className="p-6">
        {/* AI Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="🤖 AI-powered search across all resources..."
              className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/agency-resources/supplementals">
            <div className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-gray-800">Supplementals</h3>
                  <p className="text-sm text-gray-600 mt-1">View and manage supplemental documents</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/agency-resources/applications">
            <div className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-gray-800">Applications</h3>
                  <p className="text-sm text-gray-600 mt-1">Access application forms and documents</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/agency-resources/submission-contacts">
            <div className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <BookmarkIcon className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-gray-800">Submission Contacts</h3>
                  <p className="text-sm text-gray-600 mt-1">Find submission contact information</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* External Lookup Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <a
            href="https://tcportal.cpuc.ca.gov/TCP/s/"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-violet-500 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-gray-800">CA CPUC TCP LOOKUP</h3>
                  <p className="text-sm text-gray-600 mt-1">Lookup information for limousines, charter buses, etc.</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
            </div>
          </a>

          <a
            href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-blue-500 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-gray-800">SAFER DOT LOOKUP</h3>
                  <p className="text-sm text-gray-600 mt-1">Lookup DOT and trucking information</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
            </div>
          </a>

          <a
            href="https://npiregistry.cms.hhs.gov/search"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-teal-500 to-cyan-500 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-gray-800">NPI RECORDS LOOKUP</h3>
                  <p className="text-sm text-gray-600 mt-1">Non-emergency Medical Transport (VAN) provider lookup</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-teal-500 transition-colors duration-200" />
            </div>
          </a>
        </div>

        <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Recent Resources
        </h2>

        {isLoading ? (
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
            <p className="text-gray-500">Loading resources...</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.slice(0, 6).map((resource) => (
              <div
                key={resource.id}
                className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-xl">
                    {resource.resource_type === "link" || resource.external_url ? (
                      <ExternalLink className="h-6 w-6 text-blue-500" />
                    ) : (
                      <FileText className="h-6 w-6 text-orange-500" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {resource.external_url ? (
                        <a
                          href={resource.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors duration-200"
                        >
                          {resource.title}
                        </a>
                      ) : resource.file_url ? (
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors duration-200"
                        >
                          {resource.title}
                        </a>
                      ) : (
                        <span>{resource.title}</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{resource.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="inline-block px-3 py-1 text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full">
                        {resource.category}
                      </span>
                      <SimpleDeleteButton id={resource.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-lg font-medium mb-2 text-gray-800">No agency resources found</p>
              <p className="text-sm text-gray-600">Add resources using the button above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
