import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// Verify a Supabase JWT token and return user info
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token required' })

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) return res.status(401).json({ error: 'Invalid token' })

    res.json({ user: { id: user.id, email: user.email } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// QQCatalyst OAuth callback
router.get('/qqcatalyst/callback', async (req, res) => {
  const { code } = req.query
  if (!code) return res.status(400).json({ error: 'No code provided' })
  res.json({ code, message: 'Exchange this code via POST /api/qqcatalyst/auth' })
})

router.get('/qqcatalyst/status', async (_req, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('qqcatalyst_tokens')
      .select('created_at, expires_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    res.json({ hasToken: !!data, expiresAt: data?.expires_at })
  } catch {
    res.json({ hasToken: false })
  }
})

export default router
