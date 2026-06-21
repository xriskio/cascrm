-- LEAD WORKFLOW SCHEMA
-- lead_progress_steps, lead_communications, lead_notes
-- Also adds missing columns to the existing 'leads' table
-- Run after base schema is in place

-- 1. Lead Progress Steps (tracks multi-step form completion)
CREATE TABLE IF NOT EXISTS lead_progress_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL,
  step_number int NOT NULL,
  step_name varchar(255),
  captured_data jsonb,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  user_agent text,
  ip_address varchar(45),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Lead Communications (email/phone/SMS log)
CREATE TABLE IF NOT EXISTS lead_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL,
  communication_type varchar(20) NOT NULL,
  direction varchar(10) NOT NULL,
  subject varchar(255),
  body text,
  from_address varchar(255),
  to_address varchar(255),
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  resend_message_id varchar(100),
  status varchar(20) DEFAULT 'sent',
  created_by varchar(100),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Lead Notes (internal agent notes)
CREATE TABLE IF NOT EXISTS lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL,
  content text NOT NULL,
  note_type varchar(50),
  created_by varchar(100) NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_lps_lead ON lead_progress_steps(lead_id);
CREATE INDEX IF NOT EXISTS idx_lc_lead ON lead_communications(lead_id);
CREATE INDEX IF NOT EXISTS idx_ln_lead ON lead_notes(lead_id);

-- ADD MISSING COLUMNS TO LEADS TABLE
ALTER TABLE leads ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage varchar(50) DEFAULT 'lead_capture';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_step int DEFAULT 1;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_completion int DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score int DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_type varchar(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry varchar(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_reason text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_date timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type varchar(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS value decimal(12,2);