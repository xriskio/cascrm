CREATE TABLE IF NOT EXISTS quote_acceptances(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),quote_id text NOT NULL,accepted_by varchar(100) NOT NULL,acceptance_date timestamptz NOT NULL DEFAULT now(),acceptance_method varchar(50),authorized_by_email varchar(255),binding_status varchar(20) NOT NULL DEFAULT 'pending',binding_date timestamptz,binding_confirmation_number varchar(100),policy_document_url text,certificate_url text,notes text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS quote_presentations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL,submission_id text NOT NULL,presentation_number varchar(100) NOT NULL UNIQUE,presentation_date timestamptz NOT NULL DEFAULT now(),included_quote_ids jsonb,recommended_quote_id text,presentation_format varchar(50),client_reaction varchar(50),client_preferred_quote_id text,follow_up_required boolean DEFAULT false,follow_up_date timestamptz,sent_by varchar(100) NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS quote_rejections(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),quote_id text NOT NULL,rejected_by varchar(100) NOT NULL,rejection_reason text NOT NULL,rejection_category varchar(50),detailed_feedback text,rejection_date timestamptz NOT NULL DEFAULT now(),next_steps text);
-- Add columns to leads if not exists
ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_step int DEFAULT 1;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_completion int DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score int DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage varchar(20) DEFAULT 'lead_capture';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS session_id varchar(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qq_catalyst_contact_id varchar(100);
-- Add columns to submissions if not exists
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_number varchar(100);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_profile varchar(20);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_rating int DEFAULT 50;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ready_to_submit_date timestamptz;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitted_date timestamptz;
