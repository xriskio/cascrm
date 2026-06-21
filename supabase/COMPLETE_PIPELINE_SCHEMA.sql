-- ========================================================
-- COMPLETE 4-WORKFLOW PIPELINE SCHEMA
-- Run this ONCE in Supabase SQL Editor
-- Lead → Submission → Market Placement → Quote → Bound
-- ========================================================

-- LEAD SUPPORTING TABLES
CREATE TABLE IF NOT EXISTS lead_progress_steps(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL,step_number int NOT NULL,step_name varchar(100) NOT NULL,is_completed boolean DEFAULT false,started_at timestamptz DEFAULT now(),completed_at timestamptz,time_spent_seconds int DEFAULT 0,captured_data jsonb,validation_errors jsonb,user_agent text,ip_address varchar(45),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS lead_communications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL,type varchar(20) NOT NULL,subject varchar(255),body text,sent_at timestamptz DEFAULT now(),delivered_at timestamptz,opened_at timestamptz,status varchar(20) NOT NULL DEFAULT 'sent',external_id varchar(100),error_message text,sent_by varchar(100),template_name varchar(100),created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS lead_notes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL,content text NOT NULL,note_type varchar(20),is_internal boolean DEFAULT true,follow_up_date timestamptz,follow_up_completed boolean DEFAULT false,created_by varchar(100) NOT NULL,created_at timestamptz NOT NULL DEFAULT now());

-- SUBMISSION SUPPORTING TABLES
CREATE TABLE IF NOT EXISTS submission_documents(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),submission_id text NOT NULL,document_type varchar(50) NOT NULL,file_name varchar(255) NOT NULL,file_path text NOT NULL,file_size int,mime_type varchar(50),review_status varchar(20) NOT NULL DEFAULT 'pending',reviewed_by varchar(100),reviewed_at timestamptz,uploaded_by varchar(100) NOT NULL,uploaded_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS underwriting_checklist(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),submission_id text NOT NULL,item_name varchar(255) NOT NULL,item_type varchar(50),is_required boolean DEFAULT true,is_completed boolean DEFAULT false,completed_at timestamptz,completed_by varchar(100),notes text,display_order int DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());

-- MARKET PLACEMENT TABLES
CREATE TABLE IF NOT EXISTS market_placements(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),submission_id text NOT NULL,placement_number varchar(100) NOT NULL UNIQUE,carrier varchar(100) NOT NULL,carrier_email varchar(255),carrier_phone varchar(20),coverage_types jsonb,requested_limits jsonb,special_requirements text,carrier_appetite varchar(20),status varchar(20) NOT NULL DEFAULT 'submitted',submitted_date timestamptz NOT NULL DEFAULT now(),acknowledged_date timestamptz,expected_quote_date timestamptz,quote_received_date timestamptz,decline_date timestamptz,bound_date timestamptz,carrier_decline_reason text,carrier_feedback text,assigned_agent varchar(100) NOT NULL,internal_notes text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS placement_timeline(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),placement_id uuid NOT NULL,status_change_from varchar(20),status_change_to varchar(20) NOT NULL,status_change_reason text,event_description text NOT NULL,event_type varchar(50),changed_by varchar(100),changed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS carrier_counter_offers(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),placement_id uuid NOT NULL,proposed_limits jsonb,proposed_premium decimal(12,2),status varchar(20) NOT NULL DEFAULT 'pending',agent_response_date timestamptz,accepted_at timestamptz,rejection_reason text,received_date timestamptz NOT NULL DEFAULT now(),created_at timestamptz NOT NULL DEFAULT now());

-- QUOTE SUPPORTING TABLES
CREATE TABLE IF NOT EXISTS quote_acceptances(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),quote_id text NOT NULL,accepted_by varchar(100) NOT NULL,acceptance_date timestamptz NOT NULL DEFAULT now(),binding_status varchar(20) NOT NULL DEFAULT 'pending',binding_date timestamptz,binding_confirmation_number varchar(100),policy_document_url text,notes text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS quote_presentations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL,submission_id text NOT NULL,presentation_number varchar(100) NOT NULL UNIQUE,presentation_date timestamptz NOT NULL DEFAULT now(),included_quote_ids jsonb,recommended_quote_id text,presentation_format varchar(50),client_reaction varchar(50),client_preferred_quote_id text,follow_up_required boolean DEFAULT false,follow_up_date timestamptz,sent_by varchar(100) NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS quote_rejections(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),quote_id text NOT NULL,rejected_by varchar(100) NOT NULL,rejection_reason text NOT NULL,rejection_category varchar(50),detailed_feedback text,rejection_date timestamptz NOT NULL DEFAULT now(),next_steps text);

