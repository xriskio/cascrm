-- QUOTE WORKFLOW SCHEMA: quote_versions, quote_comparisons, quote_presentations, quote_acceptances, quote_rejections
-- Run this in Supabase SQL Editor after COMPLETE_PIPELINE_SCHEMA.sql

CREATE TABLE IF NOT EXISTS quote_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id text NOT NULL,
  version_number int NOT NULL,
  change_reason text NOT NULL,
  previous_base_premium decimal(12,2),
  previous_limits jsonb,
  previous_terms jsonb,
  new_base_premium decimal(12,2),
  new_limits jsonb,
  new_terms jsonb,
  modified_by varchar(100) NOT NULL,
  modified_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id text NOT NULL,
  comparison_name varchar(255),
  created_by varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  quote_ids jsonb,
  best_quote_by_premium text,
  best_quote_by_value text,
  recommended_quote text,
  recommendation_reason text,
  scoring_criteria jsonb,
  quote_scores jsonb,
  summary_analysis text
);

CREATE TABLE IF NOT EXISTS quote_presentations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL,
  submission_id text NOT NULL,
  presentation_number varchar(100) NOT NULL UNIQUE,
  presentation_date timestamptz NOT NULL DEFAULT now(),
  included_quote_ids jsonb,
  recommended_quote_id text,
  presentation_format varchar(50),
  presentation_method varchar(50),
  client_reaction_date timestamptz,
  client_reaction varchar(50),
  client_preferred_quote_id text,
  follow_up_required boolean DEFAULT false,
  follow_up_date timestamptz,
  follow_up_completed boolean DEFAULT false,
  sent_by varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id text NOT NULL,
  accepted_by varchar(100) NOT NULL,
  acceptance_date timestamptz NOT NULL DEFAULT now(),
  acceptance_method varchar(50),
  authorized_to_bind_date timestamptz,
  authorized_by_email varchar(255),
  binding_status varchar(20) NOT NULL DEFAULT 'pending',
  binding_date timestamptz,
  binding_confirmation_number varchar(100),
  policy_document_url text,
  certificate_url text,
  endorsement_documents_urls jsonb,
  binding_conditions text,
  other_documents_required jsonb,
  first_policy_document_sent_date timestamptz,
  certificate_sent_date timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_rejections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id text NOT NULL,
  rejected_by varchar(100) NOT NULL,
  rejection_reason text NOT NULL,
  rejection_category varchar(50),
  detailed_feedback text,
  alternative_preferences jsonb,
  rejection_date timestamptz NOT NULL DEFAULT now(),
  next_steps text,
  follow_up_attempted boolean DEFAULT false,
  follow_up_date timestamptz
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_qv_quote ON quote_versions(quote_id);
CREATE INDEX IF NOT EXISTS idx_qc_submission ON quote_comparisons(submission_id);
CREATE INDEX IF NOT EXISTS idx_qp_lead ON quote_presentations(lead_id);
CREATE INDEX IF NOT EXISTS idx_qa_quote ON quote_acceptances(quote_id);
CREATE INDEX IF NOT EXISTS idx_qr_quote ON quote_rejections(quote_id);

-- MISSING COLUMNS FOR QUOTES TABLE (from quote_workflow_schema.ts)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_number varchar(100);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS policy_number varchar(100);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS placement_id text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS lead_id text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS carrier_quote_id varchar(100);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS carrier_underwriter varchar(100);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS coverage_types jsonb;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS limits jsonb;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deductibles jsonb;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS exclusions jsonb;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS endorsements jsonb;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS base_premium decimal(12,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS taxes decimal(12,2) DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS fees decimal(12,2) DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS total_premium decimal(12,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS premium_percentage_change decimal(5,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS premium_percentage_delta decimal(5,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS competitiveness varchar(20);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS effective_date timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS policy_period int DEFAULT 12;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS payment_terms jsonb;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS special_conditions text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS required_endorsements jsonb;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS required_certificates jsonb;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS carrier_financial_strength varchar(50);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS carrier_claims_speed varchar(20);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS carrier_customer_service varchar(20);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_status varchar(20);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_validity_days int DEFAULT 30;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_date_received timestamptz DEFAULT now();
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_expiration_date timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS presented_to_client_date timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_acceptance_date timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS binding_authorization_date timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS bound_date timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS policy_issuance_date timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS agent_notes text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS qq_catalyst_quote_id varchar(100);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS qq_catalyst_synced_at timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_selected_quote boolean DEFAULT false;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS selection_reason text;