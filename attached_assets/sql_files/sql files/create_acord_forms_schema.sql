-- Create ACORD forms master table
CREATE TABLE IF NOT EXISTS acord_forms_master (
  id SERIAL PRIMARY KEY,
  form_id VARCHAR(10) NOT NULL,
  form_name TEXT NOT NULL,
  state VARCHAR(2),
  edition_date VARCHAR(20),
  category VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ACORD forms instances table (for generated/completed forms)
CREATE TABLE IF NOT EXISTS acord_forms_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id VARCHAR(10) NOT NULL,
  form_name TEXT NOT NULL,
  state VARCHAR(2),
  edition_date VARCHAR(20),
  policy_number VARCHAR(100),
  client_id UUID,
  agent_id UUID,
  status VARCHAR(50) DEFAULT 'draft', -- draft, completed, delivered, archived
  form_data JSONB,
  file_url TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_delivered TIMESTAMP WITH TIME ZONE,
  added_by VARCHAR(255),
  delivered_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_acord_forms_master_form_id ON acord_forms_master(form_id);
CREATE INDEX IF NOT EXISTS idx_acord_forms_master_category ON acord_forms_master(category);
CREATE INDEX IF NOT EXISTS idx_acord_forms_instances_form_id ON acord_forms_instances(form_id);
CREATE INDEX IF NOT EXISTS idx_acord_forms_instances_client_id ON acord_forms_instances(client_id);
CREATE INDEX IF NOT EXISTS idx_acord_forms_instances_status ON acord_forms_instances(status);
CREATE INDEX IF NOT EXISTS idx_acord_forms_instances_policy_number ON acord_forms_instances(policy_number);

-- Insert ACORD forms master data
INSERT INTO acord_forms_master (form_id, form_name, state, edition_date, category) VALUES
('1', 'PROPERTY LOSS NOTICE', NULL, NULL, 'Claims'),
('1', 'CALIFORNIA PROPERTY LOSS NOTICE', 'CA', NULL, 'Claims'),
('2', 'AUTOMOBILE LOSS NOTICE', NULL, NULL, 'Claims'),
('2', 'CALIFORNIA AUTOMOBILE LOSS NOTICE', 'CA', NULL, 'Claims'),
('3', 'GENERAL LIABILITY NOTICE OF OCCURRENCE / CLAIM', NULL, NULL, 'Claims'),
('3', 'CALIFORNIA LIABILITY NOTICE OF OCCURRENCE / CLAIM', 'CA', NULL, 'Claims'),
('4', 'WORKERS'' COMPENSATION - FIRST REPORT OF INJURY OR ILLNESS', NULL, NULL, 'Claims'),
('5', 'AIRCRAFT LOSS NOTICE', NULL, NULL, 'Claims'),
('20', 'CERTIFICATE OF AVIATION LIABILITY INSURANCE', NULL, NULL, 'Certificates'),
('21', 'CERTIFICATE OF AIRCRAFT INSURANCE', NULL, NULL, 'Certificates'),
('22', 'INTERMODAL INTERCHANGE CERTIFICATE OF INSURANCE', NULL, NULL, 'Certificates'),
('23', 'VEHICLE OR EQUIPMENT CERTIFICATE OF INSURANCE', NULL, NULL, 'Certificates'),
('24', 'CERTIFICATE OF PROPERTY INSURANCE', NULL, NULL, 'Certificates'),
('25', 'CERTIFICATE OF LIABILITY INSURANCE', NULL, NULL, 'Certificates'),
('26', 'POLICY CERTIFICATION LOG', NULL, NULL, 'Certificates'),
('27', 'EVIDENCE OF PROPERTY INSURANCE', NULL, NULL, 'Certificates'),
('28', 'EVIDENCE OF COMMERCIAL PROPERTY INSURANCE', NULL, NULL, 'Certificates'),
('29', 'EVIDENCE OF FLOOD INSURANCE', NULL, NULL, 'Certificates'),
('30', 'CERTIFICATE OF GARAGE INSURANCE', NULL, NULL, 'Certificates'),
('31', 'CERTIFICATE OF MARINE / ENERGY INSURANCE', NULL, NULL, 'Certificates'),
('35', 'CANCELLATION REQUEST / POLICY RELEASE', NULL, NULL, 'Policy Changes'),
('36', 'AGENT/BROKER OF RECORD CHANGE', NULL, NULL, 'Policy Changes'),
('37', 'STATEMENT OF NO LOSS', NULL, NULL, 'Policy Changes'),
('50', 'INSURANCE IDENTIFICATION CARD', NULL, NULL, 'Identification'),
('50', 'CALIFORNIA INSURANCE IDENTIFICATION CARD', 'CA', NULL, 'Identification'),
('51', 'CALIFORNIA EVIDENCE OF LIABILITY INSURANCE', 'CA', NULL, 'Identification'),
('52', 'CALIFORNIA EVIDENCE OF LIABILITY INSURANCE', 'CA', NULL, 'Identification'),
('75', 'INSURANCE BINDER', NULL, NULL, 'Binders'),
('76', 'BINDER LOG', NULL, NULL, 'Binders'),
('80', 'HOMEOWNER APPLICATION', NULL, NULL, 'Personal Lines Applications'),
('81', 'PERSONAL INLAND MARINE APPLICATION', NULL, NULL, 'Personal Lines Applications'),
('81', 'CALIFORNIA PERSONAL INLAND MARINE APPLICATION', 'CA', NULL, 'Personal Lines Applications'),
('82', 'WATERCRAFT APPLICATION', NULL, NULL, 'Personal Lines Applications'),
('82', 'CALIFORNIA WATERCRAFT APPLICATION', 'CA', NULL, 'Personal Lines Applications'),
('83', 'PERSONAL UMBRELLA APPLICATION', NULL, NULL, 'Personal Lines Applications'),
('83', 'CALIFORNIA PERSONAL UMBRELLA APPLICATION', 'CA', NULL, 'Personal Lines Applications'),
('84', 'DWELLING FIRE APPLICATION', NULL, NULL, 'Personal Lines Applications'),
('84', 'CALIFORNIA DWELLING FIRE APPLICATION', 'CA', NULL, 'Personal Lines Applications'),
('85', 'MOBILE HOME APPLICATION', NULL, NULL, 'Personal Lines Applications'),
('85', 'CALIFORNIA MOBILE HOME APPLICATION', 'CA', NULL, 'Personal Lines Applications'),
('88', 'PERSONAL INSURANCE APPLICATION', NULL, NULL, 'Personal Lines Applications'),
('88', 'CALIFORNIA PERSONAL INSURANCE APPLICATION', 'CA', NULL, 'Personal Lines Applications'),
('90', 'CALIFORNIA PERSONAL AUTO APPLICATION', 'CA', NULL, 'Personal Lines Applications'),
('125', 'COMMERCIAL INSURANCE APPLICATION', NULL, NULL, 'Commercial Lines Applications'),
('125', 'CALIFORNIA COMMERCIAL INSURANCE APPLICATION', 'CA', NULL, 'Commercial Lines Applications'),
('126', 'COMMERCIAL GENERAL LIABILITY SECTION', NULL, NULL, 'Commercial Lines Applications'),
('127', 'BUSINESS AUTO SECTION', NULL, NULL, 'Commercial Lines Applications'),
('128', 'GARAGE AND DEALERS SECTION', NULL, NULL, 'Commercial Lines Applications'),
('130', 'WORKERS COMPENSATION APPLICATION', NULL, NULL, 'Commercial Lines Applications'),
('130', 'CALIFORNIA WORKERS COMPENSATION APPLICATION', 'CA', NULL, 'Commercial Lines Applications'),
('140', 'PROPERTY SECTION', NULL, NULL, 'Commercial Lines Applications'),
('160', 'BUSINESS OWNERS SECTION', NULL, NULL, 'Commercial Lines Applications'),
('325', 'AVIATION INSURANCE APPLICATION', NULL, NULL, 'Aviation'),
('401', 'AGRICULTURE APPLICATION', NULL, NULL, 'Agriculture'),
('501', 'SURETY REPORT OF EXECUTION', NULL, NULL, 'Surety'),
('502', 'CONTRACT BOND REQUEST FORM', NULL, NULL, 'Surety'),
('503', 'COMMERCIAL OR MISCELLANEOUS BOND REQUEST FORM', NULL, NULL, 'Surety')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE acord_forms_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE acord_forms_instances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on acord_forms_master" ON acord_forms_master FOR ALL USING (true);
CREATE POLICY "Allow all operations on acord_forms_instances" ON acord_forms_instances FOR ALL USING (true);
