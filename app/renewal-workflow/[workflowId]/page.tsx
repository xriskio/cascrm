"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  Mail,
  Edit3,
  Send,
  MinusCircle,
  Calendar,
  DollarSign,
  User,
  Phone,
  RefreshCw,
  Plus,
  SkipForward,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WorkflowTask {
  id: string
  workflow_id: string
  phase: string
  title: string
  description: string | null
  status: string
  assigned_to: string | null
  assigned_role: string | null
  due_date: string | null
  completed_at: string | null
  completed_by: string | null
  sort_order: number
  is_default: boolean
}

interface WorkflowNotification {
  id: string
  notification_type: string
  recipient_email: string
  recipient_name: string | null
  subject: string | null
  status: string
  sent_at: string
}

interface Workflow {
  id: string
  renewal_id: string
  policy_number: string | null
  named_insured: string | null
  policy_type: string | null
  expiration_date: string
  current_phase: string
  status: string
  agent_name: string | null
  agent_email: string | null
  client_email: string | null
  client_phone: string | null
  expiring_premium: string | null
  quoted_premium: string | null
  bound_premium: string | null
  strategy_notes: string | null
  market_notes: string | null
  binding_notes: string | null
  days_to_expiry: number | null
}

const PHASES = [
  { key: 'planning', label: 'Phase 1: Planning & Preparation', subtitle: '120–90 days out', color: 'blue' },
  { key: 'execution', label: 'Phase 2: Market Strategy', subtitle: '90–45 days out', color: 'amber' },
  { key: 'finalization', label: 'Phase 3: Finalization', subtitle: '45–0 days out', color: 'orange' },
  { key: 'post_renewal', label: 'Post-Renewal Planning', subtitle: 'After binding', color: 'purple' },
]

const NOTIFICATION_TYPES = [
  { value: 'kickoff_120', label: '120-Day Kickoff', phase: 'planning', description: 'Informs client renewal has started' },
  { value: 'phase2_90', label: '90-Day Update', phase: 'execution', description: 'Applications submitted to market' },
  { value: 'quotes_ready', label: 'Quotes Ready', phase: 'execution', description: 'Quotes received, ready to review' },
  { value: 'proposal_30', label: '30-Day Proposal', phase: 'finalization', description: 'Urgent: final proposal ready' },
  { value: 'bound_confirmation', label: 'Bound Confirmation', phase: 'finalization', description: 'Coverage confirmed and bound' },
  { value: 'post_renewal_debrief', label: 'Post-Renewal Debrief', phase: 'post_renewal', description: 'Schedule post-renewal meeting' },
]

const PHASE_COLOR = {
  blue: { badge: 'bg-blue-100 text-blue-800 border-blue-200', header: 'border-l-blue-500', dot: 'bg-blue-500', progress: 'bg-blue-500' },
  amber: { badge: 'bg-amber-100 text-amber-800 border-amber-200', header: 'border-l-amber-500', dot: 'bg-amber-500', progress: 'bg-amber-500' },
  orange: { badge: 'bg-orange-100 text-orange-800 border-orange-200', header: 'border-l-orange-500', dot: 'bg-orange-500', progress: 'bg-orange-500' },
  purple: { badge: 'bg-purple-100 text-purple-800 border-purple-200', header: 'border-l-purple-500', dot: 'bg-purple-500', progress: 'bg-purple-500' },
}

const ROLE_LABELS: Record<string, string> = {
  agent: 'Agent',
  account_manager: 'Acct Mgr',
  csr: 'CSR',
}

function taskIcon(status: string) {
  if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
  if (status === 'in_progress') return <Clock className="h-5 w-5 text-blue-500 shrink-0" />
  if (status === 'skipped') return <MinusCircle className="h-5 w-5 text-gray-400 shrink-0" />
  return <Circle className="h-5 w-5 text-gray-300 shrink-0" />
}

