"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GoogleMapsAddressInputProps {
  value: string
  onChange: (address: string) => void
  placeholder?: string
  required?: boolean
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function GoogleMapsAddressInput({
  value,
  onChange,
  placeholder = "Enter property address...",
  required = false,
}: GoogleMapsAddressInputProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showMap, setShowMap] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [useManualEntry, setUseManualEntry] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      initializeAutocomplete()
      return
    }

    // Load Google Maps script with error handling
    loadGoogleMapsScript()
  }, [])

  const loadGoogleMapsScript = () => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      setHasError(true)
      setErrorMessage("Google Maps is already loading or failed to load")
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCwmMNUKlOy_3BDViuJH32L6PHFCiawLh0&libraries=places&callback=initMap`
    script.async = true
    script.defer = true

    // Handle successful load
    window.initMap = () => {
      setIsLoaded(true)
      setHasError(false)
      initializeAutocomplete()
    }

    // Handle script load error
    script.onerror = () => {
      setHasError(true)
      setErrorMessage("Failed to load Google Maps. Using manual address entry.")
      setUseManualEntry(true)
    }

    // Handle API errors
    window.gm_authFailure = () => {
      setHasError(true)
      setErrorMessage("Google Maps API authentication failed. Using manual address entry.")
      setUseManualEntry(true)
    }

    document.head.appendChild(script)

    // Timeout fallback
    setTimeout(() => {
      if (!isLoaded && !hasError) {
        setHasError(true)
        setErrorMessage("Google Maps loading timeout. Using manual address entry.")
        setUseManualEntry(true)
      }
    }, 10000)
  }

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      setHasError(true)
      setErrorMessage("Google Places API not available. Using manual address entry.")
      setUseManualEntry(true)
      return
    }

    try {
      // Initialize autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["formatted_address", "geometry", "name", "place_id", "address_components"],
      })

      // Add place changed listener
      autocompleteRef.current.addListener("place_changed", handlePlaceSelect)
    } catch (error) {
      console.error("Error initializing Google Places:", error)
      setHasError(true)
      setErrorMessage("Error initializing address lookup. Using manual address entry.")
      setUseManualEntry(true)
    }
  }

  const handlePlaceSelect = () => {
    try {
      const place = autocompleteRef.current.getPlace()

      if (!place.geometry) {
        console.log("No details available for input: '" + place.name + "'")
        return
      }

      setSelectedPlace(place)
      onChange(place.formatted_address || place.name)
      setShowMap(true)

      // Initialize map
      setTimeout(() => {
        initializeMap(place)
      }, 100)
    } catch (error) {
      console.error("Error handling place selection:", error)
    }
  }

  const initializeMap = (place: any) => {
    if (!mapRef.current || !window.google || !window.google.maps) return

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: place.geometry.location,
        zoom: 17,
        mapTypeId: "satellite",
      })

      // Add marker (fallback to regular marker if AdvancedMarkerElement fails)
      try {
        new window.google.maps.marker.AdvancedMarkerElement({
          position: place.geometry.location,
          map: map,
          title: place.formatted_address || place.name,
        })
      } catch (markerError) {
        // Fallback to regular marker
        new window.google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.formatted_address || place.name,
        })
      }
    } catch (error) {
      console.error("Error initializing map:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (!e.target.value) {
      setShowMap(false)
      setSelectedPlace(null)
    }
  }

  const closeMap = () => {
    setShowMap(false)
  }

  const handleManualEntry = () => {
    setUseManualEntry(true)
    setShowMap(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="space-y-4">
      {hasError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          placeholder={useManualEntry ? "Enter full property address..." : placeholder}
          required={required}
          className="pr-10"
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      <div className="flex items-center gap-4">
        <button type="button" onClick={handleManualEntry} className="text-sm text-blue-600 hover:underline">
          Enter address manually
        </button>
        {selectedPlace && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Address verified
          </span>
        )}
        {!isLoaded && !hasError && <span className="text-sm text-gray-500">Loading address lookup...</span>}
      </div>

      {useManualEntry && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Manual Address Entry</p>
          <p>Please enter the complete property address including:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Street number and name</li>
            <li>City, State, ZIP code</li>
            <li>Any apartment or unit numbers</li>
          </ul>
        </div>
      )}

      {showMap && selectedPlace && !hasError && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Property Location</h3>
            <Button variant="ghost" size="sm" onClick={closeMap}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">{selectedPlace.formatted_address}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              {selectedPlace.address_components?.map((component: any, index: number) => {
                const types = component.types
                if (types.includes("locality")) {
                  return (
                    <div key={index}>
                      <span className="font-medium">City:</span> {component.long_name}
                    </div>
                  )
                }
                if (types.includes("administrative_area_level_1")) {
                  return (
                    <div key={index}>
                      <span className="font-medium">State:</span> {component.short_name}
                    </div>
                  )
                }
                if (types.includes("postal_code")) {
                  return (
                    <div key={index}>
                      <span className="font-medium">ZIP:</span> {component.long_name}
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>

          <div ref={mapRef} className="w-full h-64 rounded-lg border bg-gray-100 flex items-center justify-center" />

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Property location verified</span>
            <span>Powered by Google Maps</span>
          </div>
        </Card>
      )}
    </div>
  )
}
