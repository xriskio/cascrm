"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  ChevronDown,
  MoreVertical,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  FileText,
  Upload,
  Download,
  MessageSquare,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react"
import { LeadDetailsModal } from "@/components/leads/lead-details-modal"
import { AddLeadModal } from "@/components/leads/add-lead-modal"
import { SmartCyclePanel } from "@/components/leads/smart-cycle-panel"

interface Lead {
  id: string
  lead_id: string
  contact_name: string
  company_name: string
  email: string
  phone: string
  source: string
  status: string
  priority: string
  lead_type: string
  notes: string
  date_entered: string
  created_at: string
  assigned_to?: string
  last_activity?: string
  next_expiration?: string
  expected_close?: string
  appointment_time?: string
  value?: number
}

const PIPELINE_STAGES = [
  { id: "new", name: "New", color: "bg-blue-500", count: 0 },
  { id: "contacted", name: "Contacted", color: "bg-yellow-500", count: 0 },
  { id: "quoted", name: "Quoted", color: "bg-purple-500", count: 0 },
  { id: "negotiating", name: "Negotiating", color: "bg-orange-500", count: 0 },
  { id: "sold", name: "Sold", color: "bg-green-500", count: 0 },
  { id: "lost", name: "Lost", color: "bg-red-500", count: 0 },
]

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("stage_entry_date")
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSmartCycle, setShowSmartCycle] = useState(false)
  const [activeTab, setActiveTab] = useState("pipeline")

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const updatedLeads = leads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    setLeads(updatedLeads)

    try {
      const supabase = createClient()
      await supabase.from("leads").update({ status: newStatus }).eq("id", leadId)
    } catch (error) {
      console.error("Error updating lead status:", error)
    }
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm),
  )

  const getLeadsByStatus = (status: string) => {
    return filteredLeads.filter((lead) => lead.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500"
      case "high":
        return "border-l-orange-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-300"
    }
  }

  const getLeadTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
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

  const totalValue = filteredLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)
  const conversionRate = leads.length > 0 ? (leads.filter((l) => l.status === "sold").length / leads.length) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    AI Pipeline
                  </h1>
                  <p className="text-sm text-gray-500">Intelligent lead management</p>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="ml-8">
                <TabsList className="bg-gray-100/50 backdrop-blur-sm">
                  <TabsTrigger value="pipeline" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Target className="w-4 h-4 mr-2" />
                    Pipeline
                  </TabsTrigger>
                  <TabsTrigger value="leads" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <User className="w-4 h-4 mr-2" />
                    Leads
                  </TabsTrigger>
                  <TabsTrigger
                    value="opportunities"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Opportunities
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSmartCycle(true)}
                className="bg-white/50 backdrop-blur-sm border-gray-200/50 hover:bg-white/80"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Smart Cycle
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm">
                  <DropdownMenuItem onClick={() => setShowAddModal(true)}>
                    <User className="w-4 h-4 mr-2" />
                    Add a Lead
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Add an Opportunity
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Building className="w-4 h-4 mr-2" />
                    Add Business
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Add a Contact
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" />
                    Add a Task
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Add a Note
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New File
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    Send an Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send a Text
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="⌘K to search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-16 w-80 bg-white/50 backdrop-blur-sm border-gray-200/50"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border">⌘K</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/30">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Pipeline Value:</span>
                <span className="text-sm font-bold text-green-600">${totalValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Conversion Rate:</span>
                <span className="text-sm font-bold text-purple-600">{conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Active Leads:</span>
                <span className="text-sm font-bold text-orange-600">{filteredLeads.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white/50 backdrop-blur-sm border-gray-200/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage_entry_date">Stage Entry Date</SelectItem>
                  <SelectItem value="appointment_time">Appointment Time</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="assigned_to">Assigned To</SelectItem>
                  <SelectItem value="last_activity">Last Activity Date</SelectItem>
                  <SelectItem value="next_expiration">Next Expiration Date</SelectItem>
                  <SelectItem value="expected_close">Expected Close Date</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm border-gray-200/50">
                    Actions
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm">
                  <DropdownMenuItem>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Leads
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export Leads
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    Export Leads to Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Export Lead Quotes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Show Smart-Cycle List
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Target className="w-4 h-4 mr-2" />
                    Show Dead Deals
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Content */}
      <div className="container mx-auto px-6 py-6">
        <TabsContent value="pipeline" className="mt-0">
          <div className="grid grid-cols-6 gap-4 min-h-[calc(100vh-300px)]">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = getLeadsByStatus(stage.id)
              return (
                <div key={stage.id} className="flex flex-col">
                  {/* Stage Header */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-t-xl border border-gray-200/50 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100/80 text-gray-700">
                        {stageLeads.length}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      ${stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Stage Content */}
                  <div
                    className={`flex-1 bg-white/40 backdrop-blur-sm rounded-b-xl border-x border-b border-gray-200/50 p-2 space-y-2 min-h-[400px] transition-colors`}
                  >
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`bg-white rounded-lg border border-gray-200/50 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${getPriorityColor(
                          lead.priority,
                        )}`}
                        onClick={() => {
                          setSelectedLeadId(lead.id)
                          setShowDetailsModal(true)
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getLeadTypeIcon(lead.lead_type)}</span>
                            <div className="text-xs font-medium text-gray-500">{lead.lead_id}</div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm">
                              <DropdownMenuItem>
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="w-4 h-4 mr-2" />
                                Quote
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 text-sm truncate">{lead.contact_name}</div>
                          <div className="text-xs text-gray-600 truncate">{lead.company_name}</div>
                          <div className="text-xs text-gray-500 truncate">{lead.email}</div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50/80">
                            {lead.source}
                          </Badge>
                          {lead.value && (
                            <div className="text-xs font-semibold text-green-600">${lead.value.toLocaleString()}</div>
                          )}
                        </div>

                        {lead.assigned_to && (
                          <div className="flex items-center gap-1 mt-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <div className="text-xs text-gray-500 truncate">{lead.assigned_to}</div>
                          </div>
                        )}
                        <Button onClick={() => handleStatusChange(lead.id, "sold")}>Move to Sold</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold mb-4">All Leads</h2>
            <p className="text-gray-600">Lead list view will be implemented here.</p>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Opportunities</h2>
            <p className="text-gray-600">Opportunities view will be implemented here.</p>
          </div>
        </TabsContent>
      </div>

      {/* Modals */}
      <LeadDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} leadId={selectedLeadId} />
      <AddLeadModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <SmartCyclePanel isOpen={showSmartCycle} onClose={() => setShowSmartCycle(false)} />
    </div>
  )
}
