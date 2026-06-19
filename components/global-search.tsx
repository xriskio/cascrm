"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, FileText, RefreshCw, Users, Phone, Building2, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { globalSearch, type SearchResult } from "@/app/actions/global-search-actions"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface GlobalSearchProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

export function GlobalSearch({
  onSearch,
  placeholder = "Search clients, policies, renewals... (Press / to focus)",
  className,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Handle search function
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      // Call the API endpoint
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data || [])
        console.log("Search results:", data)
      } else {
        const errorData = await response.json()
        console.error("Error searching:", errorData.error)
        // Fallback to existing search action
        const searchResults = await globalSearch(searchQuery)
        setResults(searchResults || [])
      }

      setSelectedIndex(-1)
      setIsOpen(true)

      // Call external onSearch if provided
      if (onSearch) {
        onSearch(searchQuery)
      }
    } catch (error) {
      console.error("Search error:", error)
      // Fallback to existing search action
      try {
        const searchResults = await globalSearch(searchQuery)
        setResults(searchResults || [])
        setIsOpen(true)
      } catch (fallbackError) {
        console.error("Fallback search error:", fallbackError)
        setResults([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Form submission handler
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (query.trim()) {
      handleSearch(query.trim())
    }
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && !isOpen) {
        event.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }

      if (isOpen) {
        if (event.key === "Escape") {
          setIsOpen(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
        } else if (event.key === "ArrowDown") {
          event.preventDefault()
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        } else if (event.key === "ArrowUp") {
          event.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        } else if (event.key === "Enter" && selectedIndex >= 0) {
          event.preventDefault()
          handleResultClick(results[selectedIndex])
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Auto-search with debounce
  useEffect(() => {
    if (query.trim().length >= 2) {
      const debounceTimer = setTimeout(() => {
        handleSearch(query)
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
    setQuery("")
    setResults([])
    setSelectedIndex(-1)
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "submission":
        return <FileText className="h-4 w-4" />
      case "renewal":
        return <RefreshCw className="h-4 w-4" />
      case "client":
        return <Users className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "carrier":
        return <Building2 className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "submission":
        return "bg-blue-500/15 text-blue-300"
      case "renewal":
        return "bg-orange-500/15 text-orange-300"
      case "client":
        return "bg-green-500/15 text-green-300"
      case "call":
        return "bg-purple-500/15 text-purple-300"
      case "carrier":
        return "bg-muted text-foreground"
      case "user":
        return "bg-indigo-500/15 text-indigo-300"
      default:
        return "bg-muted text-foreground"
    }
  }

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-20 py-3 w-full bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-card focus:text-foreground focus:placeholder:text-muted-foreground transition-all duration-200 rounded-full"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white/70" />
          ) : (
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-2xl border-0 bg-card backdrop-blur-lg">
          <CardContent className="p-0">
            {isLoading && query.length >= 2 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Searching...
              </div>
            ) : results.length === 0 && query.length >= 2 ? (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{query}"
                <div className="text-xs mt-1">Try searching for client names, policy numbers, or email addresses</div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={cn(
                      "p-4 cursor-pointer transition-colors duration-150",
                      selectedIndex === index ? "bg-blue-500/10 border-l-4 border-blue-500" : "hover:bg-muted",
                    )}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn("p-2 rounded-lg", getTypeBadgeColor(result.type))}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground truncate">{result.title}</h4>
                          <Badge variant="secondary" className={cn("text-xs", getTypeBadgeColor(result.type))}>
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{result.subtitle}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.length < 2 && (
              <div className="p-4 text-center text-muted-foreground">
                <div className="text-sm mb-2">Quick search tips:</div>
                <div className="text-xs space-y-1">
                  <div>• Search by client name, policy number, email, or phone</div>
                  <div>• Use keyboard shortcuts: / to focus, ↑↓ to navigate, Enter to select</div>
                  <div>• Minimum 2 characters required</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GlobalSearch
