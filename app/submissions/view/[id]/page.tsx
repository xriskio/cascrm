"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { notFound, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mail,
  Printer,
  Download,
  Upload,
  FileText,
  Trash2,
  Plus,
  Edit2,
  Save,
  X,
  User,
  Car,
  Shield,
  Calendar,
  Clock,
  Building,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Submission {
  id: string
  tracking_number: string
  policy_type: string
  client_name: string
  contact_email: string
  contact_phone: string
  json_raw: any
  status: string
  assigned_agent?: string
  created_at: string
  updated_at: string
  notes?: string
  carrier?: string
  date_received?: string
  time_received?: string
  effective_date?: string
  expiration_date?: string
  premium_amount?: string
}

interface DocumentUpload {
  id: string
  name: string
  type: string
  category: string
  url?: string
  uploadedAt: string
}

export default function SubmissionViewPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [comments, setComments] = useState("")
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [showDrivers, setShowDrivers] = useState(true)
  const [showVehicles, setShowVehicles] = useState(true)
  const [showPolicy, setShowPolicy] = useState(true)
  
  // Editable fields
  const [editedStatus, setEditedStatus] = useState("")
  const [editedCarrier, setEditedCarrier] = useState("")
  const [editedDateReceived, setEditedDateReceived] = useState("")
  const [editedTimeReceived, setEditedTimeReceived] = useState("")
  const [editedAgent, setEditedAgent] = useState("")
  const [editedEffectiveDate, setEditedEffectiveDate] = useState("")
  const [editedExpirationDate, setEditedExpirationDate] = useState("")
  const [editedPremium, setEditedPremium] = useState("")
  
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSubmission()
  }, [params.id])

  const fetchSubmission = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("tracking_number", params.id)
        .single()

      if (error || !data) {
        notFound()
      }

      setSubmission(data)
      setComments(data.notes || "")
      
      // Initialize editable fields
      setEditedStatus(data.status || "pending")
      setEditedCarrier(data.carrier || "")
      setEditedDateReceived(data.date_received || "")
      setEditedTimeReceived(data.time_received || "")
      setEditedAgent(data.assigned_agent || "")
      setEditedEffectiveDate(data.effective_date || data.json_raw?.effectiveDate || "")
      setEditedExpirationDate(data.expiration_date || "")
      setEditedPremium(data.premium_amount || "")
      
      // Extract documents from json_raw if they exist
      const existingDocs = data.json_raw?.uploadedDocuments || []
      setDocuments(existingDocs)
    } catch (error) {
      console.error("Error fetching submission:", error)
      toast({
        title: "Error",
        description: "Failed to load submission",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("submissions")
        .update({
          status: editedStatus,
          carrier: editedCarrier,
          date_received: editedDateReceived,
          time_received: editedTimeReceived,
          assigned_agent: editedAgent,
          effective_date: editedEffectiveDate,
          expiration_date: editedExpirationDate,
          premium_amount: editedPremium,
          updated_at: new Date().toISOString(),
        })
        .eq("tracking_number", params.id)

      if (error) throw error

      // Update local state
      if (submission) {
        setSubmission({
          ...submission,
          status: editedStatus,
          carrier: editedCarrier,
          date_received: editedDateReceived,
          time_received: editedTimeReceived,
          assigned_agent: editedAgent,
          effective_date: editedEffectiveDate,
          expiration_date: editedExpirationDate,
          premium_amount: editedPremium,
        })
      }

      setIsEditMode(false)
      toast({
        title: "Success",
        description: "Changes saved successfully",
      })
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset to original values
    if (submission) {
      setEditedStatus(submission.status || "pending")
      setEditedCarrier(submission.carrier || "")
      setEditedDateReceived(submission.date_received || "")
      setEditedTimeReceived(submission.time_received || "")
      setEditedAgent(submission.assigned_agent || "")
      setEditedEffectiveDate(submission.effective_date || "")
      setEditedExpirationDate(submission.expiration_date || "")
      setEditedPremium(submission.premium_amount || "")
    }
    setIsEditMode(false)
  }

  const handleFileUpload = async (category: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const file = files[0]
      const supabase = createClient()
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${params.id}/${category}/${Date.now()}.${fileExt}`
      const filePath = `submissions/${fileName}`
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)
      
      const newDocument: DocumentUpload = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type,
        category: category,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      }

      const updatedDocuments = [...documents, newDocument]
      setDocuments(updatedDocuments)

      const { error } = await supabase
        .from("submissions")
        .update({
          json_raw: {
            ...submission?.json_raw,
            uploadedDocuments: updatedDocuments,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("tracking_number", params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    try {
      const updatedDocuments = documents.filter((doc) => doc.id !== docId)
      setDocuments(updatedDocuments)

      const supabase = createClient()
      const { error } = await supabase
        .from("submissions")
        .update({
          json_raw: {
            ...submission?.json_raw,
            uploadedDocuments: updatedDocuments,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("tracking_number", params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const handleSaveComments = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("submissions")
        .update({
          notes: comments,
          updated_at: new Date().toISOString(),
        })
        .eq("tracking_number", params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Comments saved successfully",
      })
    } catch (error) {
      console.error("Save comments error:", error)
      toast({
        title: "Error",
        description: "Failed to save comments",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      submitted: "bg-blue-100 text-blue-800 border-blue-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      under_review: "bg-purple-100 text-purple-800 border-purple-300",
      quoted: "bg-cyan-100 text-cyan-800 border-cyan-300",
      bound: "bg-teal-100 text-teal-800 border-teal-300",
    }

    return (
      <Badge
        className={`${statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-300"} capitalize`}
        variant="outline"
      >
        {status?.replace("_", " ") || "Pending"}
      </Badge>
    )
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const formatTime = (timeString: string): string => {
    if (!timeString) return "N/A"
    return timeString
  }

  const extractVehicleCount = (formData: any): number => {
    if (!formData) return 0
    if (formData.numberOfVehicles) return Number(formData.numberOfVehicles) || 0
    if (formData.vehicles?.length) return formData.vehicles.length
    return 0
  }

  const extractDriverCount = (formData: any): number => {
    if (!formData) return 0
    if (formData.numberOfDrivers) return Number(formData.numberOfDrivers) || 0
    if (formData.drivers?.length) return formData.drivers.length
    return 0
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading submission...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/submissions/list">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
        <div className="flex gap-3">
          {!isEditMode ? (
            <>
              <Button variant="outline" onClick={() => setIsEditMode(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Application Summary Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {submission.json_raw?.companyName ||
                  submission.json_raw?.businessName ||
                  submission.client_name ||
                  submission.tracking_number}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Application #{submission.tracking_number}
              </p>
            </div>
            {getStatusBadge(isEditMode ? editedStatus : submission.status)}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Policy Type</p>
              <p className="font-semibold capitalize">{submission.policy_type?.replace(/-/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Application Date</p>
              <p className="font-semibold">{formatDate(submission.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Number of Vehicles</p>
              <p className="font-semibold">{extractVehicleCount(submission.json_raw)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Number of Drivers</p>
              <p className="font-semibold">{extractDriverCount(submission.json_raw)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Status & Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Submission Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isEditMode ? (
                <Select value={editedStatus} onValueChange={setEditedStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="bound">Bound</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                  {getStatusBadge(submission.status)}
                </div>
              )}
            </div>

            {/* Carrier/Submitted To */}
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier / Submitted To</Label>
              {isEditMode ? (
                <Input
                  id="carrier"
                  value={editedCarrier}
                  onChange={(e) => setEditedCarrier(e.target.value)}
                  placeholder="Enter carrier name"
                />
              ) : (
                <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                  {submission.carrier || "Not specified"}
                </div>
              )}
            </div>

            {/* Agent Working On It */}
            <div className="space-y-2">
              <Label htmlFor="agent">Agent Working On It</Label>
              {isEditMode ? (
                <Input
                  id="agent"
                  value={editedAgent}
                  onChange={(e) => setEditedAgent(e.target.value)}
                  placeholder="Enter agent name"
                />
              ) : (
                <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                  {submission.assigned_agent || "Unassigned"}
                </div>
              )}
            </div>

            {/* Date Received */}
            <div className="space-y-2">
              <Label htmlFor="dateReceived" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Received
              </Label>
              {isEditMode ? (
                <Input
                  id="dateReceived"
                  type="date"
                  value={editedDateReceived}
                  onChange={(e) => setEditedDateReceived(e.target.value)}
                />
              ) : (
                <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                  {submission.date_received ? formatDate(submission.date_received) : "Not set"}
                </div>
              )}
            </div>

            {/* Time Received */}
            <div className="space-y-2">
              <Label htmlFor="timeReceived" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Time Received
              </Label>
              {isEditMode ? (
                <Input
                  id="timeReceived"
                  type="time"
                  value={editedTimeReceived}
                  onChange={(e) => setEditedTimeReceived(e.target.value)}
                />
              ) : (
                <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                  {submission.time_received || "Not set"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailRow label="Company Name" value={submission.json_raw?.companyName || submission.json_raw?.businessName} />
            <DetailRow label="Contact Name" value={submission.json_raw?.contactName} />
            <DetailRow label="Email" value={submission.json_raw?.email || submission.contact_email} />
            <DetailRow label="Phone" value={submission.json_raw?.phoneNumber || submission.json_raw?.phone || submission.contact_phone} />
            <DetailRow label="Business Address" value={submission.json_raw?.businessAddress || submission.json_raw?.address} />
            <DetailRow label="City" value={submission.json_raw?.businessCity || submission.json_raw?.city} />
            <DetailRow label="State" value={submission.json_raw?.businessState || submission.json_raw?.state} />
            <DetailRow label="ZIP" value={submission.json_raw?.businessZip || submission.json_raw?.zip} />
            <DetailRow label="DOT Number" value={submission.json_raw?.dotNumber} />
            <DetailRow label="MC Number" value={submission.json_raw?.mcNumber} />
            <DetailRow label="Years in Business" value={submission.json_raw?.yearsInBusiness} />
            <DetailRow label="Business Type" value={submission.json_raw?.businessType} />
          </div>
        </CardContent>
      </Card>

      {/* Policy Information Card */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowPolicy(!showPolicy)}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Policy Information
            </CardTitle>
            {showPolicy ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {showPolicy && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Effective Date */}
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                {isEditMode ? (
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={editedEffectiveDate}
                    onChange={(e) => setEditedEffectiveDate(e.target.value)}
                  />
                ) : (
                  <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {submission.effective_date || submission.json_raw?.effectiveDate || "Not set"}
                  </div>
                )}
              </div>

              {/* Expiration Date */}
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                {isEditMode ? (
                  <Input
                    id="expirationDate"
                    type="date"
                    value={editedExpirationDate}
                    onChange={(e) => setEditedExpirationDate(e.target.value)}
                  />
                ) : (
                  <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {submission.expiration_date || "Not set"}
                  </div>
                )}
              </div>

              {/* Premium Amount */}
              <div className="space-y-2">
                <Label htmlFor="premium">Premium Amount</Label>
                {isEditMode ? (
                  <Input
                    id="premium"
                    type="text"
                    value={editedPremium}
                    onChange={(e) => setEditedPremium(e.target.value)}
                    placeholder="$0.00"
                  />
                ) : (
                  <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {submission.premium_amount || "Not set"}
                  </div>
                )}
              </div>

              {/* Coverage Details from json_raw */}
              <DetailRow label="Liability Limit" value={submission.json_raw?.liabilityLimit} />
              <DetailRow label="Physical Damage" value={submission.json_raw?.physicalDamage} />
              <DetailRow label="Cargo Coverage" value={submission.json_raw?.cargoCoverage} />
              <DetailRow label="Current Carrier" value={submission.json_raw?.currentCarrier || submission.json_raw?.currentInsuranceCarrier} />
              <DetailRow label="Current Premium" value={submission.json_raw?.currentPremium} />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Document Upload Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentUploadSection
          title="Acord Document"
          category="acord"
          documents={documents.filter((d) => d.category === "acord")}
          onUpload={(files) => handleFileUpload("acord", files)}
          onDelete={handleDeleteDocument}
          uploading={uploading}
        />
        <DocumentUploadSection
          title="Garage Document"
          category="garage"
          documents={documents.filter((d) => d.category === "garage")}
          onUpload={(files) => handleFileUpload("garage", files)}
          onDelete={handleDeleteDocument}
          uploading={uploading}
        />
        <DocumentUploadSection
          title="Vintage Document"
          category="vintage"
          documents={documents.filter((d) => d.category === "vintage")}
          onUpload={(files) => handleFileUpload("vintage", files)}
          onDelete={handleDeleteDocument}
          uploading={uploading}
        />
        <DocumentUploadSection
          title="Other Documents"
          category="other"
          documents={documents.filter((d) => d.category === "other")}
          onUpload={(files) => handleFileUpload("other", files)}
          onDelete={handleDeleteDocument}
          uploading={uploading}
        />
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AJI Comments</CardTitle>
          <CardDescription>Add notes and comments about this submission</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add comments about this application..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={6}
            className="w-full"
          />
          <Button onClick={handleSaveComments}>
            Save Comments
          </Button>
        </CardContent>
      </Card>

      {/* Driver Information Card */}
      {submission.json_raw?.drivers && Array.isArray(submission.json_raw.drivers) && submission.json_raw.drivers.length > 0 && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setShowDrivers(!showDrivers)}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Driver Information ({submission.json_raw.drivers.length})
              </CardTitle>
              {showDrivers ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {showDrivers && (
            <CardContent>
              <div className="space-y-4">
                {submission.json_raw.drivers.map((driver: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-5"
                  >
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      {`${driver.firstName || ""} ${driver.lastName || ""}`.trim() || `Driver ${index + 1}`}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <DetailRow label="License Number" value={driver.licenseNumber} />
                      <DetailRow label="State" value={driver.licenseState} />
                      <DetailRow label="Date of Birth" value={driver.dateOfBirth} />
                      <DetailRow label="Years Experience" value={driver.yearsExperience ? `${driver.yearsExperience} years` : "N/A"} />
                      <DetailRow label="CDL Class" value={driver.cdlClass} />
                      <DetailRow label="Endorsements" value={driver.endorsements} />
                      <DetailRow label="Hire Date" value={driver.hireDate} />
                      <DetailRow label="Violations" value={driver.violations || "None"} />
                      <DetailRow label="Accidents" value={driver.accidents || "None"} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Vehicle Information Card */}
      {submission.json_raw?.vehicles && Array.isArray(submission.json_raw.vehicles) && submission.json_raw.vehicles.length > 0 && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setShowVehicles(!showVehicles)}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information ({submission.json_raw.vehicles.length})
              </CardTitle>
              {showVehicles ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {showVehicles && (
            <CardContent>
              <div className="space-y-4">
                {submission.json_raw.vehicles.map((vehicle: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-green-50 border border-gray-200 rounded-lg p-5"
                  >
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Car className="h-5 w-5 text-green-600" />
                      Vehicle {index + 1}: {`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <DetailRow label="VIN" value={vehicle.vin} />
                      <DetailRow label="Value" value={vehicle.value ? `$${Number(vehicle.value).toLocaleString()}` : "N/A"} />
                      <DetailRow label="Seating Capacity" value={vehicle.seatingCapacity} />
                      <DetailRow label="Primary Use" value={vehicle.primaryUse} />
                      <DetailRow label="Garage Location" value={vehicle.garageLocation} />
                      <DetailRow label="Mileage" value={vehicle.mileage} />
                      <DetailRow label="Garaging Zip" value={vehicle.garagingZip} />
                      <DetailRow label="Gross Weight" value={vehicle.grossWeight} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}

// Document Upload Section Component
function DocumentUploadSection({
  title,
  category,
  documents,
  onUpload,
  onDelete,
  uploading,
}: {
  title: string
  category: string
  documents: DocumentUpload[]
  onUpload: (files: FileList | null) => void
  onDelete: (docId: string) => void
  uploading: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <Badge variant="outline">{documents.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => onUpload(e.target.files)}
            disabled={uploading}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Browse & Upload"}
          </Button>
        </div>

        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-md border"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(doc.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {documents.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No documents uploaded yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Helper component for consistent detail rows
function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</span>
      <div className="text-sm text-gray-900 font-medium">{value || "N/A"}</div>
    </div>
  )
}
