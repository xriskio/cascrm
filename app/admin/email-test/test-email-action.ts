"use server"

import {
  sendSubmissionNotification,
  sendLeadNotification,
  sendTaskAssignmentNotification,
  sendServiceRequestNotification,
  sendDailySummaryNotification,
} from "@/lib/email-templates"
import { revalidatePath } from "next/cache"

export async function testEmailNotifications(type: string) {
  try {
    const testData = {
      submission: {
        submissionNumber: "TEST-SUB-001",
        clientName: "Test Insurance Client LLC",
        policyType: "Commercial General Liability",
        agentName: "Test Agent",
        agentEmail: "agent@test.com",
        submissionDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        submissionId: "test-123",
      },
      lead: {
        leadId: "LEAD-TEST-001",
        contactName: "John Test Business",
        companyName: "Test Company Inc",
        phone: "(555) 123-4567",
        email: "test@testcompany.com",
        source: "Website Form",
        notes: "Interested in commercial auto coverage for fleet of 5 vehicles",
        priority: "High" as const,
        agentName: "Test Agent",
        dateEntered: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      task: {
        taskId: "TASK-TEST-001",
        title: "Review Test Submission Documentation",
        description: "Complete review of all submitted documents and verify coverage requirements",
        assignedTo: "Test Underwriter",
        assignedBy: "Test Manager",
        priority: "High" as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        category: "Underwriting",
        relatedSubmission: "TEST-SUB-001",
      },
      service: {
        requestId: "SR-TEST-001",
        clientName: "Test Client Corporation",
        requestType: "Policy Change",
        priority: "Medium" as const,
        description: "Request to add additional vehicle to commercial auto policy",
        submittedBy: "Test Agent",
        submittedDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        contactInfo: "test@client.com | (555) 987-6543",
      },
      summary: {
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        metrics: {
          newSubmissions: 12,
          newLeads: 8,
          completedTasks: 15,
          pendingTasks: 23,
          serviceRequests: 6,
          totalRevenue: 45000,
        },
        topPerformers: [
          { name: "Sarah Johnson", submissions: 5, revenue: 15000 },
          { name: "Mike Chen", submissions: 4, revenue: 12000 },
          { name: "Lisa Rodriguez", submissions: 3, revenue: 8000 },
        ],
        urgentItems: [
          "3 submissions pending underwriter review",
          "5 tasks due tomorrow",
          "2 high-priority service requests",
        ],
      },
    }

    let results: any[] = []

    switch (type) {
      case "submission":
        const submissionResult = await sendSubmissionNotification(testData.submission)
        results.push({ type: "Submission", result: submissionResult })
        break

      case "lead":
        const leadResult = await sendLeadNotification(testData.lead)
        results.push({ type: "Lead", result: leadResult })
        break

      case "task":
        const taskResult = await sendTaskAssignmentNotification(testData.task)
        results.push({ type: "Task", result: taskResult })
        break

      case "service":
        const serviceResult = await sendServiceRequestNotification(testData.service)
        results.push({ type: "Service Request", result: serviceResult })
        break

      case "summary":
        const summaryResult = await sendDailySummaryNotification(testData.summary)
        results.push({ type: "Daily Summary", result: summaryResult })
        break

      case "all":
        // Test all notification types
        const allResults = await Promise.allSettled([
          sendSubmissionNotification(testData.submission),
          sendLeadNotification(testData.lead),
          sendTaskAssignmentNotification(testData.task),
          sendServiceRequestNotification(testData.service),
          sendDailySummaryNotification(testData.summary),
        ])

        results = allResults.map((result, index) => ({
          type: ["Submission", "Lead", "Task", "Service Request", "Daily Summary"][index],
          result: result.status === "fulfilled" ? result.value : { error: result.reason },
        }))
        break

      default:
        throw new Error("Invalid test type")
    }

    console.log("Email test results:", results)

    // Revalidate the page to show any updates
    revalidatePath("/admin/email-test")

    return { success: true, results }
  } catch (error) {
    console.error("Error testing email notifications:", error)
    return { success: false, error: error.message }
  }
}
