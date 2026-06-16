"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  FileText,
  Shield,
  TrendingUp,
  Brain,
  Activity,
  RefreshCw,
  Folder,
  Briefcase,
  FileCheck,
  BarChart3,
  Eye,
  Download,
  Plus,
  Receipt,
  UserCheck,
  BookOpen,
  Users,
  MapPin,
  Building,
  Calendar,
  AlertTriangle,
  Paperclip,
  HelpCircle,
  Package,
} from "lucide-react"

interface PolicyDetailProps {
  policy: {
    id: string
    type: string
    carrier: string
    status: string
    premium: number
    effectiveDate: string
    expirationDate: string
    deductible: number
  }
  client: {
    name: string
    business_name?: string
  }
}

export default function PolicyDetailView({ policy, client }: PolicyDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false)

  // Mock comprehensive policy data
  const policyData = {
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
      effectiveDate: policy.effectiveDate,
      expirationDate: policy.expirationDate,
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
      totalPremium: policy.premium,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "current":
      case "bound":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  const renderTabContent = () => {
    switch (activeTab) {
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
                      <p className="text-2xl font-bold text-green-800">{formatCurrency(policy.premium)}</p>
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
                          policyData.coverageLimits.reduce(
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
                      <p className="text-2xl font-bold text-purple-800">{policyData.locations.length}</p>
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
                    {policyData.locations.map((location) => (
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
                  {policyData.coverageLimits.map((locationCoverage, index) => (
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
                      {index < policyData.coverageLimits.length - 1 && (
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
                  {policyData.additionalInterests.map((interest, index) => (
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
                {policyData.namedInsureds.map((insured) => (
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
                      <span className="font-medium">{formatCurrency(policyData.premiumBreakdown.basePremium)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Policy Fee:</span>
                      <span className="font-medium">{formatCurrency(policyData.premiumBreakdown.fees.policyFee)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Inspection Fee:</span>
                      <span className="font-medium">
                        {formatCurrency(policyData.premiumBreakdown.fees.inspectionFee)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Carrier Fee:</span>
                      <span className="font-medium">{formatCurrency(policyData.premiumBreakdown.fees.carrierFee)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Taxes:</span>
                      <span className="font-medium">{formatCurrency(policyData.premiumBreakdown.taxes)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Total Premium</h4>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="text-center">
                      <p className="text-green-600 text-sm font-medium">Annual Premium</p>
                      <p className="text-3xl font-bold text-green-800">
                        {formatCurrency(policyData.premiumBreakdown.totalPremium)}
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
                {policyData.underwritingQuestions.map((question, index) => (
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
                  {policyData.policyForms.map((form, index) => (
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

  return (
    <div className="space-y-6">
      {/* Policy Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{policy.type}</h1>
              <p className="text-blue-100">Policy #{policy.id}</p>
              <p className="text-blue-100">Carrier: {policy.carrier}</p>
            </div>
            <div className="text-right">
              <Badge className={`${getStatusColor(policy.status)} text-lg px-3 py-1`}>{policy.status}</Badge>
              <p className="text-blue-100 mt-2">
                {formatDate(policy.effectiveDate)} - {formatDate(policy.expirationDate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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

        <TabsContent value={activeTab} className="space-y-4">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
