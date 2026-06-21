# Casurance 4-Workflow CRM System
## Architecture: Lead → Submission → Market Placement → Quote → Bound Policy

### Database Setup (run in order)
1. COMPLETE_PIPELINE_SCHEMA.sql
2. LEAD_WORKFLOW_SCHEMA.sql
3. SUBMISSION_WORKFLOW_SCHEMA.sql
4. MARKET_PLACEMENT_SCHEMA.sql
5. QUOTE_WORKFLOW_SCHEMA.sql
6. RENEWAL_WORKFLOW_SCHEMA.sql
7. WORKFLOW_ANALYTICS_VIEWS.sql (optional)

### Test Data
Run WORKFLOW_TEST_SEED.sql for a complete end-to-end test record set.

---

## API Reference

### Lead Workflow
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/workflow/leads | Create lead (dedup by email) |
| GET | /api/workflow/leads/[id] | Get lead + progress + comms + notes |
| PATCH | /api/workflow/leads/[id] | Update status/stage/agent |
| PATCH | /api/workflow/leads/[id]/form-step | Advance form (step 1-4) |
| POST | /api/workflow/leads/[id]/qualify | Qualify lead + assign agent |

### Submission Workflow
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/workflow/submissions | Create submission + 7-item checklist |
| GET | /api/submissions/[id]/workflow | Load submission + checklist + notes |
| PATCH | /api/submissions/[id]/workflow | Update submission status |
| GET/POST | /api/submissions/[id]/documents | List/upload documents |
| PATCH | /api/submissions/[id]/checklist/[itemId] | Complete checklist item |
| GET/POST | /api/submissions/[id]/notes | List/add internal notes |
| POST | /api/workflow/submissions/[id]/complete | Mark ready (validates checklist) |

### Market Placement Workflow
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/workflow/placements | Send to carrier + log timeline |
| PATCH | /api/workflow/placements/[id]/status | Update status + log timeline |
| GET/POST | /api/workflow/placements/[id]/communications | Log carrier comms |

### Quote Workflow
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/workflow/quotes | Create quote + score competitiveness |
| GET/POST | /api/workflow/quote-comparisons | Auto-score multi-quote analysis |
| POST | /api/workflow/quote-presentations | Present quotes to client |
| GET/PATCH | /api/workflow/quote-presentations/[id] | Update client reaction |
| POST | /api/workflow/quotes/[id]/accept | Accept quote |
| POST | /api/workflow/quotes/[id]/bind | Bind policy + update all records |
| POST | /api/workflow/quotes/[id]/reject | Reject quote + log reason |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/workflow/metrics | KPIs for all 4 workflows (last N days) |

---

## Status Flows

### Lead
started → in_progress → qualified → contacted → converted / lost

### Submission
draft → ready → submitted → accepted / declined

### Placement
submitted → acknowledged → under_review → quoted → bound / declined / withdrawn

### Quote
received → presented → accepted → bound / declined / expired

---

## Email Triggers (lib/workflow-emails.ts)
1. sendLeadWelcome — on lead creation
2. sendLeadQualified — agent notification on qualification
3. sendSubmissionReady — agent notification when checklist complete
4. sendQuoteReceived — agent notification when quote created
5. sendQuotePresentation — client notification when quotes presented
6. sendBindingConfirmation — client confirmation when policy bound

Requires: RESEND_API_KEY env var. All functions are no-ops if key is missing.

---

## UI Pages
| Route | Purpose |
|-------|---------|
| /pipeline | 4-column kanban: Lead / Submission / Placement / Quote |
| /submissions/[id]/workflow | Checklist + notes + status flow |
| /submissions/[id]/placements | Multi-carrier tracker + add carrier |
| /quotes/compare/[submissionId] | Side-by-side quote comparison + bind |
| /renewals/[id]/workflow | 120-day renewal cycle management |

---

## Environment Variables
RESEND_API_KEY — Email automation (optional)
NEXT_PUBLIC_APP_URL — Base URL for email links
QQ_BEARER_TOKEN — QQCatalyst API bearer token
NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key

---

## Casurance Agency | License #6005562 | Surplus Lines #0B86622
## Version 1.0 | June 2026