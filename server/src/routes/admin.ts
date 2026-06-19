import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

// List all tables / schema check
router.get('/schema', async (_req, res) => {
  try {
    const tables = ['clients', 'renewals', 'submissions', 'leads', 'quotes', 'policies',
      'market_submissions', 'call_logs', 'renewal_workflows', 'renewal_workflow_tasks',
      'renewal_workflow_notifications', 'audit_logs', 'qqcatalyst_tokens']

    const results: Record<string, { exists: boolean; count?: number }> = {}

    await Promise.all(tables.map(async (table) => {
      const { count, error } = await supabaseAdmin.from(table).select('*', { count: 'exact', head: true })
      results[table] = { exists: !error, count: count ?? undefined }
    }))

    res.json({ tables: results })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string || '100')
    const { data, error } = await supabaseAdmin.from('audit_logs').select('*')
      .order('created_at', { ascending: false }).limit(limit)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ data })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Users
router.get('/users', async (_req, res) => {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ users: users.map((u) => ({ id: u.id, email: u.email, created_at: u.created_at, role: u.role })) })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
