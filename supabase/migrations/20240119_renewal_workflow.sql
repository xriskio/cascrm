-- Renewal Workflow tables
-- Run this in Supabase SQL editor or via supabase db push

CREATE TABLE IF NOT EXISTS renewal_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renewal_id UUID NOT NULL,
  policy_number VARCHAR(255),
  named_insured VARCHAR(500),
  policy_type VARCHAR(255),
  expiration_date TIMESTAMPTZ NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  agent_name VARCHAR(255),
  agent_email VARCHAR(255),
  current_phase VARCHAR(50) DEFAULT 'planning',
  strategy_notes TEXT,
  market_notes TEXT,
  binding_notes TEXT,
  expiring_premium NUMERIC(12,2),
  quoted_premium NUMERIC(12,2),
  bound_premium NUMERIC(12,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_renewal_workflows_renewal_id ON renewal_workflows(renewal_id);
CREATE INDEX IF NOT EXISTS idx_renewal_workflows_phase ON renewal_workflows(current_phase);
CREATE INDEX IF NOT EXISTS idx_renewal_workflows_expiration ON renewal_workflows(expiration_date);
CREATE INDEX IF NOT EXISTS idx_renewal_workflows_status ON renewal_workflows(status);

CREATE TABLE IF NOT EXISTS renewal_workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES renewal_workflows(id) ON DELETE CASCADE,
  phase VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_to VARCHAR(255),
  assigned_role VARCHAR(50),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_workflow_id ON renewal_workflow_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_phase ON renewal_workflow_tasks(phase);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_status ON renewal_workflow_tasks(status);

CREATE TABLE IF NOT EXISTS renewal_workflow_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES renewal_workflows(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(500),
  recipient_type VARCHAR(50),
  subject VARCHAR(500),
  body_preview TEXT,
  status VARCHAR(50) DEFAULT 'sent',
  resend_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workflow_notifications_workflow_id ON renewal_workflow_notifications(workflow_id);
