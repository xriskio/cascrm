-- Create table for caching QQCatalyst customer detail summary
CREATE TABLE IF NOT EXISTS qqcatalyst_customer_details (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER NOT NULL UNIQUE,
    is_person INTEGER,
    first_name VARCHAR(255),
    middle_name VARCHAR(255),
    last_name VARCHAR(255),
    dob TIMESTAMP,
    marital_status_id INTEGER,
    marital_status VARCHAR(100),
    gender VARCHAR(50),
    business_name VARCHAR(255),
    location_id INTEGER,
    customer_source_id INTEGER,
    entity_status VARCHAR(100),
    source_detail TEXT,
    customer_status VARCHAR(100),
    prospect BOOLEAN DEFAULT FALSE,
    customer_no VARCHAR(100),
    customer_since TIMESTAMP,
    agent_id INTEGER,
    agent_name VARCHAR(255),
    csr_id INTEGER,
    csr_name VARCHAR(255),
    customer_type VARCHAR(100),
    preferred_language_code INTEGER,
    display_name VARCHAR(255),
    salutation VARCHAR(100),
    ssn_last_four VARCHAR(4),
    driver_license_no VARCHAR(255),
    fein VARCHAR(255),
    last_synced TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_details_entity_id ON qqcatalyst_customer_details(entity_id);
CREATE INDEX IF NOT EXISTS idx_customer_details_agent_id ON qqcatalyst_customer_details(agent_id);
CREATE INDEX IF NOT EXISTS idx_customer_details_csr_id ON qqcatalyst_customer_details(csr_id);
CREATE INDEX IF NOT EXISTS idx_customer_details_last_synced ON qqcatalyst_customer_details(last_synced);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_customer_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customer_details_updated_at
    BEFORE UPDATE ON qqcatalyst_customer_details
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_details_updated_at();

-- Add RLS policies

-- Allow authenticated users to read and write


