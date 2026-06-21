-- SUBMISSION WORKFLOW SCHEMA
-- submission_documents, underwriting_checklist, submission_versions, submission_notes
-- Run after COMPLETE_PIPELINE_SCHEMA.sql

CREATE TABLE IF NOT EXISTS submission_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id text NOT NULL,
  document_type varchar(50) NOT NULL,
  file_name varchar(255) NOT NULL,
  file_path text NOT NULL,
  file_size int,
  mime_type varchar(50),
  extracted_text text,
  data_extracted jsonb,
  virus_scan_status varchar(20),
  virus_scan_result text,
  password_protected boolean DEFAULT false,
  review_status varchar(20) NOT NULL DEFAULT 'pending',
  reviewed_by varchar(100),
  reviewed_at timestamptz,
  review_notes text,
  uploaded_by varchar(100) NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS underwriting_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id text NOT NULL,
  item_name varchar(255) NOT NULL,
  item_type varchar(50),
  is_required boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  completed_by varchar(100),
  related_document_id text,
  notes text,
  display_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submission_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id text NOT NULL,
  version_number int NOT NULL,
  change_description text NOT NULL,
  changed_fields jsonb,
  previous_values jsonb,
  new_values jsonb,
  changed_by varchar(100) NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submission_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id text NOT NULL,
  content text NOT NULL,
  note_type varchar(20),
  created_by varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_internal boolean DEFAULT true,
  visible_to_carrier boolean DEFAULT false
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_sd_submission ON submission_documents(submission_id);
CREATE INDEX IF NOT EXISTS idx_uc_submission ON underwriting_checklist(submission_id);
CREATE INDEX IF NOT EXISTS idx_sv_submission ON submission_versions(submission_id);
CREATE INDEX IF NOT EXISTS idx_sn_submission ON submission_notes(submission_id);

-- DEFAULT CHECKLIST ITEMS for new submissions (insert via trigger or app logic)
-- Uncomment to create a function that auto-populates checklist on submission insert:
/*
CREATE OR REPLACE FUNCTION auto_create_checklist()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO underwriting_checklist(submission_id,item_name,item_type,is_required,display_order) VALUES
    (NEW.id,'3-Year Tax Returns','document',true,1),
    (NEW.id,'Profit & Loss Statement','document',true,2),
    (NEW.id,'Loss Runs (5 years)','document',true,3),
    (NEW.id,'ACORD Application','document',true,4),
    (NEW.id,'Driver List / MVRs','document',false,5),
    (NEW.id,'Vehicle Schedule','document',false,6),
    (NEW.id,'Safety Program Documentation','document',false,7);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER auto_checklist AFTER INSERT ON submissions FOR EACH ROW EXECUTE FUNCTION auto_create_checklist();
*/

-- MISSING COLUMNS FOR SUBMISSIONS TABLE (from submission_workflow_schema.ts)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_number varchar(100);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS lead_id text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS insured_name varchar(255);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS insured_type varchar(50);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS insured_address text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS coverage_types jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS requested_limits jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS deductible_preferences jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_profile varchar(20);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_rating int;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_factors jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS claims_history jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS year_established int;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS annual_revenue decimal(15,2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS employee_count int;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS business_description text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS financial_documents jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_documents jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ready_to_submit_date timestamptz;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitted_date timestamptz;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS assigned_underwriter varchar(100);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS qq_catalyst_quote_id varchar(100);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS qq_catalyst_synced_at timestamptz;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS underwriting_notes text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS decline_reason text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS estimated_annual_premium decimal(12,2);