"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CommercialAutoDriversPanel } from "@/components/commercial-auto/drivers-panel"

export default function CommercialAutoPage() {
  const [policyDetailId, setPolicyDetailId] = useState("")
  const [showDrivers, setShowDrivers] = useState(false)

  const handleViewDrivers = () => {
    if (policyDetailId.trim()) {
      setShowDrivers(true)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commercial Auto Policies</h1>
        <p className="text-muted-foreground">Manage commercial auto policy details from QQCatalyst</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commercial Auto Policy Details</CardTitle>
          <CardDescription>Enter a policy detail ID to view and manage commercial auto information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Policy Detail ID"
              value={policyDetailId}
              onChange={(e) => setPolicyDetailId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleViewDrivers} disabled={!policyDetailId.trim()}>
              View Drivers
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Note: You need the Policy Detail ID for a commercial auto policy. This is different from the Policy ID.
            </p>
            <p>
              You can find Policy Detail IDs in the QQCatalyst system or by using the policy details endpoints in the
              API.
            </p>
          </div>
        </CardContent>
      </Card>

      {showDrivers && <CommercialAutoDriversPanel policyDetailId={policyDetailId} />}
    </div>
  )
}
