'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const BG='#0A0A0B', BG1='#0C0C0E', BD='rgba(192,192,200,0.10)', TEXT='#E2E2E8', T2='#9A9AAA', T3='#62626E', FONT='Inter,DM Sans,system-ui,sans-serif'

const STAGES = [
  { id:'leads', label:'Lead Capture', icon:'Target', color:'#3B82F6', href:'/leads', desc:'Prospects & qualification' },
  { id:'submissions', label:'Submission', icon:'Clipboard', color:'#8B5CF6', href:'/submissions', desc:'Risk assessment & docs' },
  { id:'market', label:'Market Placement', icon:'Signal', color:'#F59E0B', href:'/market-submissions', desc:'Carrier placement & quotes' },
  { id:'quotes', label:'Quote & Bind', icon:'Check', color:'#10B981', href:'/quotes', desc:'Accept & bind policy' },
]

export default function PipelinePage() {
  const [stats, setStats] = useState<Record<string,number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    try {
      const supabase = createClient()
      const [a, b, c, d] = await Promise.all([
        supabase.from('leads').select('*', { count:'exact', head:true }),
        supabase.from('submissions').select('*', { count:'exact', head:true }),
        supabase.from('market_submissions').select('*', { count:'exact', head:true }),
        supabase.from('quotes').select('*', { count:'exact', head:true }),
      ])
      setStats({ leads: a.count||0, submissions: b.count||0, market: c.count||0, quotes: d.count||0 })
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }

  const counts = [stats.leads, stats.submissions, stats.market, stats.quotes]

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, padding:28, color:TEXT }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.5px', margin:0, color:TEXT }}>Policy Pipeline</h1>
          <p style={{ color:T3, margin:'6px 0 0', fontSize:13 }}>Lead to Submission to Market Placement to Quote to Bound</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
          {STAGES.map((s, i) => (
            <div key={s.id} style={{ background:BG1, border:`1px solid ${BD}`, borderRadius:12, padding:20, position:'relative' }}>
              {i < 3 && (
                <div style={{ position:'absolute', right:-9, top:'50%', transform:'translateY(-50%)', zIndex:2, color:T3, fontSize:20, fontWeight:300 }}>{'>'}</div>
              )}
              <div style={{ fontSize:11, color:s.color, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:36, fontWeight:700, color:TEXT, margin:'8px 0' }}>{loading ? '...' : (counts[i] || 0)}</div>
              <div style={{ fontSize:12, color:T3, marginBottom:12 }}>{s.desc}</div>
              <Link href={s.href} style={{ display:'inline-block', padding:'6px 14px', background:s.color+'22', color:s.color, borderRadius:6, fontSize:12, fontWeight:500, textDecoration:'none', border:`1px solid ${s.color}44` }}>
                View All
              </Link>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={{ background:BG1, border:`1px solid ${BD}`, borderRadius:12, padding:20 }}>
            <h2 style={{ fontSize:14, fontWeight:600, margin:'0 0 16px', color:TEXT }}>Quick Actions</h2>
            {[
              { href:'/leads/new', label:'+ New Lead', color:'#3B82F6' },
              { href:'/submissions', label:'+ New Submission', color:'#8B5CF6' },
              { href:'/market-submissions', label:'+ Market Submission', color:'#F59E0B' },
              { href:'/quotes', label:'+ New Quote', color:'#10B981' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display:'block', padding:'10px 14px', marginBottom:8, background:a.color+'15', border:`1px solid ${a.color}33`, borderRadius:8, color:a.color, textDecoration:'none', fontSize:13, fontWeight:500 }}>
                {a.label}
              </Link>
            ))}
          </div>

          <div style={{ background:BG1, border:`1px solid ${BD}`, borderRadius:12, padding:20 }}>
            <h2 style={{ fontSize:14, fontWeight:600, margin:'0 0 16px', color:TEXT }}>Pipeline Summary</h2>
            {STAGES.map((s, i) => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:s.color+'22', border:`1px solid ${s.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:s.color, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:TEXT }}>{s.label}</div>
                  <div style={{ fontSize:11, color:T3 }}>{s.desc}</div>
                </div>
                <div style={{ fontSize:18, fontWeight:700, color:s.color }}>{loading ? '...' : (counts[i] || 0)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
