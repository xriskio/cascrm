-- Create comprehensive personal lines tables

-- Enhanced customers table for personal lines
ALTER TABLE customers ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ssn_last4 TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS marital_status_detail TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS years_at_residence INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS previous_address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS years_at_previous INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS employer_address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS years_with_employer INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS self_employed BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_description TEXT;

-- Co-applicants table
CREATE TABLE IF NOT EXISTS co_applicants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    ssn_last4 TEXT,
    marital_status TEXT,
    phone TEXT,
    email TEXT,
    employer_name TEXT,
    occupation TEXT,
    years_employed INTEGER,
    relationship TEXT DEFAULT 'spouse',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced policies table
CREATE TABLE IF NOT EXISTS personal_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    line_of_business TEXT NOT NULL, -- 'homeowners', 'auto', 'boat', 'motorcycle'
    subline TEXT,
    policy_number TEXT UNIQUE NOT NULL,
    policy_version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'quoted',
    business_type TEXT DEFAULT 'new_business',
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    writing_carrier TEXT NOT NULL,
    carrier_naic_code TEXT,
    mga_broker TEXT,
    parent_carrier TEXT,
    base_premium DECIMAL(12, 2),
    taxes DECIMAL(12, 2),
    fees DECIMAL(12, 2),
    total_premium DECIMAL(12, 2),
    billing_type TEXT DEFAULT 'direct_bill',
    payment_plan TEXT DEFAULT 'monthly',
    billing_account_number TEXT,
    financed BOOLEAN DEFAULT FALSE,
    finance_company TEXT,
    down_payment DECIMAL(12, 2),
    policy_sent TEXT DEFAULT 'email',
    binder_number TEXT,
    binder_effective_date TIMESTAMP,
    binder_expiration_date TIMESTAMP,
    binder_purpose TEXT,
    non_standard_conditions BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homeowners policy details
CREATE TABLE IF NOT EXISTS homeowners_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES personal_policies(id) ON DELETE CASCADE,
    dwelling_limit DECIMAL(12, 2),
    other_structures_limit DECIMAL(12, 2),
    personal_property_limit DECIMAL(12, 2),
    loss_of_use_limit DECIMAL(12, 2),
    personal_liability_limit DECIMAL(12, 2),
    medical_payments_limit DECIMAL(12, 2),
    standard_deductible DECIMAL(10, 2),
    wind_hail_deductible DECIMAL(10, 2),
    earthquake_deductible DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property locations
CREATE TABLE IF NOT EXISTS property_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES personal_policies(id) ON DELETE CASCADE,
    location_number INTEGER DEFAULT 1,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    year_built INTEGER,
    construction_type TEXT,
    siding_type TEXT,
    roof_type TEXT,
    roof_material TEXT,
    roof_condition TEXT,
    square_footage INTEGER,
    number_of_stories INTEGER,
    number_of_units INTEGER,
    garage_type TEXT,
    number_of_rooms INTEGER,
    number_of_bedrooms INTEGER,
    number_of_bathrooms INTEGER,
    replacement_cost DECIMAL(12, 2),
    market_value DECIMAL(12, 2),
    basement_type TEXT,
    basement_sqft INTEGER,
    fireplace_count INTEGER,
    swimming_pool BOOLEAN DEFAULT FALSE,
    pool_type TEXT,
    security_devices TEXT,
    distance_to_fire_hydrant DECIMAL(5, 2),
    distance_to_fire_station DECIMAL(5, 2),
    iso_class TEXT,
    distance_to_coast DECIMAL(10, 2),
    occupancy_type TEXT DEFAULT 'primary',
    protection_class TEXT,
    windstorm_protection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto policy details
