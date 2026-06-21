-- WORKFLOW ANALYTICS VIEWS
-- Useful SQL views for dashboards and reporting

-- View: High-value leads not yet contacted (lead score > 80)
CREATE OR REPLACE VIEW v_high_value_leads AS
SELECT id, contact_name, email, company_name, lead_score, value as estimated_premium, status, assigned_to, created_at
FROM leads
WHERE lead_score > 80 AND status IN ('qualified', 'new', 'contacted')
ORDER BY value DESC NULLS LAST, lead_score DESC;

-- View: Leads abandoned in form (inactive > 7 days)
CREATE OR REPLACE VIEW v_abandoned_leads AS
SELECT id, contact_name, email, company_name, form_step, form_completion, last_activity_at
FROM leads
WHERE status = 'new' AND last_activity_at < NOW() - INTERVAL '7 days'
ORDER BY last_activity_at;

-- View: Submissions pending checklist completion
CREATE OR REPLACE VIEW v_submissions_progress AS
SELECT s.id, s.tracking_number, s.client_name, s.status,
  COUNT(c.id) as total_items,
  COUNT(c.id) FILTER (WHERE c.is_completed) as completed_items,
  COUNT(c.id) FILTER (WHERE c.is_required AND NOT c.is_completed) as required_pending,
  ROUND(COUNT(c.id) FILTER (WHERE c.is_completed)::numeric / NULLIF(COUNT(c.id),0) * 100, 0) as completion_pct
FROM submissions s
LEFT JOIN underwriting_checklist c ON c.submission_id = s.id
GROUP BY s.id, s.tracking_number, s.client_name, s.status;

-- View: Carrier SLA tracking (response times)
CREATE OR REPLACE VIEW v_carrier_sla AS
SELECT carrier_name as carrier,
  COUNT(*) as total_placements,
  COUNT(*) FILTER (WHERE status = 'quoted') as quoted,
  COUNT(*) FILTER (WHERE status = 'declined') as declined,
  ROUND(COUNT(*) FILTER (WHERE status = 'quoted')::numeric / NULLIF(COUNT(*),0) * 100, 1) as quote_rate_pct,
  ROUND(AVG(EXTRACT(EPOCH FROM (quote_received_date - submitted_date))/86400) FILTER (WHERE quote_received_date IS NOT NULL), 1) as avg_days_to_quote
FROM market_submissions
GROUP BY carrier_name
ORDER BY quote_rate_pct DESC NULLS LAST;

-- View: Active quotes awaiting client decision
CREATE OR REPLACE VIEW v_active_quotes AS
SELECT q.id, q.quote_number, q.carrier_name as carrier,
  q.annual_premium, q.competitiveness, q.quote_status,
  q.presented_to_client_date,
  ROUND(EXTRACT(EPOCH FROM (NOW() - q.presented_to_client_date))/86400) as days_since_presented,
  q.quote_expiration_date,
  ROUND(EXTRACT(EPOCH FROM (q.quote_expiration_date - NOW()))/86400) as days_until_expiry
FROM quotes q
WHERE q.quote_status = 'presented'
ORDER BY q.quote_expiration_date ASC NULLS LAST;

-- View: Workflow funnel (conversion rates)
CREATE OR REPLACE VIEW v_workflow_funnel AS
SELECT
  (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL '30 days') as leads_30d,
  (SELECT COUNT(*) FROM leads WHERE status = 'qualified' AND created_at >= NOW() - INTERVAL '30 days') as qualified_30d,
  (SELECT COUNT(*) FROM submissions WHERE created_at >= NOW() - INTERVAL '30 days') as submissions_30d,
  (SELECT COUNT(*) FROM market_submissions WHERE created_at >= NOW() - INTERVAL '30 days') as placements_30d,
  (SELECT COUNT(*) FROM quotes WHERE created_at >= NOW() - INTERVAL '30 days') as quotes_30d,
  (SELECT COUNT(*) FROM quotes WHERE quote_status = 'bound' AND created_at >= NOW() - INTERVAL '30 days') as bound_30d,
  (SELECT COALESCE(SUM(annual_premium),0) FROM quotes WHERE quote_status = 'bound' AND created_at >= NOW() - INTERVAL '30 days') as bound_premium_30d;