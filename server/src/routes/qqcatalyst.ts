import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

const QQ_API_BASE = process.env.QQ_API_BASE || 'http://api.qqcatalyst.com'
const QQ_LOGIN_HOST = process.env.QQ_LOGIN_HOST || 'https://login.qqcatalyst.com'
const QQ_CLIENT_ID = process.env.QQCATALYST_BEARER_TOKEN || process.env.QQ_CLIENT_ID || ''
const QQ_CLIENT_SECRET = process.env.QQCATALYST_CLIENT_SECRET || process.env.QQ_CLIENT_SECRET || ''

async function getStoredToken(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('qqcatalyst_tokens')
    .select('access_token, expires_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  return data.access_token
}

// Gateway proxy
router.get('/gateway', async (req, res) => {
  try {
    const endpoint = req.query.endpoint as string || '/v1/Carriers'
    let token = req.query.access_token as string

    if (!token) token = await getStoredToken() || ''
    if (!token) return res.status(400).json({ error: 'No access token available' })

    const response = await fetch(`${QQ_API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ error: `API call failed: ${response.status} - ${errorText}` })
    }

    const data = await response.json()
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/gateway', async (req, res) => {
  try {
    const endpoint = req.query.endpoint as string || '/v1/Carriers'
    let token = req.query.access_token as string || req.body.access_token

    if (!token) token = await getStoredToken() || ''
    if (!token) return res.status(400).json({ error: 'No access token available' })

    const response = await fetch(`${QQ_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// OAuth token exchange
router.post('/auth', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body
    const tokenUrl = `${QQ_LOGIN_HOST}/oauth/token`

    const params = new URLSearchParams({
      client_id: QQ_CLIENT_ID,
      client_secret: QQ_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      scope: 'openid',
      redirect_uri,
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const data = await response.json() as Record<string, any>
    if (!response.ok) return res.status(response.status).json(data)

    // Store token
    await supabaseAdmin.from('qqcatalyst_tokens').insert({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
    })

    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Get token status
router.get('/status', async (_req, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('qqcatalyst_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) return res.json({ hasToken: false })

    const isExpired = data.expires_at && new Date(data.expires_at) < new Date()
    res.json({ hasToken: true, isExpired, expiresAt: data.expires_at })
  } catch {
    res.json({ hasToken: false })
  }
})

// Get config
router.get('/config', (_req, res) => {
  res.json({
    clientId: QQ_CLIENT_ID ? `${QQ_CLIENT_ID.substring(0, 8)}...` : 'Not configured',
    apiBase: QQ_API_BASE,
    loginHost: QQ_LOGIN_HOST,
    configured: !!(QQ_CLIENT_ID && QQ_CLIENT_SECRET),
  })
})

// Search
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'accounts' } = req.query
    const token = await getStoredToken()
    if (!token) return res.status(401).json({ error: 'No QQCatalyst token' })

    const endpoint = type === 'policies' ? `/v1/Policies?search=${q}` : `/v1/Accounts?search=${q}`
    const response = await fetch(`${QQ_API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Import clients from QQCatalyst
router.post('/clients/import', async (req, res) => {
  try {
    const { accounts } = req.body
    if (!accounts || !Array.isArray(accounts)) {
      return res.status(400).json({ error: 'accounts array is required' })
    }

    const clients = accounts.map((a: any) => ({
      name: a.AccountName || a.name,
      email: a.Email || a.email,
      phone: a.Phone || a.phone,
      company_name: a.AccountName || a.company_name,
      qq_account_id: a.AccountId || a.id,
      current_status: 'active',
    }))

    const { data, error } = await supabaseAdmin.from('clients').insert(clients).select()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ imported: data?.length || 0 })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Import renewals from QQCatalyst
router.post('/renewals/import', async (req, res) => {
  try {
    const { policies } = req.body
    if (!policies || !Array.isArray(policies)) {
      return res.status(400).json({ error: 'policies array is required' })
    }

    const renewals = policies.map((p: any) => ({
      client_name: p.AccountName || p.client_name,
      policy_number: p.PolicyNumber || p.policy_number,
      expiration_date: p.ExpirationDate || p.expiration_date,
      status: 'active',
    }))

    const { data, error } = await supabaseAdmin.from('renewals').insert(renewals).select()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ imported: data?.length || 0 })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
