"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Search } from "lucide-react"
import { addRenewal } from "@/app/actions/renewal-actions"

const policyTypes = [
  "General Liability",
  "Commercial Auto",
  "Workers Compensation",
  "Commercial Property",
  "Umbrella/Excess",
  "Professional Liability",
  "Cyber Liability",
  "Business Owners Policy (BOP)",
  "NEMT",
  "Public Auto",
  "Garage Keepers",
  "Contractors",
  "Auto Dealers",
  "Transportation",
  "Restaurants",
]

const coveragesByLine = {
  "General Liability": [
    "General Aggregate",
    "Products/Completed Operations Aggregate",
    "Each Occurrence",
    "Personal & Advertising Injury",
    "Medical Expenses",
    "Fire Damage",
  ],
  "Commercial Auto": [
    "Combined Single Limit",
    "Bodily Injury Per Person",
    "Bodily Injury Per Accident",
    "Property Damage",
    "Comprehensive",
    "Collision",
    "Medical Payments",
    "Uninsured Motorist",
    "Underinsured Motorist",
  ],
  "Workers Compensation": [
    "Bodily Injury by Accident",
    "Bodily Injury by Disease - Policy Limit",
    "Bodily Injury by Disease - Each Employee",
    "Employers Liability",
  ],
  "Commercial Property": [
    "Building",
    "Business Personal Property",
    "Loss of Income",
    "Extra Expense",
    "Equipment Breakdown",
  ],
  "Umbrella/Excess": ["Each Occurrence", "General Aggregate"],
  "Garage Keepers": ["Comprehensive", "Collision", "Fire and Theft", "Combined Additional Coverages"],
}

const endorsementsByLine = {
  "General Liability": [
    "Additional Insured - Primary & Non-Contributory",
    "Waiver of Subrogation",
    "Primary & Non-Contributory",
    "Blanket Additional Insured",
    "Products/Completed Operations",
  ],
  "Commercial Auto": [
    "Additional Insured - Lessor",
    "Waiver of Subrogation",
    "Drive Other Car Coverage",
    "Employee as Additional Insured",
    "MCS-90",
  ],
  "Workers Compensation": ["Waiver of Subrogation", "Alternate Employer", "Voluntary Compensation"],
  "Garage Keepers": ["Waiver of Subrogation", "Additional Insured", "Broad Form Coverage", "Direct Primary Coverage"],
}

const brokers = ["Wael Mohammmad", "CASURANCE INC", "XRISK INC", "Casurance Agency Insurance Services"]

const states = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

const countries = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
]

interface Policy {
  id: string
  policyType: string
  policyNumber: string
  effectiveDate: string
  expirationDate: string
  carrier: string
  premium: number
  coverages: Coverage[]
  vehicles: Vehicle[]
  drivers: Driver[]
  endorsements: string[]
  exclusions: string[]
}

interface Coverage {
  id: string
  type: string
  limit: string
  premium: number
  deductible: string
}

interface Vehicle {
  id: string
  vin: string
  year: string
  make: string
  model: string
  garagingAddress: string
  radius: string
  tiv: number
}

interface Driver {
  id: string
  name: string
  dob: string
  licenseNumber: string
  experience: string
  violations: boolean
  accidents: boolean
}

interface AutoLiabilityCoverage {
  autoType: string[]
  otherAutoDescription: string
  additionalInsured: boolean
  waiverOfSubrogation: boolean
  combinedSingleLimit: number
  bodilyInjuryPerPerson: number
  bodilyInjuryPerAccident: number
  propertyDamage: number
  otherDescription: string
  otherLimit: number
}

interface GeneralLiabilityCoverage {
  coverageType: string
  otherGeneralLiabilityCoverages: boolean
  otherCoverageDescription1: string
  otherCoverage: boolean
  otherCoverageDescription2: string
  aggregateLimitAppliesPer: string
  commercialDescription: string
  additionalInsured: boolean
  waiverOfSubrogation: boolean
  eachOccurrence: number
  damageToRentedPremises: number
  medicalExpenses: number
  personalAdvInjury: number
  generalAggregate: number
  productsCompOpAgg: number
  otherOccurrence: number
}

interface GarageKeepersCoverage {
  insuredValue: number
  mainDeductible: number
  insuredPersons: string
  info: string
  totalPayroll: number
  fullTimeEmployees: number
  partTimeEmployees: number
  executiveOfficerExcluded: boolean
  waiverOfSubrogation: boolean
  perStatute: boolean
  otherLimits: boolean
  fieldBox: string
  elEachAccident: number
  elDiseaseEachEmployee: number
  elDiseasePolicyLimit: number
}

// Workers Compensation Interface
interface WorkersCompensationCoverage {
  anyProprietorPartnerExecutiveOfficerMemberExcluded: boolean
  totalPayroll: number
  numberOfFullTimeEmployees: number
  numberOfPartTimeEmployees: number
  subrWvd: boolean
  perStatute: boolean
  otherLimits: boolean
  fieldBox: string
  elEachAccident: number
  elDiseaseEachEmployee: number
  elDiseasePolicyLimit: number
}

// Commercial Property Interface
interface CommercialPropertyCoverage {
  buildingLimit: number
  businessPersonalPropertyLimit: number
  lossOfIncomeLimit: number
  extraExpenseLimit: number
  equipmentBreakdownLimit: number
  deductible: number
  coinsurancePercentage: number
  sprinklerLeakageCoverage: boolean
  floodCoverage: boolean
  earthquakeCoverage: boolean
}

// NEMT Interface
interface NEMTLiabilityCoverage {
  combinedSingleLimit: number
  bodilyInjuryPerPerson: number
  bodilyInjuryPerAccident: number
  propertyDamage: number
  uninsuredMotoristBodilyInjury: number
  underinsuredMotoristBodilyInjury: number
  medicalPayments: number
}

// Cyber Liability Interface
interface CyberLiabilityCoverage {
  cyberLiabilityLimit: number
  breachResponseCostLimit: number
  regulatoryDefenseAndPenaltiesLimit: number
  cyberExtortionThreatLimit: number
  businessInterruptionLimit: number
  dataRecoveryCostLimit: number
  notificationCostLimit: number
  creditMonitoringCostLimit: number
  publicRelationsExpenseLimit: number
  forensicAccountingExpenseLimit: number
  deductible: number
}

// Public Auto Interface
interface PublicAutoLiabilityCoverage {
  combinedSingleLimit: number
  bodilyInjuryPerPerson: number
  bodilyInjuryPerAccident: number
  propertyDamage: number
  uninsuredMotoristBodilyInjury: number
  underinsuredMotoristBodilyInjury: number
  medicalPayments: number
}

// Umbrella/Excess Interface
interface UmbrellaExcessLiabilityCoverage {
  eachOccurrenceLimit: number
  generalAggregateLimit: number
  selfInsuredRetention: number
}

// Professional Liability Interface
interface ProfessionalLiabilityCoverage {
  eachClaimLimit: number
  aggregateLimit: number
  deductible: number
  retroactiveDate: string
  priorActsCoverage: boolean
}

