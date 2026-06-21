-- Renewal Workflow System — 120-day cycle with phases and tasks
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS renewal_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text,
  policy_id text,
  policy_number varchar(100) NOT NULL,
  policy_type varchar(50) NOT NULL,
  expiration_date timestamptz NOT NULL,
  renewal_start_date timestamptz NOT NULL,
  current_phase varchar(20) NOT NULL DEFAULT 'planning',
  phase_started_at timestamptz,
  status varchar(20) NOT NULL DEFAULT 'pending',
  percent_complete int DEFAULT 0,
  current_carrier varchar(100),
  current_premium decimal(12,2),
  best_quote_premium decimal(12,2),
  quote_count int DEFAULT 0,
  preferred_carrier varchar(100),
  bind_date timestamptz,
  assigned_agent varchar(100) NOT NULL,
  assigned_csr varchar(100),
  notes text,
  client_notification_status jsonb,
  last_client_communication timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS renewal_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES renewal_workflows(id) ON DELETE CASCADE,
  phase varchar(20) NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  completion_percent int DEFAULT 0,
  tasks_total int DEFAULT 0,
  tasks_completed int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS renewal_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES renewal_workflows(id) ON DELETE CASCADE,
  phase_id uuid NOT NULL REFERENCES renewal_phases(id) ON DELETE CASCADE,
  task_type varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  assigned_to varchar(100) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  priority varchar(10) NOT NULL DEFAULT 'medium',
  due_date timestamptz NOT NULL,
  completed_at timestamptz,
  requires_client_approval boolean DEFAULT false,
  task_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS renewal_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES renewal_workflows(id) ON DELETE CASCADE,
  carrier varchar(100) NOT NULL,
  base_premium decimal(12,2) NOT NULL,
  total_premium decimal(12,2) NOT NULL,
  premium_delta decimal(12,2),
  premium_delta_percent decimal(5,2),
  limits jsonb,
  carrier_strength varchar(50),
  competitiveness varchar(20),
  recommendation_notes text,
  status varchar(20) NOT NULL DEFAULT 'received',
  selected_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS renewal_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES renewal_workflows(id) ON DELETE CASCADE,
  activity_type varchar(50) NOT NULL,
  description text NOT NULL,
  related_task_id uuid,
  actor_email varchar(255),
  actor_role varchar(50),
  previous_value jsonb,
  new_value jsonb,
  visible_to_client boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS renewal_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES renewal_workflows(id) ON DELETE CASCADE,
  notification_type varchar(50) NOT NULL,
  client_email varchar(255) NOT NULL,
  client_name varchar(255),
  subject varchar(255),
  resend_message_id varchar(100),
  status varchar(20) NOT NULL DEFAULT 'pending',
  sent_at timestamptz NOT NULL DEFAULT now(),
  sent_by varchar(100) NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rw_expiration ON renewal_workflows(expiration_date);
CREATE INDEX IF NOT EXISTS idx_rw_phase ON renewal_workflows(current_phase);
CREATE INDEX IF NOT EXISTS idx_rw_status ON renewal_workflows(status);
CREATE INDEX IF NOT EXISTS idx_rw_agent ON renewal_workflows(assigned_agent);
CREATE INDEX IF NOT EXISTS idx_rp_workflow ON renewal_phases(workflow_id);
CREATE INDEX IF NOT EXISTS idx_rt_workflow ON renewal_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_rt_status ON renewal_tasks(status);
