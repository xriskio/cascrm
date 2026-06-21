-- Lead Aggregation System Tables
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name varchar(100) NOT NULL UNIQUE,
  source_type varchar(50) NOT NULL,
  display_name varchar(100),
  api_endpoint varchar(500),
  api_auth_type varchar(50),
  api_key_encrypted text,
  is_active boolean DEFAULT true,
  sync_frequency varchar(50) DEFAULT 'hourly',
  last_sync_time timestamptz,
  next_sync_time timestamptz,
  last_successful_sync timestamptz,
  last_sync_lead_count int DEFAULT 0,
  total_leads_imported int DEFAULT 0,
  last_sync_error text,
  sync_error_count int DEFAULT 0,
  field_mapping jsonb,
  auto_qualify_rules jsonb,
  assignment_rules jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS raw_lead_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_source_id uuid NOT NULL REFERENCES lead_sources(id) ON DELETE CASCADE,
  source_contact_id varchar(255) NOT NULL,
  source_brand varchar(50) NOT NULL,
  raw_data jsonb NOT NULL,
  processing_status varchar(20) NOT NULL DEFAULT 'pending',
  duplicate_check_result jsonb,
  validation_errors jsonb,
  mapped_to_lead_id text,
  imported_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by varchar(100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_source_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL,
  lead_source_id uuid NOT NULL REFERENCES lead_sources(id) ON DELETE CASCADE,
  source_contact_id varchar(255) NOT NULL,
  source_brand varchar(50),
  imported_at timestamptz NOT NULL,
  raw_import_id uuid REFERENCES raw_lead_imports(id),
  is_synced_to_source boolean DEFAULT false,
  last_synced_to_source_at timestamptz,
  source_metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_source_id uuid NOT NULL REFERENCES lead_sources(id) ON DELETE CASCADE,
  job_type varchar(50) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_seconds int,
  records_attempted int DEFAULT 0,
  records_success int DEFAULT 0,
  records_duplicate int DEFAULT 0,
  records_skipped int DEFAULT 0,
  records_failed int DEFAULT 0,
  error_message text,
  error_details jsonb,
  query_params jsonb,
  imported_lead_ids jsonb,
  duplicate_lead_ids jsonb,
  triggered_by varchar(100),
  triggered_by_user varchar(100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS duplicate_lead_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id_1 text NOT NULL,
  lead_id_2 text NOT NULL,
  source_1 varchar(50),
  source_2 varchar(50),
  match_score int NOT NULL,
  matched_by_fields jsonb,
  match_type varchar(50),
  status varchar(20) NOT NULL DEFAULT 'pending',
  merged_at timestamptz,
  merged_by varchar(100),
  merged_to_lead_id text,
  reviewed_at timestamptz,
  reviewed_by varchar(100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_assignment_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL UNIQUE,
  queue_status varchar(20) NOT NULL DEFAULT 'pending',
  priority varchar(20) NOT NULL DEFAULT 'medium',
  source_brand varchar(50),
  source_type varchar(50),
  entered_queue_at timestamptz NOT NULL DEFAULT now(),
  age_in_minutes int DEFAULT 0,
  assigned_at timestamptz,
  assignment_method varchar(50),
  assigned_to varchar(100),
  assigned_by varchar(100),
  assigned_agent_current_workload int,
  follow_up_required boolean DEFAULT false,
  follow_up_date timestamptz,
  follow_up_completed boolean DEFAULT false,
  queue_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_workload (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_email varchar(100) NOT NULL UNIQUE,
  agent_name varchar(100),
  is_active boolean DEFAULT true,
  max_daily_leads int DEFAULT 10,
  pending_leads int DEFAULT 0,
  qualified_leads int DEFAULT 0,
  in_progress_leads int DEFAULT 0,
  total_active_leads int DEFAULT 0,
  leads_assigned_today int DEFAULT 0,
  leads_converted_today int DEFAULT 0,
  utilization_percent int DEFAULT 0,
  can_accept_more_leads boolean DEFAULT true,
  preferred_industries jsonb,
  preferred_policy_types jsonb,
  avg_time_to_qualify int,
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_job_id uuid NOT NULL REFERENCES lead_sync_jobs(id) ON DELETE CASCADE,
  log_level varchar(20),
  message text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default lead sources
INSERT INTO lead_sources (source_name, source_type, display_name, sync_frequency, assignment_rules)
VALUES
  ('qq_catalyst', 'api', 'QQ Catalyst CRM', 'hourly', '{"byIndustry":{"trucking":"wael@casurance.com","limousine":"wael@casurance.com","default":"wael@casurance.com"}}'),
  ('casurance', 'database', 'Casurance.com Website', 'hourly', '{"default":"wael@casurance.com"}'),
  ('truxsurance', 'database', 'Truxsurance.com Website', 'hourly', '{"default":"wael@casurance.com"}'),
  ('insurelimos', 'database', 'InsureLimos.com Website', 'hourly', '{"default":"wael@casurance.com"}')
ON CONFLICT (source_name) DO NOTHING;

-- Seed agent workload for wael
INSERT INTO agent_workload (agent_email, agent_name, max_daily_leads, preferred_industries, preferred_policy_types)
VALUES ('wael@casurance.com', 'Wael', 20, '["Trucking","Limousine","Transportation"]', '["GL","WC","Auto","Property"]')
ON CONFLICT (agent_email) DO NOTHING;
