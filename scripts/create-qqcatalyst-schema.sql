-- Create contacts table for QQCatalyst contacts
CREATE TABLE IF NOT EXISTS contacts (
  id                 bigint   PRIMARY KEY,
  first_name         text,
  last_name          text,
  email              text,
  phone              text,
  json_raw           jsonb,
  updated_at         timestamptz DEFAULT now()
);

-- Create policies table for QQCatalyst policies
CREATE TABLE IF NOT EXISTS policies (
  id                 bigint   PRIMARY KEY,
  contact_id         bigint   REFERENCES contacts(id),
  policy_number      text,
  line_of_business   text,
  json_raw           jsonb,
  updated_at         timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_policies_contact_id ON policies(contact_id);
CREATE INDEX IF NOT EXISTS idx_policies_policy_number ON policies(policy_number);
