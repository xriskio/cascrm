"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  importCommercialAutoDriversAction,
  getCommercialAutoDriversAction,
} from "@/app/actions/commercial-auto-actions"
import { fetchCommercialAutoDrivers } from "@/lib/qqcatalyst/api"
import { Loader2, RefreshCw, Download } from "lucide-react"

interface DriversListProps {
  policyDetailId: string | number
  initialDrivers?: any[]
}

export function CommercialAutoDriversPanel({ policyDetailId, initialDrivers = [] }: DriversListProps) {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState("")

  const handleFetchDrivers = async () => {
    setLoading(true)
    setMessage("")

    try {
      const fetchedDrivers = await fetchCommercialAutoDrivers(policyDetailId)
      setDrivers(fetchedDrivers)
      setMessage(
        fetchedDrivers.length > 0
          ? `Found ${fetchedDrivers.length} drivers from QQCatalyst`
          : "No drivers found for this policy",
      )
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImportDrivers = async () => {
    setImporting(true)
    setMessage("")

    try {
      const result = await importCommercialAutoDriversAction(policyDetailId)
      setMessage(result.message)

      if (result.success) {
        // Refresh drivers from database
        const dbResult = await getCommercialAutoDriversAction(policyDetailId)
        if (dbResult.success) {
          setDrivers(dbResult.drivers)
        }
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setImporting(false)
    }
  }

  const handleLoadFromDatabase = async () => {
    setLoading(true)
    setMessage("")

    try {
      const result = await getCommercialAutoDriversAction(policyDetailId)
      if (result.success) {
        setDrivers(result.drivers)
        setMessage(
          result.drivers.length > 0
            ? `Loaded ${result.drivers.length} drivers from database`
            : "No drivers found in database",
        )
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Commercial Auto Drivers</span>
          <Badge variant="outline">{drivers.length} Drivers</Badge>
        </CardTitle>
        <CardDescription>Manage drivers for commercial auto policy {policyDetailId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleFetchDrivers} disabled={loading} size="sm" variant="outline">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Fetch from QQCatalyst
          </Button>
          <Button onClick={handleImportDrivers} disabled={importing} size="sm" variant="outline">
            {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Import Drivers
          </Button>
          <Button onClick={handleLoadFromDatabase} disabled={loading} size="sm" variant="outline">
            Load from Database
          </Button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md ${
              message.includes("Error") || message.includes("Failed")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {drivers.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{driver.DriverNumber || driver.driver_number}</TableCell>
                    <TableCell>
                      {driver.FirstName || driver.first_name} {driver.LastName || driver.last_name}
                    </TableCell>
                    <TableCell>{driver.DriversLicenceNumber || driver.drivers_license_number}</TableCell>
                    <TableCell>{driver.StateLicensed || driver.state_licensed}</TableCell>
                    <TableCell>
                      {driver.DateOfBirth || driver.date_of_birth
                        ? new Date(driver.DateOfBirth || driver.date_of_birth).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{driver.YearsExperience || driver.years_experience} years</TableCell>
                    <TableCell className="text-right">
                      {driver.Excluded || driver.excluded ? (
                        <Badge variant="destructive">Excluded</Badge>
                      ) : (
                        <Badge variant="outline">Included</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-8 border rounded-md bg-gray-50">
            <p className="text-muted-foreground">No drivers found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Fetch from QQCatalyst" to retrieve drivers for this policy
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Policy Detail ID: <span className="font-mono">{policyDetailId}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleFetchDrivers} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}
