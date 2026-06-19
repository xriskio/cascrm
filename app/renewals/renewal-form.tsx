"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Renewal } from "@/types"

interface RenewalFormProps {
  renewal?: Renewal & Record<string, any>
}

export function RenewalForm({ renewal }: RenewalFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Renewal Information</CardTitle>
        <CardDescription>Enter the renewal details for the customer.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <Label htmlFor="customer_information">Customer Information</Label>
          <p className="text-sm text-muted-foreground">Enter the customer's contact information.</p>

          {/* Add these fields in the Customer Information section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input id="business_name" name="business_name" defaultValue={renewal?.business_name || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insured_name">Insured Name</Label>
              <Input id="insured_name" name="insured_name" defaultValue={renewal?.insured_name || ""} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_first_name">Customer First Name</Label>
              <Input
                id="customer_first_name"
                name="customer_first_name"
                defaultValue={renewal?.customer_first_name || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_last_name">Customer Last Name</Label>
              <Input
                id="customer_last_name"
                name="customer_last_name"
                defaultValue={renewal?.customer_last_name || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_primary_phone">Customer Primary Phone</Label>
              <Input
                id="customer_primary_phone"
                name="customer_primary_phone"
                type="tel"
                defaultValue={renewal?.customer_primary_phone || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_primary_email">Customer Primary Email</Label>
              <Input
                id="customer_primary_email"
                name="customer_primary_email"
                type="email"
                defaultValue={renewal?.customer_primary_email || ""}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="policy_information">Policy Information</Label>
          <p className="text-sm text-muted-foreground">Enter the policy details for the renewal.</p>

          {/* Add these fields in the Policy Information section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="line_of_business">Line of Business</Label>
              <Input id="line_of_business" name="line_of_business" defaultValue={renewal?.line_of_business || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="writing_carrier">Writing Carrier</Label>
              <Input id="writing_carrier" name="writing_carrier" defaultValue={renewal?.writing_carrier || ""} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policy_premium">Policy Premium</Label>
              <Input
                id="policy_premium"
                name="policy_premium"
                type="number"
                step="0.01"
                defaultValue={renewal?.policy_premium || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency_commission_total">Agency Commission Total</Label>
              <Input
                id="agency_commission_total"
                name="agency_commission_total"
                type="number"
                step="0.01"
                defaultValue={renewal?.agency_commission_total || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="csr_on_policy">CSR On Policy</Label>
              <Input id="csr_on_policy" name="csr_on_policy" defaultValue={renewal?.csr_on_policy || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent_on_policy">Agent On Policy</Label>
              <Input id="agent_on_policy" name="agent_on_policy" defaultValue={renewal?.agent_on_policy || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy_status">Policy Status</Label>
            <select
              id="policy_status"
              name="policy_status"
              defaultValue={renewal?.policy_status || "active"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
