"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { submitApplication } from "@/app/actions/submit-application"

const formSchema = z.object({
  // Business Information
  legalBusinessName: z.string().min(1, { message: "Legal business name is required" }),
  dba: z.string().optional(),
  mailingAddress: z.string().min(1, { message: "Mailing address is required" }),
  garageAddress: z.string().min(1, { message: "Garage address is required" }),
  contactName: z.string().min(1, { message: "Contact name is required" }),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  website: z.string().optional(),
  yearsInBusiness: z.string().min(1, { message: "Years in business is required" }),
  businessType: z.string().min(1, { message: "Business type is required" }),
  effectiveDate: z.date().optional(),
  expirationDate: z.date().optional(),
  currentInsuranceCarrier: z.string().optional(),
  currentPremium: z.string().optional(),

  // Business Description
  businessDescription: z.string().optional(),
  dealerType: z.string().min(1, { message: "Dealer type is required" }),
  annualGrossReceipts: z.string().optional(),
  annualPayroll: z.string().optional(),
  numberOfEmployees: z.string().optional(),

  // Sales & Operations
  newCarSales: z.string().optional(),
  usedCarSales: z.string().optional(),
  serviceRepairReceipts: z.string().optional(),
  partsSalesReceipts: z.string().optional(),

  // Coverage Information
  dealerOpenLotLimit: z.string().min(1, { message: "Dealer open lot limit is required" }),
  dealerOpenLotDeductible: z.string().min(1, { message: "Dealer open lot deductible is required" }),
  garageLiabilityLimit: z.string().min(1, { message: "Garage liability limit is required" }),
  garageLiabilityDeductible: z.string().min(1, { message: "Garage liability deductible is required" }),
  dealersEOLimit: z.string().min(1, { message: "Dealers E&O limit is required" }),
  dealersEODeductible: z.string().min(1, { message: "Dealers E&O deductible is required" }),
  dealerLicenseNumber: z.string().min(1, { message: "Dealer license number is required" }),
  dealerPlatesCount: z.string().min(1, { message: "Number of dealer plates is required" }),

  // Inventory Information
  maximumVehicleValue: z.string().min(1, { message: "Maximum vehicle value is required" }),
  averageVehicleValue: z.string().min(1, { message: "Average vehicle value is required" }),
  maximumVehiclesOnLot: z.string().min(1, { message: "Maximum vehicles on lot is required" }),
  lotProtection: z.string().min(1, { message: "Lot protection is required" }),

  // Claims History
  claimsHistory: z.string().optional(),

  // Additional Information
  additionalInformation: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function AutoDealersForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legalBusinessName: "",
      dba: "",
      mailingAddress: "",
      garageAddress: "",
      contactName: "",
      phoneNumber: "",
      email: "",
      website: "",
      yearsInBusiness: "",
      businessType: "",
      currentInsuranceCarrier: "",
      currentPremium: "",
      businessDescription: "",
      dealerType: "",
      annualGrossReceipts: "",
      annualPayroll: "",
      numberOfEmployees: "",
      newCarSales: "",
      usedCarSales: "",
      serviceRepairReceipts: "",
      partsSalesReceipts: "",
      dealerOpenLotLimit: "",
      dealerOpenLotDeductible: "",
      garageLiabilityLimit: "",
      garageLiabilityDeductible: "",
      dealersEOLimit: "",
      dealersEODeductible: "",
      dealerLicenseNumber: "",
      dealerPlatesCount: "",
      maximumVehicleValue: "",
      averageVehicleValue: "",
      maximumVehiclesOnLot: "",
      lotProtection: "",
      claimsHistory: "",
      additionalInformation: "",
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)

    try {
      // Convert form data to plain object
      const formDataObj: Record<string, any> = {}
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
          formDataObj[key] = value.toISOString()
        } else if (value !== undefined && value !== null) {
          formDataObj[key] = String(value)
        }
      })

      // Generate submission number
      const submissionNumber = `SUB-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`

      // Create submission data matching database schema
      const submissionData = {
        submission_number: submissionNumber,
        insurance_type: "auto-dealers",
        status: "pending",
        created_at: new Date().toISOString(),
        form_data: formDataObj,
      }

      const result = await submitApplication(submissionData)

      if (result.success) {
        toast({
          title: "Application submitted successfully",
          description: `Your submission number is ${result.submissionNumber}`,
        })
        router.push(`/submissions/success?submissionNumber=${result.submissionNumber}&submissionId=${result.submissionId}`)
      } else {
        throw new Error(result.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error submitting application",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Auto Dealers Submission</h1>
        <p className="text-muted-foreground">
          Fill out the form below to create a new submission. All fields marked with an asterisk (*) are required.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="business">Business Information</TabsTrigger>
              <TabsTrigger value="operations">Sales & Operations</TabsTrigger>
              <TabsTrigger value="coverage">Coverage Information</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Information</TabsTrigger>
              <TabsTrigger value="claims">Claims History</TabsTrigger>
              <TabsTrigger value="additional">Additional Information</TabsTrigger>
            </TabsList>

            {/* Business Information Tab */}
            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Enter the basic information about the dealership.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="legalBusinessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Business Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Legal Business Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dba"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DBA (if applicable)</FormLabel>
                          <FormControl>
                            <Input placeholder="Doing Business As" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mailingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mailing Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter complete mailing address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="garageAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garage Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter garage location address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Primary Contact" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="(XXX) XXX-XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="contact@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="www.company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="yearsInBusiness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Business *</FormLabel>
                          <FormControl>
                            <Input placeholder="Number of years" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="soleProprietorship">Sole Proprietorship</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="llc">LLC</SelectItem>
                              <SelectItem value="corporation">Corporation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="effectiveDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Effective Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? format(field.value, "MM/dd/yyyy") : <span>mm/dd/yyyy</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expirationDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expiration Date (if applicable)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? format(field.value, "MM/dd/yyyy") : <span>mm/dd/yyyy</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentInsuranceCarrier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Insurance Carrier</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter current carrier" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentPremium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Premium</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter current premium" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="businessDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the nature of your dealership operations"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dealerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dealer Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select dealer type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="newCars">New Cars</SelectItem>
                              <SelectItem value="usedCars">Used Cars</SelectItem>
                              <SelectItem value="both">Both New and Used</SelectItem>
                              <SelectItem value="motorcycle">Motorcycle</SelectItem>
                              <SelectItem value="rv">RV</SelectItem>
                              <SelectItem value="commercial">Commercial Vehicles</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dealerLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dealer License Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter dealer license number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="annualGrossReceipts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Gross Receipts</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter annual gross receipts" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="annualPayroll"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Payroll</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter annual payroll" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numberOfEmployees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Employees</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter number of employees" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales & Operations Tab */}
            <TabsContent value="operations">
              <Card>
                <CardHeader>
                  <CardTitle>Sales & Operations</CardTitle>
                  <CardDescription>Enter information about your dealership's sales and operations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="newCarSales"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Car Sales (Annual)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter annual new car sales" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="usedCarSales"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Used Car Sales (Annual)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter annual used car sales" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="serviceRepairReceipts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service/Repair Receipts (Annual)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter annual service/repair receipts" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="partsSalesReceipts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parts Sales Receipts (Annual)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter annual parts sales receipts" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dealerPlatesCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How Many Dealer Plates *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter number of dealer plates" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coverage Information Tab */}
            <TabsContent value="coverage">
              <Card>
                <CardHeader>
                  <CardTitle>Coverage Information</CardTitle>
                  <CardDescription>Enter information about the coverage you're seeking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dealerOpenLotLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dealer Open Lot Limit *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select limit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="100000">$100,000</SelectItem>
                              <SelectItem value="250000">$250,000</SelectItem>
                              <SelectItem value="500000">$500,000</SelectItem>
                              <SelectItem value="1000000">$1,000,000</SelectItem>
                              <SelectItem value="2000000">$2,000,000</SelectItem>
                              <SelectItem value="3000000">$3,000,000</SelectItem>
                              <SelectItem value="4000000">$4,000,000</SelectItem>
                              <SelectItem value="5000000">$5,000,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dealerOpenLotDeductible"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dealer Open Lot Deductible *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select deductible" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="500">$500</SelectItem>
                              <SelectItem value="1000">$1,000</SelectItem>
                              <SelectItem value="2500">$2,500</SelectItem>
                              <SelectItem value="5000">$5,000</SelectItem>
                              <SelectItem value="10000">$10,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="garageLiabilityLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garage Liability Limit *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select limit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="300000">$300,000</SelectItem>
                              <SelectItem value="500000">$500,000</SelectItem>
                              <SelectItem value="1000000">$1,000,000</SelectItem>
                              <SelectItem value="2000000">$2,000,000</SelectItem>
                              <SelectItem value="3000000">$3,000,000</SelectItem>
                              <SelectItem value="4000000">$4,000,000</SelectItem>
                              <SelectItem value="5000000">$5,000,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="garageLiabilityDeductible"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garage Liability Deductible *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select deductible" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="500">$500</SelectItem>
                              <SelectItem value="1000">$1,000</SelectItem>
                              <SelectItem value="2500">$2,500</SelectItem>
                              <SelectItem value="5000">$5,000</SelectItem>
                              <SelectItem value="10000">$10,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dealersEOLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dealers E&O Limit *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select limit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="100000">$100,000</SelectItem>
                              <SelectItem value="250000">$250,000</SelectItem>
                              <SelectItem value="500000">$500,000</SelectItem>
                              <SelectItem value="1000000">$1,000,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dealersEODeductible"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dealers E&O Deductible *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select deductible" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="500">$500</SelectItem>
                              <SelectItem value="1000">$1,000</SelectItem>
                              <SelectItem value="2500">$2,500</SelectItem>
                              <SelectItem value="5000">$5,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Information Tab */}
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Information</CardTitle>
                  <CardDescription>Enter information about your dealership's inventory.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maximumVehicleValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Value of Any One Vehicle *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter maximum vehicle value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="averageVehicleValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Value Per Vehicle *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter average vehicle value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maximumVehiclesOnLot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Number of Vehicles on Lot *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter maximum vehicles on lot" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lotProtection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lot Protection *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select lot protection" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fence">Fence</SelectItem>
                              <SelectItem value="lightedFence">Lighted Fence</SelectItem>
                              <SelectItem value="guardDog">Guard Dog</SelectItem>
                              <SelectItem value="securityGuard">Security Guard</SelectItem>
                              <SelectItem value="alarmSystem">Alarm System</SelectItem>
                              <SelectItem value="cctv">CCTV</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Claims History Tab */}
            <TabsContent value="claims">
              <Card>
                <CardHeader>
                  <CardTitle>Claims History</CardTitle>
                  <CardDescription>Enter information about any claims in the last 5 years.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="claimsHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Claims History (Last 5 Years)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide details of any dealer open lot, garage liability, or E&O claims in the last 5 years"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Information Tab */}
            <TabsContent value="additional">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Enter any additional information about this submission.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="additionalInformation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional information about this submission"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/submissions/new")}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
