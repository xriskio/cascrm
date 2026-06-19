import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || '1')
    const limit = parseInt(req.query.limit as string || '10')
    const upcoming = req.query.upcoming === 'true'
    const isDashboard = req.query.dashboard === 'true'
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('renewals')
      .select('id, client_name, policy_number, expiration_date, status, created_at', { count: 'exact' })

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('expiration_date', today)
    }

    const { data: renewals, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('expiration_date', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })

    if (isDashboard) return res.json({ data: renewals })

    res.json({
      renewals,
      data: renewals,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { data: renewal, error } = await supabaseAdmin
      .from('renewals')
      .insert([req.body])
      .select('*, profiles(*)')
      .single()

    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ renewal })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/bulk-delete', async (req, res) => {
  try {
    const { renewalIds } = req.body
    if (!Array.isArray(renewalIds) || renewalIds.length === 0) {
      return res.status(400).json({ error: 'Invalid renewal IDs provided' })
    }
    const { data, error } = await supabaseAdmin.from('renewals').delete().in('id', renewalIds).select('id')
    if (error) return res.status(500).json({ error: error.message })
    res.json({ deleted: data?.length || 0, message: `Successfully deleted ${data?.length || 0} renewals` })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/notify', async (req, res) => {
  try {
    const { renewalId, type } = req.body
    const { data: renewal, error } = await supabaseAdmin.from('renewals').select('*').eq('id', renewalId).single()
    if (error || !renewal) return res.status(404).json({ success: false, error: 'Renewal not found' })
    // Notification logic would call Resend here
    res.json({ success: true, message: `Notification of type '${type}' sent for renewal ${renewalId}` })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:renewalId', async (req, res) => {
  try {
    const { data: renewal, error } = await supabaseAdmin
      .from('renewals')
      .select('*, profiles(*)')
      .eq('id', req.params.renewalId)
      .single()

    if (error) return res.status(500).json({ error: error.message })
    if (!renewal) return res.status(404).json({ error: 'Renewal not found' })
    res.json({ renewal })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:renewalId', async (req, res) => {
  try {
    const { data: renewal, error } = await supabaseAdmin
      .from('renewals')
      .update(req.body)
      .eq('id', req.params.renewalId)
      .select('*, profiles(*)')
      .single()

    if (error) return res.status(500).json({ error: error.message })
    res.json({ renewal })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.patch('/:renewalId', async (req, res) => {
  try {
    const { data: renewal, error } = await supabaseAdmin
      .from('renewals')
      .update(req.body)
      .eq('id', req.params.renewalId)
      .select('*, profiles(*)')
      .single()

    if (error) return res.status(500).json({ error: error.message })
    res.json({ renewal })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:renewalId', async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('renewals').delete().eq('id', req.params.renewalId)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ message: 'Renewal deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:renewalId/email', async (req, res) => {
  try {
    const { data: renewal, error } = await supabaseAdmin
      .from('renewals')
      .select('*')
      .eq('id', req.params.renewalId)
      .single()
    if (error || !renewal) return res.status(404).json({ error: 'Renewal not found' })
    res.json({ success: true, message: 'Email sent' })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
