"use server"

import { createClient } from "@/lib/supabase/server"

export interface TestResult {
  step: string
  success: boolean
  error?: string
  data?: any
}

export interface ClientNavigationTestResult {
  clientId: string
  overallSuccess: boolean
  results: TestResult[]
  executionTime: number
}

export async function testClientNavigation(clientId: string): Promise<ClientNavigationTestResult> {
  const startTime = Date.now()
  const results: TestResult[] = []

  try {
    // Step 1: Test Supabase client creation
    let supabase
    try {
      supabase = createClient()
      results.push({
        step: "Create Supabase Client",
        success: true,
        data: "Client created successfully",
      })
    } catch (error) {
      results.push({
        step: "Create Supabase Client",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      return {
        clientId,
        overallSuccess: false,
        results,
        executionTime: Date.now() - startTime,
      }
    }

    // Step 2: Test authentication
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        results.push({
          step: "Authentication Check",
          success: false,
          error: userError.message,
        })
      } else if (!user) {
        results.push({
          step: "Authentication Check",
          success: false,
          error: "No authenticated user found",
        })
      } else {
        results.push({
          step: "Authentication Check",
          success: true,
          data: { userId: user.id, email: user.email },
        })
      }
    } catch (error) {
      results.push({
        step: "Authentication Check",
        success: false,
        error: error instanceof Error ? error.message : "Authentication error",
      })
    }

    // Step 3: Test client data fetch
    try {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single()

      if (clientError) {
        results.push({
          step: "Client Data Fetch",
          success: false,
          error: clientError.message,
        })
      } else if (!client) {
        results.push({
          step: "Client Data Fetch",
          success: false,
          error: "Client not found",
        })
      } else {
        results.push({
          step: "Client Data Fetch",
          success: true,
          data: {
            clientId: client.id,
            name: client.name || client.company_name,
            hasData: true,
          },
        })
      }
    } catch (error) {
      results.push({
        step: "Client Data Fetch",
        success: false,
        error: error instanceof Error ? error.message : "Data fetch error",
      })
    }

    // Step 4: Test policies fetch
    try {
      const { data: policies, error: policiesError } = await supabase
        .from("submissions")
        .select("*")
        .eq("client_id", clientId)
        .limit(5)

      if (policiesError) {
        results.push({
          step: "Policies Data Fetch",
          success: false,
          error: policiesError.message,
        })
      } else {
        results.push({
          step: "Policies Data Fetch",
          success: true,
          data: {
            policiesCount: policies?.length || 0,
            hasPolicies: (policies?.length || 0) > 0,
          },
        })
      }
    } catch (error) {
      results.push({
        step: "Policies Data Fetch",
        success: false,
        error: error instanceof Error ? error.message : "Policies fetch error",
      })
    }

    // Step 5: Test auth validity
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        results.push({
          step: "Auth Validity Check",
          success: false,
          error: authError.message,
        })
      } else if (!user) {
        results.push({
          step: "Auth Validity Check",
          success: false,
          error: "No valid user found",
        })
      } else {
        results.push({
          step: "Auth Validity Check",
          success: true,
          data: {
            authValid: true,
            userId: user.id,
            email: user.email,
          },
        })
      }
    } catch (error) {
      results.push({
        step: "Auth Validity Check",
        success: false,
        error: error instanceof Error ? error.message : "Auth check error",
      })
    }
  } catch (error) {
    results.push({
      step: "General Error",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }

  const overallSuccess = results.every((result) => result.success)
  const executionTime = Date.now() - startTime

  return {
    clientId,
    overallSuccess,
    results,
    executionTime,
  }
}

export async function getAllClientsForTesting(): Promise<{ id: string; name: string }[]> {
  try {
    const supabase = createClient()

    const { data: clients, error } = await supabase.from("clients").select("id, name, company_name").limit(10)

    if (error) {
      console.error("Error fetching clients for testing:", error)
      return []
    }

    return (
      clients?.map((client) => ({
        id: client.id,
        name: client.name || client.company_name || `Client ${client.id}`,
      })) || []
    )
  } catch (error) {
    console.error("Error in getAllClientsForTesting:", error)
    return []
  }
}

export async function testAllClients(): Promise<ClientNavigationTestResult[]> {
  const clients = await getAllClientsForTesting()
  const results: ClientNavigationTestResult[] = []

  for (const client of clients) {
    const result = await testClientNavigation(client.id)
    results.push(result)
  }

  return results
}