export default function WorkflowDetailPage() {
  const { workflowId } = useParams<{ workflowId: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [tasksByPhase, setTasksByPhase] = useState<Record<string, WorkflowTask[]>>({})
  const [phaseProgress, setPhaseProgress] = useState<Record<string, number>>({})
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [notifType, setNotifType] = useState('')
  const [notifMessage, setNotifMessage] = useState('')
  const [sendingNotif, setSendingNotif] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editFields, setEditFields] = useState<Partial<Workflow>>({})
  const [saving, setSaving] = useState(false)

  const [showAddTask, setShowAddTask] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')

  const fetchWorkflow = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/renewal-workflows/${workflowId}`)
      if (!res.ok) { router.push('/renewal-workflow'); return }
      const json = await res.json()
      setWorkflow(json.data)
      setTasksByPhase(json.tasksByPhase || {})
      setPhaseProgress(json.phaseProgress || {})
      setNotifications(json.notifications || [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load workflow', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [workflowId, router, toast])

  useEffect(() => { fetchWorkflow() }, [fetchWorkflow])

  async function updateTask(taskId: string, updates: Partial<WorkflowTask>) {
    const res = await fetch(`/api/renewal-workflows/${workflowId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      await fetchWorkflow()
    } else {
      toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' })
    }
  }

  function cycleTaskStatus(task: WorkflowTask) {
    const cycle: Record<string, string> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
      skipped: 'pending',
    }
    updateTask(task.id, { status: cycle[task.status] || 'pending' })
  }

  async function sendNotification() {
    if (!notifType) return
    setSendingNotif(true)
    try {
      const res = await fetch(`/api/renewal-workflows/${workflowId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_type: notifType, custom_message: notifMessage }),
      })
      const json = await res.json()
      if (res.ok) {
        toast({ title: 'Email Sent', description: `Renewal notification delivered to client.` })
        setShowNotifyModal(false)
        setNotifType('')
        setNotifMessage('')
        await fetchWorkflow()
      } else {
        toast({ title: 'Send Failed', description: json.error || 'Unknown error', variant: 'destructive' })
      }
    } finally {
      setSendingNotif(false)
    }
  }

  async function saveEdit() {
    setSaving(true)
    try {
      const res = await fetch(`/api/renewal-workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFields),
      })
      if (res.ok) {
        toast({ title: 'Saved', description: 'Workflow updated.' })
        setShowEditModal(false)
        await fetchWorkflow()
      } else {
        toast({ title: 'Error', description: 'Save failed', variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  async function addCustomTask(phase: string) {
    if (!newTaskTitle.trim()) return
    const res = await fetch(`/api/renewal-workflows/${workflowId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase, title: newTaskTitle, description: newTaskDesc }),
    })
    if (res.ok) {
      setShowAddTask(null)
      setNewTaskTitle('')
      setNewTaskDesc('')
      await fetchWorkflow()
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-white rounded-xl animate-pulse border" />)}
        </div>
      </div>
    )
  }

  if (!workflow) return null

  const sentNotifTypes = new Set(notifications.filter(n => n.status === 'sent').map(n => n.notification_type))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
              <ChevronLeft className="h-4 w-4 mr-0.5" /> Back to Workflows
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{workflow.named_insured || 'Renewal Workflow'}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-gray-500">{workflow.policy_type}</span>
              {workflow.policy_number && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{workflow.policy_number}</span>}
              {workflow.days_to_expiry !== null && (
                <span className={`text-sm font-medium ${workflow.days_to_expiry < 0 ? 'text-red-600' : workflow.days_to_expiry <= 30 ? 'text-red-600' : workflow.days_to_expiry <= 45 ? 'text-orange-600' : 'text-green-700'}`}>
                  {workflow.days_to_expiry < 0
                    ? `${Math.abs(workflow.days_to_expiry)} days overdue`
                    : `${workflow.days_to_expiry} days to expiration`}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setEditFields({ client_email: workflow.client_email || '', agent_name: workflow.agent_name || '', agent_email: workflow.agent_email || '', expiring_premium: workflow.expiring_premium || '', quoted_premium: workflow.quoted_premium || '', bound_premium: workflow.bound_premium || '', strategy_notes: workflow.strategy_notes || '', market_notes: workflow.market_notes || '', binding_notes: workflow.binding_notes || '' }); setShowEditModal(true) }}
            >
              <Edit3 className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800" onClick={() => setShowNotifyModal(true)}>
              <Mail className="h-4 w-4 mr-1" /> Notify Client
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchWorkflow}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main content: phases + tasks */}
          <div className="col-span-2 space-y-4">
            {PHASES.map((phase) => {
              const phaseTasks = tasksByPhase[phase.key] || []
              const progress = phaseProgress[phase.key] || 0
              const colors = PHASE_COLOR[phase.color as keyof typeof PHASE_COLOR]
              const isCurrentPhase = workflow.current_phase === phase.key
              const isComplete = progress === 100

              return (
                <Card key={phase.key} className={`border-0 shadow-sm border-l-4 ${colors.header} ${isCurrentPhase ? 'ring-1 ring-blue-300' : ''}`}>
                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-semibold text-gray-800">{phase.label}</CardTitle>
                          {isCurrentPhase && <Badge className="bg-blue-600 text-white text-xs">Current</Badge>}
                          {isComplete && <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Complete</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{phase.subtitle}</p>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 mt-2" />
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <div className="space-y-2">
                      {phaseTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer hover:border-gray-300 ${task.status === 'completed' ? 'bg-green-50 border-green-100' : task.status === 'in_progress' ? 'bg-blue-50 border-blue-100' : task.status === 'skipped' ? 'bg-gray-50 border-dashed border-gray-200 opacity-60' : 'bg-white border-gray-100'}`}
                        >
                          <button onClick={() => cycleTaskStatus(task)} className="mt-0.5 hover:scale-110 transition-transform">
                            {taskIcon(task.status)}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {task.assigned_role && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                  {ROLE_LABELS[task.assigned_role] || task.assigned_role}
                                </span>
                              )}
                              {task.due_date && (
                                <span className="text-xs text-gray-400">Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              )}
                              {task.completed_at && (
                                <span className="text-xs text-green-600">Done {new Date(task.completed_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateTask(task.id, { status: 'skipped' }) }}
                            title="Skip task"
                            className="opacity-0 group-hover:opacity-100 hover:text-gray-500 text-gray-300 transition-opacity"
                          >
                            <SkipForward className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add custom task */}
                      {showAddTask === phase.key ? (
                        <div className="border border-dashed border-blue-300 rounded-lg p-3 space-y-2">
                          <Input
                            placeholder="Task title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Textarea
                            placeholder="Description (optional)"
                            value={newTaskDesc}
                            onChange={(e) => setNewTaskDesc(e.target.value)}
                            className="text-sm min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => addCustomTask(phase.key)} className="h-7 text-xs">Add Task</Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowAddTask(null)} className="h-7 text-xs">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddTask(phase.key)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 mt-1 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add custom task
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Policy Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Policy Info</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>Exp: <strong>{new Date(workflow.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                </div>
                {workflow.expiring_premium && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>Expiring: <strong>${parseFloat(workflow.expiring_premium).toLocaleString()}</strong></span>
                  </div>
                )}
                {workflow.quoted_premium && (
                  <div className="flex items-center gap-2 text-amber-700">
                    <DollarSign className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Quoted: <strong>${parseFloat(workflow.quoted_premium).toLocaleString()}</strong></span>
                  </div>
                )}
                {workflow.bound_premium && (
                  <div className="flex items-center gap-2 text-green-700">
                    <DollarSign className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Bound: <strong>${parseFloat(workflow.bound_premium).toLocaleString()}</strong></span>
                  </div>
                )}
                {workflow.agent_name && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{workflow.agent_name}</span>
                  </div>
                )}
                {workflow.client_email && (
                  <div className="flex items-center gap-2 text-gray-700 break-all">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-xs">{workflow.client_email}</span>
                  </div>
                )}
                {workflow.client_phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{workflow.client_phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {(workflow.strategy_notes || workflow.market_notes || workflow.binding_notes) && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3 text-sm text-gray-700">
                  {workflow.strategy_notes && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Strategy</p>
                      <p className="text-sm leading-relaxed">{workflow.strategy_notes}</p>
                    </div>
                  )}
                  {workflow.market_notes && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Market</p>
                      <p className="text-sm leading-relaxed">{workflow.market_notes}</p>
                    </div>
                  )}
                  {workflow.binding_notes && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Binding</p>
                      <p className="text-sm leading-relaxed">{workflow.binding_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notifications Log */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client Notifications</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No notifications sent yet.</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.status === 'sent' ? 'bg-green-500' : 'bg-red-400'}`} />
                        <div>
                          <p className="text-xs font-medium text-gray-700 capitalize">{n.notification_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-400">{new Date(n.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3 h-7 text-xs"
                  onClick={() => setShowNotifyModal(true)}
                >
                  <Mail className="h-3.5 w-3.5 mr-1" /> Send Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Notify Modal */}
      <Dialog open={showNotifyModal} onOpenChange={setShowNotifyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Client Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!workflow.client_email && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">No client email on file. Add one in Edit to send notifications.</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Notification Type</label>
              <Select value={notifType} onValueChange={setNotifType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select notification..." />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map((nt) => (
                    <SelectItem key={nt.value} value={nt.value}>
                      <div>
                        <span className="font-medium">{nt.label}</span>
                        {sentNotifTypes.has(nt.value) && <span className="ml-2 text-xs text-green-600">✓ sent</span>}
                        <p className="text-xs text-gray-500">{nt.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Additional Message (optional)</label>
              <Textarea
                placeholder="Add a personalized note to include in the email..."
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
            {notifType && (
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                <strong>Will be sent to:</strong> {workflow.client_email || 'No email on file'}
                {workflow.agent_email && <><br /><strong>CC:</strong> {workflow.agent_email}</>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifyModal(false)}>Cancel</Button>
            <Button
              onClick={sendNotification}
              disabled={!notifType || !workflow.client_email || sendingNotif}
              className="bg-blue-700 hover:bg-blue-800"
            >
              {sendingNotif ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send Email</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workflow Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Client Email</label>
                <Input
                  value={editFields.client_email || ''}
                  onChange={(e) => setEditFields((f) => ({ ...f, client_email: e.target.value }))}
                  placeholder="client@example.com"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Agent Name</label>
                <Input
                  value={editFields.agent_name || ''}
                  onChange={(e) => setEditFields((f) => ({ ...f, agent_name: e.target.value }))}
                  placeholder="Agent name"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Agent Email</label>
                <Input
                  value={editFields.agent_email || ''}
                  onChange={(e) => setEditFields((f) => ({ ...f, agent_email: e.target.value }))}
                  placeholder="agent@casurance.net"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Expiring Premium</label>
                <Input
                  value={editFields.expiring_premium || ''}
                  onChange={(e) => setEditFields((f) => ({ ...f, expiring_premium: e.target.value }))}
                  placeholder="0.00"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Quoted Premium</label>
                <Input
                  value={editFields.quoted_premium || ''}
                  onChange={(e) => setEditFields((f) => ({ ...f, quoted_premium: e.target.value }))}
                  placeholder="0.00"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Bound Premium</label>
                <Input
                  value={editFields.bound_premium || ''}
                  onChange={(e) => setEditFields((f) => ({ ...f, bound_premium: e.target.value }))}
                  placeholder="0.00"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Strategy Notes</label>
              <Textarea
                value={editFields.strategy_notes || ''}
                onChange={(e) => setEditFields((f) => ({ ...f, strategy_notes: e.target.value }))}
                placeholder="Planning phase notes, business changes, claims discussion..."
                className="text-sm min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Market Notes</label>
              <Textarea
                value={editFields.market_notes || ''}
                onChange={(e) => setEditFields((f) => ({ ...f, market_notes: e.target.value }))}
                placeholder="Carrier submissions, market conditions, quote analysis..."
                className="text-sm min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Binding Notes</label>
              <Textarea
                value={editFields.binding_notes || ''}
                onChange={(e) => setEditFields((f) => ({ ...f, binding_notes: e.target.value }))}
                placeholder="Final terms, binding authorization, policy details..."
                className="text-sm min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving} className="bg-blue-700 hover:bg-blue-800">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
