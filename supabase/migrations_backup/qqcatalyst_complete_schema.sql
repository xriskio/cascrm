-- QQCatalyst Complete Integration Schema
-- This migration creates all tables, functions, and triggers needed for QQCatalyst integration

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TABLES
-- ===========================================

-- QQCatalyst Policies Table
CREATE TABLE IF NOT EXISTS qqcatalyst_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id INTEGER NOT NULL,
    customer_id INTEGER,
    policy_number TEXT,
    effective_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    status TEXT,
    total_premium DECIMAL(12,2),
    description TEXT,
    lob_id INTEGER,
    lob_name TEXT,
    carrier_id INTEGER,
    carrier_name TEXT,
    agent_id INTEGER,
    agent_name TEXT,
    csr_id INTEGER,
    csr_name TEXT,
    mga_id INTEGER,
    mga_name TEXT,
    customer_name TEXT,
    business_type TEXT,
    is_pending BOOLEAN,
    is_deleted BOOLEAN,
    non_renewal BOOLEAN,
    reinstated BOOLEAN,
    prior_policy_id INTEGER,
    prior_policy_number TEXT,
    created_on TIMESTAMP WITH TIME ZONE,
    last_modified TIMESTAMP WITH TIME ZONE,
    has_been_modified BOOLEAN,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(policy_id)
);

