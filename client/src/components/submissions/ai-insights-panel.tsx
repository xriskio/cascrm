
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
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Brain className="h-5 w-5" />
            AI Conversion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-900">{insights.conversionRate}%</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-green-700">+5.2% from last month</p>
            <Badge className="bg-green-100 text-green-800 border-green-300">Above Industry Average</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Processing Time Analytics */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Clock className="h-5 w-5" />
            Avg Processing Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-900">{insights.avgProcessingTime} days</span>
              <TrendingDown className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700">-0.8 days improvement</p>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300">Optimized</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Target className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-900">{insights.riskScore}</span>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-purple-700">Portfolio health: Excellent</p>
            <Badge className="bg-purple-100 text-purple-800 border-purple-300">AI Verified</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Predicted Approvals */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Zap className="h-5 w-5" />
            Predicted Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-900">{insights.predictedApprovals}</span>
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-sm text-orange-700">Next 7 days forecast</p>
            <Badge className="bg-orange-100 text-orange-800 border-orange-300">High Confidence</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Score */}
      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-teal-800">
            <PieChart className="h-5 w-5" />
            AI Efficiency Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-teal-900">{insights.efficiency}%</span>
              <TrendingUp className="h-5 w-5 text-teal-600" />
            </div>
            <p className="text-sm text-teal-700">Automation impact</p>
            <Badge className="bg-teal-100 text-teal-800 border-teal-300">Excellent</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Required */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-900">3</span>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-red-700">Urgent submissions</p>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              Review Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
