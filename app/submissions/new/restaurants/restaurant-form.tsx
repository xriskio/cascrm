"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { submitApplication } from "@/app/actions/submit-application"
import { US_STATES } from "@/lib/states"

export default function RestaurantForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("policyholder")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locations, setLocations] = useState([{ id: 1 }])
  const [formError, setFormError] = useState<string | null>(null)

  const generateSubmissionNumber = () => {
    const timestamp = new Date().getTime()
    const random = Math.floor(Math.random() * 10000)
    return `REST-${timestamp}-${random}`
  }

  const handleTabChange = (value: string) => setActiveTab(value)

  const handleNextTab = () => {
    const tabs = [
      "policyholder",
      "location",
      "classification",
      "liability",
      "property",
      "optional",
      "additional",
      "discounts",
      "effective",
      "payment",
    ]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1])
  }

  const handlePreviousTab = () => {
    const tabs = [
      "policyholder",
      "location",
      "classification",
      "liability",
      "property",
      "optional",
      "additional",
      "discounts",
      "effective",
      "payment",
    ]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1])
  }

  const addLocation = () => {
    if (locations.length < 5) setLocations([...locations, { id: locations.length + 1 }])
  }

  const removeLocation = (id: number) => {
    if (locations.length > 1) setLocations(locations.filter((location) => location.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const formDataObj: Record<string, any> = {}
      formData.forEach((value, key) => {
        formDataObj[key] = value
      })

      const submissionData = {
        submission_number: generateSubmissionNumber(),
        insurance_type: "restaurant",
        status: "pending",
        created_at: new Date().toISOString(),
        form_data: formDataObj,
      }

      const result = await submitApplication(submissionData)

      if (result.success) {
        router.push(
          `/submissions/success?submissionNumber=${result.submissionNumber}&submissionId=${result.submissionId}`,
        )
      } else {
        setFormError(`Error submitting form: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error submitting restaurant form:", error)
      setFormError(`Error submitting form: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {formError && <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">{formError}</div>}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-5 md:grid-cols-10 mb-6">
          <TabsTrigger value="policyholder">Policyholder</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="classification">Classification</TabsTrigger>
          <TabsTrigger value="liability">Liability</TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="optional">Optional</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="effective">Effective Date</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        {/* Policyholder Information Tab */}
        <TabsContent value="policyholder">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Policyholder Information</h2>
              <p className="text-gray-500 mb-6">
                The Insured name (Legal entity) and contact information apply to all locations for this account.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="insured_name">Insured name (Legal entity)</Label>
                  <Input id="insured_name" name="insured_name" />
                </div>
                <div>
                  <Label htmlFor="contact_first_name">Contact first name</Label>
                  <Input id="contact_first_name" name="contact_first_name" />
                </div>
                <div>
                  <Label htmlFor="contact_last_name">Contact last name</Label>
                  <Input id="contact_last_name" name="contact_last_name" />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact email</Label>
                  <Input id="contact_email" name="contact_email" type="email" />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact phone number</Label>
                  <Input id="contact_phone" name="contact_phone" type="tel" />
                </div>
                <div>
                  <Label htmlFor="mailing_address">Policy mailing address</Label>
                  <Input id="mailing_address" name="mailing_address" />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="same_as_location" name="same_as_location" />
                    <label
                      htmlFor="same_as_location"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Same as Location 1 address
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Information Tab */}
        <TabsContent value="location">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Location Information</h2>
              <p className="text-gray-500 mb-6">
                Start a single application, or add multiple locations to start multiple applications that share the same
                Policyholder.
              </p>

              {locations.map((location, index) => (
                <div key={location.id} className="mb-8 border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Location {location.id}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor={`location_${location.id}_state`}>
                        What state is the establishment located in?
                      </Label>
                      <Select name={`location_${location.id}_state`}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`location_${location.id}_program`}>
                        Please select the program that best fits this business location
                      </Label>
                      <Select name={`location_${location.id}_program`}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurants_brew_pubs">Restaurants & Brew Pubs</SelectItem>
                          <SelectItem value="fast_food">Fast food restaurants</SelectItem>
                          <SelectItem value="cafes">Cafes</SelectItem>
                          <SelectItem value="casual_dining">Casual dining</SelectItem>
                          <SelectItem value="fine_dining">Fine dining</SelectItem>
                          <SelectItem value="sandwich_shops">Sandwich shops</SelectItem>
                          <SelectItem value="new_ventures">New ventures</SelectItem>
                          <SelectItem value="ghost_kitchens">Ghost kitchens</SelectItem>
                          <SelectItem value="pizzerias">Pizzerias</SelectItem>
                          <SelectItem value="wine_bars">Wine bars</SelectItem>
                          <SelectItem value="multi_location">Multi-location schedules</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`location_${location.id}_dba`}>DBA/Trade Name</Label>
                      <Input id={`location_${location.id}_dba`} name={`location_${location.id}_dba`} />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`location_${location.id}_address`}>Address</Label>
                      <Input id={`location_${location.id}_address`} name={`location_${location.id}_address`} />
                    </div>

                    <div>
                      <Label htmlFor={`location_${location.id}_city`}>City</Label>
                      <Input id={`location_${location.id}_city`} name={`location_${location.id}_city`} />
                    </div>

                    <div>
                      <Label htmlFor={`location_${location.id}_zip`}>ZIP</Label>
                      <Input id={`location_${location.id}_zip`} name={`location_${location.id}_zip`} />
                    </div>
                  </div>

                  {locations.length > 1 && (
                    <div className="mt-4">
                      <Button type="button" variant="destructive" onClick={() => removeLocation(location.id)}>
                        Remove Location {location.id}
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {locations.length < 5 && (
                <Button type="button" variant="outline" onClick={addLocation} className="mb-6">
                  + Add another location
                </Button>
              )}

              {locations.length >= 5 && (
                <p className="text-amber-600 mb-6">
                  Maximum of 5 locations reached. For 6 or more locations, please start a manual submission.
                </p>
              )}

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classification & Eligibility Tab */}
        <TabsContent value="classification">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Classification & Eligibility</h2>
              <p className="text-gray-500 mb-6">Tell us a bit about the business.</p>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="establishment_class" className="mb-2 block">
                    Please choose the class of foodservice establishment
                  </Label>
                  <RadioGroup name="establishment_class" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quick_service_limited" id="quick_service_limited" />
                      <Label htmlFor="quick_service_limited">
                        Quick Service, Bakery & Coffee Shops / Limited Cooking
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quick_service_commercial" id="quick_service_commercial" />
                      <Label htmlFor="quick_service_commercial">Quick Service / Commercial Cooking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full_service_casual" id="full_service_casual" />
                      <Label htmlFor="full_service_casual">Full Service / Casual Dining Restaurants</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full_service_fine" id="full_service_fine" />
                      <Label htmlFor="full_service_fine">Full Service / Fine Dining Restaurants</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wine_bars" id="wine_bars" />
                      <Label htmlFor="wine_bars">Wine Bars / No Commercial Cooking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bars_taverns" id="bars_taverns" />
                      <Label htmlFor="bars_taverns">Bars and Taverns</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="brew_pubs_commercial" id="brew_pubs_commercial" />
                      <Label htmlFor="brew_pubs_commercial">Brew Pubs / Commercial Cooking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="brew_pubs_no_commercial" id="brew_pubs_no_commercial" />
                      <Label htmlFor="brew_pubs_no_commercial">Brew Pubs / No Commercial Cooking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mobile_food" id="mobile_food" />
                      <Label htmlFor="mobile_food">Mobile Food Vendors</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="warehouse_office" id="warehouse_office" />
                      <Label htmlFor="warehouse_office">Warehouse or Incidental Office Exposure with Restaurant</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Does the establishment offer any of the below?</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="happy_hour" name="offers_happy_hour" />
                      <label htmlFor="happy_hour" className="text-sm">
                        Happy hour between 8pm-close
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="late_liquor" name="offers_late_liquor" />
                      <label htmlFor="late_liquor" className="text-sm">
                        Serves liquor and operates between the hours of midnight and 5am
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alcohol_after_food" name="offers_alcohol_after_food" />
                      <label htmlFor="alcohol_after_food" className="text-sm">
                        Alcohol service over two hours after food service ends
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="drink_specials" name="offers_drink_specials" />
                      <label htmlFor="drink_specials" className="text-sm">
                        Alcoholic drink specials under $4 (other than standard cans or bottles of beer)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="complimentary_drinks" name="offers_complimentary_drinks" />
                      <label htmlFor="complimentary_drinks" className="text-sm">
                        Complimentary alcoholic drinks, buy-one-get one offers, or all-you-can-drink specials
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hazardous_amusement" name="offers_hazardous_amusement" />
                      <label htmlFor="hazardous_amusement" className="text-sm">
                        Hazardous amusement devices or activities (e.g. mechanical bulls, axe throwing, darts...)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="live_concerts" name="offers_live_concerts" />
                      <label htmlFor="live_concerts" className="text-sm">
                        Live concerts with 3 or more performers with a dance floor or dance area
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="door_bouncers" name="offers_door_bouncers" />
                      <label htmlFor="door_bouncers" className="text-sm">
                        Door bouncers (beyond a single ID checker)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sports_activities" name="offers_sports_activities" />
                      <label htmlFor="sports_activities" className="text-sm">
                        Sports activities (e.g. volleyball, boxing, bowling...)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="special_events" name="offers_special_events" />
                      <label htmlFor="special_events" className="text-sm">
                        Hosting special events beyond standard in-house promotions (e.g. street fair, block party)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="dance_floor" name="offers_dance_floor" />
                      <label htmlFor="dance_floor" className="text-sm">
                        Dance floor
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="atm" name="offers_atm" />
                      <label htmlFor="atm" className="text-sm">
                        ATM
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hookah" name="offers_hookah" />
                      <label htmlFor="hookah" className="text-sm">
                        Hookah
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="flaming_food" name="offers_flaming_food" />
                      <label htmlFor="flaming_food" className="text-sm">
                        Flaming food or beverages
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="none_of_above" name="offers_none_of_above" />
                      <label htmlFor="none_of_above" className="text-sm">
                        None of the above
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Is there a playground on the premises?</Label>
                  <RadioGroup name="has_playground" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="playground_yes" />
                      <Label htmlFor="playground_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="playground_no" />
                      <Label htmlFor="playground_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Does the insured have any of the following exposures? Check all that apply.
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="food_truck" name="exposure_food_truck" />
                      <label htmlFor="food_truck" className="text-sm">
                        Own and operate a food truck or food cart
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="temp_food_stand" name="exposure_temp_food_stand" />
                      <label htmlFor="temp_food_stand" className="text-sm">
                        Operate a temporary food stand at events
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ghost_kitchen" name="exposure_ghost_kitchen" />
                      <label htmlFor="ghost_kitchen" className="text-sm">
                        Sublease the insured location as a ghost kitchen at any time
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="virtual_brand" name="exposure_virtual_brand" />
                      <label htmlFor="virtual_brand" className="text-sm">
                        Operate a virtual brand out of the insured location
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="exposure_none" name="exposure_none" />
                      <label htmlFor="exposure_none" className="text-sm">
                        None of the above
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Does the establishment have more than 6 deep fat fryer units?</Label>
                  <RadioGroup name="has_many_fryers" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="fryers_yes" />
                      <Label htmlFor="fryers_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="fryers_no" />
                      <Label htmlFor="fryers_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Are any of the following types of cooking performed?</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="solid_fuel" name="cooking_solid_fuel" />
                      <label htmlFor="solid_fuel" className="text-sm">
                        Solid fuel (indoors)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="wok" name="cooking_wok" />
                      <label htmlFor="wok" className="text-sm">
                        Wok
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="charbroiling" name="cooking_charbroiling" />
                      <label htmlFor="charbroiling" className="text-sm">
                        Charbroiling
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cooking_none" name="cooking_none" />
                      <label htmlFor="cooking_none" className="text-sm">
                        None of the above
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="hood_cleaning" className="mb-2 block">
                    How often are hoods, grease removal devices, fans, and ducts inspected and cleaned by a properly
                    trained and certified technician?
                  </Label>
                  <Select name="hood_cleaning">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                      <SelectItem value="semi_annually">Semi-annually</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="not_applicable">Not applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Are there any remodeling or renovation projects planned for the applicant's premises during the
                    policy term?
                  </Label>
                  <RadioGroup name="has_renovations" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="renovations_yes" />
                      <Label htmlFor="renovations_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="renovations_no" />
                      <Label htmlFor="renovations_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Is the establishment cash only?</Label>
                  <RadioGroup name="is_cash_only" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="cash_only_yes" />
                      <Label htmlFor="cash_only_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="cash_only_no" />
                      <Label htmlFor="cash_only_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="hours_open" className="mb-2 block">
                    What are the average hours this establishment is open to the public each day? (please round down to
                    nearest whole number)
                  </Label>
                  <Input id="hours_open" name="hours_open" type="number" min="0" max="24" />
                </div>

                <div>
                  <Label className="mb-2 block">
                    Is the applicant a new venture, or been in business less than one year?
                  </Label>
                  <RadioGroup name="is_new_venture" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="new_venture_yes" />
                      <Label htmlFor="new_venture_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="new_venture_no" />
                      <Label htmlFor="new_venture_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="year_opened" className="mb-2 block">
                    What year did the establishment open?
                  </Label>
                  <Input id="year_opened" name="year_opened" type="number" min="1900" max="2025" />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Liability Coverage Tab */}
        <TabsContent value="liability">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Liability Coverage</h2>
              <p className="text-gray-500 mb-6">Tell us a bit about the business.</p>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="annual_sales" className="mb-2 block">
                    What is the establishment's estimated annual sales?
                  </Label>
                  <Input id="annual_sales" name="annual_sales" type="number" min="0" prefix="$" />
                </div>

                <div>
                  <Label htmlFor="liability_limit" className="mb-2 block">
                    Please select your General Liability limit
                  </Label>
                  <RadioGroup name="liability_limit" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="500000_1000000" id="limit_500000_1000000" />
                      <Label htmlFor="limit_500000_1000000">$500,000 / $1,000,000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1000000_2000000" id="limit_1000000_2000000" />
                      <Label htmlFor="limit_1000000_2000000">$1,000,000 / $2,000,000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2000000_4000000" id="limit_2000000_4000000" />
                      <Label htmlFor="limit_2000000_4000000">$2,000,000 / $4,000,000</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Does the establishment provide off-premises catering services?</Label>
                  <RadioGroup name="provides_catering" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="catering_yes" />
                      <Label htmlFor="catering_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="catering_no" />
                      <Label htmlFor="catering_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Does the establishment serve alcohol (beer, liquor, or wine)?</Label>
                  <RadioGroup name="serves_alcohol" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="alcohol_yes" />
                      <Label htmlFor="alcohol_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="alcohol_no" />
                      <Label htmlFor="alcohol_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Do you wish to add Hired & Non-Owned Auto Liability coverage?</Label>
                  <RadioGroup name="wants_hnoa" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="hnoa_yes" />
                      <Label htmlFor="hnoa_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="hnoa_no" />
                      <Label htmlFor="hnoa_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Does the establishment utilize any of the following third-party delivery services?
                  </Label>
                  <RadioGroup name="delivery_services" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="third_party" id="delivery_third_party" />
                      <Label htmlFor="delivery_third_party">Uber Eats, Doordash, etc.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="robotic" id="delivery_robotic" />
                      <Label htmlFor="delivery_robotic">Robotic delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="delivery_none" />
                      <Label htmlFor="delivery_none">No third-party delivery</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="full_time_employees" className="mb-2 block">
                    Number of full-time employees:
                  </Label>
                  <Input id="full_time_employees" name="full_time_employees" type="number" min="0" />
                </div>

                <div>
                  <Label htmlFor="part_time_employees" className="mb-2 block">
                    Number of part-time employees:
                  </Label>
                  <Input id="part_time_employees" name="part_time_employees" type="number" min="0" />
                </div>

                <div>
                  <Label className="mb-2 block">Is the establishment responsible for a parking lot?</Label>
                  <RadioGroup name="has_parking_lot" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="parking_lot_yes" />
                      <Label htmlFor="parking_lot_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="parking_lot_no" />
                      <Label htmlFor="parking_lot_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Does the establishment have stairs used by patrons?</Label>
                  <RadioGroup name="has_stairs" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="stairs_yes" />
                      <Label htmlFor="stairs_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="stairs_no" />
                      <Label htmlFor="stairs_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Coverage Tab */}
        <TabsContent value="property">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Property Coverage</h2>
              <p className="text-gray-500 mb-6">Tell us a bit about the business.</p>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="construction_type" className="mb-2 block">
                    What is the construction type of the establishment?
                  </Label>
                  <RadioGroup name="construction_type" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="frame" id="construction_frame" />
                      <Label htmlFor="construction_frame">Frame</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="joisted_masonry" id="construction_joisted_masonry" />
                      <Label htmlFor="construction_joisted_masonry">Joisted masonry</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non_combustible" id="construction_non_combustible" />
                      <Label htmlFor="construction_non_combustible">Non-Combustible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masonry_non_combustible" id="construction_masonry_non_combustible" />
                      <Label htmlFor="construction_masonry_non_combustible">Masonry non-combustible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="modified_fire_resistive" id="construction_modified_fire_resistive" />
                      <Label htmlFor="construction_modified_fire_resistive">Modified fire resistive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fire_resistive" id="construction_fire_resistive" />
                      <Label htmlFor="construction_fire_resistive">Fire resistive</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="building_year" className="mb-2 block">
                    What year was the building built?
                  </Label>
                  <Input id="building_year" name="building_year" type="number" min="1800" max="2025" />
                </div>

                <div>
                  <Label htmlFor="roof_type" className="mb-2 block">
                    Please select the roof covering type:
                  </Label>
                  <RadioGroup name="roof_type" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="shingle" id="roof_shingle" />
                      <Label htmlFor="roof_shingle">Shingle</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="membrane" id="roof_membrane" />
                      <Label htmlFor="roof_membrane">Membrane</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="metal" id="roof_metal" />
                      <Label htmlFor="roof_metal">Metal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tar_gravel" id="roof_tar_gravel" />
                      <Label htmlFor="roof_tar_gravel">Tar and gravel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tile" id="roof_tile" />
                      <Label htmlFor="roof_tile">Tile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wood_shake" id="roof_wood_shake" />
                      <Label htmlFor="roof_wood_shake">Wood shake</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Is the premises equipped with a fire sprinkler system?</Label>
                  <RadioGroup name="has_sprinklers" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="sprinklers_yes" />
                      <Label htmlFor="sprinklers_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="sprinklers_no" />
                      <Label htmlFor="sprinklers_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="fire_alarm" className="mb-2 block">
                    What type of fire alarm is located at the premises?
                  </Label>
                  <RadioGroup name="fire_alarm" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ul_central" id="fire_ul_central" />
                      <Label htmlFor="fire_ul_central">UL Certified Central Station</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="central" id="fire_central" />
                      <Label htmlFor="fire_central">Central station</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="local" id="fire_local" />
                      <Label htmlFor="fire_local">Local</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="fire_none" />
                      <Label htmlFor="fire_none">None</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="burglar_alarm" className="mb-2 block">
                    What type of burglar alarm is located at the premises?
                  </Label>
                  <RadioGroup name="burglar_alarm" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="central" id="burglar_central" />
                      <Label htmlFor="burglar_central">Central Station</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="local" id="burglar_local" />
                      <Label htmlFor="burglar_local">Local</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="burglar_none" />
                      <Label htmlFor="burglar_none">None</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="security_cameras" className="mb-2 block">
                    What type of security cameras are located at the premises?
                  </Label>
                  <RadioGroup name="security_cameras" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monitored" id="cameras_monitored" />
                      <Label htmlFor="cameras_monitored">Centrally monitored</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="recording" id="cameras_recording" />
                      <Label htmlFor="cameras_recording">Recording only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="cameras_none" />
                      <Label htmlFor="cameras_none">None</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="square_footage" className="mb-2 block">
                    What is the total area (square feet) of the building or unit occupied by the insured?
                  </Label>
                  <Input id="square_footage" name="square_footage" type="number" min="0" />
                </div>

                <div>
                  <Label className="mb-2 block">
                    What is the location of the establishment in any of the following?
                  </Label>
                  <RadioGroup name="location_type" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="attached_habitational" id="location_attached_habitational" />
                      <Label htmlFor="location_attached_habitational">
                        Attached to habitational structure (apartments, condos)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standalone" id="location_standalone" />
                      <Label htmlFor="location_standalone">Stand-alone building</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="strip_center" id="location_strip_center" />
                      <Label htmlFor="location_strip_center">Strip shopping center</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="enclosed_mall" id="location_enclosed_mall" />
                      <Label htmlFor="location_enclosed_mall">Enclosed mall</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="location_none" />
                      <Label htmlFor="location_none">None of the above</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="max_occupancy" className="mb-2 block">
                    What is the establishment's maximum occupancy?
                  </Label>
                  <Input id="max_occupancy" name="max_occupancy" type="number" min="0" />
                </div>

                <div>
                  <Label htmlFor="bpp_limit" className="mb-2 block">
                    Please enter the Business Personal Property limit.
                  </Label>
                  <Input id="bpp_limit" name="bpp_limit" type="number" min="0" prefix="$" />
                </div>

                <div>
                  <Label className="mb-2 block">Do you wish to add Building Coverage?</Label>
                  <RadioGroup name="wants_building_coverage" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="building_coverage_yes" />
                      <Label htmlFor="building_coverage_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="building_coverage_no" />
                      <Label htmlFor="building_coverage_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="aop_deductible" className="mb-2 block">
                    Please select the property All Other Perils deductible.
                  </Label>
                  <RadioGroup name="aop_deductible" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="500" id="aop_500" />
                      <Label htmlFor="aop_500">$500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1000" id="aop_1000" />
                      <Label htmlFor="aop_1000">$1,000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2500" id="aop_2500" />
                      <Label htmlFor="aop_2500">$2,500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5000" id="aop_5000" />
                      <Label htmlFor="aop_5000">$5,000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10000" id="aop_10000" />
                      <Label htmlFor="aop_10000">$10,000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="25000" id="aop_25000" />
                      <Label htmlFor="aop_25000">$25,000</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="tib_limit" className="mb-2 block">
                    Please enter the Tenants Improvements and Betterments limit.
                  </Label>
                  <Input id="tib_limit" name="tib_limit" type="number" min="0" prefix="$" />
                </div>

                <div>
                  <Label htmlFor="wh_deductible" className="mb-2 block">
                    Please select the property Wind & Hail deductible.
                  </Label>
                  <RadioGroup name="wh_deductible" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no_separate" id="wh_no_separate" />
                      <Label htmlFor="wh_no_separate">No separate deductible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1_percent" id="wh_1_percent" />
                      <Label htmlFor="wh_1_percent">1%</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2_percent" id="wh_2_percent" />
                      <Label htmlFor="wh_2_percent">2%</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5_percent" id="wh_5_percent" />
                      <Label htmlFor="wh_5_percent">5%</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remove" id="wh_remove" />
                      <Label htmlFor="wh_remove">Remove coverage</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optional Coverages Tab */}
        <TabsContent value="optional">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Optional Coverages</h2>
              <p className="text-gray-500 mb-6">Tell us a bit about the business.</p>

              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">
                    base policy comes with our Primary package. Would you like to add the Premier package?
                  </Label>
                  <RadioGroup name="wants_premier" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="premier_yes" />
                      <Label htmlFor="premier_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="premier_no" />
                      <Label htmlFor="premier_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Would you like to add Cyber Suite coverage?</Label>
                  <RadioGroup name="wants_cyber" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="cyber_yes" />
                      <Label htmlFor="cyber_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="cyber_no" />
                      <Label htmlFor="cyber_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Would you like to add Employment Practices Liability coverage?</Label>
                  <RadioGroup name="wants_epl" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="epl_yes" />
                      <Label htmlFor="epl_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="epl_no" />
                      <Label htmlFor="epl_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Would you like to add additional coverages or customize any limits in a package?
                  </Label>
                  <RadioGroup name="wants_additional_coverages" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="additional_coverages_yes" />
                      <Label htmlFor="additional_coverages_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="additional_coverages_no" />
                      <Label htmlFor="additional_coverages_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Interests Tab */}
        <TabsContent value="additional">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Additional Interests</h2>
              <p className="text-gray-500 mb-6">Tell us a bit about the business.</p>

              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Would you like to schedule blanket Additional Insureds?</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    The following forms will be added with "As required by contract" language included:
                  </p>
                  <ul className="text-sm text-gray-500 list-disc pl-5 mb-4">
                    <li>Additional Insured - Scheduled Person or Organization</li>
                    <li>Additional Insured - Managers or Lessors of Premises</li>
                    <li>Additional Insured - Controlling Interest</li>
                    <li>Additional Insured - Designated Person or Organization</li>
                  </ul>
                  <RadioGroup name="wants_blanket_ai" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="blanket_ai_yes" />
                      <Label htmlFor="blanket_ai_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="blanket_ai_no" />
                      <Label htmlFor="blanket_ai_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Would you like to schedule any other additional interests?</Label>
                  <RadioGroup name="wants_other_ai" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="other_ai_yes" />
                      <Label htmlFor="other_ai_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="other_ai_no" />
                      <Label htmlFor="other_ai_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Discounts</h2>
              <p className="text-gray-500 mb-6">Tell us a bit about the business.</p>

              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">
                    Association memberships - please select all that apply to the applicant.
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="nra_member" name="association_nra" />
                      <label htmlFor="nra_member" className="text-sm">
                        National Restaurant Association
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="state_ra_member" name="association_state_ra" />
                      <label htmlFor="state_ra_member" className="text-sm">
                        Any state restaurant association
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="no_association" name="association_none" />
                      <label htmlFor="no_association" className="text-sm">
                        No association memberships
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Is this establishment part of a franchise?</Label>
                  <RadioGroup name="is_franchise" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="franchise_yes" />
                      <Label htmlFor="franchise_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="franchise_no" />
                      <Label htmlFor="franchise_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Additional credits are available based on certain business practices or characteristics. Would you
                    like to select additional credits?
                  </Label>
                  <RadioGroup name="wants_additional_credits" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="additional_credits_yes" />
                      <Label htmlFor="additional_credits_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="additional_credits_no" />
                      <Label htmlFor="additional_credits_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Is the insured an active subscriber to PathSpot SafetySuite?</Label>
                  <RadioGroup name="is_pathspot_subscriber" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="pathspot_yes" />
                      <Label htmlFor="pathspot_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="pathspot_no" />
                      <Label htmlFor="pathspot_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Would you like to refer this submission to underwriting for additional pricing consideration?
                  </Label>
                  <RadioGroup name="wants_underwriting_referral" className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="underwriting_referral_yes" />
                      <Label htmlFor="underwriting_referral_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="underwriting_referral_no" />
                      <Label htmlFor="underwriting_referral_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="referral_reason" className="mb-2 block">
                    If yes, please provide the reason for the referral.
                  </Label>
                  <Textarea id="referral_reason" name="referral_reason" rows={4} />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effective Date Tab */}
        <TabsContent value="effective">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Effective Date</h2>
              <p className="text-gray-500 mb-6">Tell us a bit about the business.</p>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="effective_date" className="mb-2 block">
                    Please select the policy effective date.
                  </Label>
                  <Input id="effective_date" name="effective_date" type="date" />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              <p className="text-gray-500 mb-6">Tell us a bit about the business.</p>

              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Please select your payment preference.</Label>
                  <RadioGroup name="payment_preference" className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ach" id="payment_ach" />
                      <Label htmlFor="payment_ach">ACH</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit_card" id="payment_credit_card" />
                      <Label htmlFor="payment_credit_card">Credit Card</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
