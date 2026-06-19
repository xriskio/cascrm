"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { importPolicyInfoAction, importEnhancedPoliciesAction } from "@/app/actions/policy-info-actions"
import { fetchPolicyInfo } from "@/lib/qqcatalyst/api"
import { importPolicySummaryAction } from "@/app/actions/policy-summary-actions"
import { fetchPolicySummary } from "@/lib/qqcatalyst/api"

export default function PolicyInfoPage() {
  const [policyId, setPolicyId] = useState("")
  const [policyInfo, setPolicyInfo] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState("")
  const [policySummary, setPolicySummary] = useState<any | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  const handleFetchPolicy = async () => {
    if (!policyId.trim()) return

    setLoading(true)
    setMessage("")

    try {
      const info = await fetchPolicyInfo(policyId)
      setPolicyInfo(info)
      if (!info) {
        setMessage("Policy not found")
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setPolicyInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const handleImportPolicy = async () => {
    if (!policyId.trim()) return

    setImporting(true)
    setMessage("")

    try {
      const result = await importPolicyInfoAction(policyId)
      setMessage(result.message)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setImporting(false)
    }
  }

  const handleImportEnhanced = async () => {
    setImporting(true)
    setMessage("")

    try {
      const result = await importEnhancedPoliciesAction()
      setMessage(result.message)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setImporting(false)
    }
  }

  const handleFetchSummary = async () => {
    if (!policyId.trim()) return

    setLoading(true)
    setMessage("")

    try {
      const summary = await fetchPolicySummary(policyId)
      setPolicySummary(summary)
      setShowSummary(true)
      if (!summary) {
        setMessage("Policy summary not found")
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setPolicySummary(null)
    } finally {
      setLoading(false)
    }
  }

  const handleImportSummary = async () => {
    if (!policyId.trim()) return

    setImporting(true)
    setMessage("")

    try {
      const result = await importPolicySummaryAction(policyId)
      setMessage(result.message)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QQCatalyst Policy Info</h1>
        <p className="text-muted-foreground">Fetch and import detailed policy information from QQCatalyst</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fetch Policy Information</CardTitle>
          <CardDescription>Enter a policy ID to fetch detailed information from QQCatalyst</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Policy ID"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleFetchPolicy} disabled={loading || !policyId.trim()}>
              {loading ? "Fetching..." : "Fetch Policy"}
            </Button>
            <Button onClick={handleImportPolicy} disabled={importing || !policyId.trim()} variant="secondary">
              {importing ? "Importing..." : "Import Policy"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImportEnhanced} disabled={importing} variant="outline" className="w-full">
              {importing ? "Importing..." : "Import Enhanced Policies (Sample)"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleFetchSummary} disabled={loading || !policyId.trim()} variant="outline">
              {loading ? "Fetching..." : "Fetch Summary"}
            </Button>
            <Button onClick={handleImportSummary} disabled={importing || !policyId.trim()} variant="outline">
              {importing ? "Importing..." : "Import Summary"}
            </Button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.includes("Error") || message.includes("Failed")
                  ? "bg-red-500/10 text-red-400 border border-border"
                  : "bg-green-500/10 text-green-400 border border-border"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      {policyInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Policy Information
              <Badge variant="outline">ID: {policyInfo.PolicyID}</Badge>
            </CardTitle>
            <CardDescription>Detailed information for policy {policyInfo.PolicyNo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Policy Number:</span>
                  <p>{policyInfo.PolicyNo}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p>{policyInfo.Status}</p>
                </div>
                <div>
                  <span className="font-medium">Class:</span>
                  <p>{policyInfo.PolicyClass}</p>
                </div>
                <div>
                  <span className="font-medium">Effective Date:</span>
                  <p>{new Date(policyInfo.EffectiveDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium">Expiration Date:</span>
                  <p>{new Date(policyInfo.ExpirationDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium">Period:</span>
                  <p>{policyInfo.Period}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Agent & CSR Info */}
            <div>
              <h3 className="font-semibold mb-3">Agent & CSR Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Agent:</span>
                  <p>
                    {policyInfo.Agent} (ID: {policyInfo.AgentID})
                  </p>
                </div>
                <div>
                  <span className="font-medium">CSR:</span>
                  <p>
                    {policyInfo.CSR} (ID: {policyInfo.CsrID})
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Carrier Info */}
            <div>
              <h3 className="font-semibold mb-3">Carrier Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Carrier:</span>
                  <p>{policyInfo.Carrier}</p>
                </div>
                <div>
                  <span className="font-medium">NAIC:</span>
                  <p>{policyInfo.CarrierNAIC}</p>
                </div>
                <div>
                  <span className="font-medium">Line of Business:</span>
                  <p>{policyInfo.LOB}</p>
                </div>
                {policyInfo.ParentCarrier && (
                  <div>
                    <span className="font-medium">Parent Carrier:</span>
                    <p>{policyInfo.ParentCarrier}</p>
                  </div>
                )}
                {policyInfo.MGA && (
                  <div>
                    <span className="font-medium">MGA:</span>
                    <p>{policyInfo.MGA}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Subline:</span>
                  <p>{policyInfo.SublineName}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Info */}
            <div>
              <h3 className="font-semibold mb-3">Additional Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Business Type:</span>
                  <p>{policyInfo.BusinessType}</p>
                </div>
                <div>
                  <span className="font-medium">Policy Source:</span>
                  <p>{policyInfo.PolicySource}</p>
                </div>
                <div>
                  <span className="font-medium">Created By:</span>
                  <p>{policyInfo.CreatedBy}</p>
                </div>
                {policyInfo.BinderNumber && (
                  <div>
                    <span className="font-medium">Binder Number:</span>
                    <p>{policyInfo.BinderNumber}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Pending:</span>
                  <p>{policyInfo.isPending ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="font-medium">Non-Renewal:</span>
                  <p>{policyInfo.NonRenewal ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            {policyInfo.Description && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-sm">{policyInfo.Description}</p>
                </div>
              </>
            )}

            {policyInfo.PolicyAgencyFees && policyInfo.PolicyAgencyFees.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Agency Fees</h3>
                  <div className="space-y-2">
                    {policyInfo.PolicyAgencyFees.map((fee: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="font-medium">{fee.AgencyFeeName}</span>
                        <span>${fee.CalculatedAmount?.toFixed(2) || fee.Amount?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {policySummary && showSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Policy Summary
              <Badge variant="secondary">ID: {policySummary.PolicyID}</Badge>
              <Badge variant="outline">${policySummary.TotalPremiumString}</Badge>
            </CardTitle>
            <CardDescription>Summary information for policy {policySummary.PolicyNo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Info */}
            <div>
              <h3 className="font-semibold mb-3">Policy Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Policy Number:</span>
                  <p>{policySummary.PolicyNo}</p>
                </div>
                <div>
                  <span className="font-medium">Customer:</span>
                  <p>{policySummary.CustomerName}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p>{policySummary.PolicyStatusCaption}</p>
                </div>
                <div>
                  <span className="font-medium">Total Premium:</span>
                  <p className="font-semibold text-green-600">{policySummary.TotalPremiumString}</p>
                </div>
                <div>
                  <span className="font-medium">Base Premium:</span>
                  <p>${policySummary.PremiumBase?.toFixed(2)}</p>
                </div>
                <div>
                  <span className="font-medium">Down Payment:</span>
                  <p>${policySummary.PremiumDownPayAmount?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Agent & Carrier */}
            <div>
              <h3 className="font-semibold mb-3">Agent & Carrier</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Agent:</span>
                  <p>{policySummary.AgentName}</p>
                </div>
                <div>
                  <span className="font-medium">CSR:</span>
                  <p>{policySummary.CSRName}</p>
                </div>
                <div>
                  <span className="font-medium">Writing Carrier:</span>
                  <p>{policySummary.WritingCarrierDisplayName}</p>
                </div>
                <div>
                  <span className="font-medium">Line of Business:</span>
                  <p>{policySummary.LOB}</p>
                </div>
              </div>
            </div>

            {policySummary.PriorPolicyNo && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Prior Policy</h3>
                  <p className="text-sm">
                    <span className="font-medium">Prior Policy Number:</span> {policySummary.PriorPolicyNo}
                  </p>
                </div>
              </>
            )}

            {policySummary.PolicyAgencyFees && policySummary.PolicyAgencyFees.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Agency Fees</h3>
                  <div className="space-y-2">
                    {policySummary.PolicyAgencyFees.map((fee: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="font-medium">{fee.AgencyFeeName}</span>
                        <span>${fee.CalculatedAmount?.toFixed(2) || fee.Amount?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