CREATE TABLE IF NOT EXISTS auto_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES personal_policies(id) ON DELETE CASCADE,
    liability_bi_per_person DECIMAL(12, 2),
    liability_bi_per_accident DECIMAL(12, 2),
    liability_pd DECIMAL(12, 2),
    combined_single_limit DECIMAL(12, 2),
    um_bi_per_person DECIMAL(12, 2),
    um_bi_per_accident DECIMAL(12, 2),
    um_pd DECIMAL(12, 2),
    um_combined_limit DECIMAL(12, 2),
    medical_payments_limit DECIMAL(12, 2),
    pip_limit DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES personal_policies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    marital_status TEXT,
    relationship TEXT,
    license_number TEXT,
    license_state TEXT,
    license_type TEXT DEFAULT 'full',
    years_licensed INTEGER,
    years_continuous_insurance INTEGER,
    prior_carrier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES personal_policies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    vin TEXT NOT NULL,
    use_type TEXT DEFAULT 'pleasure',
    garaging_zip TEXT,
    ownership_status TEXT DEFAULT 'owned',
    anti_theft_devices TEXT,
    safety_features TEXT,
    annual_mileage INTEGER,
    comprehensive_deductible DECIMAL(10, 2),
    collision_deductible DECIMAL(10, 2),
    rental_reimbursement_daily DECIMAL(8, 2),
    rental_reimbursement_max DECIMAL(10, 2),
    towing_labor_limit DECIMAL(8, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boat policy details
CREATE TABLE IF NOT EXISTS boat_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES personal_policies(id) ON DELETE CASCADE,
    hull_limit DECIMAL(12, 2),
    liability_limit DECIMAL(12, 2),
    medical_payments_limit DECIMAL(12, 2),
    uninsured_watercraft_limit DECIMAL(12, 2),
    personal_effects_limit DECIMAL(12, 2),
    hull_deductible DECIMAL(10, 2),
    navigation_territory TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boats
CREATE TABLE IF NOT EXISTS boats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES personal_policies(id) ON DELETE CASCADE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    hull_id_number TEXT,
    length_feet INTEGER,
    horsepower INTEGER,
    boat_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Motorcycle policy details
CREATE TABLE IF NOT EXISTS motorcycle_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES personal_policies(id) ON DELETE CASCADE,
    liability_bi_per_person DECIMAL(12, 2),
    liability_bi_per_accident DECIMAL(12, 2),
    liability_pd DECIMAL(12, 2),
    combined_single_limit DECIMAL(12, 2),
    um_bi_per_person DECIMAL(12, 2),
    um_bi_per_accident DECIMAL(12, 2),
    um_pd DECIMAL(12, 2),
    medical_payments_limit DECIMAL(12, 2),
    comprehensive_deductible DECIMAL(10, 2),
    collision_deductible DECIMAL(10, 2),
    roadside_assistance BOOLEAN DEFAULT FALSE,
    theft_protection BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Motorcycles
CREATE TABLE IF NOT EXISTS motorcycles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    policy_id UUID REFERENCES personal_policies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    vin TEXT NOT NULL,
    engine_size INTEGER,
    custom_equipment_value DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loss history
CREATE TABLE IF NOT EXISTS loss_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES personal_policies(id),
    loss_date DATE NOT NULL,
    loss_type TEXT NOT NULL,
    amount_paid DECIMAL(12, 2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prior coverage
CREATE TABLE IF NOT EXISTS prior_coverage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    prior_insurer TEXT NOT NULL,
    prior_policy_number TEXT,
    inception_date DATE,
    expiration_date DATE,
    lapse_in_coverage BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    non_renewal_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Violations and accidents
CREATE TABLE IF NOT EXISTS violations_accidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    incident_date DATE NOT NULL,
    incident_type TEXT NOT NULL, -- 'violation', 'accident'
    description TEXT,
    conviction_date DATE,
    amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE co_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE homeowners_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boat_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE motorcycle_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE motorcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prior_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations_accidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
DO $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY[
        'co_applicants', 'personal_policies', 'homeowners_policies', 
        'property_locations', 'auto_policies', 'drivers', 'vehicles',
        'boat_policies', 'boats', 'motorcycle_policies', 'motorcycles',
        'loss_history', 'prior_coverage', 'violations_accidents'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        -- Allow all operations for authenticated users
        EXECUTE format('
            CREATE POLICY IF NOT EXISTS "Users can view all %I" ON %I FOR SELECT USING (true);
            CREATE POLICY IF NOT EXISTS "Users can insert %I" ON %I FOR INSERT WITH CHECK (true);
            CREATE POLICY IF NOT EXISTS "Users can update %I" ON %I FOR UPDATE USING (true);
            CREATE POLICY IF NOT EXISTS "Users can delete %I" ON %I FOR DELETE USING (true);
        ', table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name);
        
        -- Grant permissions
        EXECUTE format('
            GRANT ALL ON %I TO authenticated;
            GRANT ALL ON %I TO service_role;
        ', table_name, table_name);
    END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_co_applicants_customer_id ON co_applicants(customer_id);
CREATE INDEX IF NOT EXISTS idx_personal_policies_customer_id ON personal_policies(customer_id);
CREATE INDEX IF NOT EXISTS idx_personal_policies_policy_number ON personal_policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_homeowners_policies_policy_id ON homeowners_policies(policy_id);
CREATE INDEX IF NOT EXISTS idx_property_locations_policy_id ON property_locations(policy_id);
CREATE INDEX IF NOT EXISTS idx_auto_policies_policy_id ON auto_policies(policy_id);
CREATE INDEX IF NOT EXISTS idx_drivers_policy_id ON drivers(policy_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_policy_id ON vehicles(policy_id);
CREATE INDEX IF NOT EXISTS idx_boat_policies_policy_id ON boat_policies(policy_id);
CREATE INDEX IF NOT EXISTS idx_boats_policy_id ON boats(policy_id);
CREATE INDEX IF NOT EXISTS idx_motorcycle_policies_policy_id ON motorcycle_policies(policy_id);
CREATE INDEX IF NOT EXISTS idx_motorcycles_policy_id ON motorcycles(policy_id);
CREATE INDEX IF NOT EXISTS idx_loss_history_customer_id ON loss_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_prior_coverage_customer_id ON prior_coverage(customer_id);
CREATE INDEX IF NOT EXISTS idx_violations_accidents_driver_id ON violations_accidents(driver_id);
