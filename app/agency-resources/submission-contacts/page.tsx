"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, FileText, Plus, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SimpleDeleteButton } from "@/components/simple-delete-button"

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

export default function SubmissionContactsPage() {
  const [resources, setResources] = useState<AgencyResource[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchResources() {
      try {
        setIsLoading(true)
        const supabase: any = createClient()

        console.log("Fetching submission contact resources")

        const { data, error } = await supabase
          .from("agency_resources")
          .select("*")
          .eq("category", "Submission Contacts")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching submission contact resources:", error)
          throw error
        }

        console.log("Fetched submission contact resources:", data)

        setResources(data || [])
      } catch (error) {
        console.error("Error fetching submission contact resources:", error)
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Submission Contacts</h1>

      <div className="flex justify-between mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search submission contacts..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <Link href="/agency-resources/add">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-500">Loading submission contacts...</p>
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-100 p-2 rounded-full">
                  {resource.resource_type === "link" || resource.external_url ? (
                    <ExternalLink className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-orange-500" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-medium truncate">
                    {resource.external_url ? (
                      <a
                        href={resource.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {resource.title}
                      </a>
                    ) : resource.file_url ? (
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {resource.title}
                      </a>
                    ) : (
                      <span>{resource.title}</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full">{resource.category}</span>
                    <SimpleDeleteButton id={resource.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-500">No submission contacts found. Add contacts using the button above.</p>
        </div>
      )}
    </div>
  )
}
