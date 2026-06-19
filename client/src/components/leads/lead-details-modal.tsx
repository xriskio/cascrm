
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle,
  Star,
} from "lucide-react"

interface Lead {
  id: string
  lead_id: string
  contact_name: string
  company_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  source: string
  status: string
  priority: string
  lead_type: string
  notes: string
  date_entered: string
  created_at: string
  spam_score?: number
  ip_address?: string
  referral?: string
  preferred_contact?: string
}

interface LeadDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string | null
}

export function LeadDetailsModal({ isOpen, onClose, leadId }: LeadDetailsModalProps) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadDetails()
    }
  }, [isOpen, leadId])

  const fetchLeadDetails = async () => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual API
      const mockLead: Lead = {
        id: leadId!,
        lead_id: "LD-2024-001",
        contact_name: "John Smith",
        company_name: "ABC Transportation LLC",
        email: "john.smith@abctrans.com",
        phone: "(555) 123-4567",
        address: "123 Main Street",
        city: "Dallas",
        state: "TX",
        zip: "75201",
        source: "Website Form",
        status: "new",
        priority: "high",
        lead_type: "Commercial Auto",
        notes: "Interested in fleet insurance for 15 vehicles. Needs quote by end of week.",
        date_entered: "2024-01-15T10:30:00Z",
        created_at: "2024-01-15T10:30:00Z",
        spam_score: 15,
        ip_address: "192.168.1.1",
        referral: "Google Ads",
        preferred_contact: "email",
      }
      setLead(mockLead)
    } catch (error) {
      console.error("Error fetching lead details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "qualified":
        return "bg-green-100 text-green-800"
      case "converted":
        return "bg-purple-100 text-purple-800"
      case "lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLeadTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "commercial auto":
        return "🚛"
      case "general liability":
        return "🛡️"
      case "workers comp":
        return "👷"
      case "property":
        return "🏢"
      default:
        return "📋"
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="w-6 h-6" />
            Lead Details
            {lead && (
              <Badge variant="outline" className="font-mono">
                {lead.lead_id}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Complete information and activity history for this lead</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : lead ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contact">Contact Info</TabsTrigger>
              <TabsTrigger value="details">Lead Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Header Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">{getLeadTypeIcon(lead.lead_type)}</span>
                        {lead.contact_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building className="w-4 h-4" />
                        {lead.company_name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                      <Badge className={getPriorityColor(lead.priority)}>{lead.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Lead Type</div>
                        <div className="text-sm text-gray-600">{lead.lead_type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Date Entered</div>
                        <div className="text-sm text-gray-600">{new Date(lead.date_entered).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Source</div>
                        <div className="text-sm text-gray-600">{lead.source}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Spam Score</div>
                        <div className="text-sm text-gray-600">{lead.spam_score}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Lead
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Quote
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Follow-up
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {lead.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{lead.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-gray-600">{lead.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium">Phone</div>
                          <div className="text-gray-600">{lead.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-medium">Address</div>
                          <div className="text-gray-600">
                            {lead.address}
                            <br />
                            {lead.city}, {lead.state} {lead.zip}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium mb-2">Preferred Contact Method</div>
                        <Badge variant="outline">{lead.preferred_contact}</Badge>
                      </div>
                      <div>
                        <div className="font-medium mb-2">Referral Source</div>
                        <div className="text-gray-600">{lead.referral}</div>
                      </div>
                      <div>
                        <div className="font-medium mb-2">IP Address</div>
                        <div className="text-gray-600 font-mono">{lead.ip_address}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Classification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl mb-2">{getLeadTypeIcon(lead.lead_type)}</div>
                      <div className="font-medium">{lead.lead_type}</div>
                      <div className="text-sm text-gray-500">Insurance Type</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Badge className={getStatusColor(lead.status)} size="lg">
                        {lead.status}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-2">Current Status</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Badge className={getPriorityColor(lead.priority)} size="lg">
                        {lead.priority}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-2">Priority Level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Spam Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${lead.spam_score! > 50 ? "bg-red-500" : lead.spam_score! > 25 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${lead.spam_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{lead.spam_score}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lead.spam_score! < 25 ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : lead.spam_score! < 50 ? (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">
                        {lead.spam_score! < 25
                          ? "High Quality Lead"
                          : lead.spam_score! < 50
                            ? "Medium Quality Lead"
                            : "Low Quality Lead"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Lead Created</div>
                        <div className="text-sm text-gray-500">{new Date(lead.created_at).toLocaleString()}</div>
                        <div className="text-sm text-gray-600 mt-1">Lead submitted via {lead.source}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Status Updated</div>
                        <div className="text-sm text-gray-500">{new Date(lead.date_entered).toLocaleString()}</div>
                        <div className="text-sm text-gray-600 mt-1">Status changed to "{lead.status}"</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-gray-500">Lead not found</div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Edit Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
