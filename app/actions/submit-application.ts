"use server"

import { createClient } from "@/lib/supabase"
import { sendSubmissionNotification } from "@/lib/email"
import { revalidatePath } from "next/cache"

// Function to generate a unique submission number
function generateSubmissionNumber() {
  const prefix = "SUB"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}

// Function to extract client name from form data
function extractClientName(data: any): string {
  return (
    data.client_name ||
    data.business_name ||
    data.companyName ||
    data.contactName ||
    data.insuredName ||
    data.applicantName ||
    data.businessName ||
    data.company_name ||
    data.name ||
    "Unknown Client"
  )
}

// Function to extract policy type from form data
function extractPolicyType(data: any): string {
  return (
    data.policy_type ||
    data.coverage_type ||
    data.insurance_type ||
    data.policyType ||
    data.coverageType ||
    data.insuranceType ||
    data.type ||
    "Unknown Policy Type"
  )
}

// Function to extract agent information
function extractAgentInfo(data: any): { agentName?: string; agentEmail?: string } {
  return {
    agentName: data.agent_name || data.agentName || data.producer_name || data.producerName,
    agentEmail: data.agent_email || data.agentEmail || data.producer_email || data.producerEmail,
  }
}

// Function to format uploaded files for email
function formatUploadedFiles(data: any): string {
  const files = data.uploaded_files || data.uploadedFiles || data.files || []
  if (!files || files.length === 0) {
    return "No files uploaded"
  }

  return files
    .map((file: any, index: number) => {
      const fileName = file.name || file.fileName || `File ${index + 1}`
      const fileSize = file.size ? `(${(file.size / 1024).toFixed(1)} KB)` : ""
      const fileType = file.type || file.fileType || "Unknown type"
      const uploadDate = new Date().toLocaleDateString()
      return `📄 ${fileName} ${fileSize}\n   Type: ${fileType}\n   Uploaded: ${uploadDate}`
    })
    .join("\n\n")
}

// Function to format vehicle details for email
function formatVehicleDetails(data: any): string {
  const vehicles = data.vehicles || []
  if (!vehicles || vehicles.length === 0) {
    return ""
  }

  return vehicles
    .map((vehicle: any, index: number) => {
      return `🚗 Vehicle ${index + 1}:
   Year: ${vehicle.year || "N/A"}
   Make: ${vehicle.make || "N/A"}
   Model: ${vehicle.model || "N/A"}
   VIN: ${vehicle.vin || "N/A"}
   Value: ${vehicle.value ? `$${vehicle.value.toLocaleString()}` : "N/A"}
   Seating: ${vehicle.seatingCapacity || "N/A"}
   Primary Use: ${vehicle.primaryUse || "N/A"}
   Mileage: ${vehicle.mileage || "N/A"}
   Garage Location: ${vehicle.garageLocation || "N/A"}`
    })
    .join("\n\n")
}

// Function to format driver details for email
function formatDriverDetails(data: any): string {
  const drivers = data.drivers || []
  if (!drivers || drivers.length === 0) {
    return ""
  }

  return drivers
    .map((driver: any, index: number) => {
      const fullName = `${driver.firstName || ""} ${driver.lastName || ""}`.trim()
      return `👤 Driver ${index + 1}: ${fullName || "N/A"}
   Date of Birth: ${driver.dateOfBirth || "N/A"}
   License Number: ${driver.licenseNumber || "N/A"}
   License State: ${driver.licenseState || "N/A"}
   Years Experience: ${driver.yearsExperience ? `${driver.yearsExperience} years` : "N/A"}
   Hire Date: ${driver.hireDate || "N/A"}
   Violations: ${driver.violations || "None"}
   Accidents: ${driver.accidents || "None"}
   CDL Class: ${driver.cdlClass || "N/A"}
   Endorsements: ${driver.endorsements || "N/A"}`
    })
    .join("\n\n")
}

