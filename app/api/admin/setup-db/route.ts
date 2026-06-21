import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Check which tables exist
async function getExistingTables(): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('information_schema.tables' as any)
    .select('table_name')
    .eq('table_schema', 'public')
  return (data || []).map((r: any) => r.table_name)
}

// The full migration SQL — each statement is standalone
const TABLES: Record<string, string> = {
  lead_progress_steps: `CREATE TABLE lead_progress_steps(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL,step_number int NOT NULL,step_name varchar(100) NOT NULL,is_completed boolean DEFAULT false,started_at timestamptz DEFAULT now(),completed_at timestamptz,time_spent_seconds int DEFAULT 0,captured_data jsonb,validation_errors jsonb,user_agent text,ip_address varchar(45),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now())`,
  lead_communications: `CREATE TABLE lead_communications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL,type varchar(20) NOT NULL,subject varchar(255),body text,sent_at timestamptz DEFAULT now(),delivered_at timestamptz,opened_at timestamptz,status varchar(20) NOT NULL DEFAULT 'sent',external_id varchar(100),error_message text,sent_by varchar(100),template_name varchar(100),created_at timestamptz NOT NULL DEFAULT now())`,
  lead_notes: `CREATE TABLE lead_notes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL,content text NOT NULL,note_type varchar(20),is_internal boolean DEFAULT true,follow_up_date timestamptz,follow_up_completed boolean DEFAULT false,created_by varchar(100) NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`,
  submission_documents: `CREATE TABLE submission_documents(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),submission_id text NOT NULL,document_type varchar(50) NOT NULL,file_name varchar(255) NOT NULL,file_path text NOT NULL,file_size int,mime_type varchar(50),review_status varchar(20) NOT NULL DEFAULT 'pending',reviewed_by varchar(100),reviewed_at timestamptz,uploaded_by varchar(100) NOT NULL,uploaded_at timestamptz NOT NULL DEFAULT now())`,
  underwriting_checklist: `CREATE TABLE underwriting_checklist(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),submission_id text NOT NULL,item_name varchar(255) NOT NULL,item_type varchar(50),is_required boolean DEFAULT true,is_completed boolean DEFAULT false,completed_at timestamptz,completed_by varchar(100),notes text,display_order int DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now())`,
  market_placements: `CREATE TABLE market_placements(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),submission_id text NOT NULL,placement_number varchar(100) NOT NULL UNIQUE,carrier varchar(100) NOT NULL,carrier_email varchar(255),coverage_types jsonb,requested_limits jsonb,special_requirements text,carrier_appetite varchar(20),status varchar(20) NOT NULL DEFAULT 'submitted',submitted_date timestamptz NOT NULL DEFAULT now(),acknowledged_date timestamptz,expected_quote_date timestamptz,quote_received_date timestamptz,decline_date timestamptz,bound_date timestamptz,carrier_decline_reason text,carrier_feedback text,assigned_agent varchar(100) NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now())`,
  placement_timeline: `CREATE TABLE placement_timeline(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),placement_id uuid NOT NULL,status_change_from varchar(20),status_change_to varchar(20) NOT NULL,status_change_reason text,event_description text NOT NULL,event_type varchar(50),changed_by varchar(100),changed_at timestamptz NOT NULL DEFAULT now())`,
  quote_acceptances: `CREATE TABLE quote_acceptances(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),quote_id text NOT NULL,accepted_by varchar(100) NOT NULL,acceptance_date timestamptz NOT NULL DEFAULT now(),binding_status varchar(20) NOT NULL DEFAULT 'pending',binding_date timestamptz,binding_confirmation_number varchar(100),policy_document_url text,notes text,created_at timestamptz NOT NULL DEFAULT now())`,
  lead_sources: `CREATE TABLE lead_sources(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),source_name varchar(100) NOT NULL UNIQUE,source_type varchar(50) NOT NULL,display_name varchar(100),api_endpoint varchar(500),api_auth_type varchar(50),api_key_encrypted text,is_active boolean DEFAULT true,sync_frequency varchar(50) DEFAULT 'hourly',last_sync_time timestamptz,next_sync_time timestamptz,last_successful_sync timestamptz,last_sync_lead_count int DEFAULT 0,total_leads_imported int DEFAULT 0,last_sync_error text,sync_error_count int DEFAULT 0,field_mapping jsonb,auto_qualify_rules jsonb,assignment_rules jsonb,notes text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now())`,
  raw_lead_imports: `CREATE TABLE raw_lead_imports(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_source_id uuid NOT NULL,source_contact_id varchar(255) NOT NULL,source_brand varchar(50) NOT NULL,raw_data jsonb NOT NULL,processing_status varchar(20) NOT NULL DEFAULT 'pending',duplicate_check_result jsonb,validation_errors jsonb,mapped_to_lead_id text,imported_at timestamptz NOT NULL DEFAULT now(),processed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now())`,
  lead_assignment_queue: `CREATE TABLE lead_assignment_queue(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_id text NOT NULL UNIQUE,queue_status varchar(20) NOT NULL DEFAULT 'pending',priority varchar(20) NOT NULL DEFAULT 'medium',source_brand varchar(50),source_type varchar(50),entered_queue_at timestamptz NOT NULL DEFAULT now(),assigned_at timestamptz,assignment_method varchar(50),assigned_to varchar(100),assigned_by varchar(100),follow_up_required boolean DEFAULT false,queue_notes text,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now())`,
  lead_sync_jobs: `CREATE TABLE lead_sync_jobs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),lead_source_id uuid NOT NULL,job_type varchar(50) NOT NULL,status varchar(20) NOT NULL DEFAULT 'pending',started_at timestamptz NOT NULL DEFAULT now(),completed_at timestamptz,records_attempted int DEFAULT 0,records_success int DEFAULT 0,records_duplicate int DEFAULT 0,records_failed int DEFAULT 0,error_message text,imported_lead_ids jsonb,triggered_by varchar(100),created_at timestamptz NOT NULL DEFAULT now())`,
  agent_workload: `CREATE TABLE agent_workload(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),agent_email varchar(100) NOT NULL UNIQUE,agent_name varchar(100),is_active boolean DEFAULT true,max_daily_leads int DEFAULT 10,pending_leads int DEFAULT 0,total_active_leads int DEFAULT 0,leads_assigned_today int DEFAULT 0,utilization_percent int DEFAULT 0,can_accept_more_leads boolean DEFAULT true,preferred_industries jsonb,preferred_policy_types jsonb,last_updated timestamptz NOT NULL DEFAULT now(),created_at timestamptz NOT NULL DEFAULT now())`,
}

