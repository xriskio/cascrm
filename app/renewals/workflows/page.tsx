'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const BG='#0A0A0B',BG1='#0C0C0E',BG2='#141416',BG3='#1E1E24',BD='rgba(200,200,210,0.14)',TEXT='#F0F0F2',T2='#C8C8D4',T3='#8888A0',FONT="Inter,DM Sans,system-ui,sans-serif"
const BLUE='#3B82F6',GREEN='#10B981',ORANGE='#F59E0B',RED='#EF4444',PURPLE='#8B5CF6'

function daysDiff(d: string | Date) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) }
function fmtDate(d: string | Date) { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }
function fmtShort(d: string | Date) { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) }
function fmtTime(d: string | Date) { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' ' + new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }

// API routes mapped to Next.js endpoints (snake_case Supabase fields)
const API = {
  list: (q: string) => '/api/renewals/workflow' + (q ? '?' + q : ''),
  detail: (id: string) => '/api/renewals/workflow/' + id,
  progress: (id: string) => '/api/renewals/workflow/' + id + '/progress',
  task: (wid: string, tid: string) => '/api/renewals/workflow/' + wid + '/tasks/' + tid,
  notify: (id: string) => '/api/renewals/workflow/' + id + '/notify',
  bind: (id: string) => '/api/renewals/workflow/' + id + '/bind',
  quotes: (id: string) => '/api/renewals/workflow/' + id + '/quotes',
}

const PHASE_SEQ = ['planning','execution','finalization']
const PHASE_COLOR: Record<string,string> = {planning:BLUE,execution:ORANGE,finalization:GREEN,completed:GREEN}

function StatusBadge({status}:{status:string}) {
  const c = status==='bound'?{bg:'rgba(16,185,129,0.12)',color:GREEN}: status==='quoted'?{bg:'rgba(59,130,246,0.12)',color:BLUE}: {bg:'rgba(200,200,210,0.08)',color:T3}
  return <span style={{padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600,textTransform:'uppercase' as const,...c}}>{status}</span>
}

function PhaseProgress({pct,color}:{pct:number,color:string}) {
  return (
    <div style={{width:80,height:4,background:'rgba(200,200,210,0.1)',borderRadius:2,overflow:'hidden'}}>
      <div style={{width:pct+'%',height:'100%',background:color,borderRadius:2,transition:'width 0.3s'}}/>
    </div>
  )
}

