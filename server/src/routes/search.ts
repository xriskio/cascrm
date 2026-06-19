import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { query } = req.body
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' })
    }

    const searchTerm = `%${query.toLowerCase()}%`
    const results: any[] = []

    const [{ data: submissions }, { data: renewals }, { data: clients }, { data: calls }] = await Promise.all([
      supabaseAdmin.from('submissions').select('id, insured_name, policy_number, email, phone, company_name, line_of_business')
        .or(`insured_name.ilike.${searchTerm},policy_number.ilike.${searchTerm},email.ilike.${searchTerm},company_name.ilike.${searchTerm}`).limit(10),
      supabaseAdmin.from('renewals').select('id, client_name, policy_number, expiration_date, status')
        .or(`client_name.ilike.${searchTerm},policy_number.ilike.${searchTerm}`).limit(10),
      supabaseAdmin.from('clients').select('id, name, email, phone, company_name')
        .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},company_name.ilike.${searchTerm}`).limit(10),
      supabaseAdmin.from('call_logs').select('id, client_name, phone_number, notes').ilike('client_name', `%${query}%`).limit(5),
    ])

    submissions?.forEach((s) => results.push({
      id: s.id, type: 'submission',
      title: s.insured_name || s.company_name || 'Unnamed Submission',
      subtitle: s.policy_number || s.line_of_business,
      url: `/submissions/view/${s.id}`,
    }))

    renewals?.forEach((r) => results.push({
      id: r.id, type: 'renewal',
      title: r.client_name || 'Unnamed Renewal',
      subtitle: r.policy_number,
      url: `/renewals/${r.id}`,
    }))

    clients?.forEach((c) => results.push({
      id: c.id, type: 'client',
      title: c.name || c.company_name || 'Unnamed Client',
      subtitle: c.email,
      url: `/clients/${c.id}`,
    }))

    calls?.forEach((c) => results.push({
      id: c.id, type: 'call',
      title: c.client_name || 'Unknown Caller',
      subtitle: c.phone_number,
      url: `/call-log/${c.id}`,
    }))

    res.json(results)
  } catch (error: any) {
    res.status(500).json({ error: 'An error occurred while searching' })
  }
})

export default router
