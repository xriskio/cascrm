
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ConvertToPolicyButtonProps {
  submissionId: string
  quoteNumber: string
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "BOUND" | "DECLINED"
  onConvert?: (policyNumber: string) => void
}

export function ConvertToPolicyButton({ submissionId, quoteNumber, status, onConvert }: ConvertToPolicyButtonProps) {
  const [isConverting, setIsConverting] = useState(false)
  const [isConverted, setIsConverted] = useState(status === "BOUND")

  const convertToPolicyNumber = (quoteNum: string): string => {
    // Convert HOQ01-0000625 to HOI01-0000625
    const prefixMap: Record<string, string> = {
      HOQ: "HOI", // Home Owners Quote to Home Owners Insurance
      PAQ: "PAI", // Personal Auto Quote to Personal Auto Insurance
      DPQ: "DPI", // Dwelling Property Quote to Dwelling Property Insurance
      LLQ: "LLI", // Landlord Quote to Landlord Insurance
    }

    const prefix = quoteNum.substring(0, 3)
    const newPrefix = prefixMap[prefix] || prefix
    return quoteNum.replace(prefix, newPrefix)
  }

  const handleConvert = async () => {
    if (status !== "APPROVED") {
      toast({
        title: "Cannot Convert",
        description: "Only approved submissions can be converted to policies.",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    try {
      // Simulate API call to convert submission to policy
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const policyNumber = convertToPolicyNumber(quoteNumber)

      // In a real app, this would be an API call:
      // const result = await convertSubmissionToPolicy(submissionId)

      setIsConverted(true)
      onConvert?.(policyNumber)

      toast({
        title: "Success!",
        description: `Submission converted to policy: ${policyNumber}`,
      })
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Failed to convert submission to policy. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
    }
  }

  const getStatusBadge = () => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-500", label: "Draft" },
      SUBMITTED: { color: "bg-blue-500", label: "Submitted" },
      APPROVED: { color: "bg-green-500", label: "Approved" },
      BOUND: { color: "bg-purple-500", label: "Bound" },
      DECLINED: { color: "bg-red-500", label: "Declined" },
    }

    const config = statusConfig[status]
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>
  }

  const canConvert = status === "APPROVED" && !isConverted

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Policy Conversion</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quote Number:</span>
            <span className="font-mono">{quoteNumber}</span>
          </div>
          {isConverted && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Policy Number:</span>
              <span className="font-mono text-green-600">{convertToPolicyNumber(quoteNumber)}</span>
            </div>
          )}
        </div>

        {isConverted ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Successfully converted to policy</span>
          </div>
        ) : (
          <div className="space-y-3">
            {!canConvert && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">
                  {status === "DRAFT" && "Submission must be submitted first"}
                  {status === "SUBMITTED" && "Waiting for approval"}
                  {status === "DECLINED" && "Submission was declined"}
                  {status === "BOUND" && "Already converted to policy"}
                </span>
              </div>
            )}

            <Button onClick={handleConvert} disabled={!canConvert || isConverting} className="w-full" size="lg">
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert to Policy"
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Quote numbers start with Q (e.g., HOQ01-0000625)</p>
          <p>• Policy numbers start with I (e.g., HOI01-0000625)</p>
          <p>• Conversion creates a client record and policy</p>
        </div>
      </CardContent>
    </Card>
  )
}