// Column additions for existing tables
const ALTER_STMTS = [
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_step int DEFAULT 1`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_completion int DEFAULT 0`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score int DEFAULT 0`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage varchar(20) DEFAULT 'lead_capture'`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS session_id varchar(255)`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS qq_catalyst_contact_id varchar(100)`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_annual_premium decimal(12,2)`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_agent varchar(100)`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_date timestamptz`,
  `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_number varchar(100)`,
  `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS risk_rating int DEFAULT 50`,
  `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ready_to_submit_date timestamptz`,
]

export async function GET() {
  try {
    // Check existing tables
    const { data: tableRows } = await supabaseAdmin
      .from('information_schema.tables' as any)
      .select('table_name')
      .eq('table_schema', 'public')

    const existing = new Set((tableRows || []).map((r: any) => r.table_name))

    const results: {name: string; status: string; note?: string}[] = []
    let created = 0, skipped = 0

    // Create missing tables
    for (const [tableName, sql] of Object.entries(TABLES)) {
      if (existing.has(tableName)) {
        results.push({ name: tableName, status: 'exists' })
        skipped++
        continue
      }
      const { error } = await supabaseAdmin.from(tableName as any).select('id').limit(0)
      if (!error) {
        results.push({ name: tableName, status: 'exists' })
        skipped++
        continue
      }
      // Table doesn't exist - we need to create it
      // Unfortunately supabase-js doesn't support DDL directly
      // Return the SQL for the user to run
      results.push({ name: tableName, status: 'needs_creation', note: sql.slice(0, 80) + '...' })
    }

    const needsCreation = results.filter(r => r.status === 'needs_creation')

    return NextResponse.json({
      message: needsCreation.length === 0
        ? 'All tables already exist! Database is ready.'
        : `${needsCreation.length} tables need to be created. Copy the SQL below and run in Supabase SQL Editor.`,
      tablesExisting: skipped,
      tablesNeedingCreation: needsCreation.length,
      status: needsCreation.length === 0 ? 'ready' : 'needs_setup',
      supabaseSQLEditorURL: 'https://supabase.com/dashboard/project/bkdgdfwotlyvojnrenet/sql/new',
      tables: results,
      sqlToRun: needsCreation.length > 0 ? Object.values(TABLES).join(';\n\n') + ';\n\n' + ALTER_STMTS.join(';\n') + ';' : null,
    })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
