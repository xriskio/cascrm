-- =====================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
-- Copy all this SQL and click "Run"
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. TASKS TABLE (with assignee_id column)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_number VARCHAR(255) UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Not Started',
    priority TEXT NOT NULL DEFAULT 'Medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    creator_id UUID REFERENCES auth.users(id),
    assignee_id UUID REFERENCES auth.users(id),
    supervisor_id UUID REFERENCES auth.users(id),
    client_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);

-- =====================================================
-- 3. CLIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 4. RENEWALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.renewals (
  id SERIAL PRIMARY KEY,
  renewal_number VARCHAR(255) UNIQUE,
  renewal_id TEXT UNIQUE NOT NULL,
  insured_name TEXT NOT NULL,
  retail_agency_name TEXT,
  producer TEXT,
  policy_type TEXT,
  policy_number TEXT,
  effective_date DATE,
  expiration_date DATE NOT NULL,
  insurance_carrier TEXT NOT NULL,
  expiring_premium DECIMAL(10,2),
  expiring_commission DECIMAL(10,2),
  wholesaler_mga TEXT,
  renewal_premium DECIMAL(10,2),
  renewal_commission DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  last_contact_date DATE,
  next_follow_up_date DATE,
  date_renewal_sent DATE,
  date_quote_received DATE,
  date_sent_to_insured DATE,
  remarketing_requested BOOLEAN DEFAULT FALSE,
  reason_lost TEXT,
  notes TEXT,
  task TEXT,
  documents TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id SERIAL PRIMARY KEY,
  submission_number VARCHAR(255) NOT NULL UNIQUE,
  insurance_type VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  form_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- =====================================================
-- 6. CARRIER CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.carrier_contacts (
  id SERIAL PRIMARY KEY,
  insurance_carrier VARCHAR(255) NOT NULL,
  producer_code VARCHAR(100),
  website_login VARCHAR(100),
  website_link VARCHAR(255),
  agency_user_id VARCHAR(100),
  password VARCHAR(255),
  customer_service_phone VARCHAR(20),
  billing_phone VARCHAR(20),
  agency_contact VARCHAR(100),
  agency_contact_number VARCHAR(20),
  agency_contact_email VARCHAR(255),
  underwriter_contact VARCHAR(100),
  underwriter_number VARCHAR(20),
  underwriter_email VARCHAR(255),
  loss_run_request_link VARCHAR(255),
  claims_email VARCHAR(255),
  claims_phone_number VARCHAR(20),
  specialties TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type TEXT NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);

-- =====================================================
-- 8. SERVICE REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_requests (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100) NOT NULL,
  effective_date DATE NOT NULL,
  description TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL,
  specific_data JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id SERIAL PRIMARY KEY,
  lead_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_entered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  company_name TEXT,
  source TEXT,
  product_interest TEXT,
  notes TEXT,
  assigned_to TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'new'
);

-- =====================================================
-- 10. LEAD COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lead_comments (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lead_id INTEGER REFERENCES public.leads(id) ON DELETE CASCADE,
  author TEXT,
  comment TEXT NOT NULL
);

-- =====================================================
-- 11. INCOMING CALLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.incoming_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_number VARCHAR(255) UNIQUE,
  call_date DATE,
  call_time TIME,
  named_insured TEXT,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  reason TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  call_back_date DATE,
  call_back_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 12. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =====================================================
-- 13. QQCATALYST TOKENS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.qqcatalyst_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    token_name VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'bearer',
    expires_in INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    username VARCHAR(255),
    password VARCHAR(255),
    grant_type VARCHAR(50) DEFAULT 'password_credentials',
    scope TEXT,
    access_token_url VARCHAR(500) DEFAULT 'https://login.qqcatalyst.com/oauth/token',
    client_authentication VARCHAR(50) DEFAULT 'header',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 14. QQCATALYST POLICIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.qqcatalyst_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id INTEGER NOT NULL UNIQUE,
    customer_id INTEGER,
    policy_number TEXT,
    effective_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    status TEXT,
    total_premium DECIMAL(12,2),
    description TEXT,
    lob_name TEXT,
    carrier_name TEXT,
    agent_name TEXT,
    customer_name TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR NOW
-- You can enable RLS later for security
-- =====================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrier_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incoming_calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qqcatalyst_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qqcatalyst_policies DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ All 14 tables created successfully!';
    RAISE NOTICE 'Tables: users, tasks, clients, renewals, submissions, carrier_contacts, notifications, service_requests, leads, lead_comments, incoming_calls, audit_logs, qqcatalyst_tokens, qqcatalyst_policies';
END $$;
