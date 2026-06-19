import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('leads').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('leads').insert([req.body]).select().single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json(data)
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('leads').select('*').eq('id', req.params.id).single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.patch('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('leads').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('leads').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Lead deleted' })
})

router.post('/import', async (req, res) => {
  try {
    const leads = Array.isArray(req.body) ? req.body : req.body.leads
    if (!leads || leads.length === 0) return res.status(400).json({ error: 'No leads provided' })
    const { data, error } = await supabaseAdmin.from('leads').insert(leads).select()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ imported: data?.length || 0 })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

export default router