-- LEAD AGGREGATION TABLES (if not already created)
CREATE TABLE IF NOT EXISTS lead_sources(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),source_name varchar(100) NOT NULL UNIQUE,source_type varchar(50) NOT NULL,display_name varchar(100),api_endpoint varchar(500),api_auth_type varchar(50),api_key_encrypted text,is_active boolean DEFAULT true,sync_frequency varchar(50) DEFAULT 'hourly',last_sync_time timestamptz,last_successful_sync timestamptz,last_sync_lead_count int DEFAULT 0,total_leads_imported int DEFAULT 0,last_sync_error text,sync_error_count int DEFAULT 0,field_mapping jsonb,auto_qualify_rules jsonb,assignment_rules jsonb,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS lead_assignment_queue(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL UNIQUE,queue_status varchar(20) NOT NULL DEFAULT 'pending',priority varchar(20) NOT NULL DEFAULT 'medium',source_brand varchar(50),source_type varchar(50),entered_queue_at timestamptz NOT NULL DEFAULT now(),assigned_at timestamptz,assignment_method varchar(50),assigned_to varchar(100),assigned_by varchar(100),follow_up_required boolean DEFAULT false,queue_notes text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS agent_workload(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),agent_email varchar(100) NOT NULL UNIQUE,agent_name varchar(100),is_active boolean DEFAULT true,max_daily_leads int DEFAULT 20,pending_leads int DEFAULT 0,total_active_leads int DEFAULT 0,leads_assigned_today int DEFAULT 0,utilization_percent int DEFAULT 0,can_accept_more_leads boolean DEFAULT true,preferred_industries jsonb,preferred_policy_types jsonb,last_updated timestamptz NOT NULL DEFAULT now(),created_at timestamptz NOT NULL DEFAULT now());

-- SUBMISSION ADDITIONAL TABLES
CREATE TABLE IF NOT EXISTS submission_versions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),submission_id text NOT NULL,version_number int NOT NULL,change_description text NOT NULL,changed_fields jsonb,previous_values jsonb,new_values jsonb,changed_by varchar(100) NOT NULL,changed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS submission_notes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),submission_id text NOT NULL,content text NOT NULL,note_type varchar(20),created_by varchar(100) NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),is_internal boolean DEFAULT true,visible_to_carrier boolean DEFAULT false);

-- COLUMN ADDITIONS to existing tables
ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_step int DEFAULT 1;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_completion int DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score int DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage varchar(20) DEFAULT 'lead_capture';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS session_id varchar(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qq_catalyst_contact_id varchar(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_annual_premium decimal(12,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_agent varchar(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_date timestamptz;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_number varchar(100);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS lead_id text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS insured_name varchar(255);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS insured_type varchar(50);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS insured_address text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS coverage_types jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS requested_limits jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS deductible_preferences jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_profile varchar(20);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_factors jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS claims_history jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS year_established int;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS annual_revenue decimal(15,2);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS employee_count int;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS business_description text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS financial_documents jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_documents jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitted_date timestamptz;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS assigned_underwriter varchar(100);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS qq_catalyst_quote_id varchar(100);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS qq_catalyst_synced_at timestamptz;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS underwriting_notes text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS decline_reason text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_rating int DEFAULT 50;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ready_to_submit_date timestamptz;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS placement_id uuid;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS lead_id text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS submission_id text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS premium_delta_percent decimal(5,2);

-- SEED default lead sources
INSERT INTO lead_sources(source_name,source_type,display_name,sync_frequency,assignment_rules) VALUES
('qq_catalyst','api','QQ Catalyst CRM','hourly','{"default":"wael@casurance.com"}'),
('casurance','database','Casurance.com Website','hourly','{"default":"wael@casurance.com"}'),
('truxsurance','database','Truxsurance.com','hourly','{"default":"wael@casurance.com"}'),
('insurelimos','database','InsureLimos.com','hourly','{"default":"wael@casurance.com"}')
ON CONFLICT(source_name) DO NOTHING;

-- SEED agent workload
INSERT INTO agent_workload(agent_email,agent_name,max_daily_leads,preferred_industries,preferred_policy_types) VALUES
('wael@casurance.com','Wael',25,'["Trucking","Limousine","Transportation","Commercial"]','["GL","WC","Auto","Property"]')
ON CONFLICT(agent_email) DO NOTHING;
