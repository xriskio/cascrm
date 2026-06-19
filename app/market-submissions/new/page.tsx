"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewMarketSubmissionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    clientName: "",
    policyType: "",
    marketName: "",
    carrierName: "",
    wholesalerName: "",
    wholesalerCompany: "",
    wholesalerEmail: "",
    wholesalerPhone: "",
    submissionDate: "",
    responseDate: "",
    quoteStatus: "pending",
    quoteAmount: "",
    premiumQuoted: "",
    coverageDetails: "",
    notes: "",
    declineReason: "",
    priority: "normal",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/market-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Market submission created successfully",
        })
        router.push("/market-submissions")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create market submission",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PageHeader title="New Market Submission" subtitle="Submit broker application to markets and wholesalers">
        <Button asChild variant="outline">
          <Link href="/market-submissions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Link>
        </Button>
      </PageHeader>

      <div className="container mx-auto py-6 px-6">
        <form onSubmit={handleSubmit}>
          <Card className="bg-card backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
              <CardDescription>Enter the details of the market submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client and Policy Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                    placeholder="Enter client name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyType">Policy Type *</Label>
                  <Input
                    id="policyType"
                    name="policyType"
                    value={formData.policyType}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Commercial Auto, General Liability"
                  />
                </div>
              </div>

              {/* Market/Carrier Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="marketName">Market Name</Label>
                  <Input
                    id="marketName"
                    name="marketName"
                    value={formData.marketName}
                    onChange={handleChange}
                    placeholder="Enter market name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrierName">Carrier Name</Label>
                  <Input
                    id="carrierName"
                    name="carrierName"
                    value={formData.carrierName}
                    onChange={handleChange}
                    placeholder="Enter carrier name"
                  />
                </div>
              </div>

              {/* Wholesaler Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Wholesaler Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="wholesalerName">Wholesaler Name *</Label>
                    <Input
                      id="wholesalerName"
                      name="wholesalerName"
                      value={formData.wholesalerName}
                      onChange={handleChange}
                      required
                      placeholder="Enter wholesaler contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wholesalerCompany">Wholesaler Company</Label>
                    <Input
                      id="wholesalerCompany"
                      name="wholesalerCompany"
                      value={formData.wholesalerCompany}
                      onChange={handleChange}
                      placeholder="Enter wholesaler company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wholesalerEmail">Wholesaler Email</Label>
                    <Input
                      id="wholesalerEmail"
                      name="wholesalerEmail"
                      type="email"
                      value={formData.wholesalerEmail}
                      onChange={handleChange}
                      placeholder="wholesaler@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wholesalerPhone">Wholesaler Phone</Label>
                    <Input
                      id="wholesalerPhone"
                      name="wholesalerPhone"
                      value={formData.wholesalerPhone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Dates and Status */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Submission Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="submissionDate">Submission Date</Label>
                    <Input
                      id="submissionDate"
                      name="submissionDate"
                      type="date"
                      value={formData.submissionDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responseDate">Response Date</Label>
                    <Input
                      id="responseDate"
                      name="responseDate"
                      type="date"
                      value={formData.responseDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quoteStatus">Quote Status *</Label>
                    <Select value={formData.quoteStatus} onValueChange={(value) => handleSelectChange("quoteStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                        <SelectItem value="bound">Bound</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Quote Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Quote Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quoteAmount">Quote Amount</Label>
                    <Input
                      id="quoteAmount"
                      name="quoteAmount"
                      type="number"
                      step="0.01"
                      value={formData.quoteAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premiumQuoted">Premium Quoted (Text)</Label>
                    <Input
                      id="premiumQuoted"
                      name="premiumQuoted"
                      value={formData.premiumQuoted}
                      onChange={handleChange}
                      placeholder="e.g., $5,000/year"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="coverageDetails">Coverage Details</Label>
                    <Textarea
                      id="coverageDetails"
                      name="coverageDetails"
                      value={formData.coverageDetails}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter coverage details, limits, deductibles, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter any additional notes or comments"
                    />
                  </div>

                  {formData.quoteStatus === "declined" && (
                    <div className="space-y-2">
                      <Label htmlFor="declineReason">Decline Reason</Label>
                      <Textarea
                        id="declineReason"
                        name="declineReason"
                        value={formData.declineReason}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter reason for decline"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link href="/market-submissions">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-orange-500 to-red-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Create Market Submission"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
