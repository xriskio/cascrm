"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Shield,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw,
} from "lucide-react"

interface AIInsightsModalProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    name: string
    business_name?: string
    policy_type?: string
    premium?: number
    expiration_date?: string
  }
}

export function AIInsightsModal({ isOpen, onClose, client }: AIInsightsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // AI-powered insights (mock data for demonstration)
  const aiInsights = {
    riskScore: 75,
    renewalProbability: 85,
    upsellOpportunities: [
      {
        product: "Cyber Liability",
        confidence: 92,
        reason: "Digital assets exposure detected",
      },
      {
        product: "Umbrella Policy",
        confidence: 87,
        reason: "Current coverage limits below industry standard",
      },
      {
        product: "Employment Practices Liability",
        confidence: 78,
        reason: "Employee count suggests potential need",
      },
    ],
    nextBestActions: [
      {
        action: "Schedule renewal discussion",
        priority: "High",
        timeframe: "Next 30 days",
      },
      {
        action: "Review cyber security posture",
        priority: "Medium",
        timeframe: "Next 60 days",
      },
      {
        action: "Discuss umbrella coverage options",
        priority: "Medium",
        timeframe: "Next 45 days",
      },
    ],
    customerHealthScore: 92,
    riskFactors: [
      {
        factor: "Industry volatility",
        severity: "Medium",
        recommendation: "Consider business interruption coverage",
      },
      {
        factor: "Cyber security exposure",
        severity: "High",
        recommendation: "Add cyber liability coverage",
      },
      {
        factor: "Property in flood zone",
        severity: "Low",
        recommendation: "Review flood insurance options",
      },
    ],
    competitiveAnalysis: {
      currentPremium: client.premium || 5000,
      marketAverage: 5500,
      potentialSavings: 0,
      coverageGaps: ["Cyber liability", "Business interruption"],
    },
  }

  const handleRefreshInsights = async () => {
    setIsRefreshing(true)
    // Simulate API call to refresh insights
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-amber-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-600" />
            AI Insights for {client.name}
          </DialogTitle>
          <DialogDescription>
            Advanced analytics and recommendations powered by artificial intelligence.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">Last updated: Today at 10:45 AM</div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshInsights}
            disabled={isRefreshing}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Insights"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Customer Health</CardTitle>
                  <CardDescription>Overall relationship strength</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center mb-4">
                      <span className="text-4xl font-bold text-green-600">{aiInsights.customerHealthScore}%</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        This client has a <span className="font-medium text-green-600">strong</span> relationship with
                        your agency
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Renewal Forecast</CardTitle>
                  <CardDescription>Probability of policy renewal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Renewal Probability</span>
                      <span className="font-bold text-green-600">{aiInsights.renewalProbability}%</span>
                    </div>
                    <Progress value={aiInsights.renewalProbability} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>
                        Expiration:{" "}
                        {client.expiration_date ? new Date(client.expiration_date).toLocaleDateString() : "N/A"}
                      </span>
                      <span className="text-green-600 font-medium">High Retention</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Key Metrics</CardTitle>
                <CardDescription>Important indicators at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-xl font-bold text-blue-700">{aiInsights.riskScore}</div>
                    <div className="text-xs text-center text-blue-600">Risk Score</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                    <div className="text-xl font-bold text-green-700">{aiInsights.renewalProbability}%</div>
                    <div className="text-xs text-center text-green-600">Renewal Probability</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                    <Target className="h-8 w-8 text-purple-600 mb-2" />
                    <div className="text-xl font-bold text-purple-700">{aiInsights.upsellOpportunities.length}</div>
                    <div className="text-xs text-center text-purple-600">Upsell Opportunities</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-amber-600 mb-2" />
                    <div className="text-xl font-bold text-amber-700">{aiInsights.riskFactors.length}</div>
                    <div className="text-xs text-center text-amber-600">Risk Factors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Detailed analysis of client risk factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Overall Risk Score</span>
                      <span className="font-bold text-amber-600">{aiInsights.riskScore}/100</span>
                    </div>
                    <Progress value={aiInsights.riskScore} className="h-2" />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-green-600">Low Risk</span>
                      <span className="text-amber-600">Medium Risk</span>
                      <span className="text-red-600">High Risk</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Identified Risk Factors</h4>
                    {aiInsights.riskFactors.map((factor, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{factor.factor}</div>
                            <div className="text-sm text-gray-500">Recommendation: {factor.recommendation}</div>
                          </div>
                          <Badge className={`${getSeverityColor(factor.severity)} bg-opacity-10`}>
                            {factor.severity} Risk
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Analysis</CardTitle>
                <CardDescription>Evaluation of current coverage vs. recommended</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current Premium</span>
                    <span className="font-bold">${aiInsights.competitiveAnalysis.currentPremium.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Market Average</span>
                    <span className="font-bold">${aiInsights.competitiveAnalysis.marketAverage.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="font-medium mb-2">Identified Coverage Gaps</div>
                    <div className="space-y-2">
                      {aiInsights.competitiveAnalysis.coverageGaps.map((gap, index) => (
                        <div key={index} className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                          <span>{gap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upsell Opportunities</CardTitle>
                <CardDescription>AI-identified products that match client needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.upsellOpportunities.map((opportunity, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-lg">{opportunity.product}</div>
                        <Badge variant="outline" className="bg-green-50">
                          {opportunity.confidence}% Match
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{opportunity.reason}</p>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                        <Button size="sm">Create Quote</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cross-Sell Analysis</CardTitle>
                <CardDescription>Based on similar client profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-medium mb-2">Similar clients also purchase:</div>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Business Interruption Insurance (78% of similar clients)</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Directors & Officers Coverage (65% of similar clients)</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Professional Liability (62% of similar clients)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>AI-suggested next steps for this client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.nextBestActions.map((action, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{action.action}</div>
                        <Badge className={getPriorityColor(action.priority)}>{action.priority} Priority</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Timeframe: {action.timeframe}</span>
                      </div>
                      <div className="mt-3 flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          Schedule
                        </Button>
                        <Button size="sm">Mark Complete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Renewal Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      Start Renewal Process
                    </Button>
                    <Button className="w-full" variant="outline">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Generate Renewal Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Email Triggers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Send Birthday Email
                    </Button>
                    <Button className="w-full" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Send Renewal Thanks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
