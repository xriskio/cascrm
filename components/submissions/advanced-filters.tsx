"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void
  activeFilters: any
}

export function AdvancedFilters({ onFiltersChange, activeFilters }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState(activeFilters)

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilter = (key: string) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const activeFilterCount = Object.keys(filters).filter((key) => filters[key]).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount} active</Badge>}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={filters.startDate}
                  onSelect={(date) => handleFilterChange("startDate", date)}
                  placeholderText="Start date"
                />
                <span className="text-gray-400">to</span>
                <DatePicker
                  selected={filters.endDate}
                  onSelect={(date) => handleFilterChange("endDate", date)}
                  placeholderText="End date"
                />
              </div>
            </div>

            {/* Premium Range */}
            <div className="space-y-2">
              <Label>Premium Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPremium || ""}
                  onChange={(e) => handleFilterChange("minPremium", e.target.value)}
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPremium || ""}
                  onChange={(e) => handleFilterChange("maxPremium", e.target.value)}
                />
              </div>
            </div>

            {/* Agent */}
            <div className="space-y-2">
              <Label>Agent</Label>
              <Select value={filters.agent || ""} onValueChange={(value) => handleFilterChange("agent", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="john-doe">John Doe</SelectItem>
                  <SelectItem value="jane-smith">Jane Smith</SelectItem>
                  <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={filters.priority || ""} onValueChange={(value) => handleFilterChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    {key}: {String(value)}
                    <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => clearFilter(key)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
