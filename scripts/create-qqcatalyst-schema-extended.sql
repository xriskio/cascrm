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

-- 1. RENEWALS (one row per policy renewal)
CREATE TABLE IF NOT EXISTS policy_renewals (
  policy_id    BIGINT      REFERENCES policies(id) ON DELETE CASCADE,
  renewal_date DATE,
  premium      NUMERIC,
  PRIMARY KEY (policy_id, renewal_date)
);

-- 2. POLICY LOCATIONS (for HomeownersLocations, CommercialLocations, etc)
CREATE TABLE IF NOT EXISTS policy_locations (
  id             BIGINT       PRIMARY KEY,
  policy_id      BIGINT       REFERENCES policies(id) ON DELETE CASCADE,
  address_line1  TEXT,
  city           TEXT,
  state          TEXT,
  postal_code    TEXT,
  location_type  TEXT,         -- e.g. 'Homeowners', 'Commercial'
  modified_at    TIMESTAMPTZ
);

-- 3. COMMERCIAL AUTO VEHICLES
CREATE TABLE IF NOT EXISTS commercial_vehicles (
  id               BIGINT      PRIMARY KEY,
  policy_detail_id BIGINT,
  policy_id        BIGINT      REFERENCES policies(id) ON DELETE CASCADE,
  year             INT,
  make             TEXT,
  model            TEXT,
  vin              TEXT,
  modified_at      TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_policies_contact_id ON policies(contact_id);
CREATE INDEX IF NOT EXISTS idx_policies_policy_number ON policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_policy_renewals_policy_id ON policy_renewals(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_renewals_renewal_date ON policy_renewals(renewal_date);
CREATE INDEX IF NOT EXISTS idx_policy_locations_policy_id ON policy_locations(policy_id);
CREATE INDEX IF NOT EXISTS idx_commercial_vehicles_policy_id ON commercial_vehicles(policy_id);
