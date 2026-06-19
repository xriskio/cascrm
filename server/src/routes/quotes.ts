import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

router.get('/', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('quotes').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('quotes').insert([req.body]).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('quotes').select('*').eq('id', req.params.id).single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.patch('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('quotes').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('quotes').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Quote deleted' })
})

router.post('/import', async (req, res) => {
  try {
    const quotes = Array.isArray(req.body) ? req.body : req.body.quotes
    const { data, error } = await supabaseAdmin.from('quotes').insert(quotes).select()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ imported: data?.length || 0 })
  } catch (err: any) { res.status(500).json({ error: err.message }) }
})

export default router
