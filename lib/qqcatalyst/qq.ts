const TOKEN_URL = "https://login.qqcatalyst.com/oauth/token"
const API_BASE = "https://api.qqcatalyst.com/v1"

let _cache: { token: string; exp: number } = { token: "", exp: 0 }

async function getToken() {
  if (Date.now() < _cache.exp) return _cache.token

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password_credentials",
      username: process.env.QQ_USERNAME!,
      password: process.env.QQ_PASSWORD!,
      client_id: process.env.QQ_CLIENT_ID!,
      client_secret: process.env.QQ_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Auth failed: ${res.status} ${text}`)
  }

  const { access_token, expires_in } = await res.json()
  _cache = {
    token: access_token,
    exp: Date.now() + (expires_in - 30) * 1000,
  }
  return access_token
}

export async function qqFetch(path: string) {
  try {
    const token = await getToken()
    const res = await fetch(API_BASE + path, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`QQ API ${res.status}: ${text}`)
    }

    return res.json()
  } catch (error) {
    console.error("QQCatalyst API error:", error)
    throw error
  }
}

// Helper functions for common API calls
export async function listContacts(params: { pageNumber?: number; pageSize?: number } = {}) {
  const today = new Date().toISOString().slice(0, 10)
  const pageNumber = params.pageNumber || 1
  const pageSize = params.pageSize || 100

  return qqFetch(
    `/Contacts/LastModifiedCreated?startDate=2000-01-01&endDate=${today}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
  )
}

export async function getContactById(id: string | number) {
  return qqFetch(`/Contacts/${id}`)
}

export async function getContactPolicies(contactId: string | number) {
  return qqFetch(`/Contacts/${contactId}/Policies`)
}

export async function getPolicyById(id: string | number) {
  return qqFetch(`/Policies/${id}`)
}

// Function to fetch all contacts (paginated)
export async function fetchAllContacts() {
  const today = new Date().toISOString().slice(0, 10)
  let page = 1
  const all = []

  while (true) {
    const data = await qqFetch(
      `/Contacts/LastModifiedCreated?startDate=2000-01-01&endDate=${today}&pageNumber=${page}&pageSize=100`,
    )

    const contacts = data.Data || data.Contacts || []
    if (!contacts.length) break

    all.push(...contacts)
    page++

    // Safety limit to prevent infinite loops
    if (page > 10) break
  }

  return all
}
