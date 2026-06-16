-- Create the insurance_applications table
CREATE TABLE IF NOT EXISTS insurance_applications (
    id bigint primary key generated always as identity,
    contact_phone TEXT,
    contact_email TEXT,
    contact_city TEXT,
    contact_state TEXT,
    contact_zip TEXT,
    ip TEXT,
    application_date TIMESTAMPTZ DEFAULT NOW(),
    spam_score INTEGER DEFAULT 0,
    company_name TEXT,
    company_email TEXT,
    company_phone TEXT,
    company_fax TEXT,
    company_address TEXT,
    company_city TEXT,
    company_state TEXT,
    company_zip TEXT,
    years_in_business INTEGER,
    tax_id TEXT,
    number_of_drivers INTEGER DEFAULT 1,
    driver_first_name_1 TEXT,
    driver_last_name_1 TEXT,
    driver_ss_number_1 TEXT,
    driver_date_of_birth_1 TIMESTAMPTZ,
    driver_gender_1 TEXT,
    driver_marital_status_1 TEXT,
    driver_license_status_1 TEXT,
    driver_license_state_1 TEXT,
    driver_license_number_1 TEXT,
    driver_recent_suspension_1 BOOLEAN DEFAULT FALSE,
    driver_occupation_industry_1 TEXT,
    driver_occupation_title_1 TEXT,
    driver_age_licensed_1 INTEGER,
    driver_recent_accidents_1 INTEGER DEFAULT 0,
    driver_recent_violations_1 INTEGER DEFAULT 0,
    driver_sr22_filing_1 BOOLEAN DEFAULT FALSE,
    driver_good_student_1 BOOLEAN DEFAULT FALSE,
    driver_defensive_driver_1 BOOLEAN DEFAULT FALSE,
    driver_drivers_ed_1 BOOLEAN DEFAULT FALSE,
    number_of_vehicles INTEGER DEFAULT 1,
    vehicle_year_1 INTEGER,
    vehicle_make_1 TEXT,
    vehicle_model_1 TEXT,
    vehicle_vin_1 TEXT,
    vehicle_primary_driver_1 TEXT,
    vehicle_current_odometer_1 INTEGER,
    vehicle_yearly_mileage_1 INTEGER,
    vehicle_ownership_1 TEXT,
    vehicle_anti_theft_features_1 TEXT,
    vehicle_passive_restrains_1 BOOLEAN DEFAULT FALSE,
    vehicle_anti_lock_brakes_1 BOOLEAN DEFAULT FALSE,
    vehicle_daytime_running_lights_1 BOOLEAN DEFAULT FALSE,
    vehicle_prior_damage_1 BOOLEAN DEFAULT FALSE,
    vehicle_used_for_delivery_1 BOOLEAN DEFAULT FALSE,
    vehicle_comprehensive_deductible_1 INTEGER,
    vehicle_collision_deductible_1 INTEGER,
    vehicle_special_equipment_1 TEXT,
    bodily_injury NUMERIC,
    property_damage NUMERIC,
    uninsured NUMERIC,
    underinsured NUMERIC,
    medical_payments NUMERIC,
    currently_insured BOOLEAN DEFAULT FALSE,
    prior_carrier TEXT,
    current_policy_premium NUMERIC,
    current_policy_expiration TIMESTAMPTZ,
    years_with_prior INTEGER,
    years_with_continuous INTEGER,
    agent TEXT,
    referral TEXT,
    referral_specify TEXT,
    preferred_contact TEXT DEFAULT 'email',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on the insurance_applications table

-- Create RLS policies for insurance_applications




-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insurance_applications_contact_email ON insurance_applications(contact_email);
CREATE INDEX IF NOT EXISTS idx_insurance_applications_company_name ON insurance_applications(company_name);
CREATE INDEX IF NOT EXISTS idx_insurance_applications_application_date ON insurance_applications(application_date);
CREATE INDEX IF NOT EXISTS idx_insurance_applications_agent ON insurance_applications(agent);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_insurance_applications_updated_at 
    BEFORE UPDATE ON insurance_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