-- Create index on policy_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policies_policy_id ON qqcatalyst_policies(policy_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policies_customer_id ON qqcatalyst_policies(customer_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policies_expiration_date ON qqcatalyst_policies(expiration_date);

-- QQCatalyst Policy Details Table
CREATE TABLE IF NOT EXISTS qqcatalyst_policy_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id INTEGER NOT NULL,
    policy_detail_id INTEGER,
    policy_info_id INTEGER,
    policy_uuid UUID REFERENCES qqcatalyst_policies(id),
    binder_date TIMESTAMP WITH TIME ZONE,
    binder_number TEXT,
    premium_base DECIMAL(12,2),
    premium_down_payment DECIMAL(12,2),
    premium_sent TEXT,
    policy_class TEXT,
    policy_source_id INTEGER,
    policy_source TEXT,
    policy_source_details TEXT,
    parent_carrier_id INTEGER,
    parent_carrier TEXT,
    carrier_naic TEXT,
    subline_id INTEGER,
    subline_name TEXT,
    bill_type_id TEXT,
    period TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(policy_id, policy_detail_id)
);

-- Create index on policy_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_details_policy_id ON qqcatalyst_policy_details(policy_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_details_policy_uuid ON qqcatalyst_policy_details(policy_uuid);

-- QQCatalyst Policy Agency Fees Table
CREATE TABLE IF NOT EXISTS qqcatalyst_policy_agency_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id INTEGER NOT NULL,
    policy_uuid UUID REFERENCES qqcatalyst_policies(id),
    agency_fee_name TEXT,
    amount DECIMAL(12,2),
    amount_is_percent TEXT,
    calculated_amount DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on policy_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_agency_fees_policy_id ON qqcatalyst_policy_agency_fees(policy_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_agency_fees_policy_uuid ON qqcatalyst_policy_agency_fees(policy_uuid);

-- QQCatalyst Policy Producers Table
CREATE TABLE IF NOT EXISTS qqcatalyst_policy_producers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id INTEGER NOT NULL,
    policy_uuid UUID REFERENCES qqcatalyst_policies(id),
    producer_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(policy_id, producer_id)
);

-- Create index on policy_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_producers_policy_id ON qqcatalyst_policy_producers(policy_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_producers_policy_uuid ON qqcatalyst_policy_producers(policy_uuid);

-- QQCatalyst Commercial Auto Drivers Table
CREATE TABLE IF NOT EXISTS qqcatalyst_policy_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id INTEGER,
    driver_number INTEGER,
    policy_details_id INTEGER,
    policy_id INTEGER,
    policy_uuid UUID REFERENCES qqcatalyst_policies(id),
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    date_of_birth TEXT,
    drivers_license_number TEXT,
    state_licensed TEXT,
    year_licensed INTEGER,
    years_experience INTEGER,
    ssn TEXT,
    marital_status_id INTEGER,
    date_hired TEXT,
    gender TEXT,
    city TEXT,
    state_code TEXT,
    zip_code TEXT,
    doc TEXT,
    vehicle_id INTEGER,
    percent_use DECIMAL(5,2),
    carrier_driver_number INTEGER,
    agency_driver_code TEXT,
    excluded BOOLEAN,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(driver_id, policy_details_id)
);

-- Create index on policy_details_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_drivers_policy_details_id ON qqcatalyst_policy_drivers(policy_details_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_drivers_policy_id ON qqcatalyst_policy_drivers(policy_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_drivers_policy_uuid ON qqcatalyst_policy_drivers(policy_uuid);

-- QQCatalyst Sync Log Table
CREATE TABLE IF NOT EXISTS qqcatalyst_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    items_processed INTEGER DEFAULT 0,
    items_created INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on sync_type and status for faster lookups
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_sync_logs_sync_type ON qqcatalyst_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_sync_logs_status ON qqcatalyst_sync_logs(status);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to upsert a policy from QQCatalyst
CREATE OR REPLACE FUNCTION upsert_qqcatalyst_policy(
    p_policy_id INTEGER,
    p_customer_id INTEGER,
    p_policy_number TEXT,
    p_effective_date TIMESTAMP WITH TIME ZONE,
    p_expiration_date TIMESTAMP WITH TIME ZONE,
    p_status TEXT,
    p_total_premium DECIMAL,
    p_description TEXT,
    p_lob_id INTEGER,
    p_lob_name TEXT,
    p_carrier_id INTEGER,
    p_carrier_name TEXT,
    p_agent_id INTEGER,
    p_agent_name TEXT,
    p_csr_id INTEGER,
    p_csr_name TEXT,
    p_mga_id INTEGER,
    p_mga_name TEXT,
    p_customer_name TEXT,
    p_business_type TEXT,
    p_is_pending BOOLEAN,
    p_is_deleted BOOLEAN,
    p_non_renewal BOOLEAN,
    p_reinstated BOOLEAN,
    p_prior_policy_id INTEGER,
    p_prior_policy_number TEXT,
    p_created_on TIMESTAMP WITH TIME ZONE,
    p_last_modified TIMESTAMP WITH TIME ZONE,
    p_has_been_modified BOOLEAN,
    p_raw_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_policy_uuid UUID;
BEGIN
    -- Insert or update the policy
    INSERT INTO qqcatalyst_policies (
        policy_id, customer_id, policy_number, effective_date, expiration_date,
        status, total_premium, description, lob_id, lob_name,
        carrier_id, carrier_name, agent_id, agent_name, csr_id,
        csr_name, mga_id, mga_name, customer_name, business_type,
        is_pending, is_deleted, non_renewal, reinstated, prior_policy_id,
        prior_policy_number, created_on, last_modified, has_been_modified, raw_data
    )
    VALUES (
        p_policy_id, p_customer_id, p_policy_number, p_effective_date, p_expiration_date,
        p_status, p_total_premium, p_description, p_lob_id, p_lob_name,
        p_carrier_id, p_carrier_name, p_agent_id, p_agent_name, p_csr_id,
        p_csr_name, p_mga_id, p_mga_name, p_customer_name, p_business_type,
        p_is_pending, p_is_deleted, p_non_renewal, p_reinstated, p_prior_policy_id,
        p_prior_policy_number, p_created_on, p_last_modified, p_has_been_modified, p_raw_data
    )
    ON CONFLICT (policy_id)
    DO UPDATE SET
        customer_id = p_customer_id,
        policy_number = p_policy_number,
        effective_date = p_effective_date,
        expiration_date = p_expiration_date,
        status = p_status,
        total_premium = p_total_premium,
        description = p_description,
        lob_id = p_lob_id,
        lob_name = p_lob_name,
        carrier_id = p_carrier_id,
        carrier_name = p_carrier_name,
        agent_id = p_agent_id,
        agent_name = p_agent_name,
        csr_id = p_csr_id,
        csr_name = p_csr_name,
        mga_id = p_mga_id,
        mga_name = p_mga_name,
        customer_name = p_customer_name,
        business_type = p_business_type,
        is_pending = p_is_pending,
        is_deleted = p_is_deleted,
        non_renewal = p_non_renewal,
        reinstated = p_reinstated,
        prior_policy_id = p_prior_policy_id,
        prior_policy_number = p_prior_policy_number,
        created_on = p_created_on,
        last_modified = p_last_modified,
        has_been_modified = p_has_been_modified,
        raw_data = p_raw_data,
        updated_at = now()
    RETURNING id INTO v_policy_uuid;
    
    RETURN v_policy_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to upsert a policy detail from QQCatalyst
CREATE OR REPLACE FUNCTION upsert_qqcatalyst_policy_detail(
    p_policy_id INTEGER,
    p_policy_detail_id INTEGER,
    p_policy_info_id INTEGER,
    p_policy_uuid UUID,
    p_binder_date TIMESTAMP WITH TIME ZONE,
    p_binder_number TEXT,
    p_premium_base DECIMAL,
    p_premium_down_payment DECIMAL,
    p_premium_sent TEXT,
    p_policy_class TEXT,
    p_policy_source_id INTEGER,
    p_policy_source TEXT,
    p_policy_source_details TEXT,
    p_parent_carrier_id INTEGER,
    p_parent_carrier TEXT,
    p_carrier_naic TEXT,
    p_subline_id INTEGER,
    p_subline_name TEXT,
    p_bill_type_id TEXT,
    p_period TEXT,
    p_raw_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_detail_uuid UUID;
BEGIN
    -- Insert or update the policy detail
    INSERT INTO qqcatalyst_policy_details (
        policy_id, policy_detail_id, policy_info_id, policy_uuid,
        binder_date, binder_number, premium_base, premium_down_payment,
        premium_sent, policy_class, policy_source_id, policy_source,
        policy_source_details, parent_carrier_id, parent_carrier,
        carrier_naic, subline_id, subline_name, bill_type_id, period, raw_data
    )
    VALUES (
        p_policy_id, p_policy_detail_id, p_policy_info_id, p_policy_uuid,
        p_binder_date, p_binder_number, p_premium_base, p_premium_down_payment,
        p_premium_sent, p_policy_class, p_policy_source_id, p_policy_source,
        p_policy_source_details, p_parent_carrier_id, p_parent_carrier,
        p_carrier_naic, p_subline_id, p_subline_name, p_bill_type_id, p_period, p_raw_data
    )
    ON CONFLICT (policy_id, policy_detail_id)
    DO UPDATE SET
        policy_info_id = p_policy_info_id,
        policy_uuid = p_policy_uuid,
        binder_date = p_binder_date,
        binder_number = p_binder_number,
        premium_base = p_premium_base,
        premium_down_payment = p_premium_down_payment,
        premium_sent = p_premium_sent,
        policy_class = p_policy_class,
        policy_source_id = p_policy_source_id,
        policy_source = p_policy_source,
        policy_source_details = p_policy_source_details,
        parent_carrier_id = p_parent_carrier_id,
        parent_carrier = p_parent_carrier,
        carrier_naic = p_carrier_naic,
        subline_id = p_subline_id,
        subline_name = p_subline_name,
        bill_type_id = p_bill_type_id,
        period = p_period,
        raw_data = p_raw_data,
        updated_at = now()
    RETURNING id INTO v_detail_uuid;
    
    RETURN v_detail_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to upsert a commercial auto driver from QQCatalyst
CREATE OR REPLACE FUNCTION upsert_qqcatalyst_policy_driver(
    p_driver_id INTEGER,
    p_driver_number INTEGER,
    p_policy_details_id INTEGER,
    p_policy_id INTEGER,
    p_policy_uuid UUID,
    p_first_name TEXT,
    p_middle_name TEXT,
    p_last_name TEXT,
    p_date_of_birth TEXT,
    p_drivers_license_number TEXT,
    p_state_licensed TEXT,
    p_year_licensed INTEGER,
    p_years_experience INTEGER,
    p_ssn TEXT,
    p_marital_status_id INTEGER,
    p_date_hired TEXT,
    p_gender TEXT,
    p_city TEXT,
    p_state_code TEXT,
    p_zip_code TEXT,
    p_doc TEXT,
    p_vehicle_id INTEGER,
    p_percent_use DECIMAL,
    p_carrier_driver_number INTEGER,
    p_agency_driver_code TEXT,
    p_excluded BOOLEAN,
    p_raw_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_driver_uuid UUID;
BEGIN
    -- Insert or update the driver
    INSERT INTO qqcatalyst_policy_drivers (
        driver_id, driver_number, policy_details_id, policy_id, policy_uuid,
        first_name, middle_name, last_name, date_of_birth, drivers_license_number,
        state_licensed, year_licensed, years_experience, ssn, marital_status_id,
        date_hired, gender, city, state_code, zip_code,
        doc, vehicle_id, percent_use, carrier_driver_number, agency_driver_code,
        excluded, raw_data
    )
    VALUES (
        p_driver_id, p_driver_number, p_policy_details_id, p_policy_id, p_policy_uuid,
        p_first_name, p_middle_name, p_last_name, p_date_of_birth, p_drivers_license_number,
        p_state_licensed, p_year_licensed, p_years_experience, p_ssn, p_marital_status_id,
        p_date_hired, p_gender, p_city, p_state_code, p_zip_code,
        p_doc, p_vehicle_id, p_percent_use, p_carrier_driver_number, p_agency_driver_code,
        p_excluded, p_raw_data
    )
    ON CONFLICT (driver_id, policy_details_id)
    DO UPDATE SET
        driver_number = p_driver_number,
        policy_id = p_policy_id,
        policy_uuid = p_policy_uuid,
        first_name = p_first_name,
        middle_name = p_middle_name,
        last_name = p_last_name,
        date_of_birth = p_date_of_birth,
        drivers_license_number = p_drivers_license_number,
        state_licensed = p_state_licensed,
        year_licensed = p_year_licensed,
        years_experience = p_years_experience,
        ssn = p_ssn,
        marital_status_id = p_marital_status_id,
        date_hired = p_date_hired,
        gender = p_gender,
        city = p_city,
        state_code = p_state_code,
        zip_code = p_zip_code,
        doc = p_doc,
        vehicle_id = p_vehicle_id,
        percent_use = p_percent_use,
        carrier_driver_number = p_carrier_driver_number,
        agency_driver_code = p_agency_driver_code,
        excluded = p_excluded,
        raw_data = p_raw_data,
        updated_at = now()
    RETURNING id INTO v_driver_uuid;
    
    RETURN v_driver_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to add a policy agency fee
CREATE OR REPLACE FUNCTION add_qqcatalyst_policy_agency_fee(
    p_policy_id INTEGER,
    p_policy_uuid UUID,
    p_agency_fee_name TEXT,
    p_amount DECIMAL,
    p_amount_is_percent TEXT,
    p_calculated_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
    v_fee_uuid UUID;
BEGIN
    -- Insert the agency fee
    INSERT INTO qqcatalyst_policy_agency_fees (
        policy_id, policy_uuid, agency_fee_name, amount, amount_is_percent, calculated_amount
    )
    VALUES (
        p_policy_id, p_policy_uuid, p_agency_fee_name, p_amount, p_amount_is_percent, p_calculated_amount
    )
    RETURNING id INTO v_fee_uuid;
    
    RETURN v_fee_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to add a policy producer
CREATE OR REPLACE FUNCTION add_qqcatalyst_policy_producer(
    p_policy_id INTEGER,
    p_policy_uuid UUID,
    p_producer_id INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_producer_uuid UUID;
BEGIN
    -- Insert the producer if it doesn't exist
    INSERT INTO qqcatalyst_policy_producers (
        policy_id, policy_uuid, producer_id
    )
    VALUES (
        p_policy_id, p_policy_uuid, p_producer_id
    )
    ON CONFLICT (policy_id, producer_id)
    DO NOTHING
    RETURNING id INTO v_producer_uuid;
    
    -- If the insert didn't return an ID (due to conflict), get the existing ID
    IF v_producer_uuid IS NULL THEN
        SELECT id INTO v_producer_uuid
        FROM qqcatalyst_policy_producers
        WHERE policy_id = p_policy_id AND producer_id = p_producer_id;
    END IF;
    
    RETURN v_producer_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get policies expiring soon
CREATE OR REPLACE FUNCTION get_expiring_qqcatalyst_policies(
    p_days_from_now INTEGER DEFAULT 90
)
RETURNS TABLE (
    id UUID,
    policy_id INTEGER,
    policy_number TEXT,
    customer_name TEXT,
    carrier_name TEXT,
    agent_name TEXT,
    effective_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    days_until_expiration INTEGER,
    total_premium DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.policy_id,
        p.policy_number,
        p.customer_name,
        p.carrier_name,
        p.agent_name,
        p.effective_date,
        p.expiration_date,
        EXTRACT(DAY FROM (p.expiration_date - CURRENT_TIMESTAMP))::INTEGER AS days_until_expiration,
        p.total_premium
    FROM 
        qqcatalyst_policies p
    WHERE 
        p.expiration_date IS NOT NULL
        AND p.expiration_date > CURRENT_TIMESTAMP
        AND p.expiration_date <= (CURRENT_TIMESTAMP + (p_days_from_now || ' days')::INTERVAL)
        AND p.is_deleted = FALSE
    ORDER BY 
        p.expiration_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get policy sync statistics
CREATE OR REPLACE FUNCTION get_qqcatalyst_sync_stats()
RETURNS TABLE (
    sync_type TEXT,
    total_syncs BIGINT,
    successful_syncs BIGINT,
    failed_syncs BIGINT,
    items_processed BIGINT,
    items_created BIGINT,
    items_updated BIGINT,
    items_failed BIGINT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.sync_type,
        COUNT(l.id) AS total_syncs,
        COUNT(l.id) FILTER (WHERE l.status = 'completed') AS successful_syncs,
        COUNT(l.id) FILTER (WHERE l.status = 'failed') AS failed_syncs,
        SUM(l.items_processed) AS items_processed,
        SUM(l.items_created) AS items_created,
        SUM(l.items_updated) AS items_updated,
        SUM(l.items_failed) AS items_failed,
        MAX(l.completed_at) AS last_sync_at,
        (
            SELECT ls.status 
            FROM qqcatalyst_sync_logs ls 
            WHERE ls.sync_type = l.sync_type 
            ORDER BY ls.completed_at DESC NULLS LAST 
            LIMIT 1
        ) AS last_sync_status
    FROM 
        qqcatalyst_sync_logs l
    GROUP BY 
        l.sync_type;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Create update timestamp triggers for all tables
CREATE TRIGGER update_qqcatalyst_policies_timestamp
BEFORE UPDATE ON qqcatalyst_policies
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_qqcatalyst_policy_details_timestamp
BEFORE UPDATE ON qqcatalyst_policy_details
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_qqcatalyst_policy_agency_fees_timestamp
BEFORE UPDATE ON qqcatalyst_policy_agency_fees
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_qqcatalyst_policy_producers_timestamp
BEFORE UPDATE ON qqcatalyst_policy_producers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_qqcatalyst_policy_drivers_timestamp
BEFORE UPDATE ON qqcatalyst_policy_drivers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_qqcatalyst_sync_logs_timestamp
BEFORE UPDATE ON qqcatalyst_sync_logs
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on all tables

-- Create policies for authenticated users






-- ===========================================
-- SAMPLE DATA (OPTIONAL)
-- ===========================================

-- Insert a sample sync log
INSERT INTO qqcatalyst_sync_logs (
    sync_type, start_date, end_date, items_processed, 
    items_created, items_updated, items_failed, status
)
VALUES (
    'initial_setup', '2000-01-01', now()::text, 0, 
    0, 0, 0, 'completed'
);

-- Log completion message
DO $$
BEGIN
    RAISE NOTICE 'QQCatalyst schema setup complete!';
END $$;
