"use client"
import { useState, useRef } from 'react'
import Link from 'next/link'
export default function LeadImportPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload'|'preview'|'done'>('upload')
  const [preview, setPreview] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string,string>>({})
  const [headers, setHeaders] = useState<string[]>([])
  const [jobId, setJobId] = useState('')
  const [rawRows, setRawRows] = useState<any[]>([])
  const [totals, setTotals] = useState({total:0,valid:0,invalid:0})
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [assignTo, setAssignTo] = useState('')
  const [fileName, setFileName] = useState('')
  const fRef = useRef<HTMLInputElement>(null)
  const FIELDS = ['','email','phone','contact_name','first_name','last_name','company_name','lead_type','value','industry','source','notes','assigned_to']
  const LABELS: Record<string,string> = {email:'Email',phone:'Phone',contact_name:'Full Name',first_name:'First Name',last_name:'Last Name',company_name:'Company',lead_type:'Policy Type',value:'Est. Premium',industry:'Industry',source:'Source',notes:'Notes',assigned_to:'Assign To'}
  const readFile = (file: File) => {
    setFileName(file.name)
    const r = new FileReader()
    r.onload = e => setContent((e.target?.result as string) || '')
    r.readAsText(file)
  }
  const parse = async () => {
    if (!content.trim()) { setError('Please upload a file or paste content'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/leads/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, fileName }) })
    const d = await res.json()
    if (!res.ok) { setError(d.error || 'Parse failed'); setLoading(false); return }
    setJobId(d.importJobId || ''); setHeaders(d.headers || []); setMapping(d.suggestedMapping || {})
    setRawRows(d.rawRows || []); setPreview(d.preview || [])
    setTotals({ total: d.totalRows || 0, valid: d.totalValid || 0, invalid: d.totalInvalid || 0 })
    setLoading(false); setStep('preview')
  }
  const doImport = async () => {
    setLoading(true)
    const rows = rawRows.map(row => {
      const lead: Record<string,string> = {}
      Object.entries(mapping).forEach(([h,f]) => { if (f && row[h]) lead[f] = row[h] })
      if (!lead.contact_name && (lead.first_name || lead.last_name))
        lead.contact_name = [lead.first_name, lead.last_name].filter(Boolean).join(' ')
      return lead
    }).filter(r => r.email || r.phone)
    const res = await fetch('/api/leads/import/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ importJobId: jobId, rows, assignTo }) })
    setResult(await res.json()); setLoading(false); setStep('done')
  }
  const s = { background: '#1E1E24', border: '1px solid rgba(200,200,210,0.13)', borderRadius: 8, padding: '8px 12px', color: '#F0F0F2', fontSize: 13, outline: 'none' } as const
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', fontFamily: 'Inter,system-ui,sans-serif', color: '#F0F0F2' }}>
      <div style={{ background: '#0C0C0E', borderBottom: '1px solid rgba(200,200,210,0.13)', padding: '16px 28px', position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/leads" style={{ color: '#8888A0', fontSize: 13, textDecoration: 'none' }}>Leads</Link>
          <span style={{ color: '#8888A0' }}>/</span>
          <span style={{ fontWeight: 700 }}>AI Import</span>
          <span style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: 12, color: '#8B5CF6' }}>CSV / TXT / Paste</span>
        </div>
        <Link href="/leads" style={{ background: '#1E1E24', border: '1px solid rgba(200,200,210,0.13)', borderRadius: 8, padding: '7px 14px', color: '#8888A0', fontSize: 13, textDecoration: 'none' }}>Back</Link>
      </div>
      <div style={{ padding: 28, maxWidth: 1100 }}>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', borderRadius: 8, padding: '10px 14px', color: '#EF4444', marginBottom: 16, fontSize: 13 }}>{error}</div>}
        {step === 'upload' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#141416', border: '1px solid rgba(200,200,210,0.13)', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>Upload File</h2>
              <div onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) readFile(f) }} onDragOver={e => e.preventDefault()} onClick={() => fRef.current?.click()}
                style={{ border: '2px dashed rgba(200,200,210,0.13)', borderRadius: 10, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#C8C8D4', marginBottom: 4 }}>Drop file or click to browse</div>
                <div style={{ fontSize: 12, color: '#8888A0' }}>CSV, TSV, TXT — up to 500 rows</div>
                {fileName && <div style={{ marginTop: 10, fontSize: 13, color: '#3B82F6', fontWeight: 600 }}>✓ {fileName}</div>}
              </div>
              <input ref={fRef} type="file" accept=".csv,.tsv,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f) }} />
              <div style={{ padding: '9px 12px', background: '#1E1E24', borderRadius: 8, fontSize: 12, color: '#8888A0' }}>Auto-detects: Email · Phone · Company · Name · Policy Type · Premium · Industry · Source</div>
            </div>
            <div style={{ background: '#141416', border: '1px solid rgba(200,200,210,0.13)', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>Paste Content</h2>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={11}
                placeholder={'Paste CSV rows or contact list here...\n\nExample:\nFirst Name,Last Name,Email,Phone,Company\nJohn,Doe,john@example.com,(555)123-4567,ACME Trucking'}
                style={{ ...s, width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5, boxSizing: 'border-box' }} />
              {content && <div style={{ marginTop: 6, fontSize: 12, color: '#8888A0' }}>{content.split('\n').length} lines</div>}
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={parse} disabled={loading || !content.trim()} style={{ background: '#3B82F6', border: 'none', borderRadius: 8, padding: '10px 22px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: content.trim() ? 1 : 0.5 }}>
                {loading ? 'Analyzing...' : 'Analyze & Map Fields →'}
              </button>
            </div>
          </div>
        )}
        {step === 'preview' && (
          <div style={{ background: '#141416', border: '1px solid rgba(200,200,210,0.13)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Review Field Mapping</h2>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <span style={{ fontSize: 14, color: '#3B82F6', fontWeight: 700 }}>{totals.total} <span style={{ fontSize: 12, fontWeight: 400, color: '#8888A0' }}>total</span></span>
                  <span style={{ fontSize: 14, color: '#10B981', fontWeight: 700 }}>{totals.valid} <span style={{ fontSize: 12, fontWeight: 400, color: '#8888A0' }}>valid</span></span>
                  <span style={{ fontSize: 14, color: '#EF4444', fontWeight: 700 }}>{totals.invalid} <span style={{ fontSize: 12, fontWeight: 400, color: '#8888A0' }}>invalid/skipped</span></span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div><div style={{ fontSize: 11, color: '#8888A0', marginBottom: 4 }}>Assign to agent</div><input value={assignTo} onChange={e => setAssignTo(e.target.value)} placeholder="agent@casurance.com" style={{ ...s, width: 200 }} /></div>
                <button onClick={() => setStep('upload')} style={{ background: '#1E1E24', border: '1px solid rgba(200,200,210,0.13)', borderRadius: 8, padding: '9px 16px', color: '#8888A0', fontSize: 13, cursor: 'pointer' }}>Back</button>
                <button onClick={doImport} disabled={loading || totals.valid === 0} style={{ background: '#10B981', border: 'none', borderRadius: 8, padding: '9px 18px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: totals.valid > 0 ? 1 : 0.5 }}>
                  {loading ? 'Importing...' : 'Import ' + totals.valid + ' Leads'}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {headers.map(h => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1E1E24', borderRadius: 8, padding: '9px 12px' }}>
                  <div style={{ width: 160, fontSize: 13, fontWeight: 600, color: '#C8C8D4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{h}</div>
                  <span style={{ color: '#8888A0', fontSize: 12 }}>→</span>
                  <select value={mapping[h] || ''} onChange={e => setMapping(m => ({ ...m, [h]: e.target.value }))} style={{ ...s, flex: 1, fontSize: 12 }}>
                    {FIELDS.map(f => <option key={f} value={f}>{f ? LABELS[f] || f : '-- skip --'}</option>)}
                  </select>
                  {mapping[h] && <span style={{ fontSize: 10, color: '#10B981', background: 'rgba(16,185,129,0.12)', borderRadius: 20, padding: '2px 8px' }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ borderBottom: '1px solid rgba(200,200,210,0.13)' }}>
                  {['Status','Name','Company','Email','Phone','Policy','Premium','Source'].map(h => <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#8888A0', fontSize: 11, fontWeight: 600 }}>{h}</th>)}
                </tr></thead>
                <tbody>{preview.map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(200,200,210,0.13)', background: r._valid ? 'transparent' : 'rgba(239,68,68,0.04)' }}>
                    <td style={{ padding: '6px 10px' }}>{r._valid ? <span style={{ color: '#10B981', fontWeight: 600 }}>✓</span> : <span style={{ color: '#EF4444', fontSize: 11 }}>{(r._errors || []).join(', ')}</span>}</td>
                    <td style={{ padding: '6px 10px' }}>{r.contact_name || '—'}</td>
                    <td style={{ padding: '6px 10px', color: '#8888A0' }}>{r.company_name || '—'}</td>
                    <td style={{ padding: '6px 10px', color: '#8888A0' }}>{r.email || '—'}</td>
                    <td style={{ padding: '6px 10px', color: '#8888A0' }}>{r.phone || '—'}</td>
                    <td style={{ padding: '6px 10px', color: '#8888A0' }}>{r.lead_type || '—'}</td>
                    <td style={{ padding: '6px 10px', color: '#10B981' }}>{r.value ? '$' + r.value : '—'}</td>
                    <td style={{ padding: '6px 10px', color: '#8888A0' }}>{r.source || '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
              {totals.total > 15 && <p style={{ textAlign: 'center', color: '#8888A0', fontSize: 12, marginTop: 8 }}>Showing first 15 of {totals.total} records</p>}
            </div>
          </div>
        )}
        {step === 'done' && result && (
          <div style={{ maxWidth: 520, margin: '0 auto', background: '#141416', border: '1px solid rgba(200,200,210,0.13)', borderRadius: 12, padding: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px', color: '#10B981' }}>Import Complete!</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
              {[{ l: 'Imported', v: result.imported, c: '#10B981' }, { l: 'Duplicates', v: result.duplicates, c: '#F59E0B' }, { l: 'Errors', v: result.errors, c: '#EF4444' }].map(m => (
                <div key={m.l} style={{ background: '#1E1E24', borderRadius: 8, padding: 14 }}><div style={{ fontSize: 28, fontWeight: 700, color: m.c }}>{m.v}</div><div style={{ fontSize: 12, color: '#8888A0', marginTop: 2 }}>{m.l}</div></div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => { setStep('upload'); setContent(''); setFileName(''); setResult(null) }} style={{ background: '#1E1E24', border: '1px solid rgba(200,200,210,0.13)', borderRadius: 8, padding: '9px 16px', color: '#8888A0', fontSize: 13, cursor: 'pointer' }}>Import More</button>
              <Link href="/leads" style={{ background: '#3B82F6', borderRadius: 8, padding: '9px 18px', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>View Leads</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}