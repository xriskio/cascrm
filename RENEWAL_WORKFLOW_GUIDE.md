# 🔄 Commercial Insurance Renewal Workflow System

**Complete 120-day renewal management for Casurance CRM**

---

## What Is Built

| Feature | Location |
|---------|----------|
| Renewal workflow list dashboard | `/renewals/workflows` |
| Renewal workflow detail (per policy) | `/renewals/[id]/workflow` |
| API: create workflow | `POST /api/renewals/workflow` |
| API: list workflows | `GET /api/renewals/workflow` |
| API: full context | `GET /api/renewals/workflow/[id]` |
| API: progress phase | `POST /api/renewals/workflow/[id]/progress` |
| API: update task | `PATCH /api/renewals/workflow/[id]/tasks/[taskId]` |
| API: add quote | `POST /api/renewals/workflow/[id]/quotes` |
| API: bind policy | `POST /api/renewals/workflow/[id]/bind` |
| API: send notification | `POST /api/renewals/workflow/[id]/notify` |
| API: cron jobs | `GET /api/cron/renewal-notifications` |
| SQL schema | `supabase/renewal_workflow_schema.sql` |

---

## SQL Setup

Run `supabase/renewal_workflow_schema.sql` in Supabase SQL Editor. Creates:
- `renewal_workflows` — master 120-day cycle record
- `renewal_phases` — planning/execution/finalization with dates
- `renewal_tasks` — auto-created tasks per phase
- `renewal_quotes` — carrier quotes with delta comparison
- `renewal_activity_log` — immutable audit trail
- `renewal_notifications` — Resend email tracking

---

## How to Start a Renewal Workflow

1. Go to `/renewals` → find the renewal
2. Click **Begin Renewal Process** → navigates to `/renewals/[id]/workflow`
3. Click **🚀 Begin Renewal Workflow** → creates 3 phases + planning tasks
4. Work through the phase tasks, add carrier quotes, bind best quote

---

## Phase Structure

### Phase 1: Planning (Days 120-90)
Auto-created tasks:
1. Schedule Strategy Meeting with Client (High, requires client approval)
2. Gather Updated Business Data (High)
3. Identify Coverage Changes and Limits (Medium)

### Phase 2: Execution / Reshop (Days 90-45)
Tasks created when phase progresses:
1. Prepare and Submit Updated Applications (High)
2. Review Market Conditions and Carrier Appetite (Medium)

**This is where you add market quotes** — one per carrier, auto-ranks by price, calculates delta vs. current premium.

### Phase 3: Finalization and Bind (Days 45-0)
Tasks created when phase progresses:
1. Present Final Renewal Proposal to Client (Critical, client approval)
2. Bind Policy and Confirm Coverage (Critical)
3. Post-Renewal Administration (Medium)

---

## Quote Comparison

In the Execution phase, add quotes from each carrier you approach:
- Carrier name, base premium, taxes, fees
- A.M. Best rating and recommendation notes
- System auto-calculates total, delta vs. current, competitiveness rank
- **🔒 Bind Best Quote** button in finalization — confirms and sends email

---

## Automated Emails (Resend)

| Schedule | Trigger | Email |
|----------|---------|-------|
| 6 AM daily | Expiring 115-125 days out, not yet notified | 120-Day Kickoff |
| 9 AM daily | Expiring 40-50 days out | 45-Day Reminder |
| 12 PM daily | Bound within last 24 hours | Post-Renewal Debrief |

Manual send buttons available in the workflow detail page and workflow dashboard.

**Railway Cron Setup:**
```
Schedule: 0 6,9,12 * * *
Command: curl https://your-app.up.railway.app/api/cron/renewal-notifications
         -H "x-cron-secret: YOUR_SECRET"
```

Add `CRON_SECRET` to Railway environment variables.

---

## Environment Variables Required

```
RESEND_API_KEY=re_...          # Email sending
NEXT_PUBLIC_SUPABASE_URL=...   # Already set
SUPABASE_SERVICE_ROLE_KEY=...  # Already set
CRON_SECRET=any_secret_string  # Protects cron endpoint
```

---

## API Reference

### Create Workflow
```
POST /api/renewals/workflow
{
  "policyNumber": "WC PI 2656895-000",
  "policyType": "WC",
  "expirationDate": "2026-06-28",
  "assignedAgent": "wael@casurance.com",
  "currentCarrier": "Pie Ins Co",
  "currentPremium": "13365.00"
}
```

### Add Market Quote
```
POST /api/renewals/workflow/[id]/quotes
{
  "carrier": "GEICO Commercial",
  "base_premium": "11200",
  "taxes": "0",
  "fees": "0",
  "carrier_strength": "A+ (A.M. Best)",
  "recommendation_notes": "Best price, strong claims service"
}
```

### Bind Policy
```
POST /api/renewals/workflow/[id]/bind
{
  "selectedQuoteId": "uuid-of-best-quote",
  "clientEmail": "client@company.com",
  "clientName": "ADONAI LLC"
}
```
Sends binding confirmation email, marks workflow complete.

### Send Manual Notification
```
POST /api/renewals/workflow/[id]/notify
{
  "notificationType": "kickoff_120",
  "clientEmail": "client@company.com",
  "clientName": "ADONAI LLC"
}
```
Types: `kickoff_120`, `reminder_45`, `final_proposal`, `post_renewal_debrief`

---

## Key Metrics (SQL)

```sql
-- Average days to bind
SELECT AVG(EXTRACT(DAY FROM (bind_date - renewal_start_date))) AS avg_days_to_bind
FROM renewal_workflows WHERE status = 'bound';

-- Premium savings rate
SELECT AVG((CAST(best_quote_premium AS decimal) - CAST(current_premium AS decimal)) 
           / CAST(current_premium AS decimal) * 100) AS avg_premium_change_pct
FROM renewal_workflows WHERE status = 'bound';

-- Agent performance
SELECT assigned_agent, COUNT(*) AS renewals, 
       COUNT(*) FILTER (WHERE status = 'bound') AS bound
FROM renewal_workflows GROUP BY assigned_agent ORDER BY bound DESC;

-- Active renewals by phase
SELECT current_phase, COUNT(*), AVG(percent_complete) 
FROM renewal_workflows WHERE status != 'bound' GROUP BY current_phase;
```

---

**Built for Casurance Agency** | License #6005562 | Surplus Lines #0B86622
