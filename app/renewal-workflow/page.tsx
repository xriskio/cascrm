"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Users,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface RenewalWorkflow {
  id: string
  renewal_id: string
  policy_number: string | null
  named_insured: string | null
  policy_type: string | null
  expiration_date: string
  current_phase: string
  status: string
  agent_name: string | null
  client_email: string | null
  expiring_premium: string | null
  days_to_expiry: number | null
  created_at: string
}

const PHASE_CONFIG = {
  planning: {
    label: 'Phase 1: Planning',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    days: '120–90 days',
    icon: FileText,
  },
  execution: {
    label: 'Phase 2: Market Strategy',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    days: '90–45 days',
    icon: TrendingUp,
  },
  finalization: {
    label: 'Phase 3: Finalization',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    dot: 'bg-orange-500',
    days: '45–0 days',
    icon: Users,
  },
  post_renewal: {
    label: 'Post-Renewal',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    days: 'Post-binding',
    icon: CheckCircle2,
  },
  complete: {
    label: 'Complete',
    color: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500',
    days: 'Done',
    icon: CheckCircle2,
  },
}

function urgencyColor(days: number | null) {
  if (days === null) return 'text-gray-500'
  if (days < 0) return 'text-red-600 font-bold'
  if (days <= 30) return 'text-red-600 font-semibold'
  if (days <= 45) return 'text-orange-600 font-semibold'
  if (days <= 90) return 'text-amber-600'
  return 'text-green-700'
}

function urgencyBadge(days: number | null) {
  if (days === null) return null
  if (days < 0) return <Badge className="bg-red-600 text-white text-xs ml-2">EXPIRED</Badge>
  if (days <= 30) return <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs ml-2">URGENT</Badge>
  if (days <= 45) return <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-xs ml-2">ACTION NEEDED</Badge>
  return null
}

export default function RenewalWorkflowPage() {
  const [workflows, setWorkflows] = useState<RenewalWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [phaseFilter, setPhaseFilter] = useState("all")
  const [total, setTotal] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const fetchWorkflows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (phaseFilter !== 'all') params.set('phase', phaseFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/renewal-workflows?${params}`)
      const json = await res.json()
      setWorkflows(json.data || [])
      setTotal(json.total || 0)
    } catch {
      toast({ title: 'Error', description: 'Failed to load workflows', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [phaseFilter, search, toast])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  // Summary counts
  const urgentCount = workflows.filter((w) => w.days_to_expiry !== null && w.days_to_expiry <= 30 && w.days_to_expiry >= 0).length
  const expiredCount = workflows.filter((w) => w.days_to_expiry !== null && w.days_to_expiry < 0).length
  const activeCount = workflows.filter((w) => w.status === 'active').length

  const phaseCounts = Object.keys(PHASE_CONFIG).reduce((acc: Record<string, number>, p) => {
    acc[p] = workflows.filter((w) => w.current_phase === p).length
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Renewal Workflow</h1>
            <p className="text-sm text-gray-500 mt-1">120-day commercial insurance renewal management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchWorkflows}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button size="sm" onClick={() => router.push('/renewals')} className="bg-blue-700 hover:bg-blue-800">
              <Plus className="h-4 w-4 mr-1" /> Start From Renewal
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Urgent (≤30 days)</p>
                  <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400 opacity-60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Expired</p>
                  <p className="text-2xl font-bold text-red-800">{expiredCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-700 opacity-60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phase Pipeline */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-6">
            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pipeline by Phase</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(PHASE_CONFIG).map(([phase, cfg]) => (
                <button
                  key={phase}
                  onClick={() => setPhaseFilter(phaseFilter === phase ? 'all' : phase)}
                  className={`rounded-lg p-3 text-left border transition-all ${phaseFilter === phase ? 'ring-2 ring-blue-500 ' + cfg.color : 'bg-white border-gray-100 hover:border-gray-300'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${cfg.dot} mb-2`} />
                  <p className="text-lg font-bold text-gray-900">{phaseCounts[phase] || 0}</p>
                  <p className="text-xs text-gray-600 leading-tight">{cfg.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cfg.days}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search insured, policy number..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="All Phases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Phases</SelectItem>
              {Object.entries(PHASE_CONFIG).map(([phase, cfg]) => (
                <SelectItem key={phase} value={phase}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Workflow List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No renewal workflows yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Go to a renewal record and click "Start Workflow" to begin the 120-day process.
              </p>
              <Button variant="outline" onClick={() => router.push('/renewals')}>
                Go to Renewals
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {workflows.map((wf) => {
              const phaseCfg = PHASE_CONFIG[wf.current_phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.planning
              const PhaseIcon = phaseCfg.icon

              return (
                <Link key={wf.id} href={`/renewal-workflow/${wf.id}`} className="block">
                  <Card className="border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm truncate">
                              {wf.named_insured || 'Unknown Insured'}
                            </span>
                            {urgencyBadge(wf.days_to_expiry)}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                            <span>{wf.policy_type || 'Commercial'}</span>
                            {wf.policy_number && <span>#{wf.policy_number}</span>}
                            {wf.agent_name && <span>Agent: {wf.agent_name}</span>}
                            {wf.expiring_premium && (
                              <span>Premium: ${parseFloat(wf.expiring_premium).toLocaleString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className={`text-sm ${urgencyColor(wf.days_to_expiry)}`}>
                              {wf.days_to_expiry === null
                                ? '—'
                                : wf.days_to_expiry < 0
                                ? `${Math.abs(wf.days_to_expiry)}d overdue`
                                : `${wf.days_to_expiry}d remaining`}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(wf.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <PhaseIcon className="h-3.5 w-3.5 text-gray-400" />
                            <Badge variant="outline" className={`text-xs ${phaseCfg.color}`}>
                              {phaseCfg.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Phase Progress Bar */}
                      <div className="mt-3 flex items-center gap-2">
                        {['planning', 'execution', 'finalization', 'post_renewal'].map((phase, idx) => {
                          const phases = ['planning', 'execution', 'finalization', 'post_renewal', 'complete']
                          const currentIdx = phases.indexOf(wf.current_phase)
                          const phaseIdx = phases.indexOf(phase)
                          const isDone = currentIdx > phaseIdx
                          const isCurrent = currentIdx === phaseIdx
                          return (
                            <div key={phase} className="flex-1 flex items-center gap-1">
                              <div className={`h-1.5 flex-1 rounded-full transition-all ${isDone ? 'bg-blue-600' : isCurrent ? 'bg-blue-300' : 'bg-gray-200'}`} />
                              {idx < 3 && <div className={`w-2 h-2 rounded-full border-2 transition-all ${isDone ? 'bg-blue-600 border-blue-600' : isCurrent ? 'bg-white border-blue-500' : 'bg-white border-gray-300'}`} />}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
