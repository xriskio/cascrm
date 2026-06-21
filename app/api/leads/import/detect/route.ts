import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const SYNONYMS: Record<string, string[]> = {
  email: ['email','emailaddress','email_address','contactemail','businessemail','mail'],
  phone: ['phone','telephone','tel','mobile','cell','phonenumber','phone_number','contactphone'],
  contact_name: ['name','fullname','full_name','contactname','contact','person','clientname'],
  company_name: ['company','companyname','business','businessname','organization','org','employer','account','dba','insuredname'],
  first_name: ['firstname','first_name','fname','givenname','first'],
  last_name: ['lastname','last_name','lname','surname','familyname','last'],
  lead_type: ['policytype','policy_type','insurancetype','coverage','type','product','lob','coveragetype'],
  value: ['premium','annualpremium','annual_premium','estpremium','estimatedpremium','quote','value','amount'],
  industry: ['industry','businesstype','sector','trade'],
  source: ['source','leadsource','lead_source','origin','referral','channel','vendor'],
  notes: ['notes','comments','description','remarks','additionalinfo','note'],
  assigned_to: ['agent','assignedto','assigned_to','assignedagent','rep','owner'],
}

function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g,'') }

export async function POST(req: NextRequest) {
  const { headers: cols } = await req.json()
  if (!cols?.length) return NextResponse.json({ error: 'headers required' }, { status: 400 })
  const mapping: Record<string,string> = {}
  const used = new Set<string>()
  for (const h of cols) {
    const n = norm(h); let found = ''
    for (const [field, syns] of Object.entries(SYNONYMS)) {
      if (used.has(field)) continue
      if (syns.some(s => norm(s) === n || n.includes(norm(s)) || norm(s).includes(n))) { found = field; break }
    }
    mapping[h] = found
    if (found) used.add(found)
  }
  return NextResponse.json({ mapping })
}