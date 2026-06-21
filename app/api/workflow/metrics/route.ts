import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

function grp(arr:any[],k:string){return arr.reduce((a:any,i:any)=>{const v=i[k]||'unknown';a[v]=(a[v]||0)+1;return a},{})}
function pct(n:number,t:number){return t>0?parseFloat(((n/t)*100).toFixed(1)):0}
function avg(a:number[]){return a.length>0?parseFloat((a.reduce((x,y)=>x+y,0)/a.length).toFixed(1)):0}

export async function GET(req: NextRequest) {
  const sb = createClient()
  const days = parseInt(new URL(req.url).searchParams.get('days')||'30')
  const since = new Date(Date.now()-days*24*60*60*1000).toISOString()

  const [lr,sr,pr,qr] = await Promise.all([
    sb.from('leads').select('status,source,lead_score,created_at').gte('created_at',since),
    sb.from('submissions').select('status,created_at').gte('created_at',since),
    sb.from('market_submissions').select('status,submitted_date,quote_received_date,carrier_name,created_at').gte('created_at',since),
    sb.from('quotes').select('quote_status,annual_premium,competitiveness,created_at').gte('created_at',since),
  ])

  const leads=lr.data||[],subs=sr.data||[],pls=pr.data||[],qs=qr.data||[]
  const qualified=leads.filter(l=>['qualified','converted'].includes(l.status))
  const timed=pls.filter(p=>p.quote_received_date&&p.submitted_date)
  const daysToQ=timed.map(p=>Math.round((new Date(p.quote_received_date).getTime()-new Date(p.submitted_date).getTime())/86400000))
  const bound=qs.filter(q=>q.quote_status==='bound')
  const boundVal=bound.reduce((s,q)=>s+(parseFloat(q.annual_premium)||0),0)

  return NextResponse.json({
    period_days:days,
    generated_at:new Date().toISOString(),
    leads:{
      total:leads.length,
      qualified:qualified.length,
      qualification_rate_pct:pct(qualified.length,leads.length),
      avg_lead_score:avg(leads.map(l=>l.lead_score||0).filter(Boolean)),
      by_status:grp(leads,'status'),
      by_source:grp(leads,'source'),
    },
    submissions:{
      total:subs.length,
      by_status:grp(subs,'status'),
      ready_rate_pct:pct(subs.filter(s=>['ready','submitted','accepted'].includes(s.status)).length,subs.length),
      accepted_rate_pct:pct(subs.filter(s=>s.status==='accepted').length,subs.length),
    },
    placements:{
      total:pls.length,
      by_status:grp(pls,'status'),
      by_carrier:grp(pls,'carrier_name'),
      quote_rate_pct:pct(pls.filter(p=>['quoted','bound'].includes(p.status)).length,pls.length),
      decline_rate_pct:pct(pls.filter(p=>p.status==='declined').length,pls.length),
      avg_days_to_quote:avg(daysToQ),
    },
    quotes:{
      total:qs.length,
      by_status:grp(qs,'quote_status'),
      by_competitiveness:grp(qs,'competitiveness'),
      acceptance_rate_pct:pct(qs.filter(q=>['accepted','bound'].includes(q.quote_status)).length,qs.length),
      binding_rate_pct:pct(bound.length,qs.length),
      total_bound_premium:parseFloat(boundVal.toFixed(2)),
    },
  })
}