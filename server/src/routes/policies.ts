import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

router.get('/', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('policies').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('policies').insert([req.body]).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('policies').select('*').eq('id', req.params.id).single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.patch('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('policies').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('policies').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Policy deleted' })
})

export default router
