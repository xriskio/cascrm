-- ============================================================================
-- RENEWAL WORKFLOW SETUP
-- Adds the 120-day commercial renewal workflow tracking fields + a client
-- notification log. Safe to run multiple times.
-- ============================================================================

-- Per-renewal workflow tracking
ALTER TABLE public.renewals
  ADD COLUMN IF NOT EXISTS workflow_steps JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS owner TEXT,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS last_client_notified_at TIMESTAMP WITH TIME ZONE;

-- Log of client-facing renewal progress notifications (sent via Resend)
CREATE TABLE IF NOT EXISTS public.renewal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renewal_id UUID,
  to_email TEXT NOT NULL,
  subject TEXT,
  phase TEXT,
  progress INTEGER,
  status TEXT NOT NULL DEFAULT 'sent',
  resend_id TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_renewal_notifications_renewal_id
  ON public.renewal_notifications(renewal_id);

ALTER TABLE public.renewal_notifications DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.renewal_notifications TO anon, authenticated, service_role;
