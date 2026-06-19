import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    res.json(clients)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch clients' })
  }
})

router.post('/', async (req, res) => {
  try {
    const body = req.body

    if (!Array.isArray(body)) {
      const { data: clientNumber, error: rpcError } = await supabaseAdmin.rpc('generate_client_number')
      if (rpcError) throw new Error(`Failed to generate client number: ${rpcError.message}`)

      const { data: client, error } = await supabaseAdmin
        .from('clients')
        .insert([{ ...body, client_number: clientNumber }])
        .select()
        .single()

      if (error) throw new Error(`Failed to create client: ${error.message}`)
      return res.json(client)
    }

    const results = { success: 0, errors: 0, total: body.length, errorDetails: [] as string[] }
    const chunkSize = 100

    for (let i = 0; i < body.length; i += chunkSize) {
      const chunk = body.slice(i, i + chunkSize)
      try {
        const clientsWithNumbers = await Promise.all(
          chunk.map(async (client: any) => {
            const { data: clientNumber } = await supabaseAdmin.rpc('generate_client_number')
            return {
              ...client,
              client_number: clientNumber || `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: client.account_name || client.name,
              current_status: client.current_status || 'active',
            }
          })
        )
        const { data, error } = await supabaseAdmin.from('clients').insert(clientsWithNumbers).select()
        if (error) { results.errors += chunk.length; results.errorDetails.push(error.message) }
        else results.success += data?.length || 0
      } catch (e: any) {
        results.errors += chunk.length
        results.errorDetails.push(e.message)
      }
      if (i + chunkSize < body.length) await new Promise(r => setTimeout(r, 100))
    }
    res.json(results)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process request' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw new Error(error.message)
    if (!client) return res.status(404).json({ error: 'Client not found' })
    res.json(client)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    res.json(client)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    res.json(client)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('clients').delete().eq('id', req.params.id)
    if (error) throw new Error(error.message)
    res.json({ message: 'Client deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
