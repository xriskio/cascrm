"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CreateNewRenewalPage() {
  const [customerType, setCustomerType] = useState("company")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Renewal draft has been saved successfully",
    })
  }

  const handleCreateRenewal = () => {
    toast({
      title: "Renewal Created",
      description: "New renewal has been created successfully",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Renewal</h1>
        <p className="text-muted-foreground">Comprehensive renewal management with multiple policies</p>
      </div>

      <Tabs defaultValue="client-info" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="quote-info">Quote Info</TabsTrigger>
          <TabsTrigger value="client-info">Client Info</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="coverages">Coverages</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles/Drivers</TabsTrigger>
          <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
        </TabsList>

        <TabsContent value="client-info">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Type */}
              <div>
                <Label className="text-base font-medium">Customer Type</Label>
                <RadioGroup value={customerType} onValueChange={setCustomerType} className="flex gap-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company">Company</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Search for Customer */}
              <div>
                <Label htmlFor="customer-search">Search for customer</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer-search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" placeholder="Enter customer name" />
                </div>
                <div>
                  <Label htmlFor="id-code">ID code / reg no</Label>
                  <Input id="id-code" placeholder="Enter ID or registration number" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail address</Label>
                  <Input id="email" type="email" placeholder="Enter email address" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile phone</Label>
                  <Input id="mobile" placeholder="Enter mobile number" />
                </div>
                <div>
                  <Label htmlFor="renewal-date">Renewal Date *</Label>
                  <Input id="renewal-date" type="date" />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <h3 className="text-lg font-medium mb-4">Contact Person</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name">Contact person name</Label>
                    <Input id="contact-name" placeholder="Enter contact name" />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">E-mail address</Label>
                    <Input id="contact-email" type="email" placeholder="Enter contact email" />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Phone</Label>
                    <Input id="contact-phone" placeholder="Enter contact phone" />
                  </div>
                  <div>
                    <Label htmlFor="contact-mobile">Mobile phone</Label>
                    <Input id="contact-mobile" placeholder="Enter contact mobile" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-medium mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street</Label>
                    <Input id="street" placeholder="Enter street address" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP code</Label>
                    <Input id="zip" placeholder="Enter ZIP code" />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Enter city" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ca">California</SelectItem>
                        <SelectItem value="ny">New York</SelectItem>
                        <SelectItem value="tx">Texas</SelectItem>
                        <SelectItem value="fl">Florida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select defaultValue="us">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Enter any additional notes..." className="min-h-[100px]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quote-info">
          <Card>
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Quote information will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Policy information will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverages">
          <Card>
            <CardHeader>
              <CardTitle>Coverages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coverage details will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicles/Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Vehicle and driver information will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endorsements">
          <Card>
            <CardHeader>
              <CardTitle>Endorsements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Endorsement details will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        <Button onClick={handleCreateRenewal}>Create Renewal</Button>
      </div>
    </div>
  )
}
