"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  FileText,
  Shield,
  TrendingUp,
  Edit,
  Brain,
  Activity,
  RefreshCw,
  Folder,
  Briefcase,
  FileCheck,
  BarChart3,
  ChevronRight,
  Eye,
  Download,
  Mail,
  Plus,
  Filter,
  Upload,
  Calculator,
  Receipt,
  UserCheck,
  MessageSquare,
  Quote,
  Gavel,
  BookOpen,
  ArrowLeft,
  Users,
  MapPin,
  Building,
  Calendar,
  AlertTriangle,
  Paperclip,
  HelpCircle,
  Package,
} from "lucide-react"

interface Client {
  id: string
  name: string
  client_number?: string
  uid?: string
  email?: string
  phone?: string
  secondary_phone?: string
  secondary_email?: string
  street_address?: string
  street_address_line_2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  customer_type: string
  current_status: string
  business_name?: string
  business_entity?: string
  federal_ein?: string
  business_classification?: string
  naics_code?: string
  year_business_started?: number
  number_of_employees?: number
  annual_revenue?: number
  total_payroll?: number
  policy_type?: string
  policy_line?: string
  policy_number?: string
  policy_status?: string
  premium?: number
  carrier?: string
  csr?: string
  producer?: string
  broker_fee?: number
  lead_source?: string
  effective_date?: string
  expiration_date?: string
  sold_date?: string
  birth_date?: string
  customer_since?: string
  nickname?: string
  marital_status?: string
  created_at: string
  updated_at?: string
}

interface EnhancedClientDetailProps {
  client: Client
}

