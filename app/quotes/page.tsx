"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface Quote {
  id: string
  quote_number: string
  submission_type: string
  insurance_type: string
  contact_name: string
  contact_email: string
  insured_name: string
  disposition_status: string
  total_premium: number
  quote_status: string
  created_at: string
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/quotes")
      if (response.ok) {
        const data = await response.json()
        setQuotes(data)
      } else {
        console.error("Failed to fetch quotes")
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.insured_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "quoted":
        return "bg-blue-100 text-blue-800"
      case "bound":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quotes</h1>
          <p className="text-gray-600">Manage and track insurance quotes</p>
        </div>
        <Button asChild variant="outline">
            <Link href="/quotes/compare">
              <span>⚖ Compare Quotes</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/quotes/new">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredQuotes.map((quote) => (
          <Card key={quote.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{quote.quote_number}</h3>
                    <Badge className={getStatusColor(quote.disposition_status)}>{quote.disposition_status}</Badge>
                    <Badge variant="outline">{quote.quote_status}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Contact</p>
                      <p className="font-medium">{quote.contact_name}</p>
                      <p className="text-gray-600">{quote.contact_email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Insured</p>
                      <p className="font-medium">{quote.insured_name}</p>
                      <p className="text-gray-600">{quote.insurance_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Premium</p>
                      <p className="font-medium">
                        {quote.total_premium ? `$${quote.total_premium.toLocaleString()}` : "TBD"}
                      </p>
                      <p className="text-gray-600">Created {new Date(quote.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">No quotes found</p>
            <Button asChild>
              <Link href="/quotes/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Quote
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
