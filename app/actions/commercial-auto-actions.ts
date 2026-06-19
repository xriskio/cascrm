"use server"

import { createClient } from "@/lib/supabase/server"
import { fetchCommercialAutoDrivers } from "@/lib/qqcatalyst/api"
import { revalidatePath } from "next/cache"

/**
 * Import commercial auto drivers for a policy detail
 */
export async function importCommercialAutoDriversAction(policyDetailId: string | number) {
  try {
    const supabase = await createClient()

    // Fetch drivers from QQCatalyst
    const drivers = await fetchCommercialAutoDrivers(policyDetailId)

    if (!drivers || drivers.length === 0) {
      return {
        success: false,
        message: "No drivers found for this commercial auto policy",
      }
    }

    // Process each driver
    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      total: drivers.length,
    }

    for (const driver of drivers) {
      try {
        // Check if driver already exists
        const { data: existingDriver } = await supabase
          .from("policy_drivers")
          .select("id")
          .eq("qq_driver_id", driver.DriverID)
          .single()

        const driverData = {
          qq_driver_id: driver.DriverID,
          policy_detail_id: driver.PolicyDetailsID,
          driver_number: driver.DriverNumber,
          first_name: driver.FirstName,
          middle_name: driver.MiddleName,
          last_name: driver.LastName,
          date_of_birth: driver.DateOfBirth,
          drivers_license_number: driver.DriversLicenceNumber,
          state_licensed: driver.StateLicensed,
          year_licensed: driver.YearLicensed,
          years_experience: driver.YearsExperience,
          ssn: driver.SSN,
          marital_status_id: driver.MaritalStatusID,
          date_hired: driver.DateHired,
          gender: driver.Gender,
          city: driver.City,
          state_code: driver.StateCode,
          zip_code: driver.ZipCode,
          vehicle_id: driver.VehicleID,
          percent_use: driver.PercentUse,
          carrier_driver_number: driver.CarrierDriverNumber,
          agency_driver_code: driver.AgencyDriverCode,
          excluded: driver.Excluded,
          raw_data: driver,
          updated_at: new Date().toISOString(),
        }

        if (existingDriver) {
          // Update existing driver
          const { error } = await supabase.from("policy_drivers").update(driverData).eq("id", existingDriver.id)

          if (error) throw error
          results.updated++
        } else {
          // Insert new driver
          const { error } = await supabase.from("policy_drivers").insert(driverData)

          if (error) throw error
          results.created++
        }
      } catch (error) {
        console.error(`Error processing driver ${driver.DriverID}:`, error)
        results.errors++
      }
    }

    revalidatePath("/admin/qqcatalyst")
    return {
      success: true,
      message: `Imported ${results.total} drivers: ${results.created} new, ${results.updated} updated, ${results.errors} errors`,
      results,
    }
  } catch (error) {
    console.error("Error importing commercial auto drivers:", error)
    return {
      success: false,
      message: `Failed to import drivers: ${(error as any).message}`,
    }
  }
}

/**
 * Get commercial auto drivers for a policy detail
 */
export async function getCommercialAutoDriversAction(policyDetailId: string | number) {
  try {
    const supabase = await createClient()

    // Get drivers from database
    const { data: drivers, error } = await supabase
      .from("policy_drivers")
      .select("*")
      .eq("policy_detail_id", policyDetailId)
      .order("driver_number", { ascending: true })

    if (error) throw error

    return {
      success: true,
      drivers: drivers || [],
    }
  } catch (error) {
    console.error("Error getting commercial auto drivers:", error)
    return {
      success: false,
      message: `Failed to get drivers: ${(error as any).message}`,
      drivers: [],
    }
  }
}
