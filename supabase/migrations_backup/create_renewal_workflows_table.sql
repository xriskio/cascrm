-- Create renewal_workflows table
CREATE TABLE IF NOT EXISTS public.renewal_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  renewal_id UUID NOT NULL REFERENCES public.renewals(id) ON DELETE CASCADE,
  stages JSONB NOT NULL DEFAULT '[]',
  current_stage TEXT DEFAULT 'initiation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_tracking table
CREATE TABLE IF NOT EXISTS public.email_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  renewal_id UUID REFERENCES public.renewals(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  recipient_email TEXT,
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_renewal_workflows_renewal_id ON public.renewal_workflows(renewal_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_renewal_id ON public.email_tracking(renewal_id);

-- Enable RLS

-- Create RLS policies

