"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { submitApplication } from "@/app/actions/submit-application"
import { toast } from "@/hooks/use-toast"

export function PersonalAutoForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Applicant Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    licenseNumber: "",
    licenseState: "",

    // Address Information
    address: "",
    city: "",
    state: "",
    zipCode: "",

    // Vehicle Information
    vehicleYear: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleVin: "",
    vehicleUsage: "",
    annualMileage: "",

    // Coverage Information
    liabilityLimits: "",
    comprehensiveDeductible: "",
    collisionDeductible: "",

    // Additional Information
    previousInsurance: false,
    previousCarrier: "",
    accidentsViolations: "",
    additionalDrivers: "",
    specialRequests: "",
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate submission number
      const generateSubmissionNumber = () => {
        return `SUB-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`
      }

      const submissionNumber = generateSubmissionNumber()

      // Create submission data matching database schema
      const submissionData = {
        submission_number: submissionNumber,
        insurance_type: "personal-auto",
        status: "pending",
        created_at: new Date().toISOString(),
        form_data: formData,
      }

      const result = await submitApplication(submissionData)

      if (result.success) {
        toast({
          title: "Submission Created",
          description: `Personal Auto submission #${result.submissionNumber} has been created successfully.`,
        })
        router.push(`/submissions/success?submissionNumber=${result.submissionNumber}&submissionId=${result.submissionId}`)
      } else {
        throw new Error(result.error || "Failed to create submission")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Applicant Information */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="licenseNumber">License Number *</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AL">Alabama</SelectItem>
                <SelectItem value="AK">Alaska</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                <SelectItem value="AR">Arkansas</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="CO">Colorado</SelectItem>
                <SelectItem value="CT">Connecticut</SelectItem>
                <SelectItem value="DE">Delaware</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="GA">Georgia</SelectItem>
                {/* Add more states as needed */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vehicleYear">Year *</Label>
            <Input
              id="vehicleYear"
              value={formData.vehicleYear}
              onChange={(e) => handleInputChange("vehicleYear", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="vehicleMake">Make *</Label>
            <Input
              id="vehicleMake"
              value={formData.vehicleMake}
              onChange={(e) => handleInputChange("vehicleMake", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="vehicleModel">Model *</Label>
            <Input
              id="vehicleModel"
              value={formData.vehicleModel}
              onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="vehicleVin">VIN *</Label>
            <Input
              id="vehicleVin"
              value={formData.vehicleVin}
              onChange={(e) => handleInputChange("vehicleVin", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="vehicleUsage">Primary Use *</Label>
            <Select value={formData.vehicleUsage} onValueChange={(value) => handleInputChange("vehicleUsage", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select usage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pleasure">Pleasure</SelectItem>
                <SelectItem value="commute">Commute to Work</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="farm">Farm Use</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="annualMileage">Annual Mileage *</Label>
            <Input
              id="annualMileage"
              value={formData.annualMileage}
              onChange={(e) => handleInputChange("annualMileage", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Coverage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="liabilityLimits">Liability Limits *</Label>
            <Select
              value={formData.liabilityLimits}
              onValueChange={(value) => handleInputChange("liabilityLimits", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select limits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25/50/25">25/50/25</SelectItem>
                <SelectItem value="50/100/50">50/100/50</SelectItem>
                <SelectItem value="100/300/100">100/300/100</SelectItem>
                <SelectItem value="250/500/250">250/500/250</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="comprehensiveDeductible">Comprehensive Deductible</Label>
            <Select
              value={formData.comprehensiveDeductible}
              onValueChange={(value) => handleInputChange("comprehensiveDeductible", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deductible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="250">$250</SelectItem>
                <SelectItem value="500">$500</SelectItem>
                <SelectItem value="1000">$1,000</SelectItem>
                <SelectItem value="2500">$2,500</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="collisionDeductible">Collision Deductible</Label>
            <Select
              value={formData.collisionDeductible}
              onValueChange={(value) => handleInputChange("collisionDeductible", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deductible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="250">$250</SelectItem>
                <SelectItem value="500">$500</SelectItem>
                <SelectItem value="1000">$1,000</SelectItem>
                <SelectItem value="2500">$2,500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="previousInsurance"
              checked={formData.previousInsurance}
              onCheckedChange={(checked) => handleInputChange("previousInsurance", checked as boolean)}
            />
            <Label htmlFor="previousInsurance">I have had continuous auto insurance coverage</Label>
          </div>

          {formData.previousInsurance && (
            <div>
              <Label htmlFor="previousCarrier">Previous Insurance Carrier</Label>
              <Input
                id="previousCarrier"
                value={formData.previousCarrier}
                onChange={(e) => handleInputChange("previousCarrier", e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="accidentsViolations">Accidents/Violations (Last 5 Years)</Label>
            <Textarea
              id="accidentsViolations"
              value={formData.accidentsViolations}
              onChange={(e) => handleInputChange("accidentsViolations", e.target.value)}
              placeholder="Please describe any accidents or violations..."
            />
          </div>

          <div>
            <Label htmlFor="additionalDrivers">Additional Drivers</Label>
            <Textarea
              id="additionalDrivers"
              value={formData.additionalDrivers}
              onChange={(e) => handleInputChange("additionalDrivers", e.target.value)}
              placeholder="List any additional drivers and their information..."
            />
          </div>

          <div>
            <Label htmlFor="specialRequests">Special Requests or Comments</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleInputChange("specialRequests", e.target.value)}
              placeholder="Any special requests or additional information..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  )
}
