import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    let query = supabaseAdmin.from('tasks').select('*').order('created_at', { ascending: false })
    if (req.query.assigned === 'me') {
      // Would filter by current user - requires auth middleware
      query = query.neq('status', 'archived')
    }
    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

router.get('/stats', async (_req, res) => {
  try {
    const [{ count: total }, { count: pending }, { count: completed }] = await Promise.all([
      supabaseAdmin.from('tasks').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ])
    res.json({ total, pending, completed })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

router.post('/', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('tasks').insert([req.body]).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('tasks').select('*').eq('id', req.params.id).single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.patch('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('tasks').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('tasks').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Task deleted' })
})

export default router
