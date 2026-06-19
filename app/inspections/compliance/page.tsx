"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUpIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react"
import { toast } from "sonner"

interface ComplianceItem {
  id: string
  client: string
  policyNumber: string
  effectiveDate: string
  nocDate: string
  company: string
  policyType: string
  missingItems: {
    photos: boolean
    documents: boolean
    certificates: boolean
  }
  priority: "high" | "medium" | "low"
}

const initialComplianceItems: ComplianceItem[] = [
  {
    id: "1",
    client: "ABC Manufacturing",
    policyNumber: "CP-12345678",
    effectiveDate: "01/15/2023",
    nocDate: "06/15/2023",
    company: "Travelers Insurance",
    policyType: "Commercial Property",
    missingItems: {
      photos: true,
      documents: true,
      certificates: false,
    },
    priority: "high",
  },
  {
    id: "2",
    client: "XYZ Retail",
    policyNumber: "GL-87654321",
    effectiveDate: "02/01/2023",
    nocDate: "07/01/2023",
    company: "Hartford Insurance",
    policyType: "General Liability",
    missingItems: {
      photos: false,
      documents: true,
      certificates: true,
    },
    priority: "medium",
  },
  {
    id: "3",
    client: "123 Properties LLC",
    policyNumber: "CA-98765432",
    effectiveDate: "03/10/2023",
    nocDate: "08/10/2023",
    company: "Progressive Insurance",
    policyType: "Commercial Auto",
    missingItems: {
      photos: true,
      documents: false,
      certificates: false,
    },
    priority: "low",
  },
  {
    id: "4",
    client: "Riverfront Restaurant",
    policyNumber: "WC-23456789",
    effectiveDate: "04/05/2023",
    nocDate: "05/20/2023",
    company: "Liberty Mutual",
    policyType: "Workers Compensation",
    missingItems: {
      photos: true,
      documents: true,
      certificates: true,
    },
    priority: "high",
  },
]

export default function PendingCompliancePage() {
  const router = useRouter()
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(initialComplianceItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isSendingReminders, setIsSendingReminders] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filteredItems = complianceItems.filter(
    (item) =>
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSendReminders = async () => {
    setIsSendingReminders(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Reminders sent to all clients with missing items!")
    } catch (error) {
      toast.error("Failed to send reminders")
    } finally {
      setIsSendingReminders(false)
    }
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success("Compliance report generated successfully!")

      // Simulate download
      const link = document.createElement("a")
      link.href = "#"
      link.setAttribute("download", "compliance_report.pdf")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      toast.error("Failed to generate report")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleUpload = async (id: string, itemType: "photos" | "documents" | "certificates") => {
    setProcessingId(id)
    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update the state to mark the item as uploaded
      setComplianceItems(
        complianceItems.map((item) =>
          item.id === id
            ? {
                ...item,
                missingItems: {
                  ...item.missingItems,
                  [itemType]: false,
                },
              }
            : item,
        ),
      )

      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} uploaded successfully!`)
    } catch (error) {
      toast.error(`Failed to upload ${itemType}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleSendReminder = async (id: string) => {
    setProcessingId(id)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Reminder sent successfully!")
    } catch (error) {
      toast.error("Failed to send reminder")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Inspection Compliance</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSendReminders}
            disabled={isSendingReminders}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSendingReminders ? "Sending..." : "Send Reminders"}
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isGeneratingReport ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Missing Documentation</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-xs">High Priority</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span className="text-xs">Medium Priority</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs">Low Priority</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by client, policy number, or company..."
            className="w-full px-4 py-2 border border-border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border px-4 py-2 text-left">Client</th>
                <th className="border px-4 py-2 text-left">Policy Number</th>
                <th className="border px-4 py-2 text-left">Effective Date</th>
                <th className="border px-4 py-2 text-left">NOC Date</th>
                <th className="border px-4 py-2 text-left">Insurance Company</th>
                <th className="border px-4 py-2 text-left">Policy Type</th>
                <th className="border px-4 py-2 text-left">Missing Items</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b ${
                    item.priority === "high" ? "bg-red-500/10" : item.priority === "medium" ? "bg-yellow-500/10" : "bg-green-500/10"
                  }`}
                >
                  <td className="border px-4 py-2">{item.client}</td>
                  <td className="border px-4 py-2">{item.policyNumber}</td>
                  <td className="border px-4 py-2">{item.effectiveDate}</td>
                  <td className="border px-4 py-2">{item.nocDate}</td>
                  <td className="border px-4 py-2">{item.company}</td>
                  <td className="border px-4 py-2">{item.policyType}</td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center">
                        {item.missingItems.photos ? (
                          <AlertCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className={item.missingItems.photos ? "text-red-500" : "text-green-500"}>Photos</span>
                      </div>
                      <div className="flex items-center">
                        {item.missingItems.documents ? (
                          <AlertCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className={item.missingItems.documents ? "text-red-500" : "text-green-500"}>
                          Documents
                        </span>
                      </div>
                      <div className="flex items-center">
                        {item.missingItems.certificates ? (
                          <AlertCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className={item.missingItems.certificates ? "text-red-500" : "text-green-500"}>
                          Certificates
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-col gap-1">
                      {item.missingItems.photos && (
                        <button
                          className="text-blue-500 hover:text-blue-400 flex items-center text-sm"
                          onClick={() => handleUpload(item.id, "photos")}
                          disabled={processingId === item.id}
                        >
                          <FileUpIcon className="h-4 w-4 mr-1" />
                          {processingId === item.id ? "Uploading..." : "Upload Photos"}
                        </button>
                      )}
                      {item.missingItems.documents && (
                        <button
                          className="text-blue-500 hover:text-blue-400 flex items-center text-sm"
                          onClick={() => handleUpload(item.id, "documents")}
                          disabled={processingId === item.id}
                        >
                          <FileUpIcon className="h-4 w-4 mr-1" />
                          {processingId === item.id ? "Uploading..." : "Upload Documents"}
                        </button>
                      )}
                      {item.missingItems.certificates && (
                        <button
                          className="text-blue-500 hover:text-blue-400 flex items-center text-sm"
                          onClick={() => handleUpload(item.id, "certificates")}
                          disabled={processingId === item.id}
                        >
                          <FileUpIcon className="h-4 w-4 mr-1" />
                          {processingId === item.id ? "Uploading..." : "Upload Certificates"}
                        </button>
                      )}
                      <button
                        className="text-orange-500 hover:text-orange-400 text-sm"
                        onClick={() => handleSendReminder(item.id)}
                        disabled={processingId === item.id}
                      >
                        {processingId === item.id ? "Sending..." : "Send Reminder"}
                      </button>
                      <button
                        className="text-muted-foreground hover:text-muted-foreground text-sm"
                        onClick={() => {
                          toast.info(`Viewing details for ${item.client}`)
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="border px-4 py-8 text-center text-muted-foreground">
                    No compliance issues found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
