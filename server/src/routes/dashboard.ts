import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

router.get('/stats', async (_req, res) => {
  try {
    const now = new Date()
    const in90Days = new Date(now.getTime() + 90 * 86400000)
    const in30Days = new Date(now.getTime() + 30 * 86400000)
    const todayStr = now.toISOString().split('T')[0]

    const [renewals90, renewals30, clients, submissions] = await Promise.all([
      supabaseAdmin.from('renewals').select('*', { count: 'exact', head: true })
        .gte('expiration_date', todayStr).lte('expiration_date', in90Days.toISOString().split('T')[0]).neq('status', 'archived'),
      supabaseAdmin.from('renewals').select('*', { count: 'exact', head: true })
        .gte('expiration_date', todayStr).lte('expiration_date', in30Days.toISOString().split('T')[0]).neq('status', 'archived'),
      supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('submissions').select('*', { count: 'exact', head: true })
        .not('status', 'in', '(completed,archived,bound)'),
    ])

    res.json({
      renewals: { total: renewals90.count ?? 0, urgent: renewals30.count ?? 0 },
      clients: { total: clients.count ?? 0 },
      submissions: { total: submissions.count ?? 0 },
    })
  } catch {
    res.json({ renewals: { total: 0, urgent: 0 }, clients: { total: 0 }, submissions: { total: 0 } })
  }
})

router.get('/renewals', async (_req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabaseAdmin
      .from('renewals')
      .select('id, client_name, policy_number, expiration_date, status')
      .gte('expiration_date', today)
      .order('expiration_date', { ascending: true })
      .limit(10)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ data })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