export default function EnhancedClientDetail({ client }: EnhancedClientDetailProps) {
  const [activeSection, setActiveSection] = useState("overview")
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)
  const [activePolicyTab, setActivePolicyTab] = useState("overview")
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data for all the new sections
  const mockData = {
    policies: [
      {
        id: "POL-2024-001",
        type: "Commercial Package",
        carrier: "ABC Insurance",
        status: "Active",
        premium: 5000,
        effectiveDate: "2024-01-01",
        expirationDate: "2025-01-01",
        deductible: 1000,
      },
      {
        id: "POL-2023-002",
        type: "Workers Compensation",
        carrier: "XYZ Insurance",
        status: "Expired",
        premium: 2500,
        effectiveDate: "2023-01-01",
        expirationDate: "2024-01-01",
        deductible: 500,
      },
    ],
    adjustments: [
      {
        id: "ADJ-001",
        date: "2024-01-15",
        type: "Premium Adjustment",
        amount: 250,
        reason: "Additional vehicle added",
        status: "Approved",
      },
      {
        id: "ADJ-002",
        date: "2024-02-10",
        type: "Coverage Change",
        amount: -100,
        reason: "Reduced coverage limits",
        status: "Pending",
      },
    ],
    billing: [
      {
        id: "INV-001",
        date: "2024-01-01",
        amount: 1250,
        dueDate: "2024-01-15",
        status: "Paid",
        type: "Premium",
      },
      {
        id: "INV-002",
        date: "2024-02-01",
        amount: 1250,
        dueDate: "2024-02-15",
        status: "Outstanding",
        type: "Premium",
      },
    ],
    files: [
      {
        id: "FILE-001",
        name: "Policy Documents.pdf",
        type: "Policy",
        size: "2.5 MB",
        uploadDate: "2024-01-01",
        category: "Policy Documents",
      },
      {
        id: "FILE-002",
        name: "Certificate of Insurance.pdf",
        type: "Certificate",
        size: "1.2 MB",
        uploadDate: "2024-01-15",
        category: "Certificates",
      },
    ],
    emails: [
      {
        id: "EMAIL-001",
        subject: "Policy Renewal Reminder",
        from: "agent@casurance.net",
        to: client.email,
        date: "2024-01-10",
        status: "Sent",
        type: "Renewal",
      },
      {
        id: "EMAIL-002",
        subject: "Birthday Wishes",
        from: "ops@casurance.net",
        to: client.email,
        date: "2024-01-05",
        status: "Delivered",
        type: "Birthday",
      },
    ],
    acord: [
      {
        id: "ACORD-25",
        name: "Certificate of Liability Insurance",
        status: "Current",
        issueDate: "2024-01-01",
        expirationDate: "2025-01-01",
      },
      {
        id: "ACORD-27",
        name: "Evidence of Property Insurance",
        status: "Current",
        issueDate: "2024-01-01",
        expirationDate: "2025-01-01",
      },
    ],
    commissions: [
      {
        id: "COMM-001",
        policy: "POL-2024-001",
        amount: 500,
        rate: "10%",
        status: "Paid",
        date: "2024-01-15",
      },
      {
        id: "COMM-002",
        policy: "POL-2023-002",
        amount: 250,
        rate: "10%",
        status: "Pending",
        date: "2024-02-01",
      },
    ],
    producers: [
      {
        id: "PROD-001",
        name: "John Smith",
        role: "Primary Agent",
        commission: "10%",
        phone: "(555) 123-4567",
        email: "john@casurance.net",
      },
      {
        id: "PROD-002",
        name: "Sarah Johnson",
        role: "CSR",
        commission: "5%",
        phone: "(555) 234-5678",
        email: "sarah@casurance.net",
      },
    ],
    tasks: [
      {
        id: "TASK-001",
        title: "Follow up on renewal",
        description: "Contact client about upcoming renewal",
        priority: "High",
        dueDate: "2024-02-15",
        status: "Open",
        assignedTo: "John Smith",
      },
      {
        id: "TASK-002",
        title: "Update contact information",
        description: "Client moved to new address",
        priority: "Medium",
        dueDate: "2024-02-10",
        status: "Completed",
        assignedTo: "Sarah Johnson",
      },
    ],
    quotes: [
      {
        id: "QUOTE-001",
        carrier: "ABC Insurance",
        premium: 4800,
        status: "Bound",
        date: "2023-12-15",
        expirationDate: "2024-01-15",
      },
      {
        id: "QUOTE-002",
        carrier: "DEF Insurance",
        premium: 5200,
        status: "Declined",
        date: "2023-12-10",
        expirationDate: "2024-01-10",
      },
    ],
    claims: [
      {
        id: "CLAIM-001",
        date: "2023-06-15",
        type: "Property Damage",
        amount: 15000,
        status: "Closed",
        description: "Water damage to office building",
      },
      {
        id: "CLAIM-002",
        date: "2023-09-20",
        type: "Auto Liability",
        amount: 8500,
        status: "Open",
        description: "Vehicle accident claim",
      },
    ],
    logs: [
      {
        id: "LOG-001",
        date: "2024-01-15",
        time: "10:30 AM",
        user: "John Smith",
        action: "Policy Updated",
        details: "Added additional vehicle to policy",
      },
      {
        id: "LOG-002",
        date: "2024-01-10",
        time: "2:15 PM",
        user: "Sarah Johnson",
        action: "Email Sent",
        details: "Renewal reminder sent to client",
      },
    ],
  }

  // Mock comprehensive policy data
  const policyDetailData = {
    namedInsureds: [
      {
        id: 1,
        name: client.name,
        type: "Primary",
        relationship: "Named Insured",
        address: "1234 Main Street, Dallas, TX 76266",
      },
      {
        id: 2,
        name: client.business_name || "Business Entity",
        type: "Additional",
        relationship: "Additional Insured",
        address: "Same as Primary",
      },
    ],
    binderInfo: {
      binderNumber: "BND-2024-001",
      effectiveDate: selectedPolicy?.effectiveDate,
      expirationDate: selectedPolicy?.expirationDate,
      status: "Active",
      issuedDate: "2024-01-01",
      producer: "John Smith",
    },
    locations: [
      {
        locNumber: 1,
        bldgNumber: 1,
        streetAddress: "1234 Main Street",
        cityStateZip: "Dallas, TX 76266",
        county: "Denton",
        occupancy: "Office",
        constructionType: "Frame",
        yearBuilt: 2010,
      },
      {
        locNumber: 2,
        bldgNumber: 1,
        streetAddress: "6767 Emery Street",
        cityStateZip: "Denton, TX 76201",
        county: "Denton",
        occupancy: "Warehouse",
        constructionType: "Masonry",
        yearBuilt: 2015,
      },
    ],
    additionalInterests: [
      {
        name: "First State Bank",
        address: "PO Box 1234",
        cityStateZip: "Dallas, TX 75000",
        type: "Mortgagee",
        locationNumber: 1,
      },
      {
        name: "Bank of the West",
        address: "PO Box 345890",
        cityStateZip: "Atlanta, GA 12311",
        type: "Mortgagee",
        locationNumber: 2,
      },
    ],
    coverageLimits: [
      {
        location: "LOC 1 / BLDG 1",
        address: "1234 MAIN STREET; DALLAS, TX 76266",
        coverages: [
          {
            subjectOfInsurance: "Building",
            amount: 200000,
            coinsPercent: 80,
            valuation: "RC",
            causeOfLoss: "Special with Theft",
            inflationGuard: "4%",
            deductible: 5000,
            formsConditions: "2% WIND/HAIL...",
          },
          {
            subjectOfInsurance: "Business Personal Property",
            amount: 200000,
            coinsPercent: 80,
            valuation: "RC",
            causeOfLoss: "Special with Theft",
            inflationGuard: "4%",
            deductible: 5000,
            formsConditions: "2% WIND/HAIL...",
          },
          {
            subjectOfInsurance: "Sign Coverage",
            amount: 200000,
            coinsPercent: 80,
            valuation: "RC",
            causeOfLoss: "Special with Theft",
            inflationGuard: "4%",
            deductible: 1000,
            formsConditions: "2% WIND/HAIL...",
          },
          {
            subjectOfInsurance: "Spoilage Breakdown",
            amount: 25000,
            coinsPercent: null,
            valuation: null,
            causeOfLoss: "SPLGA",
            inflationGuard: null,
            deductible: 500,
            formsConditions: null,
          },
        ],
      },
      {
        location: "LOC 2 / BLDG 1",
        address: "6767 EMERY STREET; DENTON, TX 76201",
        coverages: [
          {
            subjectOfInsurance: "Building",
            amount: 1000000,
            coinsPercent: 80,
            valuation: "RC",
            causeOfLoss: "Special Form",
            inflationGuard: "4%",
            deductible: 1000,
            formsConditions: null,
          },
          {
            subjectOfInsurance: "Business Personal Property",
            amount: 500000,
            coinsPercent: 80,
            valuation: "RC",
            causeOfLoss: "Special Form",
            inflationGuard: "4%",
            deductible: 1000,
            formsConditions: null,
          },
        ],
      },
    ],
    premiumBreakdown: {
      basePremium: 4200,
      fees: {
        policyFee: 100,
        inspectionFee: 150,
        agencyFee: 250,
        carrierFee: 75,
      },
      taxes: 225,
      totalPremium: selectedPolicy?.premium || 5000,
    },
    paymentPlan: {
      type: "Monthly",
      downPayment: 1000,
      monthlyPayment: 450,
      numberOfPayments: 10,
      nextDueDate: "2024-02-15",
    },
    underwritingQuestions: [
      {
        question: "Has the insured had any losses in the past 5 years?",
        answer: "No",
        category: "Loss History",
      },
      {
        question: "Are there any swimming pools on the premises?",
        answer: "No",
        category: "Property Features",
      },
      {
        question: "What is the primary business operation?",
        answer: "Professional Services",
        category: "Business Operations",
      },
    ],
    policyForms: [
      {
        formNumber: "CP 00 10 10 12",
        formName: "Building and Personal Property Coverage Form",
        edition: "10/12",
        type: "Coverage Form",
      },
      {
        formNumber: "CP 10 30 09 17",
        formName: "Causes of Loss - Special Form",
        edition: "09/17",
        type: "Causes of Loss",
      },
      {
        formNumber: "CP 04 18 06 07",
        formName: "Ordinance or Law Coverage",
        edition: "06/07",
        type: "Coverage Enhancement",
      },
    ],
    attachments: [
      {
        id: "ATT-001",
        name: "Policy Declaration Page.pdf",
        type: "Declaration",
        size: "2.1 MB",
        uploadDate: "2024-01-01",
      },
      {
        id: "ATT-002",
        name: "Property Inspection Report.pdf",
        type: "Inspection",
        size: "5.3 MB",
        uploadDate: "2024-01-05",
      },
    ],
  }

  // Policy tabs
  const policyTabs = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "named-insureds", label: "Named Insureds", icon: Users },
    { id: "binder-info", label: "Binder Info", icon: Folder },
    { id: "policy-info", label: "Policy Info", icon: FileText },
    { id: "additional-info", label: "Additional Info", icon: Briefcase },
    { id: "extended-policy", label: "Extended Policy Info", icon: FileCheck },
    { id: "premium-carrier", label: "Policy Premium / Carrier Fees", icon: DollarSign },
    { id: "agency-fees", label: "Agency Fees", icon: Receipt },
    { id: "payment-plan", label: "Payment Plan", icon: Calendar },
    { id: "location-schedule", label: "Location Schedule", icon: MapPin },
    { id: "additional-interest", label: "Additional Interest", icon: AlertTriangle },
    { id: "nature-business", label: "Nature Of Business", icon: Building },
    { id: "attachments", label: "Policy Attachments", icon: Paperclip },
    { id: "forms", label: "Policy Forms", icon: FileText },
    { id: "prior-policy", label: "Prior Policy Info", icon: BookOpen },
    { id: "underwriting", label: "Underwriting Questions", icon: HelpCircle },
    { id: "gl-underwriting", label: "General Liability Underwriting", icon: Shield },
    { id: "commercial-lines", label: "Commercial Lines Additional Policy Information", icon: BarChart3 },
    { id: "contractors", label: "Contractors Underwriting", icon: UserCheck },
    { id: "products-ops", label: "Products/Completed Operations Underwriting", icon: Package },
  ]

  // Navigation sections with all the requested tabs
  const navigationSections = [
    { id: "overview", label: "Overview", icon: Eye, color: "blue" },
    { id: "policies", label: "Policies", icon: Shield, color: "green" },
    { id: "policy-info", label: "Policy Info", icon: FileText, color: "blue" },
    { id: "details", label: "Details", icon: Briefcase, color: "purple" },
    { id: "adjustments", label: "Adjustments", icon: Calculator, color: "orange" },
    { id: "billing", label: "Billing", icon: Receipt, color: "green" },
    { id: "files", label: "Files", icon: Folder, color: "gray" },
    { id: "emails", label: "Emails", icon: Mail, color: "blue" },
    { id: "acord", label: "ACORD", icon: FileCheck, color: "purple" },
    { id: "agency-commissions", label: "Agency Commissions", icon: DollarSign, color: "green" },
    { id: "producers", label: "Producers", icon: UserCheck, color: "blue" },
    { id: "tasks-notes", label: "Tasks/Notes", icon: MessageSquare, color: "orange" },
    { id: "quotes", label: "Quotes", icon: Quote, color: "purple" },
    { id: "claims", label: "Claims", icon: Gavel, color: "red" },
    { id: "log", label: "Log", icon: BookOpen, color: "gray" },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "paid":
      case "current":
      case "bound":
      case "approved":
      case "sent":
      case "delivered":
      case "completed":
      case "closed":
        return "bg-green-100 text-green-800"
      case "pending":
      case "outstanding":
      case "open":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
      case "declined":
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderPolicyDetailContent = () => {
    switch (activePolicyTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* AI Policy Analytics */}
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-600" />
                  AI Policy Analytics
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRefreshingInsights(true)}
                  disabled={isRefreshingInsights}
                  className="text-blue-600 hover:bg-blue-100"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingInsights ? "animate-spin" : ""}`} />
                  {isRefreshingInsights ? "Analyzing..." : "Refresh"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">A+</div>
                    <div className="text-sm text-gray-600">Policy Rating</div>
                    <Progress value={92} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">88%</div>
                    <div className="text-sm text-gray-600">Coverage Adequacy</div>
                    <Progress value={88} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">Low</div>
                    <div className="text-sm text-gray-600">Risk Level</div>
                    <Progress value={25} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">95%</div>
                    <div className="text-sm text-gray-600">Compliance Score</div>
                    <Progress value={95} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Annual Premium</p>
                      <p className="text-2xl font-bold text-green-800">{formatCurrency(selectedPolicy?.premium)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Coverage</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {formatCurrency(
                          policyDetailData.coverageLimits.reduce(
                            (total, loc) => total + loc.coverages.reduce((sum, cov) => sum + cov.amount, 0),
                            0,
                          ),
                        )}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Locations</p>
                      <p className="text-2xl font-bold text-purple-800">{policyDetailData.locations.length}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "location-schedule":
        return (
          <div className="space-y-6">
            {/* Locations Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  LOCATIONS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="font-semibold text-blue-800">Loc #</TableHead>
                      <TableHead className="font-semibold text-blue-800">Bldg #</TableHead>
                      <TableHead className="font-semibold text-blue-800">Street Address</TableHead>
                      <TableHead className="font-semibold text-blue-800">City / State / Zip</TableHead>
                      <TableHead className="font-semibold text-blue-800">County</TableHead>
                      <TableHead className="font-semibold text-blue-800">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policyDetailData.locations.map((location) => (
                      <TableRow key={location.locNumber} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{location.locNumber}</TableCell>
                        <TableCell>{location.bldgNumber}</TableCell>
                        <TableCell className="text-blue-600 hover:underline cursor-pointer">
                          {location.streetAddress}
                        </TableCell>
                        <TableCell>{location.cityStateZip}</TableCell>
                        <TableCell>{location.county}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                            Location Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Coverage Limits by Location */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-600">COVERAGE LIMITS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {policyDetailData.coverageLimits.map((locationCoverage, index) => (
                    <div key={index} className="space-y-4">
                      <div className="border-b pb-2">
                        <h3 className="font-semibold text-blue-600">
                          {locationCoverage.location} - {locationCoverage.address}
                        </h3>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Subject of Insurance</TableHead>
                            <TableHead className="font-semibold">Amount</TableHead>
                            <TableHead className="font-semibold">Coins %</TableHead>
                            <TableHead className="font-semibold">Valuation</TableHead>
                            <TableHead className="font-semibold">Cause of Loss</TableHead>
                            <TableHead className="font-semibold">Inflation Guard</TableHead>
                            <TableHead className="font-semibold">Deductible</TableHead>
                            <TableHead className="font-semibold">Forms & Conditions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {locationCoverage.coverages.map((coverage, covIndex) => (
                            <TableRow key={covIndex} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{coverage.subjectOfInsurance}</TableCell>
                              <TableCell>{formatCurrency(coverage.amount)}</TableCell>
                              <TableCell>{coverage.coinsPercent || "-"}</TableCell>
                              <TableCell>{coverage.valuation || "-"}</TableCell>
                              <TableCell>{coverage.causeOfLoss}</TableCell>
                              <TableCell>{coverage.inflationGuard || "-"}</TableCell>
                              <TableCell>{formatCurrency(coverage.deductible)}</TableCell>
                              <TableCell>{coverage.formsConditions || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {index < policyDetailData.coverageLimits.length - 1 && (
                        <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                          Location Details
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "additional-interest":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                ADDITIONAL INTERESTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="font-semibold text-blue-800">Name</TableHead>
                    <TableHead className="font-semibold text-blue-800">Address</TableHead>
                    <TableHead className="font-semibold text-blue-800">City / State / Zip</TableHead>
                    <TableHead className="font-semibold text-blue-800">Type</TableHead>
                    <TableHead className="font-semibold text-blue-800">Location #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policyDetailData.additionalInterests.map((interest, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{interest.name}</TableCell>
                      <TableCell className="text-blue-600">{interest.address}</TableCell>
                      <TableCell>{interest.cityStateZip}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{interest.type}</Badge>
                      </TableCell>
                      <TableCell>{interest.locationNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      case "named-insureds":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Named Insureds
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Named Insured
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policyDetailData.namedInsureds.map((insured) => (
                  <div key={insured.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{insured.name}</h4>
                        <p className="text-sm text-gray-600">{insured.relationship}</p>
                        <p className="text-sm text-gray-500">{insured.address}</p>
                      </div>
                      <Badge variant={insured.type === "Primary" ? "default" : "secondary"}>{insured.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "premium-carrier":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Policy Premium / Carrier Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Premium Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-600">Base Premium:</span>
                      <span className="font-medium">
                        {formatCurrency(policyDetailData.premiumBreakdown.basePremium)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Policy Fee:</span>
                      <span className="font-medium">
                        {formatCurrency(policyDetailData.premiumBreakdown.fees.policyFee)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Inspection Fee:</span>
                      <span className="font-medium">
                        {formatCurrency(policyDetailData.premiumBreakdown.fees.inspectionFee)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Carrier Fee:</span>
                      <span className="font-medium">
                        {formatCurrency(policyDetailData.premiumBreakdown.fees.carrierFee)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Taxes:</span>
                      <span className="font-medium">{formatCurrency(policyDetailData.premiumBreakdown.taxes)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Total Premium</h4>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="text-center">
                      <p className="text-green-600 text-sm font-medium">Annual Premium</p>
                      <p className="text-3xl font-bold text-green-800">
                        {formatCurrency(policyDetailData.premiumBreakdown.totalPremium)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "underwriting":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                Underwriting Questions
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policyDetailData.underwritingQuestions.map((question, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{question.category}</Badge>
                      </div>
                      <h4 className="font-medium">{question.question}</h4>
                      <p className="text-sm text-green-600 font-medium">Answer: {question.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "forms":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Policy Forms
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Form
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-50">
                    <TableHead className="font-semibold text-purple-800">Form Number</TableHead>
                    <TableHead className="font-semibold text-purple-800">Form Name</TableHead>
                    <TableHead className="font-semibold text-purple-800">Edition</TableHead>
                    <TableHead className="font-semibold text-purple-800">Type</TableHead>
                    <TableHead className="font-semibold text-purple-800">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policyDetailData.policyForms.map((form, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-blue-600">{form.formNumber}</TableCell>
                      <TableCell>{form.formName}</TableCell>
                      <TableCell>{form.edition}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{form.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Section Under Development</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">This section is being enhanced with AI capabilities.</p>
                <p className="text-sm text-gray-500 mt-2">More detailed information will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  const renderSectionContent = () => {
    // If a policy is selected, show the policy detail view
    if (selectedPolicy && activeSection === "policies") {
      return (
        <div className="space-y-6">
          {/* Policy Header with Back Button */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPolicy(null)}
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Policies
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">{selectedPolicy.type}</h1>
                    <p className="text-blue-100">Policy #{selectedPolicy.id}</p>
                    <p className="text-blue-100">Carrier: {selectedPolicy.carrier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${getStatusColor(selectedPolicy.status)} text-lg px-3 py-1`}>
                    {selectedPolicy.status}
                  </Badge>
                  <p className="text-blue-100 mt-2">
                    {formatDate(selectedPolicy.effectiveDate)} - {formatDate(selectedPolicy.expirationDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Tabs */}
          <Tabs value={activePolicyTab} onValueChange={setActivePolicyTab} className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <ScrollArea className="w-full">
                <TabsList className="grid w-full grid-cols-10 lg:grid-cols-20 gap-1">
                  {policyTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center space-x-1 text-xs whitespace-nowrap"
                      >
                        <Icon className="h-3 w-3" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </ScrollArea>
            </div>

            <TabsContent value={activePolicyTab} className="space-y-4">
              {renderPolicyDetailContent()}
            </TabsContent>
          </Tabs>
        </div>
      )
    }

    // Regular section content
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* AI Insights Dashboard */}
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-600" />
                  AI Insurance Analytics
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRefreshingInsights(true)}
                  disabled={isRefreshingInsights}
                  className="text-blue-600 hover:bg-blue-100"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingInsights ? "animate-spin" : ""}`} />
                  {isRefreshingInsights ? "Analyzing..." : "Refresh"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">75%</div>
                    <div className="text-sm text-gray-600">Risk Score</div>
                    <Progress value={75} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">Renewal Probability</div>
                    <Progress value={85} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">88%</div>
                    <div className="text-sm text-gray-600">Underwriting Score</div>
                    <Progress value={88} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">92%</div>
                    <div className="text-sm text-gray-600">Customer Health</div>
                    <Progress value={92} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Active Policies</p>
                      <p className="text-2xl font-bold text-green-800">
                        {mockData.policies.filter((p) => p.status === "Active").length}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Premium</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {formatCurrency(mockData.policies.reduce((sum, p) => sum + p.premium, 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Open Claims</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {mockData.claims.filter((c) => c.status === "Open").length}
                      </p>
                    </div>
                    <Gavel className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Open Tasks</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {mockData.tasks.filter((t) => t.status === "Open").length}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "policies":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Client Policies
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.policies.map((policy) => (
                  <div
                    key={policy.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-blue-600 hover:underline">{policy.type}</h4>
                          <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Policy #{policy.id}</p>
                        <p className="text-sm text-gray-600">Carrier: {policy.carrier}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{formatCurrency(policy.premium)}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(policy.effectiveDate)} - {formatDate(policy.expirationDate)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "adjustments":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-orange-600" />
                Policy Adjustments
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Adjustment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.adjustments.map((adjustment) => (
                  <div key={adjustment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{adjustment.type}</h4>
                        <p className="text-sm text-gray-600">{adjustment.reason}</p>
                        <p className="text-sm text-gray-500">{formatDate(adjustment.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${adjustment.amount > 0 ? "text-red-600" : "text-green-600"}`}>
                          {adjustment.amount > 0 ? "+" : ""}
                          {formatCurrency(adjustment.amount)}
                        </p>
                        <Badge className={getStatusColor(adjustment.status)}>{adjustment.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "billing":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-green-600" />
                Billing & Invoices
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.billing.map((invoice) => (
                  <div key={invoice.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Invoice #{invoice.id}</h4>
                        <p className="text-sm text-gray-600">{invoice.type}</p>
                        <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "files":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Folder className="h-5 w-5 mr-2 text-gray-600" />
                Client Files
              </CardTitle>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.files.map((file) => (
                  <div key={file.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{file.name}</h4>
                          <p className="text-sm text-gray-600">
                            {file.category} • {file.size}
                          </p>
                          <p className="text-sm text-gray-500">Uploaded: {formatDate(file.uploadDate)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "emails":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Email Communications
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Compose Email
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.emails.map((email) => (
                  <div key={email.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{email.subject}</h4>
                        <p className="text-sm text-gray-600">From: {email.from}</p>
                        <p className="text-sm text-gray-600">To: {email.to}</p>
                        <p className="text-sm text-gray-500">{formatDate(email.date)}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                        <p className="text-sm text-gray-500 mt-1">{email.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "acord":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-purple-600" />
                ACORD Forms
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Generate ACORD
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.acord.map((form) => (
                  <div key={form.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {form.id} - {form.name}
                        </h4>
                        <p className="text-sm text-gray-600">Issue Date: {formatDate(form.issueDate)}</p>
                        <p className="text-sm text-gray-600">Expires: {formatDate(form.expirationDate)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "agency-commissions":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Agency Commissions
              </CardTitle>
              <Button size="sm">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Commission
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.commissions.map((commission) => (
                  <div key={commission.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Policy: {commission.policy}</h4>
                        <p className="text-sm text-gray-600">Rate: {commission.rate}</p>
                        <p className="text-sm text-gray-500">{formatDate(commission.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{formatCurrency(commission.amount)}</p>
                        <Badge className={getStatusColor(commission.status)}>{commission.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "producers":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                Producers & Agents
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Producer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.producers.map((producer) => (
                  <div key={producer.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getInitials(producer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{producer.name}</h4>
                          <p className="text-sm text-gray-600">{producer.role}</p>
                          <p className="text-sm text-gray-500">{producer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{producer.commission}</p>
                        <p className="text-sm text-gray-600">{producer.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "tasks-notes":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-orange-600" />
                Tasks & Notes
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.tasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge
                            variant={
                              task.priority === "High"
                                ? "destructive"
                                : task.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <p className="text-sm text-gray-500">Assigned to: {task.assignedTo}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        <p className="text-sm text-gray-500 mt-1">Due: {formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "quotes":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Quote className="h-5 w-5 mr-2 text-purple-600" />
                Insurance Quotes
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Quote
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.quotes.map((quote) => (
                  <div key={quote.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Quote #{quote.id}</h4>
                        <p className="text-sm text-gray-600">Carrier: {quote.carrier}</p>
                        <p className="text-sm text-gray-500">Date: {formatDate(quote.date)}</p>
                        <p className="text-sm text-gray-500">Expires: {formatDate(quote.expirationDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(quote.premium)}</p>
                        <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "claims":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Gavel className="h-5 w-5 mr-2 text-red-600" />
                Insurance Claims
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Report Claim
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.claims.map((claim) => (
                  <div key={claim.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">Claim #{claim.id}</h4>
                        <p className="text-sm text-gray-600">{claim.type}</p>
                        <p className="text-sm text-gray-600 mt-1">{claim.description}</p>
                        <p className="text-sm text-gray-500">Date: {formatDate(claim.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(claim.amount)}</p>
                        <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "log":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-gray-600" />
                Activity Log
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.logs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <h4 className="font-medium">{log.action}</h4>
                          <p className="text-sm text-gray-600">{log.details}</p>
                          <p className="text-sm text-gray-500">By: {log.user}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{formatDate(log.date)}</p>
                        <p>{log.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Section Under Development</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">This section is being enhanced with AI capabilities.</p>
                <p className="text-sm text-gray-500 mt-2">More detailed information will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Modern Navigation Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-lg">{client.name}</h2>
              <p className="text-sm text-gray-600">{client.business_name || "Individual Client"}</p>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4 space-y-2">
            {navigationSections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id)
                    setSelectedPolicy(null) // Reset policy selection when changing sections
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                    isActive ? "bg-blue-100 text-blue-700 border border-blue-200" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedPolicy
                    ? `${selectedPolicy.type} - Policy Details`
                    : navigationSections.find((s) => s.id === activeSection)?.label || "Client Details"}
                </h1>
                <p className="text-gray-600">
                  {selectedPolicy
                    ? `Comprehensive policy information for ${selectedPolicy.id}`
                    : `Comprehensive insurance information for ${client.name}`}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {renderSectionContent()}
        </div>
      </div>
    </div>
  )
}
