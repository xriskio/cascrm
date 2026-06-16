-- Create table for caching QQCatalyst contact account information
CREATE TABLE IF NOT EXISTS qqcatalyst_contact_accounts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL UNIQUE,
    customer_no VARCHAR(50),
    agent_id INTEGER,
    agent_name VARCHAR(255),
    csr_id INTEGER,
    csr_name VARCHAR(255),
    customer_priority_id INTEGER,
    customer_priority VARCHAR(100),
    customer_since TIMESTAMP,
    user_id VARCHAR(100),
    customer_type VARCHAR(100),
    office_id INTEGER,
    cp_access BOOLEAN DEFAULT FALSE,
    customer_name VARCHAR(255),
    customer_source_id INTEGER,
    customer_source VARCHAR(255),
    source_detail TEXT,
    created_by_id INTEGER,
    created_by_name VARCHAR(255),
    customer_since_string VARCHAR(100),
    last_synced TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_accounts_customer_id ON qqcatalyst_contact_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_accounts_agent_id ON qqcatalyst_contact_accounts(agent_id);
CREATE INDEX IF NOT EXISTS idx_contact_accounts_csr_id ON qqcatalyst_contact_accounts(csr_id);
CREATE INDEX IF NOT EXISTS idx_contact_accounts_last_synced ON qqcatalyst_contact_accounts(last_synced);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_contact_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contact_accounts_updated_at
    BEFORE UPDATE ON qqcatalyst_contact_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_accounts_updated_at();

-- Add RLS policies

-- Allow authenticated users to read and write


