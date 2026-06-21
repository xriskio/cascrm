-- WORKFLOW TEST DATA / SEED
-- Creates one complete workflow path: Lead → Submission → Placement → Quote
-- Safe to run multiple times (uses IF NOT EXISTS checks)

DO $$
DECLARE
  lead_id text;
  sub_id text;
  place_id text;
  quote_id text;
BEGIN
  -- 1. Create test lead
  INSERT INTO leads (id, email, contact_name, company_name, source, status, stage, lead_score, form_step, form_completion, lead_type)
  VALUES (gen_random_uuid()::text, 'test@bobstrucking.com', 'Bob Smith', 'Bob Smith Trucking LLC', 'google-ads', 'qualified', 'submission_prep', 85, 4, 100, 'Commercial Auto,GL')
  ON CONFLICT (email) DO UPDATE SET lead_score = EXCLUDED.lead_score, status = EXCLUDED.status
  RETURNING id INTO lead_id;

  -- 2. Create test submission
  INSERT INTO submissions (id, tracking_number, lead_id, client_name, policy_type, status, assigned_agent, estimated_annual_premium)
  SELECT gen_random_uuid()::text, 'SUB-TEST-001', lead_id, 'Bob Smith Trucking LLC', 'Commercial Auto', 'ready', 'agent@casurance.com', 15000
  WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE tracking_number = 'SUB-TEST-001')
  RETURNING id INTO sub_id;

  IF sub_id IS NULL THEN
    SELECT id INTO sub_id FROM submissions WHERE tracking_number = 'SUB-TEST-001';
  END IF;

  -- 3. Create 7-item underwriting checklist
  INSERT INTO underwriting_checklist (id, submission_id, item_name, item_type, is_required, is_completed, display_order)
  SELECT gen_random_uuid()::text, sub_id, v.name, 'document', true, v.done, v.ord
  FROM (VALUES
    ('Tax Returns (Last 3 Years)', true, 1),
    ('Profit & Loss Statement', true, 2),
    ('Loss Runs / Claims History', true, 3),
    ('Employee List & Payroll', false, 4),
    ('Vehicle/Equipment List', true, 5),
    ('Business Description & Operations', true, 6),
    ('Safety Procedures Documentation', false, 7)
  ) AS v(name, done, ord)
  ON CONFLICT DO NOTHING;

  -- 4. Create test market placement
  INSERT INTO market_submissions (id, submission_id, carrier_name, status, assigned_agent, submitted_date)
  SELECT gen_random_uuid()::text, sub_id, 'GEICO Commercial', 'quoted', 'agent@casurance.com', NOW() - INTERVAL '3 days'
  WHERE NOT EXISTS (SELECT 1 FROM market_submissions WHERE submission_id = sub_id AND carrier_name = 'GEICO Commercial')
  RETURNING id INTO place_id;

  IF place_id IS NULL THEN
    SELECT id INTO place_id FROM market_submissions WHERE submission_id = sub_id AND carrier_name = 'GEICO Commercial';
  END IF;

  -- 5. Create test quotes (3 carriers)
  INSERT INTO quotes (id, submission_id, placement_id, lead_id, quote_number, carrier_name, annual_premium, base_premium, competitiveness, quote_status, quote_date_received)
  VALUES
    (gen_random_uuid()::text, sub_id, place_id, lead_id, 'QT-TEST-001', 'GEICO Commercial', 12650, 12000, 'best', 'received', NOW()),
    (gen_random_uuid()::text, sub_id, place_id, lead_id, 'QT-TEST-002', 'BHHC', 13200, 12500, 'competitive', 'received', NOW()),
    (gen_random_uuid()::text, sub_id, place_id, lead_id, 'QT-TEST-003', 'Kinsale Capital', 14800, 14000, 'moderate', 'received', NOW())
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Test data seeded. Lead: %, Submission: %, Placement: %', lead_id, sub_id, place_id;
END $$;