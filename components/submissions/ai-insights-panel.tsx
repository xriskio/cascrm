"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Zap,
  Brain,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
} from "lucide-react"

interface AIInsightsPanelProps {
  submissions: any[]
}

export function AIInsightsPanel({ submissions }: AIInsightsPanelProps) {
  const insights = {
    conversionRate: 78.5,
    avgProcessingTime: 2.3,
    riskScore: "Low",
    predictedApprovals: 12,
    trendDirection: "up",
    efficiency: 94.2,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* AI Conversion Prediction */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-300">
            <Brain className="h-5 w-5" />
            AI Conversion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-300">{insights.conversionRate}%</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-green-400">+5.2% from last month</p>
            <Badge className="bg-green-500/15 text-green-300 border-green-300">Above Industry Average</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Processing Time Analytics */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-300">
            <Clock className="h-5 w-5" />
            Avg Processing Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-300">{insights.avgProcessingTime} days</span>
              <TrendingDown className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-blue-400">-0.8 days improvement</p>
            <Badge className="bg-blue-500/15 text-blue-300 border-blue-300">Optimized</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Target className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-300">{insights.riskScore}</span>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-purple-400">Portfolio health: Excellent</p>
            <Badge className="bg-purple-500/15 text-purple-300 border-purple-300">AI Verified</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Predicted Approvals */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-300">
            <Zap className="h-5 w-5" />
            Predicted Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-300">{insights.predictedApprovals}</span>
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-sm text-orange-400">Next 7 days forecast</p>
            <Badge className="bg-orange-500/15 text-orange-300 border-orange-300">High Confidence</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Score */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-teal-300">
            <PieChart className="h-5 w-5" />
            AI Efficiency Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-teal-300">{insights.efficiency}%</span>
              <TrendingUp className="h-5 w-5 text-teal-600" />
            </div>
            <p className="text-sm text-teal-400">Automation impact</p>
            <Badge className="bg-teal-500/15 text-teal-300 border-teal-300">Excellent</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Required */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="h-5 w-5" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-300">3</span>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-red-400">Urgent submissions</p>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              Review Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
