"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Clock,
  FileText,
  DollarSign,
  Edit,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Contact {
  id: string
  entity_id: string
  display_name: string
  customer_no?: string
  first_name?: string
  last_name?: string
  company_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  is_person?: boolean
  prospect?: boolean
  customer_since?: string
  agent_name?: string
  csr_name?: string
  customer_priority?: string
  type?: string
  created_at?: string
  updated_at?: string
}

export default function ContactDetailPage() {
  const params = useParams()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadContact(params.id as string)
    }
  }, [params.id])

  const loadContact = async (contactId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase.from("contacts").select("*").eq("id", contactId).single()

      if (fetchError) {
        throw fetchError
      }

      setContact(data as any)
    } catch (error) {
      console.error("Error loading contact:", error)
      setError(`Failed to load contact: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (isProspect?: boolean) => {
    return isProspect ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
  }

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "bg-gray-100 text-gray-800"

    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !contact) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Not Found</h3>
        <p className="text-gray-600 mb-4">{error || "The contact you're looking for doesn't exist."}</p>
        <Button asChild>
          <Link href="/contacts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/contacts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contact.display_name}</h1>
            <p className="text-gray-600">
              {contact.company_name && `${contact.company_name} • `}
              Customer #{contact.customer_no || contact.entity_id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/contacts/${contact.id}/policies`}>View Policies</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/contacts/${contact.id}/files`}>View Files</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/contacts/${contact.id}/account`}>Account Info</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center space-x-2">
        <Badge className={getStatusColor(contact.prospect)} variant="outline">
          {contact.prospect ? "Prospect" : "Customer"}
        </Badge>
        <Badge className="bg-blue-100 text-blue-800" variant="outline">
          {contact.is_person ? "Individual" : "Business"}
        </Badge>
        {contact.customer_priority && (
          <Badge className={getPriorityColor(contact.customer_priority)} variant="outline">
            {contact.customer_priority} Priority
          </Badge>
        )}
        {contact.type && (
          <Badge className="bg-purple-100 text-purple-800" variant="outline">
            {contact.type}
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.first_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">First Name</label>
                    <p className="text-sm">{contact.first_name}</p>
                  </div>
                )}
                {contact.last_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    <p className="text-sm">{contact.last_name}</p>
                  </div>
                )}
                {contact.company_name && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="text-sm font-medium">{contact.company_name}</p>
                  </div>
                )}
                {contact.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}
                {contact.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`tel:${contact.phone}`} className="text-sm text-blue-600 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          {(contact.address || contact.city || contact.state || contact.zip) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contact.address && <p className="text-sm">{contact.address}</p>}
                  <p className="text-sm">{[contact.city, contact.state, contact.zip].filter(Boolean).join(", ")}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Customer Number</label>
                <p className="text-sm font-mono">{contact.customer_no || contact.entity_id}</p>
              </div>
              {contact.agent_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Agent</label>
                  <p className="text-sm">{contact.agent_name}</p>
                </div>
              )}
              {contact.csr_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">CSR</label>
                  <p className="text-sm">{contact.csr_name}</p>
                </div>
              )}
              {contact.customer_since && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Since</label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-sm">{formatDate(contact.customer_since)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/contacts/${contact.id}/policies`}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Policies
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/contacts/${contact.id}/files`}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Files
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/contacts/${contact.id}/account`}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Account Info
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Entity ID</label>
                <p className="text-sm font-mono">{contact.entity_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-sm">{formatDate(contact.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm">{formatDate(contact.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
