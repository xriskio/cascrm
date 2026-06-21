-- MARKET PLACEMENT WORKFLOW SCHEMA
-- market_placements, placement_communications, placement_timeline,
-- placement_requirements, carrier_underwriting_notes, carrier_counter_offers
-- Run after COMPLETE_PIPELINE_SCHEMA.sql

CREATE TABLE IF NOT EXISTS market_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id text NOT NULL,
  placement_number varchar(100) NOT NULL UNIQUE,
  carrier varchar(100) NOT NULL,
  carrier_account_manager varchar(100),
  carrier_email varchar(255),
  carrier_phone varchar(20),
  coverage_types jsonb,
  requested_limits jsonb,
  special_requirements text,
  carrier_appetite varchar(20),
  estimated_response_days int DEFAULT 5,
  status varchar(20) NOT NULL DEFAULT 'submitted',
  submitted_date timestamptz NOT NULL DEFAULT now(),
  acknowledged_date timestamptz,
  expected_quote_date timestamptz,
  quote_received_date timestamptz,
  decline_date timestamptz,
  bound_date timestamptz,
  carrier_decline_reason text,
  carrier_feedback text,
  counter_terms_offered jsonb,
  qq_catalyst_placement_id varchar(100),
  qq_catalyst_synced_at timestamptz,
  assigned_agent varchar(100) NOT NULL,
  assigned_carrier_rep varchar(100),
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS placement_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id text NOT NULL,
  communication_type varchar(20) NOT NULL,
  subject varchar(255),
  message text,
  direction varchar(10) NOT NULL,
  from_party varchar(100) NOT NULL,
  to_party varchar(100) NOT NULL,
  from_email varchar(255),
  to_email varchar(255),
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz,
  attachment_count int DEFAULT 0,
  attachments jsonb,
  recorded_by varchar(100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS placement_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id text NOT NULL,
  status_change_from varchar(20),
  status_change_to varchar(20) NOT NULL,
  status_change_reason text,
  event_description text NOT NULL,
  event_type varchar(50),
  changed_by varchar(100),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS placement_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id text NOT NULL,
  requirement_name varchar(255) NOT NULL,
  requirement_type varchar(50),
  description text,
  is_required boolean DEFAULT true,
  is_satisfied boolean DEFAULT false,
  satisfied_at timestamptz,
  satisfied_by varchar(100),
  due_date timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carrier_underwriting_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id text NOT NULL,
  note_text text NOT NULL,
  note_category varchar(50),
  sourced_from varchar(50),
  carrier_underwriter varchar(100),
  requires_response boolean DEFAULT false,
  response_provided boolean DEFAULT false,
  response_date timestamptz,
  agent_response text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carrier_counter_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id text NOT NULL,
  proposed_limits jsonb,
  proposed_deductibles jsonb,
  proposed_exclusions jsonb,
  proposed_endorsements jsonb,
  proposed_premium decimal(12,2),
  status varchar(20) NOT NULL DEFAULT 'pending',
  agent_response_date timestamptz,
  accepted_at timestamptz,
  rejection_reason text,
  counter_proposal jsonb,
  received_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_mp_submission ON market_placements(submission_id);
CREATE INDEX IF NOT EXISTS idx_mp_carrier ON market_placements(carrier);
CREATE INDEX IF NOT EXISTS idx_mp_status ON market_placements(status);
CREATE INDEX IF NOT EXISTS idx_pc_placement ON placement_communications(placement_id);
CREATE INDEX IF NOT EXISTS idx_pt_placement ON placement_timeline(placement_id);
CREATE INDEX IF NOT EXISTS idx_pr_placement ON placement_requirements(placement_id);
CREATE INDEX IF NOT EXISTS idx_cun_placement ON carrier_underwriting_notes(placement_id);
CREATE INDEX IF NOT EXISTS idx_cco_placement ON carrier_counter_offers(placement_id);

-- ADD MISSING COLUMNS TO market_submissions (existing table)
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS placement_number varchar(100);
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS carrier_appetite varchar(20);
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS estimated_response_days int DEFAULT 5;
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS acknowledged_date timestamptz;
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS expected_quote_date timestamptz;
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS decline_date timestamptz;
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS carrier_decline_reason text;
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS carrier_feedback text;
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS counter_terms_offered jsonb;
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS qq_catalyst_placement_id varchar(100);
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS assigned_carrier_rep varchar(100);
ALTER TABLE market_submissions ADD COLUMN IF NOT EXISTS internal_notes text;