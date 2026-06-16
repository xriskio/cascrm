"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, AlertCircle } from "lucide-react"

interface AddressInputProps {
  value: string
  onChange: (address: string) => void
  placeholder?: string
  required?: boolean
}

export function AddressInput({
  value,
  onChange,
  placeholder = "Enter property address...",
  required = false,
}: AddressInputProps) {
  const [showManualEntry, setShowManualEntry] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="pr-10"
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      <div className="flex items-center gap-4">
        <button type="button" onClick={toggleManualEntry} className="text-sm text-blue-600 hover:underline">
          {showManualEntry ? "Hide" : "Show"} address entry tips
        </button>
      </div>

      {showManualEntry && (
        <Card className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Please enter the complete property address including:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Street number and name (e.g., 123 Main Street)</li>
                <li>City, State, ZIP code (e.g., Anytown, CA 12345)</li>
                <li>Any apartment or unit numbers (e.g., Apt 2B)</li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">Example: 123 Main Street, Apt 2B, Anytown, CA 12345</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
