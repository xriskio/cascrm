'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
const BG='#0A0A0B',BG1='#0C0C0E',BG2='#141416',BD='rgba(192,192,200,0.10)',TEXT='#E2E2E8',T2='#9A9AAA',T3='#62626E',FONT="Inter,DM Sans,system-ui,sans-serif"
const SOURCES=[
  {id:'qq_catalyst',label:'QQ Catalyst CRM',color:'#3B82F6',icon:'QQ',desc:'Contacts via bearer token API'},
  {id:'casurance',label:'Casurance.com',color:'#8B5CF6',icon:'CA',desc:'Website form leads'},
  {id:'truxsurance',label:'Truxsurance.com',color:'#F59E0B',icon:'TX',desc:'Trucking website leads'},
  {id:'insurelimos',label:'InsureLimos.com',color:'#10B981',icon:'IL',desc:'Limousine website leads'},
]
export default function LeadAggregationPage() {
  const [status, setStatus] = useState<Record<string,any>>({})
  const [syncing, setSyncing] = useState<string|null>(null)
  const [log, setLog] = useState<string[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadStatus() }, [])
  async function loadStatus() {
    setLoading(true)
    try {
      const r = await fetch('/api/lead-aggregation/sync')
      if (r.ok) {
        const d = await r.json()
        const map: Record<string,any> = {}
        for (const s of (d.sources || [])) map[s.source_name] = s
        setStatus(map)
        setJobs(d.recentJobs || [])
        setQueue(d.pendingQueue || [])
      }
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }
  async function syncSource(sourceId: string) {
    setSyncing(sourceId)
    setLog(l => [...l, 'Starting sync from ' + sourceId + '...'])
    try {
      const r = await fetch('/api/lead-aggregation/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: sourceId }) })
      const d = await r.json()
      if (d.success) {
        setLog(l => [...l, '[' + sourceId + '] Imported: ' + d.imported + ', Duplicates: ' + d.duplicates + ', Total: ' + d.total])
      } else {
        setLog(l => [...l, '[ERROR] ' + sourceId + ': ' + d.error])
      }
      await loadStatus()
    } catch(e: any) {
      setLog(l => [...l, '[ERROR] ' + e.message])
    } finally { setSyncing(null) }
  }
  async function syncAll() {
    for (const s of SOURCES) await syncSource(s.id)
  }
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, padding: 24, color: TEXT }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.4px' }}>Lead Aggregation</h1>
            <p style={{ color: T3, margin: '4px 0 0', fontSize: 13 }}>Pull leads from QQ Catalyst + 3 websites into unified CRM</p>
          </div>
          <button onClick={syncAll} disabled={!!syncing} style={{ padding: '8px 18px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, opacity: syncing ? 0.6 : 1 }}>
            {syncing ? 'Syncing...' : 'Sync All Sources'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 24 }}>
          {SOURCES.map(s => {
            const src = status[s.id]
            const isSyncing = syncing === s.id
            return (
              <div key={s.id} style={{ background: BG1, border: '1px solid ' + BD, borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color + '22', border: '1px solid ' + s.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: s.color }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: T3 }}>{s.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => syncSource(s.id)} disabled={!!syncing} style={{ padding: '5px 12px', background: isSyncing ? s.color + '33' : s.color + '22', color: s.color, border: '1px solid ' + s.color + '44', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { label: 'Total Imported', val: src?.total_leads_imported || 0 },
                    { label: 'Last Sync', val: src?.last_sync_lead_count !== undefined ? src.last_sync_lead_count + ' new' : '—' },
                    { label: 'Errors', val: src?.sync_error_count || 0, color: src?.sync_error_count > 0 ? '#EF4444' : undefined },
                  ].map(m => (
                    <div key={m.label} style={{ background: BG2, borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: T3, marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: m.color || TEXT }}>{loading ? '...' : m.val}</div>
                    </div>
                  ))}
                </div>
                {src?.last_successful_sync && <div style={{ fontSize: 10, color: T3, marginTop: 8 }}>Last sync: {new Date(src.last_successful_sync).toLocaleString()}</div>}
                {src?.last_sync_error && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 4 }}>Error: {src.last_sync_error}</div>}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ background: BG1, border: '1px solid ' + BD, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Assignment Queue</div>
              <span style={{ fontSize: 11, background: '#3B82F622', color: '#3B82F6', padding: '2px 8px', borderRadius: 10 }}>{queue.length} pending</span>
            </div>
            {queue.length === 0 && <div style={{ fontSize: 12, color: T3, textAlign: 'center', padding: '12px 0' }}>No pending leads</div>}
            {queue.slice(0,6).map((q: any) => (
              <div key={q.id} style={{ padding: '8px 0', borderBottom: '1px solid ' + BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: TEXT }}>{q.lead_id}</div>
                  <div style={{ fontSize: 10, color: T3 }}>{q.source_brand} · {q.priority}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: q.priority === 'urgent' ? '#EF4444' : q.priority === 'high' ? '#F59E0B' : '#3B82F6', background: (q.priority === 'urgent' ? '#EF4444' : q.priority === 'high' ? '#F59E0B' : '#3B82F6') + '22', padding: '2px 6px', borderRadius: 4 }}>{q.priority}</span>
              </div>
            ))}
            {queue.length > 0 && <Link href='/leads' style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 12, color: '#3B82F6', textDecoration: 'none' }}>View all in Leads</Link>}
          </div>
          <div style={{ background: BG1, border: '1px solid ' + BD, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 12 }}>Recent Sync Jobs</div>
            {jobs.length === 0 && <div style={{ fontSize: 12, color: T3, textAlign: 'center', padding: '12px 0' }}>No sync jobs yet</div>}
            {jobs.slice(0,6).map((j: any) => (
              <div key={j.id} style={{ padding: '8px 0', borderBottom: '1px solid ' + BD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: TEXT }}>{j.lead_sources?.display_name || j.lead_source_id}</div>
                  <div style={{ fontSize: 10, color: T3 }}>{j.started_at ? new Date(j.started_at).toLocaleString() : '—'} · {j.records_success || 0} imported</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: j.status === 'success' ? '#10B981' : j.status === 'running' ? '#F59E0B' : '#EF4444', background: (j.status === 'success' ? '#10B981' : j.status === 'running' ? '#F59E0B' : '#EF4444') + '22', padding: '2px 6px', borderRadius: 4 }}>{j.status}</span>
              </div>
            ))}
          </div>
        </div>
        {log.length > 0 && (
          <div style={{ background: BG1, border: '1px solid ' + BD, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Sync Log</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: T2 }}>
              {log.map((line, i) => <div key={i} style={{ marginBottom: 3, color: line.startsWith('[ERROR]') ? '#EF4444' : T2 }}>{line}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
