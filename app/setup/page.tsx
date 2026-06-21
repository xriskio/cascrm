'use client'
import { useState, useEffect } from 'react'
const BG='#0A0A0B',BG1='#0C0C0E',BG2='#141416',BD='rgba(192,192,200,0.10)',TEXT='#E2E2E8',T2='#9A9AAA',T3='#62626E',FONT="Inter,DM Sans,system-ui,sans-serif"
export default function SetupPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  useEffect(() => { checkStatus() }, [])
  async function checkStatus() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/setup-db')
      setResult(await r.json())
    } catch(e: any) { setResult({ error: e.message }) } finally { setLoading(false) }
  }
  function copySQL() {
    if (result?.sqlToRun) {
      navigator.clipboard.writeText(result.sqlToRun)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, padding:32, color:TEXT }}>
      <div style={{ maxWidth:820, margin:'0 auto' }}>
        <h1 style={{ fontSize:24, fontWeight:700, margin:'0 0 6px', letterSpacing:'-0.4px' }}>Database Setup</h1>
        <p style={{ color:T3, margin:'0 0 28px', fontSize:13 }}>Run migrations to create pipeline & aggregation tables in Supabase</p>
        {loading && <div style={{ background:BG1, border:'1px solid '+BD, borderRadius:12, padding:24, textAlign:'center', color:T3 }}>Checking database status...</div>}
        {result?.error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:12, padding:20, color:'#EF4444' }}>Error: {result.error}</div>}
        {result && !result.error && (
          <div>
            <div style={{ background: result.status === 'ready' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border:'1px solid '+(result.status === 'ready' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'), borderRadius:12, padding:20, marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:600, color: result.status === 'ready' ? '#10B981' : '#F59E0B', marginBottom:6 }}>
                {result.status === 'ready' ? '✅ Database Ready' : '⚠️ Setup Required'}
              </div>
              <div style={{ fontSize:13, color:T2 }}>{result.message}</div>
              <div style={{ display:'flex', gap:20, marginTop:12, fontSize:12, color:T3 }}>
                <span style={{ color:'#10B981' }}>✓ {result.tablesExisting} tables already exist</span>
                {result.tablesNeedingCreation > 0 && <span style={{ color:'#F59E0B' }}>⚠ {result.tablesNeedingCreation} tables need creation</span>}
              </div>
            </div>
            {result.sqlToRun && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:TEXT }}>SQL to Run in Supabase</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={copySQL} style={{ padding:'7px 16px', background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)', color: copied ? '#10B981' : '#3B82F6', border:'1px solid '+(copied ? 'rgba(16,185,129,0.4)' : 'rgba(59,130,246,0.4)'), borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:500 }}>
                      {copied ? '✓ Copied!' : '📋 Copy All SQL'}
                    </button>
                    <a href={result.supabaseSQLEditorURL} target="_blank" rel="noreferrer" style={{ padding:'7px 16px', background:'rgba(139,92,246,0.2)', color:'#8B5CF6', border:'1px solid rgba(139,92,246,0.4)', borderRadius:6, textDecoration:'none', fontSize:12, fontWeight:500 }}>
                      Open Supabase Editor ↗
                    </a>
                  </div>
                </div>
                <div style={{ background:BG2, border:'1px solid '+BD, borderRadius:8, padding:16, maxHeight:300, overflowY:'auto' }}>
                  <pre style={{ margin:0, fontSize:11, color:T2, fontFamily:'JetBrains Mono,monospace', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{result.sqlToRun}</pre>
                </div>
                <div style={{ marginTop:16, padding:16, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:8 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#3B82F6', marginBottom:8 }}>How to run:</div>
                  <ol style={{ margin:0, paddingLeft:16, fontSize:12, color:T2, lineHeight:1.8 }}>
                    <li>Click <strong style={{ color:TEXT }}>"Copy All SQL"</strong> above</li>
                    <li>Click <strong style={{ color:TEXT }}>"Open Supabase Editor"</strong> — it opens the SQL Editor</li>
                    <li>Paste the SQL and click <strong style={{ color:TEXT }}>"Run"</strong></li>
                    <li>Come back here and click <strong style={{ color:TEXT }}>"Re-check Status"</strong> to confirm</li>
                  </ol>
                </div>
              </div>
            )}
            <div style={{ background:BG1, border:'1px solid '+BD, borderRadius:12, padding:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:TEXT, marginBottom:12 }}>Table Status</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {(result.tables || []).map((t: any) => (
                  <div key={t.name} style={{ padding:'8px 10px', background:BG2, borderRadius:6, display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid '+(t.status === 'exists' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)') }}>
                    <span style={{ fontSize:11, color:TEXT }}>{t.name}</span>
                    <span style={{ fontSize:10, color: t.status === 'exists' ? '#10B981' : '#F59E0B' }}>{t.status === 'exists' ? '✓' : '⚠'}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={checkStatus} style={{ marginTop:16, padding:'8px 20px', background:'rgba(59,130,246,0.15)', color:'#3B82F6', border:'1px solid rgba(59,130,246,0.3)', borderRadius:8, cursor:'pointer', fontSize:13 }}>Re-check Status</button>
          </div>
        )}
      </div>
    </div>
  )
}
