"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Initialize the QQCatalyst schema in the database
 */
export async function initializeQQCatalystSchemaAction() {
  try {
    const supabase = await createClient()

    // Read the SQL file content
    const sqlFilePath =
      process.env.NODE_ENV === "development"
        ? "./supabase/migrations/qqcatalyst_complete_schema.sql"
        : "/app/supabase/migrations/qqcatalyst_complete_schema.sql"

    // For production, we'll need to use a different approach since we can't read files directly
    // This is a simplified example - in production you might want to embed the SQL or use a different approach
    const sql = `
    -- QQCatalyst Complete Integration Schema
    -- This migration creates all tables, functions, and triggers needed for QQCatalyst integration

    -- Enable UUID extension if not already enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

    -- QQCatalyst Tokens Table
    CREATE TABLE IF NOT EXISTS qqcatalyst_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        token_name TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_type TEXT NOT NULL DEFAULT 'Bearer',
        expires_in INTEGER,
        expires_at TIMESTAMP WITH TIME ZONE,
        client_id TEXT,
        client_secret TEXT,
        username TEXT,
        password TEXT,
        grant_type TEXT NOT NULL DEFAULT 'password',
        scope TEXT,
        access_token_url TEXT NOT NULL,
        client_authentication TEXT NOT NULL DEFAULT 'header',
        is_active BOOLEAN DEFAULT true,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Create index on is_active for faster lookups
    CREATE INDEX IF NOT EXISTS idx_qqcatalyst_tokens_is_active ON qqcatalyst_tokens(is_active);

    -- Function to update timestamps
    CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

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

    CREATE TRIGGER update_qqcatalyst_tokens_timestamp
    BEFORE UPDATE ON qqcatalyst_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error initializing QQCatalyst schema:", error)
      return { success: false, error: (error as any).message }
    }

    // Log the successful initialization
    await supabase.from("qqcatalyst_sync_logs").insert({
      sync_type: "schema_initialization",
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
      status: "completed",
      items_processed: 0,
      completed_at: new Date().toISOString(),
    })

    revalidatePath("/admin/qqcatalyst")
    return { success: true }
  } catch (error) {
    console.error("Error in initializeQQCatalystSchemaAction:", error)
    return { success: false, error: (error as any).message }
  }
}

/**
 * Test the database connection
 */
export async function testDatabaseConnectionAction() {
  try {
    const supabase = await createClient()

    // Try to query the qqcatalyst_sync_logs table
    const { data, error } = await supabase.from("qqcatalyst_sync_logs").select("id, sync_type, status").limit(1)

    if (error) {
      // If the table doesn't exist, suggest initializing the schema
      if (error.code === "42P01") {
        // undefined_table
        return {
          success: false,
          error: "QQCatalyst schema not initialized. Please run the initialization first.",
          needsInitialization: true,
        }
      }

      return { success: false, error: (error as any).message }
    }

    return {
      success: true,
      message: "Database connection successful",
      data,
    }
  } catch (error) {
    console.error("Error in testDatabaseConnectionAction:", error)
    return { success: false, error: (error as any).message }
  }
}

/**
 * Get policy sync statistics
 */
export async function getPolicySyncStatsAction() {
  try {
    const supabase = await createClient()

    // Try to query the sync stats function
    const { data, error } = await supabase.rpc("get_qqcatalyst_sync_stats")

    if (error) {
      return { success: false, error: (error as any).message }
    }

    // Also get total policy counts
    const { count: policyCount, error: policyError } = await supabase
      .from("qqcatalyst_policies")
      .select("*", { count: "exact", head: true })

    if (policyError) {
      console.error("Error getting policy count:", policyError)
    }

    return {
      success: true,
      stats: data,
      policyCount: policyCount || 0,
    }
  } catch (error) {
    console.error("Error in getPolicySyncStatsAction:", error)
    return { success: false, error: (error as any).message }
  }
}

/**
 * Get expiring policies
 */
export async function getExpiringPoliciesAction(daysFromNow = 90) {
  try {
    const supabase = await createClient()

    // Try to query the expiring policies function
    const { data, error } = await supabase.rpc("get_expiring_qqcatalyst_policies", {
      p_days_from_now: daysFromNow,
    })

    if (error) {
      return { success: false, error: (error as any).message }
    }

    return {
      success: true,
      policies: data,
    }
  } catch (error) {
    console.error("Error in getExpiringPoliciesAction:", error)
    return { success: false, error: (error as any).message }
  }
}
