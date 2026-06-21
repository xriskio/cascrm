'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const BG='#0A0A0B',BG1='#0C0C0E',BG2='#141416',BG3='#1E1E24',BD='rgba(200,200,210,0.14)',TEXT='#F0F0F2',T2='#C8C8D4',T3='#8888A0',FONT="Inter,DM Sans,system-ui,sans-serif"
const BLUE='#3B82F6',GREEN='#10B981',ORANGE='#F59E0B',RED='#EF4444',PURPLE='#8B5CF6'

const PHASE_META: Record<string,{label:string,days:string,color:string}> = {
  planning: { label:'Planning', days:'Days 120-90', color: BLUE },
  execution: { label:'Execution (Reshop)', days:'Days 90-45', color: ORANGE },
  finalization: { label:'Finalization & Bind', days:'Days 45-0', color: GREEN },
  completed: { label:'Completed', days:'Bound', color: GREEN },
}

export default function RenewalWorkflowPage() {
  const params = useParams()
  const router = useRouter()
  const renewalId = params.id as string
  const [renewal, setRenewal] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [phases, setPhases] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState('planning')
  const [showAddQuote, setShowAddQuote] = useState(false)
  const [newQuote, setNewQuote] = useState({ carrier:'', base_premium:'', taxes:'0', fees:'0', carrier_strength:'', recommendation_notes:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{text:string,type:string}|null>(null)

  useEffect(() => { loadData() }, [renewalId])

  async function loadData() {
    setLoading(true)
    try {
      // Load renewal
      const rRes = await fetch('/api/renewals/' + renewalId)
      if (rRes.ok) { const d = await rRes.json(); setRenewal(d.data || d) }
      // Load workflow
      const wRes = await fetch('/api/renewals/workflow?renewal_id=' + renewalId)
      if (wRes.ok) {
        const d = await wRes.json()
        if (d && d.length > 0) {
          const wf = d[0]
          setWorkflow(wf)
          setActivePhase(wf.current_phase || 'planning')
          // Load phases, tasks, quotes, log
          const [ph, tk, qt, al] = await Promise.all([
            fetch('/api/renewals/workflow/' + wf.id + '/phases').then(r => r.json()).catch(() => []),
            fetch('/api/renewals/workflow/' + wf.id + '/tasks').then(r => r.json()).catch(() => []),
            fetch('/api/renewals/workflow/' + wf.id + '/quotes').then(r => r.json()).catch(() => []),
            fetch('/api/renewals/workflow/' + wf.id + '/log').then(r => r.json()).catch(() => []),
          ])
          setPhases(ph || [])
          setTasks(tk || [])
          setQuotes(qt || [])
          setActivityLog(al || [])
        }
      }
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }

  async function startWorkflow() {
    if (!renewal) return
    setSaving(true)
    try {
      const r = await fetch('/api/renewals/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyNumber: renewal.policy_number || renewal.policyNumber,
          policyType: renewal.lob || renewal.policy_type || 'GL',
          expirationDate: renewal.expiration_date || renewal.expirationDate,
          assignedAgent: renewal.agent_name || renewal.assignedAgent || 'wael@casurance.com',
          currentCarrier: renewal.carrier || null,
          currentPremium: renewal.premium || null,
          renewalId: renewalId,
        })
      })
      const d = await r.json()
      if (d.success) { setMsg({ text:'Workflow started! Planning phase is active with 3 tasks.', type:'success' }); await loadData() }
      else setMsg({ text: d.error || 'Failed to start workflow', type:'error' })
    } catch(e: any) { setMsg({ text: e.message, type:'error' }) } finally { setSaving(false) }
  }

  async function completeTask(taskId: string, done: boolean) {
    if (!workflow) return
    await fetch('/api/renewals/workflow/' + workflow.id + '/tasks/' + taskId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: done ? 'completed' : 'pending' })
    })
    await loadData()
  }

  async function progressPhase() {
    if (!workflow) return
    const next: Record<string,string> = { planning:'execution', execution:'finalization', finalization:'completed' }
    const nextPhase = next[workflow.current_phase]
    if (!nextPhase) return
    setSaving(true)
    const r = await fetch('/api/renewals/workflow/' + workflow.id + '/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextPhase })
    })
    const d = await r.json()
    if (d.success) { setMsg({ text: 'Moved to ' + nextPhase + ' phase!', type:'success' }); await loadData() }
    else setMsg({ text: d.error || 'Failed', type:'error' })
    setSaving(false)
  }

  async function addQuote() {
    if (!workflow || !newQuote.carrier || !newQuote.base_premium) { setMsg({ text:'Carrier and base premium required', type:'error' }); return }
    setSaving(true)
    const total = (parseFloat(newQuote.base_premium)||0) + (parseFloat(newQuote.taxes)||0) + (parseFloat(newQuote.fees)||0)
    const r = await fetch('/api/renewals/workflow/' + workflow.id + '/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newQuote, total_premium: total.toString(), workflow_id: workflow.id })
    })
    const d = await r.json()
    if (d.success || d.id) { setMsg({ text:'Quote added!', type:'success' }); setShowAddQuote(false); setNewQuote({ carrier:'', base_premium:'', taxes:'0', fees:'0', carrier_strength:'', recommendation_notes:'' }); await loadData() }
    else setMsg({ text: d.error || 'Failed to add quote', type:'error' })
    setSaving(false)
  }

  async function sendNotification(type: string) {
    if (!workflow) return
    const clientEmail = renewal?.client_email || renewal?.email || ''
    const r = await fetch('/api/renewals/workflow/' + workflow.id + '/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationType: type, clientEmail, clientName: renewal?.client_name || renewal?.named_insured || '' })
    })
    const d = await r.json()
    setMsg({ text: d.success ? 'Email sent successfully!' : (d.error || 'Failed'), type: d.success ? 'success' : 'error' })
  }

  if (loading) return <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:T3, fontFamily:FONT }}>Loading renewal workflow...</div>

  const phaseOrder = ['planning','execution','finalization']
  const currentIdx = phaseOrder.indexOf(workflow?.current_phase || 'planning')
  const phaseProgress = workflow ? Math.round(((currentIdx) / 3) * 100 + (workflow.percent_complete || 0) / 3) : 0
  const phaseTasks = tasks.filter(t => {
    const p = phases.find(ph => ph.phase === activePhase)
    return p && t.phase_id === p.id
  })

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, padding:24, color:TEXT }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <Link href={'/renewals/' + renewalId} style={{ color:BLUE, textDecoration:'none', fontSize:13, display:'flex', alignItems:'center', gap:4, marginBottom:8 }}>← Back to Renewal Details</Link>
            <h1 style={{ fontSize:22, fontWeight:700, margin:0, letterSpacing:'-0.4px' }}>
              Renewal Workflow {renewal?.policy_number || renewal?.policyNumber ? '— ' + (renewal.policy_number || renewal.policyNumber) : ''}
            </h1>
            <p style={{ color:T3, fontSize:13, margin:'4px 0 0' }}>
              {renewal?.named_insured || renewal?.client_name || 'Client'} · {renewal?.lob || renewal?.policy_type || 'Policy'} · Expires {renewal?.expiration_date ? new Date(renewal.expiration_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          {workflow && (
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => sendNotification('kickoff_120')} style={{ padding:'7px 14px', background:'rgba(59,130,246,0.15)', color:BLUE, border:'1px solid rgba(59,130,246,0.3)', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:500 }}>📧 120-Day Kickoff</button>
              <button onClick={() => sendNotification('reminder_45')} style={{ padding:'7px 14px', background:'rgba(245,158,11,0.15)', color:ORANGE, border:'1px solid rgba(245,158,11,0.3)', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:500 }}>📧 45-Day Reminder</button>
              <button onClick={() => sendNotification('post_renewal_debrief')} style={{ padding:'7px 14px', background:'rgba(139,92,246,0.15)', color:PURPLE, border:'1px solid rgba(139,92,246,0.3)', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:500 }}>📧 Debrief</button>
            </div>
          )}
        </div>

        {msg && (
          <div style={{ padding:'10px 16px', marginBottom:16, borderRadius:8, background: msg.type==='success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border:'1px solid '+(msg.type==='success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'), color: msg.type==='success' ? GREEN : RED, fontSize:13 }}>
            {msg.text} <button onClick={() => setMsg(null)} style={{ marginLeft:8, background:'none', border:'none', cursor:'pointer', color:'inherit', fontSize:16 }}>×</button>
          </div>
        )}

        {!workflow ? (
          <div style={{ background:BG1, border:'1px solid '+BD, borderRadius:14, padding:48, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔄</div>
            <h2 style={{ fontSize:18, fontWeight:600, margin:'0 0 8px', color:TEXT }}>No Renewal Workflow Started</h2>
            <p style={{ color:T3, fontSize:14, marginBottom:24, maxWidth:400, margin:'0 auto 24px' }}>
              Starting a workflow will create a 120-day structured process with Planning, Execution (reshop), and Finalization phases — each with specific agent tasks.
            </p>
            <button onClick={startWorkflow} disabled={saving} style={{ padding:'12px 28px', background:BLUE, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:600, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Starting...' : '🚀 Begin Renewal Process'}
            </button>
          </div>
        ) : (
          <>
            {/* Phase Timeline */}
            <div style={{ background:BG1, border:'1px solid '+BD, borderRadius:14, padding:20, marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h2 style={{ fontSize:15, fontWeight:600, margin:0 }}>Phase Timeline</h2>
                <div style={{ fontSize:12, color:T3 }}>{workflow.percent_complete || 0}% complete</div>
              </div>
              <div style={{ display:'flex', gap:0, position:'relative', marginBottom:12 }}>
                {phaseOrder.map((phase, idx) => {
                  const meta = PHASE_META[phase]
                  const isActive = workflow.current_phase === phase
                  const isDone = currentIdx > idx
                  return (
                    <div key={phase} style={{ flex:1, position:'relative' }}>
                      {idx < 2 && <div style={{ position:'absolute', right:0, top:20, width:'100%', height:2, background: isDone ? GREEN : 'rgba(200,200,210,0.2)', zIndex:0 }} />}
                      <div onClick={() => setActivePhase(phase)} style={{ position:'relative', zIndex:1, textAlign:'center', cursor:'pointer' }}>
                        <div style={{ width:42, height:42, borderRadius:'50%', background: isDone ? GREEN : isActive ? meta.color : BG3, border:'2px solid '+(isDone ? GREEN : isActive ? meta.color : 'rgba(200,200,210,0.2)'), display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', fontSize:16 }}>
                          {isDone ? '✓' : isActive ? '●' : (idx+1)}
                        </div>
                        <div style={{ fontSize:12, fontWeight: isActive ? 600 : 400, color: isActive ? meta.color : isDone ? GREEN : T3 }}>{meta.label}</div>
                        <div style={{ fontSize:10, color:T3 }}>{meta.days}</div>
                        {phases.find(p => p.phase === phase) && (
                          <div style={{ fontSize:10, color:T3, marginTop:2 }}>
                            {phases.find(p => p.phase === phase)?.tasks_completed || 0}/{phases.find(p => p.phase === phase)?.tasks_total || 0} tasks
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {workflow.current_phase !== 'completed' && (
                <div style={{ textAlign:'center', marginTop:8 }}>
                  <button onClick={progressPhase} disabled={saving} style={{ padding:'8px 20px', background:'rgba(16,185,129,0.15)', color:GREEN, border:'1px solid rgba(16,185,129,0.3)', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:500, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : 'Move to ' + (PHASE_META[{planning:'execution',execution:'finalization',finalization:'completed'}[workflow.current_phase] || 'execution']?.label) + ' Phase →'}
                  </button>
                </div>
              )}
            </div>

            {/* Tasks + Quotes row */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              {/* Phase Tasks */}
              <div style={{ background:BG1, border:'1px solid '+BD, borderRadius:14, padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <h3 style={{ fontSize:14, fontWeight:600, margin:0 }}>{PHASE_META[activePhase]?.label} Tasks</h3>
                  <div style={{ display:'flex', gap:6 }}>
                    {phaseOrder.map(p => (
                      <button key={p} onClick={() => setActivePhase(p)} style={{ padding:'4px 10px', background: activePhase===p ? PHASE_META[p].color+'22' : 'transparent', color: activePhase===p ? PHASE_META[p].color : T3, border:'1px solid '+(activePhase===p ? PHASE_META[p].color+'44' : BD), borderRadius:6, cursor:'pointer', fontSize:11 }}>
                        {p.charAt(0).toUpperCase()+p.slice(1,4)}
                      </button>
                    ))}
                  </div>
                </div>
                {phaseTasks.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'20px 0', color:T3, fontSize:13 }}>No tasks for this phase yet.</div>
                ) : phaseTasks.map(task => (
                  <div key={task.id} style={{ display:'flex', gap:10, marginBottom:10, padding:'10px 12px', background:BG2, borderRadius:8, border:'1px solid '+(task.status==='completed' ? 'rgba(16,185,129,0.2)' : BD), alignItems:'flex-start' }}>
                    <input type="checkbox" checked={task.status==='completed'} onChange={e => completeTask(task.id, e.target.checked)} style={{ marginTop:3, cursor:'pointer', width:16, height:16, accentColor:GREEN }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, color: task.status==='completed' ? T3 : TEXT, textDecoration: task.status==='completed' ? 'line-through' : 'none' }}>{task.title}</div>
                      {task.description && <div style={{ fontSize:11, color:T3, marginTop:2 }}>{task.description}</div>}
                      <div style={{ display:'flex', gap:6, marginTop:4 }}>
                        <span style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background: task.priority==='critical' ? 'rgba(239,68,68,0.15)' : task.priority==='high' ? 'rgba(245,158,11,0.15)' : 'rgba(200,200,210,0.1)', color: task.priority==='critical' ? RED : task.priority==='high' ? ORANGE : T3 }}>{task.priority}</span>
                        {task.due_date && <span style={{ fontSize:10, color:T3 }}>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                        {task.requires_client_approval && <span style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background:'rgba(245,158,11,0.1)', color:ORANGE }}>Client approval</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quote Comparison */}
              <div style={{ background:BG1, border:'1px solid '+BD, borderRadius:14, padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <h3 style={{ fontSize:14, fontWeight:600, margin:0 }}>Market Quotes ({quotes.length})</h3>
                  <button onClick={() => setShowAddQuote(v => !v)} style={{ padding:'5px 12px', background:showAddQuote ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color:BLUE, border:'1px solid rgba(59,130,246,0.3)', borderRadius:6, cursor:'pointer', fontSize:12 }}>
                    {showAddQuote ? '✕ Cancel' : '+ Add Quote'}
                  </button>
                </div>

                {showAddQuote && (
                  <div style={{ background:BG2, border:'1px solid '+BD, borderRadius:8, padding:14, marginBottom:12 }}>
                    {[
                      { key:'carrier', label:'Carrier Name', placeholder:'e.g. GEICO Commercial' },
                      { key:'base_premium', label:'Base Premium ($)', placeholder:'12000' },
                      { key:'taxes', label:'Taxes ($)', placeholder:'0' },
                      { key:'fees', label:'Fees ($)', placeholder:'0' },
                      { key:'carrier_strength', label:'A.M. Best Rating', placeholder:'A+' },
                      { key:'recommendation_notes', label:'Notes', placeholder:'Coverage highlights...' },
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom:8 }}>
                        <label style={{ fontSize:11, color:T3, display:'block', marginBottom:3 }}>{f.label}</label>
                        <input value={(newQuote as any)[f.key]} onChange={e => setNewQuote(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                          style={{ width:'100%', padding:'7px 10px', background:BG3, border:'1px solid rgba(200,200,210,0.2)', borderRadius:6, color:TEXT, fontSize:12, boxSizing:'border-box' as const }} />
                      </div>
                    ))}
                    <button onClick={addQuote} disabled={saving} style={{ width:'100%', padding:'9px', background:GREEN, color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:13, fontWeight:500, marginTop:4 }}>
                      {saving ? 'Saving...' : 'Add Quote to Comparison'}
                    </button>
                  </div>
                )}

                {quotes.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'20px 0', color:T3, fontSize:13 }}>No quotes yet. Add carrier quotes above to compare.</div>
                ) : (
                  <div>
                    {quotes.sort((a,b) => parseFloat(a.total_premium||0) - parseFloat(b.total_premium||0)).map((q, idx) => (
                      <div key={q.id} style={{ padding:'10px 12px', background:BG2, borderRadius:8, marginBottom:8, border:'1px solid '+(idx===0 ? 'rgba(16,185,129,0.3)' : BD) }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:TEXT, display:'flex', alignItems:'center', gap:6 }}>
                              {q.carrier}
                              {idx===0 && <span style={{ fontSize:10, padding:'2px 6px', background:'rgba(16,185,129,0.15)', color:GREEN, borderRadius:4 }}>BEST</span>}
                            </div>
                            {q.carrier_strength && <div style={{ fontSize:11, color:T3 }}>A.M. Best: {q.carrier_strength}</div>}
                            {q.recommendation_notes && <div style={{ fontSize:11, color:T2, marginTop:2 }}>{q.recommendation_notes}</div>}
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:16, fontWeight:700, color: idx===0 ? GREEN : TEXT }}>${parseFloat(q.total_premium||0).toLocaleString()}</div>
                            {q.premium_delta_percent !== null && q.premium_delta_percent !== undefined && (
                              <div style={{ fontSize:11, color: parseFloat(q.premium_delta_percent) > 0 ? RED : GREEN }}>
                                {parseFloat(q.premium_delta_percent) > 0 ? '+' : ''}{parseFloat(q.premium_delta_percent).toFixed(1)}% vs current
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop:12, padding:'8px 12px', background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:8, fontSize:12, color:T2 }}>
                      <strong style={{ color:BLUE }}>Best quote:</strong> {quotes.sort((a,b) => parseFloat(a.total_premium||0) - parseFloat(b.total_premium||0))[0]?.carrier} at ${parseFloat(quotes.sort((a,b) => parseFloat(a.total_premium||0) - parseFloat(b.total_premium||0))[0]?.total_premium||0).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Log */}
            {activityLog.length > 0 && (
              <div style={{ background:BG1, border:'1px solid '+BD, borderRadius:14, padding:18 }}>
                <h3 style={{ fontSize:14, fontWeight:600, margin:'0 0 12px' }}>Activity Timeline</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {activityLog.slice(0,10).map(log => (
                    <div key={log.id} style={{ display:'flex', gap:10, fontSize:12, color:T2, padding:'6px 0', borderBottom:'1px solid rgba(200,200,210,0.06)' }}>
                      <span style={{ color:T3, flexShrink:0 }}>{new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                      <span style={{ color: log.visible_to_client ? GREEN : TEXT }}>{log.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
