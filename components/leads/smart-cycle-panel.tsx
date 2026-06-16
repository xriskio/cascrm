"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface SmartCyclePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SmartCyclePanel({ isOpen, onClose }: SmartCyclePanelProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [aiInsights, setAiInsights] = useState({
    pipelineHealth: 87,
    conversionRate: 23.5,
    timeSaved: 12.5,
    leadScore: 94.2,
    automationActive: true,
    nextActions: 8,
  })

  const recommendations = [
    {
      id: 1,
      type: "urgent",
      title: "Follow up with high-value prospects",
      description: "3 leads worth $45K+ haven't been contacted in 5+ days",
      action: "Send automated follow-up sequence",
      impact: "High",
      icon: AlertCircle,
    },
    {
      id: 2,
      type: "opportunity",
      title: "Optimize email timing",
      description: "Emails sent at 2PM have 34% higher open rates",
      action: "Reschedule pending emails",
      impact: "Medium",
      icon: Mail,
    },
    {
      id: 3,
      type: "automation",
      title: "Enable smart lead scoring",
      description: "AI can predict lead quality with 94.2% accuracy",
      action: "Activate advanced scoring",
      impact: "High",
      icon: Brain,
    },
  ]

  const automationRules = [
    {
      id: 1,
      name: "New Lead Assignment",
      description: "Automatically assign leads based on territory and expertise",
      status: "active",
      triggers: 156,
    },
    {
      id: 2,
      name: "Follow-up Sequences",
      description: "Send personalized follow-ups based on lead behavior",
      status: "active",
      triggers: 89,
    },
    {
      id: 3,
      name: "Lead Scoring Updates",
      description: "Update lead scores based on engagement and profile data",
      status: "active",
      triggers: 234,
    },
    {
      id: 4,
      name: "Stale Lead Alerts",
      description: "Notify agents when leads haven't been contacted recently",
      status: "paused",
      triggers: 12,
    },
  ]

  const performanceMetrics = [
    { label: "Pipeline Velocity", value: "14.2 days", change: "-2.1 days", trend: "up" },
    { label: "Conversion Rate", value: "23.5%", change: "+4.2%", trend: "up" },
    { label: "Average Deal Size", value: "$12,450", change: "+$1,200", trend: "up" },
    { label: "Response Time", value: "2.3 hours", change: "-45 min", trend: "up" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Smart Cycle AI Dashboard
          </DialogTitle>
          <DialogDescription>AI-powered insights and automation for your lead management pipeline</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Pipeline Health */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Pipeline Health</h3>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Excellent
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{aiInsights.pipelineHealth}%</span>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <Progress value={aiInsights.pipelineHealth} className="h-2" />
                  <p className="text-sm text-gray-600">Your pipeline is performing above industry average</p>
                </div>
              </div>

              {/* Lead Scoring */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">AI Lead Scoring</h3>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Active
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-600">{aiInsights.leadScore}%</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <Progress value={aiInsights.leadScore} className="h-2" />
                  <p className="text-sm text-gray-600">Accuracy rate for lead quality prediction</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Time Saved</span>
                </div>
                <div className="text-xl font-bold text-orange-600">{aiInsights.timeSaved}h</div>
                <div className="text-xs text-gray-500">per week</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                </div>
                <div className="text-xl font-bold text-green-600">+{aiInsights.conversionRate}%</div>
                <div className="text-xs text-gray-500">improvement</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Next Actions</span>
                </div>
                <div className="text-xl font-bold text-blue-600">{aiInsights.nextActions}</div>
                <div className="text-xs text-gray-500">pending</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const IconComponent = rec.icon
                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            rec.type === "urgent"
                              ? "bg-red-100 text-red-600"
                              : rec.type === "opportunity"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={rec.impact === "High" ? "destructive" : "secondary"} className="text-xs">
                              {rec.impact} Impact
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="ml-4">
                        {rec.action}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <div className="space-y-4">
              {automationRules.map((rule) => (
                <div key={rule.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <Badge variant={rule.status === "active" ? "default" : "secondary"}>{rule.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                      <div className="text-xs text-gray-500">Triggered {rule.triggers} times this month</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                  <div className="text-sm text-green-600">{metric.change} vs last month</div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4">AI Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Efficiency Gain</span>
                  <span className="font-semibold text-green-600">+34%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lead Quality Improvement</span>
                  <span className="font-semibold text-blue-600">+28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time Reduction</span>
                  <span className="font-semibold text-purple-600">-45%</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            Optimize Pipeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
