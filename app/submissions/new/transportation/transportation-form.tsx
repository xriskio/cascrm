"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitApplication } from "@/app/actions/submit-application"
import { US_STATES } from "@/lib/states"
import { AlertCircle, Loader2 } from "lucide-react"

export default function TransportationForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("insured")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sameAddress, setSameAddress] = useState(false)
  const [dataSharing, setDataSharing] = useState("eld")
  const [ineligibleOps, setIneligibleOps] = useState("no")
  const [personalUse, setPersonalUse] = useState("no")
  const [refrigeration, setRefrigeration] = useState("no")
  const [federalFilings, setFederalFilings] = useState("no")
  const [stateFilings, setStateFilings] = useState("no")
  const [priorCancellation, setPriorCancellation] = useState("no")
  const [bankruptcy, setBankruptcy] = useState("no")
  const [displayLosses, setDisplayLosses] = useState("no")
  const [operationTypes, setOperationTypes] = useState<string[]>([])
  const [waiverSubrogation, setWaiverSubrogation] = useState("no")
  const [primaryNonContribTGL, setPrimaryNonContribTGL] = useState("no")
  const [primaryNonContribAL, setPrimaryNonContribAL] = useState("no")
  const [apdTowing, setApdTowing] = useState("yes")
  const [driverEligibility, setDriverEligibility] = useState("covered")
  const [trailerOwnership, setTrailerOwnership] = useState("owned")

  const [vehicles, setVehicles] = useState<any[]>([{}])
  const [trailers, setTrailers] = useState<any[]>([{}])
  const [drivers, setDrivers] = useState<any[]>([{}])
  const [bulkVehiclesText, setBulkVehiclesText] = useState("")
  const [bulkTrailersText, setBulkTrailersText] = useState("")
  const [bulkDriversText, setBulkDriversText] = useState("")

  const generateSubmissionNumber = () => {
    return `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleNextTab = () => {
    const tabs = [
      "insured",
      "limits",
      "operations",
      "radius",
      "cargo",
      "terminals",
      "vehicles",
      "trailers",
      "drivers",
      "losses",
      "summary",
    ]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const handlePreviousTab = () => {
    const tabs = [
      "insured",
      "limits",
      "operations",
      "radius",
      "cargo",
      "terminals",
      "vehicles",
      "trailers",
      "drivers",
      "losses",
      "summary",
    ]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  const handleOperationTypeChange = (type: string) => {
    setOperationTypes((current) => (current.includes(type) ? current.filter((t) => t !== type) : [...current, type]))
  }

  const addVehicle = () => {
    if (vehicles.length < 10) {
      setVehicles([...vehicles, {}])
    }
  }

  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((_, i) => i !== index))
    }
  }

  const addTrailer = () => {
    if (trailers.length < 10) {
      setTrailers([...trailers, {}])
    }
  }

  const removeTrailer = (index: number) => {
    if (trailers.length > 1) {
      setTrailers(trailers.filter((_, i) => i !== index))
    }
  }

  const addDriver = () => {
    if (drivers.length < 10) {
      setDrivers([...drivers, {}])
    }
  }

  const removeDriver = (index: number) => {
    if (drivers.length > 1) {
      setDrivers(drivers.filter((_, i) => i !== index))
    }
  }

  const handleBulkVehiclesImport = () => {
    try {
      const lines = bulkVehiclesText.trim().split("\n")
      const newVehicles = lines.slice(0, 10).map((line) => {
        const parts = line.split(",")
        return {
          vin: parts[0]?.trim() || "",
          year: parts[1]?.trim() || "",
          make: parts[2]?.trim() || "",
          model: parts[3]?.trim() || "",
          value: parts[4]?.trim() || "",
        }
      })
      setVehicles(newVehicles.length > 0 ? newVehicles : [{}])
      setBulkVehiclesText("")
    } catch (error) {
      console.error("Error parsing bulk vehicles:", error)
    }
  }

  const handleBulkTrailersImport = () => {
    try {
      const lines = bulkTrailersText.trim().split("\n")
      const newTrailers = lines.slice(0, 10).map((line) => {
        const parts = line.split(",")
        return {
          vin: parts[0]?.trim() || "",
          year: parts[1]?.trim() || "",
          make: parts[2]?.trim() || "",
          model: parts[3]?.trim() || "",
          value: parts[4]?.trim() || "",
        }
      })
      setTrailers(newTrailers.length > 0 ? newTrailers : [{}])
      setBulkTrailersText("")
    } catch (error) {
      console.error("Error parsing bulk trailers:", error)
    }
  }

  const handleBulkDriversImport = () => {
    try {
      const lines = bulkDriversText.trim().split("\n")
      const newDrivers = lines.slice(0, 10).map((line) => {
        const parts = line.split(",")
        return {
          firstName: parts[0]?.trim() || "",
          lastName: parts[1]?.trim() || "",
          licenseState: parts[2]?.trim() || "",
          licenseNumber: parts[3]?.trim() || "",
        }
      })
      setDrivers(newDrivers.length > 0 ? newDrivers : [{}])
      setBulkDriversText("")
    } catch (error) {
      console.error("Error parsing bulk drivers:", error)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      const submissionNumber = generateSubmissionNumber()

      // Convert FormData to a regular object
      const formDataObj: Record<string, any> = {}
      formData.forEach((value, key) => {
        formDataObj[key] = value
      })

      // Add operation types from state
      formDataObj.operationTypes = operationTypes
      formDataObj.vehicles = vehicles
      formDataObj.trailers = trailers
      formDataObj.drivers = drivers

      // Create the submission data object
      const submissionData = {
        submission_number: submissionNumber,
        insurance_type: "transportation",
        status: "pending",
        created_at: new Date().toISOString(),
        form_data: formDataObj,
      }

      const result = await submitApplication(submissionData)

      if (result.success) {
        router.push(`/submissions/success?submissionNumber=${result.submissionNumber}&submissionId=${result.submissionId}`)
      } else {
        setError(`Submission failed: ${result.error || "Unknown error"}`)
        setIsSubmitting(false)
      }
    } catch (err) {
      setError(`Error submitting form: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 mb-6">
          <TabsTrigger value="insured">Insured</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="radius">Radius</TabsTrigger>
          <TabsTrigger value="cargo">Cargo</TabsTrigger>
          <TabsTrigger value="terminals">Terminals</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="trailers">Trailers</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="losses">Losses</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Insured Information Tab */}
        <TabsContent value="insured">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="dotNumber">DOT Number</Label>
                    <Input id="dotNumber" name="dotNumber" placeholder="DOT Number" />
                    <p className="text-sm text-gray-500 mt-1">
                      The "DOT Number" issued by the Federal Motor Carrier Safety Administration
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Time operating in your name</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Input id="operatingYears" name="operatingYears" type="number" min="0" placeholder="Years" />
                      </div>
                      <div>
                        <Input
                          id="operatingMonths"
                          name="operatingMonths"
                          type="number"
                          min="0"
                          max="11"
                          placeholder="Months"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="insuredName">Insured Name</Label>
                    <Input id="insuredName" name="insuredName" placeholder="Legal Business Name" required />
                  </div>
                  <div>
                    <Label htmlFor="dba">Doing Business As ("DBA")</Label>
                    <Input id="dba" name="dba" placeholder="DBA (optional)" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Mailing Address</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="mailingAddress">Address</Label>
                      <Input id="mailingAddress" name="mailingAddress" placeholder="Street Address" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="mailingCity">City</Label>
                        <Input id="mailingCity" name="mailingCity" placeholder="City" required />
                      </div>
                      <div>
                        <Label htmlFor="mailingState">State</Label>
                        <Select name="mailingState" defaultValue="">
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mailingZip">ZIP</Label>
                        <Input id="mailingZip" name="mailingZip" placeholder="ZIP Code" required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAddress"
                    checked={sameAddress}
                    onCheckedChange={(checked) => setSameAddress(checked === true)}
                  />
                  <Label
                    htmlFor="sameAddress"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Business Garaging Address is same as Mailing Address
                  </Label>
                </div>

                {!sameAddress && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Business Garaging Address (Must match SAFER)</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="garagingAddress">Address</Label>
                        <Input id="garagingAddress" name="garagingAddress" placeholder="Street Address" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="garagingCity">City</Label>
                          <Input id="garagingCity" name="garagingCity" placeholder="City" />
                        </div>
                        <div>
                          <Label htmlFor="garagingState">State</Label>
                          <Select name="garagingState" defaultValue="">
                            <SelectTrigger>
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="garagingZip">ZIP</Label>
                          <Input id="garagingZip" name="garagingZip" placeholder="ZIP Code" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="numberOfTrucks">Number of Trucks</Label>
                    <Input id="numberOfTrucks" name="numberOfTrucks" type="number" min="1" defaultValue="1" required />
                  </div>
                  <div>
                    <Label htmlFor="totalValueTrucks">Total Value of Trucks</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <Input
                        id="totalValueTrucks"
                        name="totalValueTrucks"
                        type="number"
                        min="0"
                        className="pl-6"
                        placeholder="What would the vehicles sell for today?"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="numberOfTrailers">Number of Trailers</Label>
                    <Input id="numberOfTrailers" name="numberOfTrailers" type="number" min="0" defaultValue="0" />
                  </div>
                  <div>
                    <Label htmlFor="totalValueTrailers">Total Value of Trailers</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <Input
                        id="totalValueTrailers"
                        name="totalValueTrailers"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className="pl-6"
                        placeholder="What would the trailers sell for today?"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button type="button" onClick={handleNextTab}>
                  Next: Limits
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Application Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm mb-4">
                      Please review your application before submitting. Once submitted, a team member will review your
                      submission as soon as possible.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Important Notes:</h4>
                        <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                          <li>Quotes are based on the digital application, not attachments you upload</li>
                          <li>We can quote "subject to" receipt of additional information</li>
                          <li>Dash Camera and Coaching program is mandatory for all Auto Liability programs</li>
                          <li>
                            Equipment must be activated within 10 days of delivery tracking date or subject to automatic
                            cancellation
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous: Losses
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
