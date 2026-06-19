// Commercial insurance renewal workflow — a structured 120-day process.
// Pure module (no server imports) so it can be used on client and server.

export type WorkflowStepState = { done?: boolean; at?: string | null; by?: string | null }
export type WorkflowSteps = Record<string, WorkflowStepState>

export interface WorkflowStep {
  key: string
  label: string
  description: string
}

export interface WorkflowPhase {
  id: "upcoming" | "phase1" | "phase2" | "phase3" | "expired"
  title: string
  short: string
  /** inclusive upper / exclusive lower bound on "days until expiration" */
  maxDays: number | null // null = no upper bound (upcoming)
  minDays: number | null // null = no lower bound (expired)
  accent: string // hex accent for UI
  steps: WorkflowStep[]
}

export const WORKFLOW_PHASES: WorkflowPhase[] = [
  {
    id: "upcoming",
    title: "Upcoming",
    short: "120+ days",
    maxDays: null,
    minDays: 120,
    accent: "#8A8A96",
    steps: [],
  },
  {
    id: "phase1",
    title: "Phase 1 · Planning & Preparation",
    short: "120–90 days",
    maxDays: 120,
    minDays: 90,
    accent: "#3B82F6",
    steps: [
      { key: "strategy_meeting", label: "Strategy meeting with client", description: "Discuss business changes, claims history, and risk management initiatives." },
      { key: "gather_data", label: "Gather updated data", description: "Financial reports, payroll numbers, and an updated asset list (equipment, vehicles, locations)." },
      { key: "identify_changes", label: "Identify coverage changes", description: "Higher limits, additional endorsements, or coverages that can be eliminated." },
    ],
  },
  {
    id: "phase2",
    title: "Phase 2 · Strategy Execution",
    short: "90–45 days",
    maxDays: 90,
    minDays: 45,
    accent: "#F59E0B",
    steps: [
      { key: "prepare_applications", label: "Prepare & submit applications", description: "Update the renewal control list and submit updated applications to underwriters." },
      { key: "review_market", label: "Review market conditions", description: "Evaluate market trends, inflation, and carrier appetite to secure the best offers." },
      { key: "evaluate_quotes", label: "Evaluate carrier quotes", description: "Review proposals on total cost of risk — carrier strength & exclusions, not just base premium." },
    ],
  },
  {
    id: "phase3",
    title: "Phase 3 · Finalization",
    short: "45–0 days",
    maxDays: 45,
    minDays: 0,
    accent: "#22C55E",
    steps: [
      { key: "client_review", label: "Present final proposal", description: "Present the final renewal proposal to the insured ~30 days before expiration." },
      { key: "bind_policy", label: "Bind the policy", description: "Once approved, confirm coverage in writing and bind the policy." },
      { key: "post_renewal", label: "Post-renewal planning", description: "Update COIs for lenders/partners, set up payment strategy, and schedule a debrief." },
    ],
  },
  {
    id: "expired",
    title: "Expired / Past Due",
    short: "past expiration",
    maxDays: 0,
    minDays: null,
    accent: "#EF4444",
    steps: [],
  },
]

export const ACTIVE_PHASES = WORKFLOW_PHASES.filter((p) => p.steps.length > 0)

/** All workflow steps across phases, in order. */
export const ALL_STEPS: WorkflowStep[] = ACTIVE_PHASES.flatMap((p) => p.steps)

export function daysUntil(expiration: string | null | undefined): number | null {
  if (!expiration) return null
  const exp = new Date(expiration)
  if (isNaN(exp.getTime())) return null
  const today = new Date()
  const a = Date.UTC(exp.getFullYear(), exp.getMonth(), exp.getDate())
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((a - b) / 86400000)
}

export function phaseForDays(days: number | null): WorkflowPhase {
  if (days === null) return WORKFLOW_PHASES.find((p) => p.id === "upcoming")!
  if (days < 0) return WORKFLOW_PHASES.find((p) => p.id === "expired")!
  if (days <= 45) return WORKFLOW_PHASES.find((p) => p.id === "phase3")!
  if (days <= 90) return WORKFLOW_PHASES.find((p) => p.id === "phase2")!
  if (days <= 120) return WORKFLOW_PHASES.find((p) => p.id === "phase1")!
  return WORKFLOW_PHASES.find((p) => p.id === "upcoming")!
}

export function getPhase(id: string): WorkflowPhase | undefined {
  return WORKFLOW_PHASES.find((p) => p.id === id)
}

/** Overall progress across all active steps. */
export function progress(steps: WorkflowSteps | null | undefined): { done: number; total: number; pct: number } {
  const s = steps || {}
  const total = ALL_STEPS.length
  const done = ALL_STEPS.filter((st) => s[st.key]?.done).length
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

/** Whether every step up to and including the renewal's current phase is complete. */
export function isOnTrack(steps: WorkflowSteps | null | undefined, days: number | null): boolean {
  const phase = phaseForDays(days)
  const order = ["phase1", "phase2", "phase3"]
  const idx = order.indexOf(phase.id)
  if (idx < 0) return true // upcoming or expired
  const expectedSteps = ACTIVE_PHASES.filter((p) => order.indexOf(p.id) <= idx).flatMap((p) => p.steps)
  const s = steps || {}
  return expectedSteps.every((st) => s[st.key]?.done)
}
