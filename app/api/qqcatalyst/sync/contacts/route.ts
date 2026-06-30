import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as sb } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function displayName(contact: any) {
  return (
    contact.FullName ||
    contact.Name ||
    `${contact.FirstName || ''} ${contact.LastName || ''}`.trim() ||
    'Unknown'
  )
}

function qqContactId(contact: any) {
  const id = contact.EntityID || contact.ContactID || contact.ID
  return id ? String(id) : ''
}

function persistenceError(table: string, error: any) {
  return NextResponse.json(
    {
      success: false,
      error: `Failed to persist QQCatalyst ${table}: ${error.message}`,
    },
    { status: 500 },
  )
}

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}))
  const tok = b.token || req.headers.get('x-qq-token') || process.env.QQ_BEARER_TOKEN || process.env.QQCATALYST_BEARER_TOKEN

  if (!tok) {
    return NextResponse.json(
      { success: false, error: 'No token. Set QQ_BEARER_TOKEN in Railway or pass in body.token' },
      { status: 400 },
    )
  }

  const d = new Date().toISOString().slice(0, 10)
  const all: any[] = []
  let pg = 1

  while (pg <= 50) {
    const r = await fetch(
      'https://api.qqcatalyst.com/v1/Contacts/LastModifiedCreated?startDate=2000-01-01&endDate=' +
        d +
        '&pageNumber=' +
        pg +
        '&pageSize=500',
      { headers: { Authorization: 'Bearer ' + tok, Accept: 'application/json' } },
    )

    if (!r.ok) {
      const t = await r.text()
      return NextResponse.json({ success: false, error: 'QQ ' + r.status + ' contacts: ' + t.slice(0, 300) }, { status: 500 })
    }

    const j = await r.json()
    const rows = j?.Data || j?.data || []
    if (!rows.length) break

    all.push(...rows)
    if (pg >= (j?.PagesTotal || 1)) break
    pg++
  }

  if (!all.length) {
    return NextResponse.json(
      { success: false, error: '0 contacts from QQCatalyst. Get fresh token: app.qqcatalyst.com/apideveloper' },
      { status: 502 },
    )
  }

  const contacts = all
    .map((c: any) => ({
      entity_id: qqContactId(c),
      customer_id: c.CustomerID ? String(c.CustomerID) : null,
      first_name: c.FirstName || null,
      last_name: c.LastName || null,
      full_name: c.FullName || c.Name || null,
      email: c.Email || c.PrimaryEmail || null,
      phone: c.Phone || c.PrimaryPhone || null,
      business_name: c.BusinessName || c.CompanyName || null,
      contact_type: c.ContactType || null,
      qq_status: c.Status || null,
      producer: c.AgentName || null,
      raw_data: c,
      synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    .filter((c: any) => c.entity_id)

  const contactsResult = await sb.from('qqcatalyst_contacts').upsert(contacts, { onConflict: 'entity_id' })
  if (contactsResult.error) return persistenceError('contacts', contactsResult.error)

  const leads = all
    .map((c: any) => ({
      email: c.Email || c.PrimaryEmail || null,
      phone: c.Phone || c.PrimaryPhone || null,
      name: displayName(c),
      contact_name: displayName(c),
      company_name: c.BusinessName || c.CompanyName || null,
      source: 'qqcatalyst',
      status: 'new',
      stage: 'lead_capture',
    }))
    .filter((l: any) => l.email || l.phone)

  if (leads.length) {
    const leadsResult = await sb.from('leads').upsert(leads, { onConflict: 'email', ignoreDuplicates: true })
    if (leadsResult.error) return persistenceError('leads', leadsResult.error)
  }

  const clients = all
    .map((c: any) => {
      const id = qqContactId(c)
      return {
        qq_contact_id: id,
        customer_id: c.CustomerID ? String(c.CustomerID) : null,
        entity_id: id,
        contact_name: displayName(c),
        first_name: c.FirstName || null,
        last_name: c.LastName || null,
        name: displayName(c),
        email: c.Email || c.PrimaryEmail || null,
        phone: c.Phone || c.PrimaryPhone || null,
        business_name: c.BusinessName || c.CompanyName || null,
        updated_at: new Date().toISOString(),
      }
    })
    .filter((c: any) => c.qq_contact_id)

  if (clients.length) {
    const clientsResult = await sb.from('clients').upsert(clients, { onConflict: 'qq_contact_id' })
    if (clientsResult.error) return persistenceError('clients', clientsResult.error)
  }

  return NextResponse.json({
    success: true,
    contacts: all.length,
    leads: leads.length,
    clients: clients.length,
    message: 'Synced ' + all.length + ' contacts',
  })
}