// Function to format form data for email
function formatFormDataForEmail(data: any): string {
  const sections = []

  // Business Information
  if (data.companyName || data.businessName || data.business_name) {
    sections.push(`📋 BUSINESS INFORMATION:
• Company Name: ${data.companyName || data.businessName || data.business_name || "N/A"}
• Contact Name: ${data.contactName || data.contact_name || "N/A"}
• Email: ${data.email || "N/A"}
• Phone: ${data.phoneNumber || data.phone || data.phone_number || "N/A"}
• Business Type: ${data.businessType || data.business_type || "N/A"}
• Years in Business: ${data.yearsInBusiness || data.years_in_business || "N/A"}
• Website: ${data.website || "N/A"}`)
  }

  // Address Information
  if (data.businessAddress || data.business_address) {
    sections.push(`📍 ADDRESS INFORMATION:
• Business Address: ${data.businessAddress || data.business_address || "N/A"}
• City: ${data.businessCity || data.business_city || "N/A"}
• State: ${data.businessState || data.business_state || "N/A"}
• ZIP: ${data.businessZip || data.business_zip || "N/A"}`)
  }

  // Coverage Information
  if (data.liabilityLimit || data.liability_limit || data.coverageAmount) {
    sections.push(`🛡️ COVERAGE INFORMATION:
• Liability Limit: ${data.liabilityLimit || data.liability_limit || data.coverageAmount || "N/A"}
• Physical Damage: ${data.physicalDamage || data.physical_damage || "N/A"}
• Cargo Coverage: ${data.cargoCoverage || data.cargo_coverage || "N/A"}
• Effective Date: ${data.effectiveDate || data.effective_date || "N/A"}
• Current Carrier: ${data.currentCarrier || data.current_carrier || "N/A"}`)
  }

  // DOT/MC Numbers
  if (data.dotNumber || data.mcNumber) {
    sections.push(`🚛 TRANSPORTATION INFO:
• DOT Number: ${data.dotNumber || data.dot_number || "N/A"}
• MC Number: ${data.mcNumber || data.mc_number || "N/A"}
• Operation Type: ${data.operationType || data.operation_type || "N/A"}
• Service Area: ${data.serviceArea || data.service_area || "N/A"}`)
  }

  return sections.join("\n\n") || "No detailed form data available"
}

export async function submitApplication(data: any) {
  try {
    console.log("Attempting to save submission to Supabase...")
    console.log("Form data received:", JSON.stringify(data, null, 2))

    // Generate tracking number if not provided
    const trackingNumber = data.submission_number || data.tracking_number || generateSubmissionNumber()

    // Extract client and policy information
    const clientName = extractClientName(data.form_data || data)
    const policyType = data.insurance_type || extractPolicyType(data.form_data || data)
    const { agentName, agentEmail } = extractAgentInfo(data.form_data || data)

    // Get current user information using a regular client (has access to session)
    const regularClient = createClient()
    const { data: { user } } = await regularClient.auth.getUser()
    const assignedAgent = user?.email || agentName || data.contactName || data.contact_name || "System"

    console.log("Extracted info:", { clientName, policyType, agentName, agentEmail, assignedAgent })

    // Extract contact information from form_data
    const formData = data.form_data || {}
    const contactEmail = formData.email || data.email || ""
    const contactPhone = formData.phoneNumber || formData.phone || data.phone || ""

    // Prepare submission data matching database schema
    const submissionData = {
      tracking_number: trackingNumber,
      client_name: clientName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      policy_type: policyType,
      status: data.status || "pending",
      assigned_agent: assignedAgent,
      json_raw: data.form_data || data,
    }

    // Use service role client for insert (bypasses RLS)
    const supabase = createClient({ useServiceRole: true })
    const { data: savedData, error } = await supabase.from("submissions").insert([submissionData]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error: error.message }
    }

    console.log("Submission saved successfully:", trackingNumber)

    // Send enhanced email notification with all details
    try {
      await sendSubmissionNotification({
        submissionNumber: trackingNumber,
        clientName,
        policyType,
        agentName,
        agentEmail,
        submissionDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        submissionId: savedData.id,
        formDetails: formatFormDataForEmail(data.form_data || data),
        uploadedFiles: formatUploadedFiles(data.form_data || data),
        vehicleDetails: formatVehicleDetails(data.form_data || data),
        driverDetails: formatDriverDetails(data.form_data || data),
      })

      console.log("Enhanced email notification sent successfully")
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
      // Don't fail the submission if email fails
    }

    // Revalidate relevant paths
    revalidatePath("/submissions")
    revalidatePath("/dashboard")

    return {
      success: true,
      submissionNumber: trackingNumber,
      submissionId: savedData.id,
    }
  } catch (error) {
    console.error("Error in submitApplication:", error)
    return { success: false, error: error.message }
  }
}
