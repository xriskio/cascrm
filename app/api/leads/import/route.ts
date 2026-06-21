import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const SYNONYMS: Record<string, string[]> = {
  email: ['email','emailaddress','email_address','contactemail','businessemail','mail'],
  phone: ['phone','telephone','tel','mobile','cell','phonenumber','phone_number','contactphone'],
  contact_name: ['name','fullname','full_name','contactname','contact','person','clientname'],
  company_name: ['company','companyname','business','businessname','organization','org','employer','account','dba','insuredname'],
  first_name: ['firstname','first_name','fname','first'],
  last_name: ['lastname','last_name','lname','surname','last'],
  lead_type: ['policytype','policy_type','insurancetype','coverage','type','product','lob'],
  value: ['premium','annualpremium','annual_premium','estpremium','estimatedpremium','quote','value','amount'],
  industry: ['industry','businesstype','sector','trade'],
  source: ['source','leadsource','lead_source','origin','referral','channel','vendor'],
  notes: ['notes','comments','description','remarks','additionalinfo','note'],
  assigned_to: ['agent','assignedto','assigned_to','assignedagent','rep','owner'],
  company_type: ['companytype','businesstype','entity','entitytype'],
}

function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g,'') }

function detectFieldMapping(headers: string[]): Record<string,string> {
  const mapping: Record<string,string> = {}
  const used = new Set<string>()
  for (const h of headers) {
    const n = norm(h); let found = ''
    for (const [field, syns] of Object.entries(SYNONYMS)) {
      if (used.has(field)) continue
      if (syns.some(s => norm(s) === n || n.includes(norm(s)) || norm(s).includes(n))) { found = field; break }
    }
    mapping[h] = found
    if (found) used.add(found)
  }
  return mapping
}

function parseCSV(content: string): { headers: string[], rows: Record<string,string>[] } {
  const lines = content.split(/\r?\n/).filter(l => l.trim())
  if (!lines.length) return { headers: [], rows: [] }
  const parseRow = (line: string): string[] => {
    const res: string[] = []; let cur = ''; let q = false
    for (const ch of line) {
      if (ch === '"') { q = !q }
      else if ((ch === ',' || ch === '\t') && !q) { res.push(cur.trim().replace(/^"|"$/g,'')); cur = '' }
      else { cur += ch }
    }
    res.push(cur.trim().replace(/^"|"$/g,''))
    return res
  }
  const headers = parseRow(lines[0])
  const rows: Record<string,string>[] = []
  for (let i = 1; i < Math.min(lines.length, 501); i++) {
    const vals = parseRow(lines[i])
    const row: Record<string,string> = {}
    headers.forEach((h,idx) => { row[h] = vals[idx] || '' })
    if (Object.values(row).some(v => v.trim())) rows.push(row)
  }
  return { headers, rows }
}

function applyMapping(row: Record<string,string>, mapping: Record<string,string>): Record<string,string> {
  const lead: Record<string,string> = {}
  for (const [h,f] of Object.entries(mapping)) {
    if (f && row[h]?.trim()) lead[f] = row[h].trim()
  }
  if (!lead.contact_name && (lead.first_name || lead.last_name))
    lead.contact_name = [lead.first_name, lead.last_name].filter(Boolean).join(' ')
  return lead
}

function validate(lead: Record<string,string>): string[] {
  const errs: string[] = []
  if (!lead.email && !lead.phone) errs.push('missing email/phone')
  if (!lead.company_name && !lead.contact_name) errs.push('missing company/name')
  if (lead.email && !lead.email.includes('@')) errs.push('invalid email')
  return errs
}

export async function POST(req: NextRequest) {
  const sb = createClient()
  const body = await req.json()
  const { content, fileName, mapping: userMapping } = body
  if (!content?.trim()) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const { headers, rows } = parseCSV(content)
  if (!headers.length || !rows.length) return NextResponse.json({ error: 'No data found' }, { status: 400 })

  const suggestedMapping = userMapping || detectFieldMapping(headers)
  const mapped = rows.map(r => applyMapping(r, suggestedMapping))
  const totalValid = mapped.filter(l => validate(l).length === 0).length
  const preview = mapped.slice(0, 15).map((lead, i) => {
    const errs = validate(lead)
    return { ...lead, _index: i, _errors: errs, _valid: errs.length === 0 }
  })

  const { data: job } = await sb.from('import_jobs').insert({
    file_name: fileName || 'paste', file_type: 'csv',
    status: 'preview', total_records: rows.length, valid_records: totalValid, field_mapping: suggestedMapping,
  }).select().single()

  return NextResponse.json({
    importJobId: job?.id, headers, suggestedMapping,
    totalRows: rows.length, totalValid, totalInvalid: rows.length - totalValid,
    preview, rawRows: rows.slice(0, 500),
  })
}

export async function GET(_req: NextRequest) {
  const sb = createClient()
  const { data } = await sb.from('import_jobs').select('*').order('created_at', { ascending: false }).limit(20)
  return NextResponse.json({ jobs: data || [] })
}