export default function RenewalWorkflowsPage() {
  const [renewals, setRenewals] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [phase, setPhase] = useState('all')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchList() }, [phase, status])

  async function fetchList() {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (phase !== 'all') p.set('phase', phase)
      if (status !== 'all') p.set('status', status)
      const r = await fetch(API.list(p.toString()))
      if (r.ok) setRenewals(await r.json())
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }

  async function fetchDetail(id: string) {
    const r = await fetch(API.detail(id))
    if (r.ok) setSelected(await r.json())
  }

  async function progressPhase(wfId: string, nextPhase: string) {
    const r = await fetch(API.progress(wfId), { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({nextPhase}) })
    if (r.ok) { await fetchDetail(wfId); await fetchList() }
  }

  async function toggleTask(wfId: string, taskId: string, done: boolean) {
    const r = await fetch(API.task(wfId, taskId), { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:done?'completed':'pending'}) })
    if (r.ok) fetchDetail(wfId)
  }

  async function sendNotif(wfId: string, type: string, email: string, name: string) {
    const r = await fetch(API.notify(wfId), { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({notificationType:type,clientEmail:email,clientName:name}) })
    const d = await r.json()
    alert(d.success ? '✅ Sent: ' + type : '❌ ' + (d.error || 'Failed'))
    if (d.success) fetchDetail(wfId)
  }

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:FONT,padding:24,color:TEXT}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:700,margin:'0 0 4px',letterSpacing:'-0.4px'}}>Renewal Workflows</h1>
            <p style={{color:T3,fontSize:13,margin:0}}>Manage 120-day commercial insurance renewal cycles with full reshop & bind workflow</p>
          </div>
          <Link href="/renewals" style={{color:BLUE,textDecoration:'none',fontSize:13}}>← Renewals Dashboard</Link>
        </div>

        <div style={{background:BG1,border:'1px solid '+BD,borderRadius:12,padding:'12px 16px',marginBottom:20,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap' as const}}>
          {[{label:'Phase',val:phase,set:setPhase,opts:[['all','All Phases'],['planning','Planning'],['execution','Execution'],['finalization','Finalization']]},
            {label:'Status',val:status,set:setStatus,opts:[['all','All Statuses'],['pending','Pending'],['in_progress','In Progress'],['quoted','Quoted'],['bound','Bound']]}
          ].map(f => (
            <div key={f.label} style={{display:'flex',alignItems:'center',gap:6}}>
              <label style={{fontSize:12,color:T3}}>{f.label}:</label>
              <select value={f.val} onChange={e=>f.set(e.target.value)} style={{padding:'5px 10px',background:BG2,border:'1px solid rgba(200,200,210,0.2)',borderRadius:6,color:TEXT,fontSize:12,cursor:'pointer'}}>
                {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <button onClick={fetchList} disabled={loading} style={{marginLeft:'auto',padding:'7px 16px',background:'rgba(59,130,246,0.12)',color:BLUE,border:'1px solid rgba(59,130,246,0.25)',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:500}}>
            {loading?'Loading...':'↻ Refresh'}
          </button>
          <span style={{fontSize:11,color:T3}}>{renewals.length} workflow{renewals.length!==1?'s':''}</span>
        </div>

        {!selected ? (
          renewals.length === 0 ? (
            <div style={{background:BG1,border:'1px solid '+BD,borderRadius:14,padding:48,textAlign:'center'}}>
              <div style={{fontSize:40,marginBottom:12}}>🔄</div>
              <h3 style={{fontSize:16,fontWeight:600,margin:'0 0 8px',color:TEXT}}>No Renewal Workflows</h3>
              <p style={{color:T3,fontSize:13,marginBottom:20}}>Start a workflow from a renewal detail page by clicking "Begin Renewal Process"</p>
              <Link href="/renewals" style={{padding:'10px 20px',background:BLUE,color:'#fff',textDecoration:'none',borderRadius:8,fontSize:13,fontWeight:500}}>Go to Renewals →</Link>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
              {renewals.map(r => {
                const days = daysDiff(r.expiration_date)
                const urgent = days <= 30
                return (
                  <div key={r.id} onClick={()=>fetchDetail(r.id)} style={{background:BG1,border:'2px solid '+(urgent?'rgba(239,68,68,0.3)':BD),borderRadius:14,padding:18,cursor:'pointer',transition:'all 0.15s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=BLUE;(e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 20px rgba(0,0,0,0.4)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=urgent?'rgba(239,68,68,0.3)':BD;(e.currentTarget as HTMLDivElement).style.boxShadow='none'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:TEXT}}>{r.policy_number}</div>
                        <div style={{fontSize:12,color:T3}}>{r.policy_type}</div>
                      </div>
                      <StatusBadge status={r.status}/>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
                      {[
                        {l:'Expires',v:<span style={{color:urgent?RED:TEXT,fontWeight:urgent?700:400}}>{fmtDate(r.expiration_date)} ({days}d)</span>},
                        {l:'Phase',v:<span style={{color:PHASE_COLOR[r.current_phase]||T2,fontWeight:500,textTransform:'capitalize' as const}}>{r.current_phase}</span>},
                        {l:'Quotes',v:<span style={{color:TEXT}}>{r.quote_count||0} received</span>},
                        {l:'Agent',v:<span style={{color:T3}}>{r.assigned_agent}</span>},
                      ].map(row=>(
                        <div key={row.l} style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                          <span style={{color:T3}}>{row.l}:</span>{row.v}
                        </div>
                      ))}
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:T3,marginBottom:4}}>
                        <span>Progress</span><span>{r.percent_complete||0}%</span>
                      </div>
                      <div style={{width:'100%',height:4,background:'rgba(200,200,210,0.1)',borderRadius:2}}>
                        <div style={{width:(r.percent_complete||0)+'%',height:'100%',background:BLUE,borderRadius:2,transition:'width 0.3s'}}/>
                      </div>
                    </div>
                    {r.current_premium && r.best_quote_premium && (
                      <div style={{borderTop:'1px solid '+BD,paddingTop:10,marginTop:10,display:'flex',justifyContent:'space-between',fontSize:12}}>
                        <div><div style={{color:T3}}>Current</div><div style={{color:TEXT,fontWeight:500}}>${parseFloat(r.current_premium).toLocaleString()}</div></div>
                        <div style={{textAlign:'right'}}><div style={{color:T3}}>Best Quote</div><div style={{color:GREEN,fontWeight:600}}>${parseFloat(r.best_quote_premium).toLocaleString()}</div></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        ) : (
          <DetailView
            data={selected}
            onBack={()=>setSelected(null)}
            onProgress={progressPhase}
            onTask={toggleTask}
            onNotify={sendNotif}
            onRefresh={()=>fetchDetail(selected.workflow.id)}
          />
        )}
      </div>
    </div>
  )
}

function DetailView({data,onBack,onProgress,onTask,onNotify,onRefresh}:any) {
  const {workflow,phases,tasks,quotes,notifications,activityLog} = data
  const [expandedPhase, setExpanded] = useState(workflow.current_phase)
  const [saving, setSaving] = useState(false)
  const [showAddQuote, setShowAddQuote] = useState(false)
  const [nq, setNq] = useState({carrier:'',base_premium:'',taxes:'0',fees:'0',carrier_strength:'',recommendation_notes:''})
  const [msg, setMsg] = useState<{t:string,k:string}|null>(null)
  const currentIdx = PHASE_SEQ.indexOf(workflow.current_phase)
  const sortedQuotes = [...(quotes||[])].sort((a,b)=>parseFloat(a.total_premium||0)-parseFloat(b.total_premium||0))

  async function addQuote() {
    if (!nq.carrier||!nq.base_premium) { setMsg({t:'Carrier and base premium required',k:'error'}); return }
    setSaving(true)
    const total = (parseFloat(nq.base_premium)||0)+(parseFloat(nq.taxes)||0)+(parseFloat(nq.fees)||0)
    const r = await fetch(API.quotes(workflow.id), { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...nq,total_premium:total.toString()}) })
    const d = await r.json()
    if (d.success||d.quote) { setMsg({t:'Quote added from '+nq.carrier+'!',k:'success'}); setShowAddQuote(false); setNq({carrier:'',base_premium:'',taxes:'0',fees:'0',carrier_strength:'',recommendation_notes:''}); onRefresh() }
    else setMsg({t:d.error||'Failed',k:'error'})
    setSaving(false)
  }

  async function bind() {
    if (!sortedQuotes.length) return
    const best = sortedQuotes[0]
    if (!confirm('BIND with '+best.carrier+' at $'+parseFloat(best.total_premium).toLocaleString()+'?\nThis completes the renewal and sends a confirmation email.')) return
    setSaving(true)
    const r = await fetch(API.bind(workflow.id), { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({selectedQuoteId:best.id}) })
    const d = await r.json()
    if (d.success) { setMsg({t:'🎉 Policy BOUND with '+best.carrier+'!',k:'success'}); onRefresh() }
    else setMsg({t:d.error||'Bind failed',k:'error'})
    setSaving(false)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <button onClick={onBack} style={{alignSelf:'flex-start',color:BLUE,background:'none',border:'none',cursor:'pointer',fontSize:13,padding:0}}>← Back to All Workflows</button>

      {msg && <div style={{padding:'10px 16px',borderRadius:8,background:msg.k==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',border:'1px solid '+(msg.k==='success'?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'),color:msg.k==='success'?GREEN:RED,fontSize:13,display:'flex',justifyContent:'space-between'}}>
        {msg.t}<button onClick={()=>setMsg(null)} style={{background:'none',border:'none',cursor:'pointer',color:'inherit',fontSize:16}}>×</button>
      </div>}

      {workflow.status==='bound' && <div style={{padding:'14px 18px',borderRadius:10,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)',display:'flex',gap:12,alignItems:'center'}}>
        <span style={{fontSize:28}}>🎉</span>
        <div><div style={{fontSize:15,fontWeight:700,color:GREEN}}>Policy Bound!</div>
        <div style={{fontSize:13,color:T2}}>Bound with <strong>{workflow.preferred_carrier}</strong> at <strong>${parseFloat(workflow.best_quote_premium||0).toLocaleString()}/yr</strong></div></div>
      </div>}

      <div style={{background:BG1,border:'1px solid '+BD,borderRadius:14,padding:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:700,margin:'0 0 4px'}}>{workflow.policy_number}</h2>
            <p style={{color:T3,fontSize:13,margin:0}}>{workflow.policy_type} · Expires {fmtDate(workflow.expiration_date)}</p>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:12,color:T3,marginBottom:4}}>{Math.max(0,daysDiff(workflow.expiration_date))} days remaining</div>
            <StatusBadge status={workflow.status}/>
          </div>
        </div>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:T3,marginBottom:6}}><span>Overall Progress</span><strong style={{color:TEXT}}>{workflow.percent_complete||0}%</strong></div>
          <div style={{height:8,background:'rgba(200,200,210,0.1)',borderRadius:4,overflow:'hidden'}}>
            <div style={{width:(workflow.percent_complete||0)+'%',height:'100%',background:'linear-gradient(90deg,'+BLUE+','+PURPLE+')',borderRadius:4,transition:'width 0.4s'}}/>
          </div>
        </div>
        {workflow.status!=='bound' && (
          <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap' as const}}>
            <button onClick={()=>onNotify(workflow.id,'kickoff_120','','Valued Client')} style={{padding:'6px 12px',background:'rgba(59,130,246,0.1)',color:BLUE,border:'1px solid rgba(59,130,246,0.2)',borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:500}}>📧 120-Day Kickoff</button>
            <button onClick={()=>onNotify(workflow.id,'reminder_45','','Valued Client')} style={{padding:'6px 12px',background:'rgba(245,158,11,0.1)',color:ORANGE,border:'1px solid rgba(245,158,11,0.2)',borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:500}}>📧 45-Day Reminder</button>
            <button onClick={()=>onNotify(workflow.id,'post_renewal_debrief','','Valued Client')} style={{padding:'6px 12px',background:'rgba(139,92,246,0.1)',color:PURPLE,border:'1px solid rgba(139,92,246,0.2)',borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:500}}>📧 Post-Renewal Debrief</button>
          </div>
        )}
      </div>

      <div style={{background:BG1,border:'1px solid '+BD,borderRadius:14,padding:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{fontSize:14,fontWeight:600,margin:0}}>Phase Timeline</h3>
          {workflow.current_phase!=='completed'&&workflow.status!=='bound'&&(
            <button onClick={()=>onProgress(workflow.id,PHASE_SEQ[currentIdx+1])} disabled={saving} style={{padding:'6px 14px',background:'rgba(16,185,129,0.12)',color:GREEN,border:'1px solid rgba(16,185,129,0.25)',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:500}}>
              Move to {PHASE_SEQ[currentIdx+1]?.charAt(0).toUpperCase()+(PHASE_SEQ[currentIdx+1]?.slice(1)||'')} Phase →
            </button>
          )}
        </div>
        {(phases||[]).map((ph: any, idx: number) => {
          const isActive = ph.phase===workflow.current_phase
          const isDone = PHASE_SEQ.indexOf(ph.phase)<currentIdx
          const color = PHASE_COLOR[ph.phase]||T3
          const phaseTasks = (tasks||[]).filter((t:any)=>t.phase_id===ph.id)
          return (
            <div key={ph.id} style={{marginBottom:8,border:'1px solid '+(isActive?color+'44':BD),borderRadius:10,overflow:'hidden'}}>
              <div onClick={()=>setExpanded(expandedPhase===ph.id?'':ph.id)} style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',background:isActive?color+'08':'transparent'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:30,height:30,borderRadius:'50%',background:isDone?GREEN:isActive?color:BG3,border:'2px solid '+(isDone?GREEN:isActive?color:'rgba(200,200,210,0.2)'),display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#fff',fontWeight:700,flexShrink:0}}>
                    {isDone?'✓':isActive?'●':(idx+1)}
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:isActive?color:isDone?GREEN:T2,textTransform:'capitalize' as const}}>{ph.phase} Phase</div>
                    <div style={{fontSize:11,color:T3}}>{fmtShort(ph.start_date)} – {fmtShort(ph.end_date)}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11,color:T3,marginBottom:4}}>{ph.tasks_completed||0}/{ph.tasks_total||0} tasks</div>
                  <PhaseProgress pct={ph.completion_percent||0} color={isDone?GREEN:color}/>
                </div>
              </div>
              {expandedPhase===ph.id && (
                <div style={{padding:'10px 14px 14px',borderTop:'1px solid rgba(200,200,210,0.08)'}}>
                  {phaseTasks.length===0 ? <div style={{fontSize:12,color:T3,textAlign:'center',padding:'8px 0'}}>No tasks for this phase yet.</div>
                  : phaseTasks.map((t:any)=>(
                    <div key={t.id} style={{display:'flex',gap:10,marginBottom:8,padding:'10px 12px',background:BG2,borderRadius:8,border:'1px solid '+(t.status==='completed'?'rgba(16,185,129,0.18)':BD),alignItems:'flex-start'}}>
                      <input type="checkbox" checked={t.status==='completed'} onChange={e=>onTask(workflow.id,t.id,e.target.checked)} style={{marginTop:3,cursor:'pointer',width:15,height:15,accentColor:GREEN}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,color:t.status==='completed'?T3:TEXT,textDecoration:t.status==='completed'?'line-through':'none'}}>{t.title}</div>
                        {t.description&&<div style={{fontSize:11,color:T3,marginTop:2}}>{t.description}</div>}
                        <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap' as const}}>
                          <span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:t.priority==='critical'?'rgba(239,68,68,0.1)':t.priority==='high'?'rgba(245,158,11,0.1)':'rgba(200,200,210,0.06)',color:t.priority==='critical'?RED:t.priority==='high'?ORANGE:T3}}>{t.priority}</span>
                          {t.due_date&&<span style={{fontSize:10,color:T3}}>Due: {fmtShort(t.due_date)}</span>}
                          {t.requires_client_approval&&<span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:'rgba(245,158,11,0.08)',color:ORANGE}}>Client approval</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{background:BG1,border:'1px solid '+BD,borderRadius:14,padding:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <h3 style={{fontSize:14,fontWeight:600,margin:0}}>Quotes Received ({sortedQuotes.length})</h3>
          {workflow.status!=='bound'&&<button onClick={()=>setShowAddQuote(v=>!v)} style={{padding:'5px 12px',background:'rgba(59,130,246,0.1)',color:BLUE,border:'1px solid rgba(59,130,246,0.2)',borderRadius:6,cursor:'pointer',fontSize:12}}>{showAddQuote?'✕ Cancel':'+ Add Quote'}</button>}
        </div>
        {showAddQuote&&(
          <div style={{background:BG2,border:'1px solid '+BD,borderRadius:8,padding:14,marginBottom:14}}>
            {[{k:'carrier',l:'Carrier Name *',p:'e.g. GEICO Commercial'},{k:'base_premium',l:'Base Premium ($) *',p:'12000'},{k:'taxes',l:'Taxes',p:'0'},{k:'fees',l:'Fees',p:'0'},{k:'carrier_strength',l:'A.M. Best',p:'A+'},{k:'recommendation_notes',l:'Notes',p:'Coverage highlights...'}].map(f=>(
              <div key={f.k} style={{marginBottom:8}}>
                <label style={{fontSize:11,color:T3,display:'block',marginBottom:3}}>{f.l}</label>
                <input value={(nq as any)[f.k]} onChange={e=>setNq(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} style={{width:'100%',padding:'7px 10px',background:BG3,border:'1px solid rgba(200,200,210,0.15)',borderRadius:6,color:TEXT,fontSize:12,boxSizing:'border-box' as const}}/>
              </div>
            ))}
            {workflow.current_premium&&<div style={{padding:'6px 10px',background:'rgba(59,130,246,0.06)',borderRadius:6,fontSize:11,color:T3,marginBottom:8}}>
              Total: ${((parseFloat(nq.base_premium)||0)+(parseFloat(nq.taxes)||0)+(parseFloat(nq.fees)||0)).toLocaleString()} · Delta: {(((parseFloat(nq.base_premium)||0)+(parseFloat(nq.taxes)||0)+(parseFloat(nq.fees)||0)-parseFloat(workflow.current_premium))/parseFloat(workflow.current_premium)*100).toFixed(1)}% vs current
            </div>}
            <button onClick={addQuote} disabled={saving} style={{width:'100%',padding:'9px',background:GREEN,color:'#fff',border:'none',borderRadius:7,cursor:'pointer',fontSize:13,fontWeight:500}}>{saving?'Adding...':'Add to Comparison Table'}</button>
          </div>
        )}
        {sortedQuotes.length===0 ? <div style={{textAlign:'center',padding:'16px 0',color:T3,fontSize:13}}>No quotes yet. Add market quotes above to compare carriers.</div>
        : sortedQuotes.map((q:any,i:number)=>(
          <div key={q.id} style={{padding:'12px 14px',background:BG2,borderRadius:8,marginBottom:8,border:'1px solid '+(i===0?'rgba(16,185,129,0.25)':q.status==='bound'?'rgba(59,130,246,0.35)':BD)}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:TEXT,display:'flex',alignItems:'center',gap:6}}>
                  {q.carrier}
                  {i===0&&<span style={{fontSize:10,padding:'2px 6px',background:'rgba(16,185,129,0.12)',color:GREEN,borderRadius:4}}>BEST PRICE</span>}
                  {q.status==='bound'&&<span style={{fontSize:10,padding:'2px 6px',background:'rgba(59,130,246,0.12)',color:BLUE,borderRadius:4}}>BOUND ✓</span>}
                </div>
                {q.carrier_strength&&<div style={{fontSize:11,color:T3}}>A.M. Best: {q.carrier_strength}</div>}
                {q.recommendation_notes&&<div style={{fontSize:11,color:T2,marginTop:2}}>{q.recommendation_notes}</div>}
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:700,color:i===0?GREEN:TEXT}}>${parseFloat(q.total_premium||0).toLocaleString()}/yr</div>
                {q.premium_delta_percent!=null&&<div style={{fontSize:11,color:parseFloat(q.premium_delta_percent)>0?RED:GREEN}}>{parseFloat(q.premium_delta_percent)>0?'+':''}{parseFloat(q.premium_delta_percent).toFixed(1)}% vs current</div>}
              </div>
            </div>
          </div>
        ))}
        {sortedQuotes.length>0&&workflow.status!=='bound'&&(
          <div style={{marginTop:12,padding:'12px 14px',background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.18)',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:12,color:T2}}>
              <strong style={{color:GREEN}}>Recommendation:</strong> {sortedQuotes[0]?.carrier} — ${parseFloat(sortedQuotes[0]?.total_premium||0).toLocaleString()}/yr
              {sortedQuotes[0]?.premium_delta_percent!=null&&<span style={{color:parseFloat(sortedQuotes[0].premium_delta_percent)>0?RED:GREEN}}> ({parseFloat(sortedQuotes[0].premium_delta_percent)>0?'+':''}{parseFloat(sortedQuotes[0].premium_delta_percent).toFixed(1)}%)</span>}
            </div>
            <button onClick={bind} disabled={saving} style={{padding:'8px 18px',background:GREEN,color:'#fff',border:'none',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:700,flexShrink:0}}>🔒 Bind Best Quote</button>
          </div>
        )}
      </div>

      {(notifications||[]).length>0&&(
        <div style={{background:BG1,border:'1px solid '+BD,borderRadius:14,padding:20}}>
          <h3 style={{fontSize:14,fontWeight:600,margin:'0 0 12px'}}>📧 Sent Notifications</h3>
          {notifications.slice(0,5).map((n:any)=>(
            <div key={n.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:T2,padding:'6px 0',borderBottom:'1px solid rgba(200,200,210,0.06)'}}>
              <span>{(n.notification_type||n.notificationType||'').replace(/_/g,' ')}</span>
              <span style={{color:T3}}>{n.sent_at?fmtTime(n.sent_at):''}</span>
            </div>
          ))}
        </div>
      )}

      {(activityLog||[]).length>0&&(
        <div style={{background:BG1,border:'1px solid '+BD,borderRadius:14,padding:20}}>
          <h3 style={{fontSize:14,fontWeight:600,margin:'0 0 12px'}}>Activity Timeline</h3>
          {activityLog.slice(0,10).map((l:any)=>(
            <div key={l.id} style={{display:'flex',gap:10,fontSize:12,color:T2,padding:'5px 0',borderBottom:'1px solid rgba(200,200,210,0.05)'}}>
              <span style={{color:T3,flexShrink:0,whiteSpace:'nowrap' as const}}>{l.created_at?fmtTime(l.created_at):''}</span>
              <span style={{color:l.visible_to_client?GREEN:TEXT}}>{l.description}</span>
              {l.visible_to_client&&<span style={{fontSize:10,color:GREEN,flexShrink:0}}>client</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
