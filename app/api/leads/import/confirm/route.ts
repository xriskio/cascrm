import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

function calcLeadScore(lead: Record<string,string>): number {
  let score = 40
  const prem = parseFloat(lead.value || '0')
  if (prem >= 20000) score += 20
  else if (prem >= 10000) score += 12
  else if (prem >= 5000) score += 6
  const ind = (lead.industry || '').toLowerCase()
  if (['trucking','transportation','limousine','limo','towing'].some(k => ind.includes(k))) score += 12
  else if (['construction','contractor','restaurant','retail'].some(k => ind.includes(k))) score += 6
  if (lead.email) score += 8
  if (lead.phone) score += 6
  if (lead.company_name) score += 6
  if (lead.contact_name) score += 4
  if (lead.notes) score += 4
  return Math.min(score, 100)
}

function normalizePhone(p: string): string {
  const digits = p.replace(/\D/g,'')
  if (digits.length === 10) return digits.replace(/(\d{3})(\d{3})(\d{4})/,'() -')
  if (digits.length === 11 && digits[0] === '1') return digits.slice(1).replace(/(\d{3})(\d{3})(\d{4})/,'() -')
  return p
}

export async function POST(req: NextRequest) {
  const sb = createClient()
  const { importJobId, rows, fieldMapping, assignTo } = await req.json()

  if (!rows?.length) return NextResponse.json({ error: 'No rows to import' }, { status: 400 })

  let imported = 0, duplicates = 0, errors = 0
  const errorList: string[] = []

  for (const row of rows.slice(0, 500)) {
    try {
      if (!row.email && !row.phone) { errors++; continue }

      let isDuplicate = false
      if (row.email) {
        const { data: ex } = await sb.from('leads').select('id').eq('email', row.email).limit(1)
        if (ex && ex.length > 0) { duplicates++; isDuplicate = true }
      }
      if (!isDuplicate && row.phone) {
        const phone = row.phone.replace(/\D/g,'')
        if (phone.length >= 10) {
          const { data: ex } = await sb.from('leads').select('id').eq('phone', normalizePhone(row.phone)).limit(1)
          if (ex && ex.length > 0) { duplicates++; isDuplicate = true }
        }
      }
      if (isDuplicate) continue

      const lead: Record<string,unknown> = {
        email: row.email || null,
        phone: row.phone ? normalizePhone(row.phone) : null,
        contact_name: row.contact_name || row.company_name || 'Unknown',
        company_name: row.company_name || null,
        source: row.source || 'import',
        status: 'new',
        stage: 'lead_capture',
        form_step: 1,
        form_completion: 25,
        lead_type: row.lead_type || null,
        lead_score: calcLeadScore(row),
        value: row.value ? parseFloat(row.value.replace(/[^0-9.]/g,'')) || null : null,
        industry: row.industry || null,
        company_type: row.company_type || null,
        notes: row.notes || null,
        assigned_to: assignTo || row.assigned_to || null,
      }

      const { error } = await sb.from('leads').insert(lead)
      if (error) { errors++; errorList.push(error.message) } else { imported++ }
    } catch (e: any) {
      errors++
      errorList.push(e.message || 'Unknown error')
    }
  }

  if (importJobId) {
    await sb.from('import_jobs').update({
      status: 'completed', imported_records: imported,
      duplicate_records: duplicates, error_records: errors,
      completed_at: new Date().toISOString(),
    }).eq('id', importJobId)
  }

  return NextResponse.json({ imported, duplicates, errors, total: rows.length, errorSample: errorList.slice(0,5) })
}