export default function ComprehensiveRenewalForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("client")

  // Quote Information
  const [quoteInfo, setQuoteInfo] = useState({
    status: "unsaved",
    date: new Date().toISOString().split("T")[0],
    broker: "",
  })

  // Client Information
  const [clientInfo, setClientInfo] = useState({
    insuredName: "",
    clientEmail: "",
    clientPhone: "",
    mobilePhone: "",
    address: "",
    street: "",
    zipCode: "",
    city: "",
    state: "",
    country: "United States",
    customerType: "company",
    idCode: "",
    producer: "",
    retailAgencyName: "",
    renewalDate: "",
    notes: "",
  })

  // Contact Person
  const [contactPerson, setContactPerson] = useState({
    name: "",
    email: "",
    phone: "",
    mobilePhone: "",
  })

  // Auto Liability Coverage
  const [autoLiability, setAutoLiability] = useState<AutoLiabilityCoverage>({
    autoType: [],
    otherAutoDescription: "",
    additionalInsured: false,
    waiverOfSubrogation: false,
    combinedSingleLimit: 0,
    bodilyInjuryPerPerson: 0,
    bodilyInjuryPerAccident: 0,
    propertyDamage: 0,
    otherDescription: "",
    otherLimit: 0,
  })

  // General Liability Coverage
  const [generalLiability, setGeneralLiability] = useState<GeneralLiabilityCoverage>({
    coverageType: "Claims-Made",
    otherGeneralLiabilityCoverages: false,
    otherCoverageDescription1: "",
    otherCoverage: false,
    otherCoverageDescription2: "",
    aggregateLimitAppliesPer: "Policy",
    commercialDescription: "",
    additionalInsured: false,
    waiverOfSubrogation: false,
    eachOccurrence: 0,
    damageToRentedPremises: 0,
    medicalExpenses: 0,
    personalAdvInjury: 0,
    generalAggregate: 0,
    productsCompOpAgg: 0,
    otherOccurrence: 0,
  })

  // Garage Keepers Coverage
  const [garageKeepers, setGarageKeepers] = useState<GarageKeepersCoverage>({
    insuredValue: 0,
    mainDeductible: 0,
    insuredPersons: "",
    info: "",
    totalPayroll: 0,
    fullTimeEmployees: 0,
    partTimeEmployees: 0,
    executiveOfficerExcluded: false,
    waiverOfSubrogation: false,
    perStatute: false,
    otherLimits: false,
    fieldBox: "",
    elEachAccident: 0,
    elDiseaseEachEmployee: 0,
    elDiseasePolicyLimit: 0,
  })

  // Workers Compensation Coverage
  const [workersCompensation, setWorkersCompensation] = useState<WorkersCompensationCoverage>({
    anyProprietorPartnerExecutiveOfficerMemberExcluded: false,
    totalPayroll: 0,
    numberOfFullTimeEmployees: 0,
    numberOfPartTimeEmployees: 0,
    subrWvd: false,
    perStatute: false,
    otherLimits: false,
    fieldBox: "",
    elEachAccident: 0,
    elDiseaseEachEmployee: 0,
    elDiseasePolicyLimit: 0,
  })

  // Commercial Property Coverage
  const [commercialProperty, setCommercialProperty] = useState<CommercialPropertyCoverage>({
    buildingLimit: 0,
    businessPersonalPropertyLimit: 0,
    lossOfIncomeLimit: 0,
    extraExpenseLimit: 0,
    equipmentBreakdownLimit: 0,
    deductible: 0,
    coinsurancePercentage: 0,
    sprinklerLeakageCoverage: false,
    floodCoverage: false,
    earthquakeCoverage: false,
  })

  // NEMT Liability Coverage
  const [nemtLiability, setNEMTLiability] = useState<NEMTLiabilityCoverage>({
    combinedSingleLimit: 0,
    bodilyInjuryPerPerson: 0,
    bodilyInjuryPerAccident: 0,
    propertyDamage: 0,
    uninsuredMotoristBodilyInjury: 0,
    underinsuredMotoristBodilyInjury: 0,
    medicalPayments: 0,
  })

  // Cyber Liability Coverage
  const [cyberLiability, setCyberLiability] = useState<CyberLiabilityCoverage>({
    cyberLiabilityLimit: 0,
    breachResponseCostLimit: 0,
    regulatoryDefenseAndPenaltiesLimit: 0,
    cyberExtortionThreatLimit: 0,
    businessInterruptionLimit: 0,
    dataRecoveryCostLimit: 0,
    notificationCostLimit: 0,
    creditMonitoringCostLimit: 0,
    publicRelationsExpenseLimit: 0,
    forensicAccountingExpenseLimit: 0,
    deductible: 0,
  })

  // Public Auto Liability Coverage
  const [publicAutoLiability, setPublicAutoLiability] = useState<PublicAutoLiabilityCoverage>({
    combinedSingleLimit: 0,
    bodilyInjuryPerPerson: 0,
    bodilyInjuryPerAccident: 0,
    propertyDamage: 0,
    uninsuredMotoristBodilyInjury: 0,
    underinsuredMotoristBodilyInjury: 0,
    medicalPayments: 0,
  })

  // Umbrella/Excess Liability Coverage
  const [umbrellaExcessLiability, setUmbrellaExcessLiability] = useState<UmbrellaExcessLiabilityCoverage>({
    eachOccurrenceLimit: 0,
    generalAggregateLimit: 0,
    selfInsuredRetention: 0,
  })

  // Professional Liability Coverage
  const [professionalLiability, setProfessionalLiability] = useState<ProfessionalLiabilityCoverage>({
    eachClaimLimit: 0,
    aggregateLimit: 0,
    deductible: 0,
    retroactiveDate: new Date().toISOString().split("T")[0],
    priorActsCoverage: false,
  })

  // Policies
  const [policies, setPolicies] = useState<Policy[]>([])
  const [activePolicyIndex, setActivePolicyIndex] = useState(0)

  const addPolicy = () => {
    const newPolicy: Policy = {
      id: `policy-${Date.now()}`,
      policyType: "",
      policyNumber: "",
      effectiveDate: "",
      expirationDate: "",
      carrier: "",
      premium: 0,
      coverages: [],
      vehicles: [],
      drivers: [],
      endorsements: [],
      exclusions: [],
    }
    setPolicies([...policies, newPolicy])
    setActivePolicyIndex(policies.length)
  }

  const updatePolicy = (index: number, field: string, value: any) => {
    const updatedPolicies = [...policies]
    updatedPolicies[index] = { ...updatedPolicies[index], [field]: value }
    setPolicies(updatedPolicies)
  }

  const removePolicy = (index: number) => {
    const updatedPolicies = policies.filter((_, i) => i !== index)
    setPolicies(updatedPolicies)
    if (activePolicyIndex >= updatedPolicies.length) {
      setActivePolicyIndex(Math.max(0, updatedPolicies.length - 1))
    }
  }

  // Coverage Management
  const addCoverage = (policyIndex: number) => {
    const newCoverage: Coverage = {
      id: `coverage-${Date.now()}`,
      type: "",
      limit: "",
      premium: 0,
      deductible: "",
    }
    const updatedPolicies = [...policies]
    updatedPolicies[policyIndex].coverages.push(newCoverage)
    setPolicies(updatedPolicies)
  }

  const updateCoverage = (policyIndex: number, coverageIndex: number, field: string, value: any) => {
    const updatedPolicies = [...policies]
    updatedPolicies[policyIndex].coverages[coverageIndex] = {
      ...updatedPolicies[policyIndex].coverages[coverageIndex],
      [field]: value,
    }
    setPolicies(updatedPolicies)
  }

  const removeCoverage = (policyIndex: number, coverageIndex: number) => {
    const updatedPolicies = [...policies]
    updatedPolicies[policyIndex].coverages = updatedPolicies[policyIndex].coverages.filter(
      (_, i) => i !== coverageIndex,
    )
    setPolicies(updatedPolicies)
  }

  // Vehicle Management
  const addVehicle = (policyIndex: number) => {
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      vin: "",
      year: "",
      make: "",
      model: "",
      garagingAddress: "",
      radius: "",
      tiv: 0,
    }
    const updatedPolicies = [...policies]
    updatedPolicies[policyIndex].vehicles.push(newVehicle)
    setPolicies(updatedPolicies)
  }

  const updateVehicle = (policyIndex: number, vehicleIndex: number, field: string, value: any) => {
    const updatedPolicies = [...policies]
    updatedPolicies[policyIndex].vehicles[vehicleIndex] = {
      ...updatedPolicies[policyIndex].vehicles[vehicleIndex],
      [field]: value,
    }
    setPolicies(updatedPolicies)
  }

  const removeVehicle = (policyIndex: number, vehicleIndex: number) => {
    const updatedPolicies = [...policies]
    updatedPolicies[policyIndex].vehicles = updatedPolicies[policyIndex].vehicles.filter((_, i) => i !== vehicleIndex)
    setPolicies(updatedPolicies)
  }

  // Driver Management
  const addDriver = (policyIndex: number) => {
    const newDriver: Driver = {
      id: `driver-${Date.now()}`,
      name: "",
      dob: "",
      licenseNumber: "",
      experience: "",
      violations: false,
      accidents: false,
    }
    const updatedPolicies = [...policies]
    updatedPolicies[policyIndex].drivers.push(newDriver)
    setPolicies(updatedPolicies)
  }

  const updateDriver = (policyIndex: number, driverIndex: number, field: string, value: any) => {
    const updatedPolicies = [...policies]
    updatedPolicies[policyIndex].drivers[driverIndex] = {
      ...updatedPolicies[policyIndex].drivers[driverIndex],
      [field]: value,
    }
    setPolicies(updatedPolicies)
  }

  const removeDriver = (policyIndex: number, driverIndex: number) => {
    const updatedPolicies = [...policies]
    updatedPolicies[policyIndex].drivers = updatedPolicies[policyIndex].drivers.filter((_, i) => i !== driverIndex)
    setPolicies(updatedPolicies)
  }

  // Endorsement/Exclusion Management
  const toggleEndorsement = (policyIndex: number, endorsement: string) => {
    const updatedPolicies = [...policies]
    const endorsements = updatedPolicies[policyIndex].endorsements
    if (endorsements.includes(endorsement)) {
      updatedPolicies[policyIndex].endorsements = endorsements.filter((e) => e !== endorsement)
    } else {
      updatedPolicies[policyIndex].endorsements.push(endorsement)
    }
    setPolicies(updatedPolicies)
  }

  // Auto Liability Type Management
  const toggleAutoType = (type: string) => {
    const currentTypes = [...autoLiability.autoType]
    if (currentTypes.includes(type)) {
      setAutoLiability({
        ...autoLiability,
        autoType: currentTypes.filter((t) => t !== type),
      })
    } else {
      setAutoLiability({
        ...autoLiability,
        autoType: [...currentTypes, type],
      })
    }
  }

  // Calculate total premium
  const totalPremium = policies.reduce((total, policy) => total + policy.premium, 0)

  // Check if auto line
  const isAutoLine = (policyType: string) => {
    return ["Commercial Auto", "NEMT", "Public Auto", "Transportation"].includes(policyType)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare renewal data
      const renewalData = {
        insured_name: clientInfo.insuredName,
        client_email: clientInfo.clientEmail || null,
        client_phone: clientInfo.clientPhone || null,
        mobile_phone: clientInfo.mobilePhone || null,
        address: {
          street: clientInfo.street,
          zip_code: clientInfo.zipCode,
          city: clientInfo.city,
          state: clientInfo.state,
          country: clientInfo.country,
        },
        customer_type: clientInfo.customerType,
        id_code: clientInfo.idCode,
        producer: clientInfo.producer || quoteInfo.broker || null,
        retail_agency_name: clientInfo.retailAgencyName || null,
        expiration_date: clientInfo.renewalDate || null,
        notes: clientInfo.notes || null,
        status: quoteInfo.status || "pending",
        quote_date: quoteInfo.date,
        policies: policies,
        total_premium: totalPremium,
        contact_person: contactPerson.name
          ? {
              name: contactPerson.name,
              email: contactPerson.email,
              phone: contactPerson.phone,
              mobile_phone: contactPerson.mobilePhone,
            }
          : null,
        auto_liability: autoLiability,
        general_liability: generalLiability,
        garage_keepers: garageKeepers,
        workers_compensation: workersCompensation,
        commercial_property: commercialProperty,
        nemt_liability: nemtLiability,
        cyber_liability: cyberLiability,
        public_auto_liability: publicAutoLiability,
        umbrella_excess_liability: umbrellaExcessLiability,
        professional_liability: professionalLiability,
      }

      const result = await addRenewal(renewalData)

      if (result.success) {
        router.push("/renewals")
      } else {
        setError(`Error creating renewal: ${result.error || "Unknown error"}`)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCoverageForm = (policyType: string) => {
    switch (policyType) {
      case "Garage Keepers":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuredValue">Insured value</Label>
                <div className="flex">
                  <Input
                    id="insuredValue"
                    type="number"
                    step="0.01"
                    value={garageKeepers.insuredValue}
                    onChange={(e) =>
                      setGarageKeepers({
                        ...garageKeepers,
                        insuredValue: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                </div>
              </div>
              <div>
                <Label htmlFor="mainDeductible">Main deductible</Label>
                <div className="flex">
                  <Input
                    id="mainDeductible"
                    type="number"
                    step="0.01"
                    value={garageKeepers.mainDeductible}
                    onChange={(e) =>
                      setGarageKeepers({
                        ...garageKeepers,
                        mainDeductible: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuredPersons">Insured persons</Label>
                <Input
                  id="insuredPersons"
                  value={garageKeepers.insuredPersons}
                  onChange={(e) => setGarageKeepers({ ...garageKeepers, insuredPersons: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="info">Info</Label>
                <Input
                  id="info"
                  value={garageKeepers.info}
                  onChange={(e) => setGarageKeepers({ ...garageKeepers, info: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="totalPayroll">Total payroll</Label>
                <div className="flex">
                  <Input
                    id="totalPayroll"
                    type="number"
                    step="0.01"
                    value={garageKeepers.totalPayroll}
                    onChange={(e) =>
                      setGarageKeepers({
                        ...garageKeepers,
                        totalPayroll: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                </div>
              </div>
              <div>
                <Label htmlFor="fullTimeEmployees">Number of fulltime employees</Label>
                <Input
                  id="fullTimeEmployees"
                  type="number"
                  value={garageKeepers.fullTimeEmployees}
                  onChange={(e) =>
                    setGarageKeepers({
                      ...garageKeepers,
                      fullTimeEmployees: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="partTimeEmployees">Number of parttime employees</Label>
                <Input
                  id="partTimeEmployees"
                  type="number"
                  value={garageKeepers.partTimeEmployees}
                  onChange={(e) =>
                    setGarageKeepers({
                      ...garageKeepers,
                      partTimeEmployees: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="executiveOfficerExcluded">
                Type of Insurance - Workers Compensation and Employers' Liability - Any
                Proprietor/Partner/Executive/Officer/Member Excluded?
              </Label>
              <Select
                value={garageKeepers.executiveOfficerExcluded ? "yes" : "no"}
                onValueChange={(value) =>
                  setGarageKeepers({ ...garageKeepers, executiveOfficerExcluded: value === "yes" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gkWaiverOfSubrogation">Subr Wvd</Label>
                <Select
                  value={garageKeepers.waiverOfSubrogation ? "yes" : "no"}
                  onValueChange={(value) =>
                    setGarageKeepers({ ...garageKeepers, waiverOfSubrogation: value === "yes" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="perStatute">Per Statute</Label>
                  <Select
                    value={garageKeepers.perStatute ? "yes" : "no"}
                    onValueChange={(value) => setGarageKeepers({ ...garageKeepers, perStatute: value === "yes" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="otherLimits">Other</Label>
                  <Select
                    value={garageKeepers.otherLimits ? "yes" : "no"}
                    onValueChange={(value) => setGarageKeepers({ ...garageKeepers, otherLimits: value === "yes" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fieldBox">Field Box</Label>
                <Textarea
                  id="fieldBox"
                  value={garageKeepers.fieldBox}
                  onChange={(e) => setGarageKeepers({ ...garageKeepers, fieldBox: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="elEachAccident">E.L. Each Accident $</Label>
                  <div className="flex">
                    <Input
                      id="elEachAccident"
                      type="number"
                      step="0.01"
                      value={garageKeepers.elEachAccident}
                      onChange={(e) =>
                        setGarageKeepers({
                          ...garageKeepers,
                          elEachAccident: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="elDiseaseEachEmployee">E.L. Disease- EA Employee $</Label>
                  <div className="flex">
                    <Input
                      id="elDiseaseEachEmployee"
                      type="number"
                      step="0.01"
                      value={garageKeepers.elDiseaseEachEmployee}
                      onChange={(e) =>
                        setGarageKeepers({
                          ...garageKeepers,
                          elDiseaseEachEmployee: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="elDiseasePolicyLimit">E.L. Disease- Policy Limit $</Label>
                  <div className="flex">
                    <Input
                      id="elDiseasePolicyLimit"
                      type="number"
                      step="0.01"
                      value={garageKeepers.elDiseasePolicyLimit}
                      onChange={(e) =>
                        setGarageKeepers({
                          ...garageKeepers,
                          elDiseasePolicyLimit: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      case "Commercial General Liability":
        return (
          <>
            <div>
              <Label className="block mb-2">General Liability Coverages</Label>
              <RadioGroup
                value={generalLiability.coverageType}
                onValueChange={(value) => setGeneralLiability({ ...generalLiability, coverageType: value })}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Claims-Made" id="claimsMade" />
                  <Label htmlFor="claimsMade">Claims-Made</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Occurrence" id="occurrence" />
                  <Label htmlFor="occurrence">Occurrence</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="otherGL" />
                  <Label htmlFor="otherGL">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="otherGeneralLiabilityCoverages">Other general liability coverages</Label>
                <Select
                  value={generalLiability.otherGeneralLiabilityCoverages ? "yes" : "no"}
                  onValueChange={(value) =>
                    setGeneralLiability({
                      ...generalLiability,
                      otherGeneralLiabilityCoverages: value === "yes",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {generalLiability.otherGeneralLiabilityCoverages && (
                <div>
                  <Label htmlFor="otherCoverageDescription1">Other coverage description</Label>
                  <Input
                    id="otherCoverageDescription1"
                    value={generalLiability.otherCoverageDescription1}
                    onChange={(e) =>
                      setGeneralLiability({ ...generalLiability, otherCoverageDescription1: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="otherCoverage">Other coverage</Label>
                <Select
                  value={generalLiability.otherCoverage ? "yes" : "no"}
                  onValueChange={(value) =>
                    setGeneralLiability({ ...generalLiability, otherCoverage: value === "yes" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {generalLiability.otherCoverage && (
                <div>
                  <Label htmlFor="otherCoverageDescription2">Other coverage description</Label>
                  <Input
                    id="otherCoverageDescription2"
                    value={generalLiability.otherCoverageDescription2}
                    onChange={(e) =>
                      setGeneralLiability({ ...generalLiability, otherCoverageDescription2: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="block mb-2">General Aggregate Limit Applies Per</Label>
              <RadioGroup
                value={generalLiability.aggregateLimitAppliesPer}
                onValueChange={(value) => setGeneralLiability({ ...generalLiability, aggregateLimitAppliesPer: value })}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Policy" id="policy" />
                  <Label htmlFor="policy">Policy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Project" id="project" />
                  <Label htmlFor="project">Project</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Location" id="location" />
                  <Label htmlFor="location">Location</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="otherAggregate" />
                  <Label htmlFor="otherAggregate">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {generalLiability.aggregateLimitAppliesPer === "Other" && (
              <div>
                <Label htmlFor="commercialDescription">Commercial Description</Label>
                <Input
                  id="commercialDescription"
                  value={generalLiability.commercialDescription}
                  onChange={(e) => setGeneralLiability({ ...generalLiability, commercialDescription: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="glAdditionalInsured">Addl Insd</Label>
                <Select
                  value={generalLiability.additionalInsured ? "yes" : "no"}
                  onValueChange={(value) =>
                    setGeneralLiability({ ...generalLiability, additionalInsured: value === "yes" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="glWaiverOfSubrogation">Subr Wvd</Label>
                <Select
                  value={generalLiability.waiverOfSubrogation ? "yes" : "no"}
                  onValueChange={(value) =>
                    setGeneralLiability({ ...generalLiability, waiverOfSubrogation: value === "yes" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="eachOccurrence">Each Occurrence $</Label>
                  <div className="flex">
                    <Input
                      id="eachOccurrence"
                      type="number"
                      step="0.01"
                      value={generalLiability.eachOccurrence}
                      onChange={(e) =>
                        setGeneralLiability({
                          ...generalLiability,
                          eachOccurrence: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="damageToRentedPremises">Damage to Rented Premises $</Label>
                  <div className="flex">
                    <Input
                      id="damageToRentedPremises"
                      type="number"
                      step="0.01"
                      value={generalLiability.damageToRentedPremises}
                      onChange={(e) =>
                        setGeneralLiability({
                          ...generalLiability,
                          damageToRentedPremises: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="medicalExpenses">Med Exp $</Label>
                  <div className="flex">
                    <Input
                      id="medicalExpenses"
                      type="number"
                      step="0.01"
                      value={generalLiability.medicalExpenses}
                      onChange={(e) =>
                        setGeneralLiability({
                          ...generalLiability,
                          medicalExpenses: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="personalAdvInjury">Personal & Adv Injury $</Label>
                  <div className="flex">
                    <Input
                      id="personalAdvInjury"
                      type="number"
                      step="0.01"
                      value={generalLiability.personalAdvInjury}
                      onChange={(e) =>
                        setGeneralLiability({
                          ...generalLiability,
                          personalAdvInjury: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="generalAggregate">General Aggregate $</Label>
                  <div className="flex">
                    <Input
                      id="generalAggregate"
                      type="number"
                      step="0.01"
                      value={generalLiability.generalAggregate}
                      onChange={(e) =>
                        setGeneralLiability({
                          ...generalLiability,
                          generalAggregate: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="productsCompOpAgg">Products- Comp/Op Agg $</Label>
                  <div className="flex">
                    <Input
                      id="productsCompOpAgg"
                      type="number"
                      step="0.01"
                      value={generalLiability.productsCompOpAgg}
                      onChange={(e) =>
                        setGeneralLiability({
                          ...generalLiability,
                          productsCompOpAgg: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium mb-2">Other Limits</h5>
                <div>
                  <Label htmlFor="otherOccurrence">Other Occurrence $</Label>
                  <div className="flex max-w-sm">
                    <Input
                      id="otherOccurrence"
                      type="number"
                      step="0.01"
                      value={generalLiability.otherOccurrence}
                      onChange={(e) =>
                        setGeneralLiability({
                          ...generalLiability,
                          otherOccurrence: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      case "Automobile Liability":
        return (
          <>
            <div>
              <Label className="block mb-2">Automobile Liability</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anyAuto"
                    checked={autoLiability.autoType.includes("Any Auto")}
                    onCheckedChange={() => toggleAutoType("Any Auto")}
                  />
                  <Label htmlFor="anyAuto">Any Auto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allOwnedAutos"
                    checked={autoLiability.autoType.includes("All Owned Autos")}
                    onCheckedChange={() => toggleAutoType("All Owned Autos")}
                  />
                  <Label htmlFor="allOwnedAutos">All Owned Autos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hiredAutos"
                    checked={autoLiability.autoType.includes("Hired Autos")}
                    onCheckedChange={() => toggleAutoType("Hired Autos")}
                  />
                  <Label htmlFor="hiredAutos">Hired Autos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="otherAutos1"
                    checked={autoLiability.autoType.includes("Other")}
                    onCheckedChange={() => toggleAutoType("Other")}
                  />
                  <Label htmlFor="otherAutos1">Other</Label>
                </div>
              </div>
            </div>

            {autoLiability.autoType.includes("Other") && (
              <div>
                <Label htmlFor="otherAutoDescription">Other Covered Auto Description</Label>
                <Input
                  id="otherAutoDescription"
                  value={autoLiability.otherAutoDescription}
                  onChange={(e) => setAutoLiability({ ...autoLiability, otherAutoDescription: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label className="block mb-2">Automobile Liability</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scheduledAutos"
                    checked={autoLiability.autoType.includes("Scheduled Autos")}
                    onCheckedChange={() => toggleAutoType("Scheduled Autos")}
                  />
                  <Label htmlFor="scheduledAutos">Scheduled Autos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nonOwnedAutos"
                    checked={autoLiability.autoType.includes("Non-Owned Autos")}
                    onCheckedChange={() => toggleAutoType("Non-Owned Autos")}
                  />
                  <Label htmlFor="nonOwnedAutos">Non-Owned Autos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="otherCoveredAuto"
                    checked={autoLiability.autoType.includes("Other covered Auto")}
                    onCheckedChange={() => toggleAutoType("Other covered Auto")}
                  />
                  <Label htmlFor="otherCoveredAuto">Other covered Auto</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="autoAdditionalInsured">Addl Insd</Label>
                <Select
                  value={autoLiability.additionalInsured ? "yes" : "no"}
                  onValueChange={(value) => setAutoLiability({ ...autoLiability, additionalInsured: value === "yes" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="autoWaiverOfSubrogation">Subr Wvd</Label>
                <Select
                  value={autoLiability.waiverOfSubrogation ? "yes" : "no"}
                  onValueChange={(value) =>
                    setAutoLiability({ ...autoLiability, waiverOfSubrogation: value === "yes" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="combinedSingleLimit">Combined Single Limit $</Label>
                <div className="flex">
                  <Input
                    id="combinedSingleLimit"
                    type="number"
                    step="0.01"
                    value={autoLiability.combinedSingleLimit}
                    onChange={(e) =>
                      setAutoLiability({
                        ...autoLiability,
                        combinedSingleLimit: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                </div>
              </div>
              <div>
                <Label htmlFor="bodilyInjuryPerPerson">Bodily Injury (Per Person) $</Label>
                <div className="flex">
                  <Input
                    id="bodilyInjuryPerPerson"
                    type="number"
                    step="0.01"
                    value={autoLiability.bodilyInjuryPerPerson}
                    onChange={(e) =>
                      setAutoLiability({
                        ...autoLiability,
                        bodilyInjuryPerPerson: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                </div>
              </div>
              <div>
                <Label htmlFor="bodilyInjuryPerAccident">Bodily Injury (Per Accident) $</Label>
                <div className="flex">
                  <Input
                    id="bodilyInjuryPerAccident"
                    type="number"
                    step="0.01"
                    value={autoLiability.bodilyInjuryPerAccident}
                    onChange={(e) =>
                      setAutoLiability({
                        ...autoLiability,
                        bodilyInjuryPerAccident: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                </div>
              </div>
              <div>
                <Label htmlFor="propertyDamage">Property Damage</Label>
                <div className="flex">
                  <Input
                    id="propertyDamage"
                    type="number"
                    step="0.01"
                    value={autoLiability.propertyDamage}
                    onChange={(e) =>
                      setAutoLiability({
                        ...autoLiability,
                        propertyDamage: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="otherDescription">Other Description</Label>
                <Input
                  id="otherDescription"
                  value={autoLiability.otherDescription}
                  onChange={(e) => setAutoLiability({ ...autoLiability, otherDescription: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="otherLimit">Other Limit</Label>
                <div className="flex">
                  <Input
                    id="otherLimit"
                    type="number"
                    step="0.01"
                    value={autoLiability.otherLimit}
                    onChange={(e) =>
                      setAutoLiability({ ...autoLiability, otherLimit: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                  <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="additionalInformation">Additional information</Label>
              <Textarea id="additionalInformation" rows={3} placeholder="Enter any additional information..." />
            </div>
          </>
        )
      case "Workers Compensation":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anyProprietorPartnerExecutiveOfficerMemberExcluded">
                  Any Proprietor/Partner/Executive/Officer/Member Excluded?
                </Label>
                <Select
                  value={workersCompensation.anyProprietorPartnerExecutiveOfficerMemberExcluded ? "yes" : "no"}
                  onValueChange={(value) =>
                    setWorkersCompensation({
                      ...workersCompensation,
                      anyProprietorPartnerExecutiveOfficerMemberExcluded: value === "yes",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="totalPayroll">Total payroll</Label>
                <div className="flex">
                  <Input
                    id="totalPayroll"
                    type="number"
                    step="0.01"
                    value={workersCompensation.totalPayroll}
                    onChange={(e) =>
                      setWorkersCompensation({
                        ...workersCompensation,
                        totalPayroll: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                </div>
              </div>
              <div>
                <Label htmlFor="numberOfFullTimeEmployees">Number of fulltime employees</Label>
                <Input
                  id="numberOfFullTimeEmployees"
                  type="number"
                  value={workersCompensation.numberOfFullTimeEmployees}
                  onChange={(e) =>
                    setWorkersCompensation({
                      ...workersCompensation,
                      numberOfFullTimeEmployees: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="numberOfPartTimeEmployees">Number of parttime employees</Label>
                <Input
                  id="numberOfPartTimeEmployees"
                  type="number"
                  value={workersCompensation.numberOfPartTimeEmployees}
                  onChange={(e) =>
                    setWorkersCompensation({
                      ...workersCompensation,
                      numberOfPartTimeEmployees: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subrWvd">Subr Wvd</Label>
                <Select
                  value={workersCompensation.subrWvd ? "yes" : "no"}
                  onValueChange={(value) =>
                    setWorkersCompensation({ ...workersCompensation, subrWvd: value === "yes" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="perStatute">Per Statute</Label>
                  <Select
                    value={workersCompensation.perStatute ? "yes" : "no"}
                    onValueChange={(value) =>
                      setWorkersCompensation({ ...workersCompensation, perStatute: value === "yes" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="otherLimits">Other</Label>
                  <Select
                    value={workersCompensation.otherLimits ? "yes" : "no"}
                    onValueChange={(value) =>
                      setWorkersCompensation({ ...workersCompensation, otherLimits: value === "yes" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fieldBox">Field Box</Label>
                <Textarea
                  id="fieldBox"
                  value={workersCompensation.fieldBox}
                  onChange={(e) => setWorkersCompensation({ ...workersCompensation, fieldBox: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="elEachAccident">E.L. Each Accident $</Label>
                  <div className="flex">
                    <Input
                      id="elEachAccident"
                      type="number"
                      step="0.01"
                      value={workersCompensation.elEachAccident}
                      onChange={(e) =>
                        setWorkersCompensation({
                          ...workersCompensation,
                          elEachAccident: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="elDiseaseEachEmployee">E.L. Disease- EA Employee $</Label>
                  <div className="flex">
                    <Input
                      id="elDiseaseEachEmployee"
                      type="number"
                      step="0.01"
                      value={workersCompensation.elDiseaseEachEmployee}
                      onChange={(e) =>
                        setWorkersCompensation({
                          ...workersCompensation,
                          elDiseaseEachEmployee: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="elDiseasePolicyLimit">E.L. Disease- Policy Limit $</Label>
                  <div className="flex">
                    <Input
                      id="elDiseasePolicyLimit"
                      type="number"
                      step="0.01"
                      value={workersCompensation.elDiseasePolicyLimit}
                      onChange={(e) =>
                        setWorkersCompensation({
                          ...workersCompensation,
                          elDiseasePolicyLimit: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="bg-gray-100 px-3 flex items-center border border-l-0 rounded-r-md">USD</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      case "Commercial Property":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buildingLimit">Building Limit $</Label>
                <Input
                  id="buildingLimit"
                  type="number"
                  step="0.01"
                  value={commercialProperty.buildingLimit}
                  onChange={(e) =>
                    setCommercialProperty({
                      ...commercialProperty,
                      buildingLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="businessPersonalPropertyLimit">Business Personal Property Limit $</Label>
                <Input
                  id="businessPersonalPropertyLimit"
                  type="number"
                  step="0.01"
                  value={commercialProperty.businessPersonalPropertyLimit}
                  onChange={(e) =>
                    setCommercialProperty({
                      ...commercialProperty,
                      businessPersonalPropertyLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lossOfIncomeLimit">Loss of Income Limit $</Label>
                <Input
                  id="lossOfIncomeLimit"
                  type="number"
                  step="0.01"
                  value={commercialProperty.lossOfIncomeLimit}
                  onChange={(e) =>
                    setCommercialProperty({
                      ...commercialProperty,
                      lossOfIncomeLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="extraExpenseLimit">Extra Expense Limit $</Label>
                <Input
                  id="extraExpenseLimit"
                  type="number"
                  step="0.01"
                  value={commercialProperty.extraExpenseLimit}
                  onChange={(e) =>
                    setCommercialProperty({
                      ...commercialProperty,
                      extraExpenseLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipmentBreakdownLimit">Equipment Breakdown Limit $</Label>
                <Input
                  id="equipmentBreakdownLimit"
                  type="number"
                  step="0.01"
                  value={commercialProperty.equipmentBreakdownLimit}
                  onChange={(e) =>
                    setCommercialProperty({
                      ...commercialProperty,
                      equipmentBreakdownLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="deductible">Deductible $</Label>
                <Input
                  id="deductible"
                  type="number"
                  step="0.01"
                  value={commercialProperty.deductible}
                  onChange={(e) =>
                    setCommercialProperty({
                      ...commercialProperty,
                      deductible: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="coinsurancePercentage">Coinsurance Percentage %</Label>
              <Input
                id="coinsurancePercentage"
                type="number"
                value={commercialProperty.coinsurancePercentage}
                onChange={(e) =>
                  setCommercialProperty({
                    ...commercialProperty,
                    coinsurancePercentage: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sprinklerLeakageCoverage"
                  checked={commercialProperty.sprinklerLeakageCoverage}
                  onCheckedChange={(checked) =>
                    setCommercialProperty({ ...commercialProperty, sprinklerLeakageCoverage: !!checked })
                  }
                />
                <Label htmlFor="sprinklerLeakageCoverage">Sprinkler Leakage Coverage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="floodCoverage"
                  checked={commercialProperty.floodCoverage}
                  onCheckedChange={(checked) =>
                    setCommercialProperty({ ...commercialProperty, floodCoverage: !!checked })
                  }
                />
                <Label htmlFor="floodCoverage">Flood Coverage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="earthquakeCoverage"
                  checked={commercialProperty.earthquakeCoverage}
                  onCheckedChange={(checked) =>
                    setCommercialProperty({ ...commercialProperty, earthquakeCoverage: !!checked })
                  }
                />
                <Label htmlFor="earthquakeCoverage">Earthquake Coverage</Label>
              </div>
            </div>
          </>
        )
      case "NEMT":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="combinedSingleLimit">Combined Single Limit $</Label>
                <Input
                  id="combinedSingleLimit"
                  type="number"
                  step="0.01"
                  value={nemtLiability.combinedSingleLimit}
                  onChange={(e) =>
                    setNEMTLiability({
                      ...nemtLiability,
                      combinedSingleLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="bodilyInjuryPerPerson">Bodily Injury (Per Person) $</Label>
                <Input
                  id="bodilyInjuryPerPerson"
                  type="number"
                  step="0.01"
                  value={nemtLiability.bodilyInjuryPerPerson}
                  onChange={(e) =>
                    setNEMTLiability({
                      ...nemtLiability,
                      bodilyInjuryPerPerson: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bodilyInjuryPerAccident">Bodily Injury (Per Accident) $</Label>
                <Input
                  id="bodilyInjuryPerAccident"
                  type="number"
                  step="0.01"
                  value={nemtLiability.bodilyInjuryPerAccident}
                  onChange={(e) =>
                    setNEMTLiability({
                      ...nemtLiability,
                      bodilyInjuryPerAccident: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="propertyDamage">Property Damage $</Label>
                <Input
                  id="propertyDamage"
                  type="number"
                  step="0.01"
                  value={nemtLiability.propertyDamage}
                  onChange={(e) =>
                    setNEMTLiability({
                      ...nemtLiability,
                      propertyDamage: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uninsuredMotoristBodilyInjury">Uninsured Motorist Bodily Injury $</Label>
                <Input
                  id="uninsuredMotoristBodilyInjury"
                  type="number"
                  step="0.01"
                  value={nemtLiability.uninsuredMotoristBodilyInjury}
                  onChange={(e) =>
                    setNEMTLiability({
                      ...nemtLiability,
                      uninsuredMotoristBodilyInjury: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="underinsuredMotoristBodilyInjury">Underinsured Motorist Bodily Injury $</Label>
                <Input
                  id="underinsuredMotoristBodilyInjury"
                  type="number"
                  step="0.01"
                  value={nemtLiability.underinsuredMotoristBodilyInjury}
                  onChange={(e) =>
                    setNEMTLiability({
                      ...nemtLiability,
                      underinsuredMotoristBodilyInjury: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="medicalPayments">Medical Payments $</Label>
              <Input
                id="medicalPayments"
                type="number"
                step="0.01"
                value={nemtLiability.medicalPayments}
                onChange={(e) =>
                  setNEMTLiability({
                    ...nemtLiability,
                    medicalPayments: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </>
        )
      case "Cyber Liability":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cyberLiabilityLimit">Cyber Liability Limit $</Label>
                <Input
                  id="cyberLiabilityLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.cyberLiabilityLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      cyberLiabilityLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="breachResponseCostLimit">Breach Response Cost Limit $</Label>
                <Input
                  id="breachResponseCostLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.breachResponseCostLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      breachResponseCostLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="regulatoryDefenseAndPenaltiesLimit">Regulatory Defense and Penalties Limit $</Label>
                <Input
                  id="regulatoryDefenseAndPenaltiesLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.regulatoryDefenseAndPenaltiesLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      regulatoryDefenseAndPenaltiesLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="cyberExtortionThreatLimit">Cyber Extortion Threat Limit $</Label>
                <Input
                  id="cyberExtortionThreatLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.cyberExtortionThreatLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      cyberExtortionThreatLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessInterruptionLimit">Business Interruption Limit $</Label>
                <Input
                  id="businessInterruptionLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.businessInterruptionLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      businessInterruptionLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="dataRecoveryCostLimit">Data Recovery Cost Limit $</Label>
                <Input
                  id="dataRecoveryCostLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.dataRecoveryCostLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      dataRecoveryCostLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notificationCostLimit">Notification Cost Limit $</Label>
                <Input
                  id="notificationCostLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.notificationCostLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      notificationCostLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="creditMonitoringCostLimit">Credit Monitoring Cost Limit $</Label>
                <Input
                  id="creditMonitoringCostLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.creditMonitoringCostLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      creditMonitoringCostLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publicRelationsExpenseLimit">Public Relations Expense Limit $</Label>
                <Input
                  id="publicRelationsExpenseLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.publicRelationsExpenseLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      publicRelationsExpenseLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="forensicAccountingExpenseLimit">Forensic Accounting Expense Limit $</Label>
                <Input
                  id="forensicAccountingExpenseLimit"
                  type="number"
                  step="0.01"
                  value={cyberLiability.forensicAccountingExpenseLimit}
                  onChange={(e) =>
                    setCyberLiability({
                      ...cyberLiability,
                      forensicAccountingExpenseLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deductible">Deductible $</Label>
              <Input
                id="deductible"
                type="number"
                step="0.01"
                value={cyberLiability.deductible}
                onChange={(e) =>
                  setCyberLiability({
                    ...cyberLiability,
                    deductible: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </>
        )
      case "Public Auto":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="combinedSingleLimit">Combined Single Limit $</Label>
                <Input
                  id="combinedSingleLimit"
                  type="number"
                  step="0.01"
                  value={publicAutoLiability.combinedSingleLimit}
                  onChange={(e) =>
                    setPublicAutoLiability({
                      ...publicAutoLiability,
                      combinedSingleLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="bodilyInjuryPerPerson">Bodily Injury (Per Person) $</Label>
                <Input
                  id="bodilyInjuryPerPerson"
                  type="number"
                  step="0.01"
                  value={publicAutoLiability.bodilyInjuryPerPerson}
                  onChange={(e) =>
                    setPublicAutoLiability({
                      ...publicAutoLiability,
                      bodilyInjuryPerPerson: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bodilyInjuryPerAccident">Bodily Injury (Per Accident) $</Label>
                <Input
                  id="bodilyInjuryPerAccident"
                  type="number"
                  step="0.01"
                  value={publicAutoLiability.bodilyInjuryPerAccident}
                  onChange={(e) =>
                    setPublicAutoLiability({
                      ...publicAutoLiability,
                      bodilyInjuryPerAccident: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="propertyDamage">Property Damage $</Label>
                <Input
                  id="propertyDamage"
                  type="number"
                  step="0.01"
                  value={publicAutoLiability.propertyDamage}
                  onChange={(e) =>
                    setPublicAutoLiability({
                      ...publicAutoLiability,
                      propertyDamage: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uninsuredMotoristBodilyInjury">Uninsured Motorist Bodily Injury $</Label>
                <Input
                  id="uninsuredMotoristBodilyInjury"
                  type="number"
                  step="0.01"
                  value={publicAutoLiability.uninsuredMotoristBodilyInjury}
                  onChange={(e) =>
                    setPublicAutoLiability({
                      ...publicAutoLiability,
                      uninsuredMotoristBodilyInjury: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="underinsuredMotoristBodilyInjury">Underinsured Motorist Bodily Injury $</Label>
                <Input
                  id="underinsuredMotoristBodilyInjury"
                  type="number"
                  step="0.01"
                  value={publicAutoLiability.underinsuredMotoristBodilyInjury}
                  onChange={(e) =>
                    setPublicAutoLiability({
                      ...publicAutoLiability,
                      underinsuredMotoristBodilyInjury: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="medicalPayments">Medical Payments $</Label>
              <Input
                id="medicalPayments"
                type="number"
                step="0.01"
                value={publicAutoLiability.medicalPayments}
                onChange={(e) =>
                  setPublicAutoLiability({
                    ...publicAutoLiability,
                    medicalPayments: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </>
        )
      case "Umbrella/Excess":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eachOccurrenceLimit">Each Occurrence Limit $</Label>
                <Input
                  id="eachOccurrenceLimit"
                  type="number"
                  step="0.01"
                  value={umbrellaExcessLiability.eachOccurrenceLimit}
                  onChange={(e) =>
                    setUmbrellaExcessLiability({
                      ...umbrellaExcessLiability,
                      eachOccurrenceLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="generalAggregateLimit">General Aggregate Limit $</Label>
                <Input
                  id="generalAggregateLimit"
                  type="number"
                  step="0.01"
                  value={umbrellaExcessLiability.generalAggregateLimit}
                  onChange={(e) =>
                    setUmbrellaExcessLiability({
                      ...umbrellaExcessLiability,
                      generalAggregateLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="selfInsuredRetention">Self-Insured Retention $</Label>
              <Input
                id="selfInsuredRetention"
                type="number"
                step="0.01"
                value={umbrellaExcessLiability.selfInsuredRetention}
                onChange={(e) =>
                  setUmbrellaExcessLiability({
                    ...umbrellaExcessLiability,
                    selfInsuredRetention: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </>
        )
      case "Professional Liability":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eachClaimLimit">Each Claim Limit $</Label>
                <Input
                  id="eachClaimLimit"
                  type="number"
                  step="0.01"
                  value={professionalLiability.eachClaimLimit}
                  onChange={(e) =>
                    setProfessionalLiability({
                      ...professionalLiability,
                      eachClaimLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="aggregateLimit">Aggregate Limit $</Label>
                <Input
                  id="aggregateLimit"
                  type="number"
                  step="0.01"
                  value={professionalLiability.aggregateLimit}
                  onChange={(e) =>
                    setProfessionalLiability({
                      ...professionalLiability,
                      aggregateLimit: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deductible">Deductible $</Label>
                <Input
                  id="deductible"
                  type="number"
                  step="0.01"
                  value={professionalLiability.deductible}
                  onChange={(e) =>
                    setProfessionalLiability({
                      ...professionalLiability,
                      deductible: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="retroactiveDate">Retroactive Date</Label>
                <Input
                  id="retroactiveDate"
                  type="date"
                  value={professionalLiability.retroactiveDate}
                  onChange={(e) =>
                    setProfessionalLiability({ ...professionalLiability, retroactiveDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="priorActsCoverage"
                checked={professionalLiability.priorActsCoverage}
                onCheckedChange={(checked) =>
                  setProfessionalLiability({ ...professionalLiability, priorActsCoverage: !!checked })
                }
              />
              <Label htmlFor="priorActsCoverage">Prior Acts Coverage</Label>
            </div>
          </>
        )
      default:
        return <p>No specific form available for this policy type.</p>
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Renewal</h1>
        <p className="text-gray-600">Comprehensive renewal management with multiple policies</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="quote">Quote Info</TabsTrigger>
            <TabsTrigger value="client">Client Info</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="coverages">Coverages</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles/Drivers</TabsTrigger>
            <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
          </TabsList>

          {/* Quote Information Tab */}
          <TabsContent value="quote">
            <Card>
              <CardHeader>
                <CardTitle>Quote Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quoteStatus">Quote Status</Label>
                    <Select
                      value={quoteInfo.status}
                      onValueChange={(value) => setQuoteInfo({ ...quoteInfo, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unsaved">Unsaved</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="bound">Bound</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quoteDate">Date</Label>
                    <Input
                      id="quoteDate"
                      type="date"
                      value={quoteInfo.date}
                      onChange={(e) => setQuoteInfo({ ...quoteInfo, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="broker">Broker</Label>
                    <Select
                      value={quoteInfo.broker}
                      onValueChange={(value) => setQuoteInfo({ ...quoteInfo, broker: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select broker" />
                      </SelectTrigger>
                      <SelectContent>
                        {brokers.map((broker) => (
                          <SelectItem key={broker} value={broker}>
                            {broker}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Information Tab */}
          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Label>Customer Type</Label>
                    <RadioGroup
                      value={clientInfo.customerType}
                      onValueChange={(value) => setClientInfo({ ...clientInfo, customerType: value })}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company">Company</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual">Individual</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="relative w-1/3">
                    <Label htmlFor="customerSearch">Search for customer</Label>
                    <div className="relative">
                      <Input id="customerSearch" placeholder="Search..." />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="insuredName">Name *</Label>
                    <Input
                      id="insuredName"
                      value={clientInfo.insuredName}
                      onChange={(e) => setClientInfo({ ...clientInfo, insuredName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="idCode">ID code / reg no</Label>
                    <Input
                      id="idCode"
                      value={clientInfo.idCode}
                      onChange={(e) => setClientInfo({ ...clientInfo, idCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">E-mail address</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientInfo.clientEmail}
                      onChange={(e) => setClientInfo({ ...clientInfo, clientEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input
                      id="clientPhone"
                      value={clientInfo.clientPhone}
                      onChange={(e) => setClientInfo({ ...clientInfo, clientPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobilePhone">Mobile phone</Label>
                    <Input
                      id="mobilePhone"
                      value={clientInfo.mobilePhone}
                      onChange={(e) => setClientInfo({ ...clientInfo, mobilePhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="renewalDate">Renewal Date *</Label>
                    <Input
                      id="renewalDate"
                      type="date"
                      value={clientInfo.renewalDate}
                      onChange={(e) => setClientInfo({ ...clientInfo, renewalDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-4">Contact Person</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName">Contact person name</Label>
                      <Input
                        id="contactName"
                        value={contactPerson.name}
                        onChange={(e) => setContactPerson({ ...contactPerson, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">E-mail address</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactPerson.email}
                        onChange={(e) => setContactPerson({ ...contactPerson, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        value={contactPerson.phone}
                        onChange={(e) => setContactPerson({ ...contactPerson, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactMobile">Mobile phone</Label>
                      <Input
                        id="contactMobile"
                        value={contactPerson.mobilePhone}
                        onChange={(e) => setContactPerson({ ...contactPerson, mobilePhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-4">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        value={clientInfo.street}
                        onChange={(e) => setClientInfo({ ...clientInfo, street: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP code</Label>
                      <Input
                        id="zipCode"
                        value={clientInfo.zipCode}
                        onChange={(e) => setClientInfo({ ...clientInfo, zipCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={clientInfo.city}
                        onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={clientInfo.state}
                        onValueChange={(value) => setClientInfo({ ...clientInfo, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={clientInfo.country}
                        onValueChange={(value) => setClientInfo({ ...clientInfo, country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={clientInfo.notes}
                    onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <div className="space-y-4">
              {policies.map((policy, index) => (
                <Card key={policy.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>
                        Policy #{index + 1}: {policy.policyType || "New Policy"}
                      </CardTitle>
                      <div>
                        <Button variant="destructive" size="icon" onClick={() => removePolicy(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`policyType-${index}`}>Policy Type</Label>
                        <Select
                          value={policy.policyType}
                          onValueChange={(value) => updatePolicy(index, "policyType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a policy type" />
                          </SelectTrigger>
                          <SelectContent>
                            {policyTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`policyNumber-${index}`}>Policy Number</Label>
                        <Input
                          id={`policyNumber-${index}`}
                          value={policy.policyNumber}
                          onChange={(e) => updatePolicy(index, "policyNumber", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`effectiveDate-${index}`}>Effective Date</Label>
                        <Input
                          id={`effectiveDate-${index}`}
                          type="date"
                          value={policy.effectiveDate}
                          onChange={(e) => updatePolicy(index, "effectiveDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`expirationDate-${index}`}>Expiration Date</Label>
                        <Input
                          id={`expirationDate-${index}`}
                          type="date"
                          value={policy.expirationDate}
                          onChange={(e) => updatePolicy(index, "expirationDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`carrier-${index}`}>Carrier</Label>
                        <Input
                          id={`carrier-${index}`}
                          value={policy.carrier}
                          onChange={(e) => updatePolicy(index, "carrier", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`premium-${index}`}>Premium</Label>
                        <Input
                          id={`premium-${index}`}
                          type="number"
                          value={policy.premium}
                          onChange={(e) => updatePolicy(index, "premium", Number.parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button type="button" onClick={addPolicy}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>

              {policies.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Premium:</span>
                      <span className="text-xl font-bold">${totalPremium.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Coverages Tab */}
          <TabsContent value="coverages">
            <Card>
              <CardHeader>
                <CardTitle>Product Coverage Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {policies.length > 0 ? (
                  <>
                    <Label htmlFor="policyType">Select Policy Type</Label>
                    <Select
                      value={policies[activePolicyIndex]?.policyType}
                      onValueChange={(value) => {
                        updatePolicy(activePolicyIndex, "policyType", value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a policy type" />
                      </SelectTrigger>
                      <SelectContent>
                        {policyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {policies[activePolicyIndex]?.policyType &&
                      renderCoverageForm(policies[activePolicyIndex].policyType)}
                  </>
                ) : (
                  <p>Please add a policy to manage coverages.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles/Drivers Tab */}
          <TabsContent value="vehicles">
            {policies.length > 0 ? (
              <>
                {isAutoLine(policies[activePolicyIndex].policyType) ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Vehicles for Policy #{activePolicyIndex + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {policies[activePolicyIndex]?.vehicles.map((vehicle, index) => (
                          <Card key={vehicle.id}>
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <CardTitle>Vehicle #{index + 1}</CardTitle>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removeVehicle(activePolicyIndex, index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`vehicleVin-${index}`}>VIN</Label>
                                  <Input
                                    id={`vehicleVin-${index}`}
                                    value={vehicle.vin}
                                    onChange={(e) => updateVehicle(activePolicyIndex, index, "vin", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`vehicleYear-${index}`}>Year</Label>
                                  <Input
                                    id={`vehicleYear-${index}`}
                                    value={vehicle.year}
                                    onChange={(e) => updateVehicle(activePolicyIndex, index, "year", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`vehicleMake-${index}`}>Make</Label>
                                  <Input
                                    id={`vehicleMake-${index}`}
                                    value={vehicle.make}
                                    onChange={(e) => updateVehicle(activePolicyIndex, index, "make", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`vehicleModel-${index}`}>Model</Label>
                                  <Input
                                    id={`vehicleModel-${index}`}
                                    value={vehicle.model}
                                    onChange={(e) => updateVehicle(activePolicyIndex, index, "model", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`vehicleGaragingAddress-${index}`}>Garaging Address</Label>
                                  <Input
                                    id={`vehicleGaragingAddress-${index}`}
                                    value={vehicle.garagingAddress}
                                    onChange={(e) =>
                                      updateVehicle(activePolicyIndex, index, "garagingAddress", e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`vehicleRadius-${index}`}>Radius</Label>
                                  <Input
                                    id={`vehicleRadius-${index}`}
                                    value={vehicle.radius}
                                    onChange={(e) => updateVehicle(activePolicyIndex, index, "radius", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`vehicleTiv-${index}`}>TIV</Label>
                                  <Input
                                    id={`vehicleTiv-${index}`}
                                    type="number"
                                    value={vehicle.tiv}
                                    onChange={(e) =>
                                      updateVehicle(activePolicyIndex, index, "tiv", Number.parseFloat(e.target.value))
                                    }
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button type="button" onClick={() => addVehicle(activePolicyIndex)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Vehicle
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Drivers for Policy #{activePolicyIndex + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {policies[activePolicyIndex]?.drivers.map((driver, index) => (
                          <Card key={driver.id}>
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <CardTitle>Driver #{index + 1}</CardTitle>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removeDriver(activePolicyIndex, index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`driverName-${index}`}>Name</Label>
                                  <Input
                                    id={`driverName-${index}`}
                                    value={driver.name}
                                    onChange={(e) => updateDriver(activePolicyIndex, index, "name", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`driverDob-${index}`}>Date of Birth</Label>
                                  <Input
                                    id={`driverDob-${index}`}
                                    type="date"
                                    value={driver.dob}
                                    onChange={(e) => updateDriver(activePolicyIndex, index, "dob", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`driverLicenseNumber-${index}`}>License Number</Label>
                                  <Input
                                    id={`driverLicenseNumber-${index}`}
                                    value={driver.licenseNumber}
                                    onChange={(e) =>
                                      updateDriver(activePolicyIndex, index, "licenseNumber", e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`driverExperience-${index}`}>Experience</Label>
                                  <Input
                                    id={`driverExperience-${index}`}
                                    value={driver.experience}
                                    onChange={(e) =>
                                      updateDriver(activePolicyIndex, index, "experience", e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`driverViolations-${index}`}>Violations</Label>
                                  <Select
                                    value={String(driver.violations)}
                                    onValueChange={(value) =>
                                      updateDriver(activePolicyIndex, index, "violations", value === "true")
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="true">Yes</SelectItem>
                                      <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor={`driverAccidents-${index}`}>Accidents</Label>
                                  <Select
                                    value={String(driver.accidents)}
                                    onValueChange={(value) =>
                                      updateDriver(activePolicyIndex, index, "accidents", value === "true")
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="true">Yes</SelectItem>
                                      <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button type="button" onClick={() => addDriver(activePolicyIndex)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Driver
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <p>This policy type does not require vehicle/driver information.</p>
                )}
              </>
            ) : (
              <p>Please add a policy to manage vehicles and drivers.</p>
            )}
          </TabsContent>

          {/* Endorsements Tab */}
          <TabsContent value="endorsements">
            {policies.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Endorsements for Policy #{activePolicyIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {endorsementsByLine[policies[activePolicyIndex].policyType]?.map((endorsement) => (
                      <div key={endorsement} className="flex items-center space-x-2">
                        <Checkbox
                          id={`endorsement-${endorsement}`}
                          checked={policies[activePolicyIndex].endorsements.includes(endorsement)}
                          onCheckedChange={() => toggleEndorsement(activePolicyIndex, endorsement)}
                        />
                        <Label htmlFor={`endorsement-${endorsement}`}>{endorsement}</Label>
                      </div>
                    ))}
                  </div>

                  {policies[activePolicyIndex].endorsements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Selected Endorsements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {policies[activePolicyIndex].endorsements.map((endorsement) => (
                          <Badge key={endorsement} variant="secondary">
                            {endorsement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <p>Please add a policy to manage endorsements.</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Submit Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} variant="outline">
              {isSubmitting ? "Saving..." : "Save Draft"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Renewal"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
