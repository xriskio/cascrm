
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Save } from "lucide-react"
import { generateRenewalQuote } from "@/lib/actions/generateRenewalQuote" // Import the generateRenewalQuote function

interface QuoteGeneratorProps {
  renewalId: string
  renewal: any
  onUpdate: () => void
}

export default function QuoteGenerator({ renewalId, renewal, onUpdate }: QuoteGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [quoteGenerated, setQuoteGenerated] = useState(!!renewal.quote_data)

  // Basic quote data
  const [quoteData, setQuoteData] = useState({
    premium: renewal.renewal_premium || "",
    limits: renewal.current_limits || "",
    deductibles: renewal.current_deductibles || "",
    carrier: renewal.insurance_carrier || "",
    effectiveDate: renewal.effective_date || "",
    expirationDate: renewal.expiration_date || "",
    notes: "",
  })

  const handleGenerateQuote = async () => {
    setIsGenerating(true)
    try {
      // Prepare quote data
      const quoteDataToSend = {
        premium: quoteData.premium,
        limits: quoteData.limits,
        deductibles: quoteData.deductibles,
        carrier: quoteData.carrier,
        effectiveDate: quoteData.effectiveDate,
        expirationDate: quoteData.expirationDate,
        notes: quoteData.notes,
        generatedDate: new Date().toISOString(),
        version: 1,
      }

      // Call server action
      const result = await generateRenewalQuote(renewalId, quoteDataToSend)

      if (result.success) {
        setQuoteGenerated(true)
        alert(`Quote generated successfully! Quote Number: ${result.quoteNumber}`)
        onUpdate()
      } else {
        alert(`Error generating quote: ${result.error}`)
      }
    } catch (error) {
      console.error("Error generating quote:", error)
      alert("Error generating quote. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveQuote = async () => {
    // Save quote logic here
    console.log("Saving quote:", quoteData)
    onUpdate()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quote Generator
          </CardTitle>
          <div className="flex gap-2">
            {quoteGenerated && (
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Quote
              </Button>
            )}
            <Button onClick={handleGenerateQuote} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Quote"}
            </Button>
          </div>
        </div>
        {quoteGenerated && (
          <div className="mt-4">
            {/* Placeholder for Badge component */}
            <div className="w-fit bg-secondary text-white px-2 py-1 rounded">Quote Generated • Version 1</div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="premium">Premium</Label>
            <Input
              id="premium"
              type="number"
              value={quoteData.premium}
              onChange={(e) => setQuoteData({ ...quoteData, premium: e.target.value })}
              placeholder="Enter premium amount"
            />
          </div>

          <div>
            <Label htmlFor="carrier">Carrier</Label>
            <Select value={quoteData.carrier} onValueChange={(value) => setQuoteData({ ...quoteData, carrier: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="State Farm">State Farm</SelectItem>
                <SelectItem value="Allstate">Allstate</SelectItem>
                <SelectItem value="Progressive">Progressive</SelectItem>
                <SelectItem value="GEICO">GEICO</SelectItem>
                <SelectItem value="Liberty Mutual">Liberty Mutual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="limits">Coverage Limits</Label>
            <Input
              id="limits"
              value={quoteData.limits}
              onChange={(e) => setQuoteData({ ...quoteData, limits: e.target.value })}
              placeholder="e.g., $1M/$2M"
            />
          </div>

          <div>
            <Label htmlFor="deductibles">Deductibles</Label>
            <Input
              id="deductibles"
              value={quoteData.deductibles}
              onChange={(e) => setQuoteData({ ...quoteData, deductibles: e.target.value })}
              placeholder="e.g., $1,000"
            />
          </div>

          <div>
            <Label htmlFor="effectiveDate">Effective Date</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={quoteData.effectiveDate}
              onChange={(e) => setQuoteData({ ...quoteData, effectiveDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              type="date"
              value={quoteData.expirationDate}
              onChange={(e) => setQuoteData({ ...quoteData, expirationDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Quote Notes</Label>
          <Textarea
            id="notes"
            value={quoteData.notes}
            onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
            placeholder="Add any additional notes about this quote..."
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerateQuote} disabled={isGenerating}>
            <Plus className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Quote"}
          </Button>
          <Button variant="outline" onClick={handleSaveQuote}>
            <Save className="h-4 w-4 mr-2" />
            Save Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
