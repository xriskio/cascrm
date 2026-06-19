"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  ACTIVE_PHASES,
  WORKFLOW_PHASES,
  daysUntil,
  phaseForDays,
  progress,
  isOnTrack,
  type WorkflowSteps,
} from "@/lib/renewals/workflow"

interface Renewal {
  id: string
  client_name: string | null
  named_insured: string | null
  insured_name: string | null
  policy_number: string | null
  carrier: string | null
  insurance_company: string | null
  lob: string | null
  policy_type: string | null
  premium: number | null
  expiration_date: string | null
  status: string | null
  owner: string | null
  client_email: string | null
  workflow_steps: WorkflowSteps | null
  last_client_notified_at: string | null
}

const COLUMNS = ["phase1", "phase2", "phase3"] as const
const PER_COLUMN = 20

function nameOf(r: Renewal) {
  return r.client_name || r.named_insured || r.insured_name || "Unknown"
}
function carrierOf(r: Renewal) {
  return r.carrier || r.insurance_company || "—"
}
function lobOf(r: Renewal) {
  return r.lob || r.policy_type || "—"
}
function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"
}
function dayChip(days: number | null): { label: string; color: string; bg: string } {
  if (days === null) return { label: "no date", color: "#8A8A96", bg: "rgba(138,138,150,0.12)" }
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: "#EF4444", bg: "rgba(239,68,68,0.12)" }
  if (days <= 14) return { label: `${days}d left`, color: "#EF4444", bg: "rgba(239,68,68,0.12)" }
  if (days <= 30) return { label: `${days}d left`, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" }
  return { label: `${days}d left`, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" }
}

export default function RenewalWorkflowPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [selected, setSelected] = useState<Renewal | null>(null)
  const [limits, setLimits] = useState<Record<string, number>>({ phase1: PER_COLUMN, phase2: PER_COLUMN, phase3: PER_COLUMN })

  const supabase = createClient()

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("renewals")
      .select("*")
      .neq("status", "archived")
      .order("expiration_date", { ascending: true })
    if (!error) setRenewals(((data as any[]) || []) as Renewal[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  const owners = useMemo(() => {
    const s = new Set<string>()
    renewals.forEach((r) => r.owner && s.add(r.owner))
    return Array.from(s).sort()
  }, [renewals])

  const enriched = useMemo(() => {
    const q = search.trim().toLowerCase()
    return renewals
      .map((r) => {
        const days = daysUntil(r.expiration_date)
        return { r, days, phase: phaseForDays(days), prog: progress(r.workflow_steps), onTrack: isOnTrack(r.workflow_steps, days) }
      })
      .filter(({ r }) => {
        if (ownerFilter !== "all" && (r.owner || "") !== ownerFilter) return false
        if (!q) return true
        return [nameOf(r), r.policy_number, carrierOf(r), lobOf(r)].some((v) => (v || "").toString().toLowerCase().includes(q))
      })
  }, [renewals, search, ownerFilter])

  const byPhase = useMemo(() => {
    const m: Record<string, typeof enriched> = { upcoming: [], phase1: [], phase2: [], phase3: [], expired: [] }
    enriched.forEach((e) => m[e.phase.id].push(e))
    return m
  }, [enriched])

  const stats = useMemo(() => {
    const inPipeline = COLUMNS.reduce((n, p) => n + byPhase[p].length, 0)
    const expiring30 = enriched.filter((e) => e.days !== null && e.days >= 0 && e.days <= 30).length
    const needsAttention = enriched.filter((e) => COLUMNS.includes(e.phase.id as any) && !e.onTrack).length
    const notified = renewals.filter((r) => r.last_client_notified_at).length
    return { inPipeline, expiring30, needsAttention, notified, expired: byPhase.expired.length, upcoming: byPhase.upcoming.length }
  }, [enriched, byPhase, renewals])

  const patchLocal = (updated: Renewal) => {
    setRenewals((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)))
    setSelected((s) => (s && s.id === updated.id ? { ...s, ...updated } : s))
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Renewal Workflow</h1>
          <p className="text-sm text-muted-foreground">120-day commercial renewal pipeline — organized by phase.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, policy, carrier…"
            className="h-9 w-64 rounded-lg bg-card border border-border px-3 text-sm outline-none focus:border-primary"
          />
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="h-9 rounded-lg bg-card border border-border px-3 text-sm outline-none"
          >
            <option value="all">All owners</option>
            {owners.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="In pipeline" value={stats.inPipeline} accent="#3B82F6" />
        <Stat label="Expiring ≤30d" value={stats.expiring30} accent="#F59E0B" />
        <Stat label="Needs attention" value={stats.needsAttention} accent="#EF4444" />
        <Stat label="Clients notified" value={stats.notified} accent="#22C55E" />
        <Stat label="Upcoming / Expired" value={`${stats.upcoming} / ${stats.expired}`} accent="#8A8A96" />
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading renewals…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {COLUMNS.map((pid) => {
            const phase = WORKFLOW_PHASES.find((p) => p.id === pid)!
            const items = byPhase[pid]
            const shown = items.slice(0, limits[pid])
            return (
              <div key={pid} className="flex flex-col rounded-xl bg-card border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border" style={{ borderTop: `2px solid ${phase.accent}` }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: phase.accent }} />
                  <span className="text-sm font-semibold">{phase.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{phase.short}</span>
                  <span className="ml-1 text-xs font-mono px-1.5 py-0.5 rounded bg-muted text-foreground">{items.length}</span>
                </div>
                <div className="p-3 space-y-2.5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
                  {items.length === 0 && <div className="text-xs text-muted-foreground py-6 text-center">No renewals in this phase.</div>}
                  {shown.map(({ r, days, prog, onTrack }) => {
                    const chip = dayChip(days)
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="w-full text-left rounded-lg bg-background border border-border hover:border-primary/50 transition-colors p-3"
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{nameOf(r)}</div>
                            <div className="text-xs text-muted-foreground truncate">{r.policy_number || "no policy #"} · {carrierOf(r)}</div>
                          </div>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: chip.color, background: chip.bg }}>{chip.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2.5">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-1.5 rounded-full" style={{ width: `${prog.pct}%`, background: phase.accent }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground font-mono">{prog.done}/{prog.total}</span>
                          {!onTrack && <span title="Behind on this phase" className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                          <span>exp {fmtDate(r.expiration_date)}</span>
                          {r.owner && <span className="ml-auto px-1.5 py-0.5 rounded bg-muted text-foreground">{r.owner}</span>}
                          {r.last_client_notified_at && <span className="text-green-400" title="Client notified">✉</span>}
                        </div>
                      </button>
                    )
                  })}
                  {items.length > limits[pid] && (
                    <button
                      onClick={() => setLimits((l) => ({ ...l, [pid]: l[pid] + PER_COLUMN }))}
                      className="w-full text-xs text-primary py-2 hover:underline"
                    >
                      Show {Math.min(PER_COLUMN, items.length - limits[pid])} more ({items.length - limits[pid]} hidden)
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && <WorkflowDrawer renewal={selected} onClose={() => setSelected(null)} onChange={patchLocal} />}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

function WorkflowDrawer({ renewal, onClose, onChange }: { renewal: Renewal; onClose: () => void; onChange: (r: Renewal) => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [owner, setOwner] = useState(renewal.owner || "")
  const [email, setEmail] = useState(renewal.client_email || "")
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null)

  const days = daysUntil(renewal.expiration_date)
  const currentPhase = phaseForDays(days)
  const prog = progress(renewal.workflow_steps)
  const steps = renewal.workflow_steps || {}

  async function toggleStep(stepKey: string, done: boolean) {
    setBusy(stepKey)
    try {
      const res = await fetch(`/api/renewals/${renewal.id}/workflow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepKey, done }),
      })
      const data = await res.json()
      if (data.success) onChange(data.renewal)
    } finally {
      setBusy(null)
    }
  }

  async function saveMeta() {
    setBusy("meta")
    try {
      const res = await fetch(`/api/renewals/${renewal.id}/workflow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, client_email: email }),
      })
      const data = await res.json()
      if (data.success) { onChange(data.renewal); setNotice({ ok: true, msg: "Saved." }) }
    } finally {
      setBusy(null)
    }
  }

  async function notifyClient() {
    setBusy("notify")
    setNotice(null)
    try {
      const res = await fetch(`/api/renewals/${renewal.id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_email: email }),
      })
      const data = await res.json()
      setNotice({ ok: !!data.success, msg: data.success ? data.message : data.error })
      if (data.success) onChange({ ...renewal, client_email: email, last_client_notified_at: new Date().toISOString() })
    } catch (e: any) {
      setNotice({ ok: false, msg: e?.message || "Failed to notify" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="absolute top-0 right-0 bottom-0 w-[min(480px,100vw)] bg-card border-l border-border flex flex-col shadow-2xl">
        <div className="flex items-start gap-3 p-5 border-b border-border">
          <div className="min-w-0">
            <div className="text-lg font-semibold truncate">{nameOf(renewal)}</div>
            <div className="text-xs text-muted-foreground truncate">{renewal.policy_number || "no policy #"} · {carrierOf(renewal)} · {lobOf(renewal)}</div>
          </div>
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status */}
          <div className="rounded-lg bg-background border border-border p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: currentPhase.accent }} />
              <span className="text-sm font-semibold">{currentPhase.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">exp {fmtDate(renewal.expiration_date)}{days !== null ? ` · ${days}d` : ""}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-2 rounded-full" style={{ width: `${prog.pct}%`, background: currentPhase.accent }} />
              </div>
              <span className="text-xs text-muted-foreground font-mono">{prog.done}/{prog.total} · {prog.pct}%</span>
            </div>
          </div>

          {/* Checklist by phase */}
          {ACTIVE_PHASES.map((phase) => {
            const isCurrent = phase.id === currentPhase.id
            return (
              <div key={phase.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: phase.accent }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: phase.accent }}>{phase.title}</span>
                  <span className="text-[10px] text-muted-foreground">{phase.short}</span>
                  {isCurrent && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: phase.accent, background: `${phase.accent}22` }}>current</span>}
                </div>
                <div className="space-y-1.5">
                  {phase.steps.map((s) => {
                    const done = !!steps[s.key]?.done
                    return (
                      <label key={s.key} className="flex gap-3 items-start rounded-lg border border-border bg-background p-3 cursor-pointer hover:border-primary/40">
                        <input
                          type="checkbox"
                          checked={done}
                          disabled={busy === s.key}
                          onChange={(e) => toggleStep(s.key, e.target.checked)}
                          className="mt-0.5 h-4 w-4 accent-primary"
                        />
                        <div className="min-w-0">
                          <div className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{s.label}</div>
                          <div className="text-xs text-muted-foreground">{s.description}</div>
                          {done && steps[s.key]?.at && (
                            <div className="text-[10px] text-green-400 mt-0.5">Done {new Date(steps[s.key]!.at as string).toLocaleDateString()}</div>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer: owner + notify */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Owner / account mgr" className="h-9 rounded-lg bg-background border border-border px-3 text-sm outline-none focus:border-primary" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Client email" className="h-9 rounded-lg bg-background border border-border px-3 text-sm outline-none focus:border-primary" />
          </div>
          {notice && (
            <div className={`text-xs rounded-lg px-3 py-2 ${notice.ok ? "text-green-400 bg-green-500/10 border border-green-500/30" : "text-red-300 bg-red-500/10 border border-red-500/30"}`}>{notice.msg}</div>
          )}
          {renewal.last_client_notified_at && !notice && (
            <div className="text-[11px] text-muted-foreground">Last notified {new Date(renewal.last_client_notified_at).toLocaleString()}</div>
          )}
          <div className="flex gap-2">
            <button onClick={saveMeta} disabled={busy === "meta"} className="flex-1 h-9 rounded-lg border border-border bg-background text-sm hover:border-primary/50 disabled:opacity-50">Save</button>
            <button onClick={notifyClient} disabled={busy === "notify" || !email} className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
              {busy === "notify" ? "Sending…" : "Notify client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
