"use client"
import{useState,useEffect,useCallback}from"react"
import{useParams}from"next/navigation"
import Link from"next/link"
import{createClient}from"@/lib/supabase/client"
const C={bg:"#0A0A0B",bg1:"#0C0C0E",bg2:"#141416",bg3:"#1E1E24",bd:"rgba(200,200,210,0.13)",tx:"#F0F0F2",t2:"#C8C8D4",t3:"#8888A0",bl:"#3B82F6",gr:"#10B981",or:"#F59E0B",rd:"#EF4444"}
const SC:Record<string,string>={draft:"#A78BFA",ready:"#F59E0B",submitted:"#3B82F6",accepted:"#10B981",declined:"#EF4444"}
const RC:Record<string,string>={excellent:"#10B981",good:"#3B82F6",fair:"#F59E0B",poor:"#EF4444"}
export default function SubWfPage(){
  const{id}=useParams() as{id:string}
  const[sub,setSub]=useState<any>(null)
  const[cl,setCl]=useState<any[]>([])
  const[ns,setNs]=useState<any[]>([])
  const[loading,setLoading]=useState(true)
  const[nt,setNt]=useState("")
  const[sv,setSv]=useState(false)
  const[tab,setTab]=useState("cl")
  const load=useCallback(async()=>{
    setLoading(true)
    const r=await fetch("/api/submissions/"+id+"/workflow")
    const d=await r.json()
    setSub(d.submission);setCl(d.checklist||[]);setNs(d.notes||[])
    setLoading(false)
  },[id])
  useEffect(()=>{load()},[load])
  const toggle=async(item:any)=>{
    const v=!item.is_completed
    setCl(p=>p.map((i:any)=>i.id===item.id?{...i,is_completed:v}:i))
    await fetch("/api/submissions/"+id+"/checklist/"+item.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({is_completed:v,completed_by:"agent"})})
    load()
  }
  const addNote=async()=>{
    if(!nt.trim())return;setSv(true)
    await fetch("/api/submissions/"+id+"/notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:nt,created_by:"agent"})})
    setNt("");setSv(false);load()
  }
  const adv=async(s:string)=>{
    const r=await fetch("/api/submissions/"+id+"/workflow",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:s})})
    if(r.ok){const d=await r.json();setSub(d.submission)}
  }
  const done=cl.filter((i:any)=>i.is_completed).length,req=cl.filter((i:any)=>i.is_required).length,rD=cl.filter((i:any)=>i.is_required&&i.is_completed).length
  const pct=cl.length>0?Math.round((done/cl.length)*100):0
  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg}}><p style={{color:C.t3}}>Loading...</p></div>
  if(!sub)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg}}><Link href="/submissions/list" style={{color:C.bl}}>Not found</Link></div>
  const sc=SC[sub.status]||C.t3
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,system-ui,sans-serif",color:C.tx}}>
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.bd,padding:"16px 28px",position:"sticky",top:0,zIndex:40}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Link href="/submissions/list" style={{color:C.t3,fontSize:13,textDecoration:"none"}}>Submissions</Link><span style={{color:C.t3}}>/</span>
            <span style={{fontWeight:600,fontSize:14}}>{sub.tracking_number||sub.id.slice(0,8)}</span>
            <span style={{background:sc+"22",border:"1px solid "+sc+"44",borderRadius:20,padding:"3px 10px",fontSize:12,color:sc,textTransform:"capitalize"}}>{sub.status}</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            {sub.status==="ready"&&<button onClick={()=>adv("submitted")} style={{background:C.bl,border:"none",borderRadius:8,padding:"8px 16px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Submit to Market</button>}
            {sub.status==="draft"&&rD>=req&&req>0&&<button onClick={()=>adv("ready")} style={{background:C.or,border:"none",borderRadius:8,padding:"8px 16px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Mark Ready</button>}
            <Link href="/pipeline" style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"8px 14px",color:C.t2,fontSize:13,textDecoration:"none"}}>Pipeline</Link>
          </div>
        </div>
      </div>
      <div style={{padding:"20px 24px",display:"grid",gridTemplateColumns:"1fr 280px",gap:18,maxWidth:1300}}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:12,padding:18}}>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 14px"}}>{sub.insured_name||sub.client_name||"Submission"}</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {([{l:"Policy Type",v:sub.policy_type||"N/A"},{l:"Agent",v:sub.assigned_agent||"N/A"},{l:"Underwriter",v:sub.assigned_underwriter||"N/A"},{l:"Coverage",v:(sub.coverage_types||[]).join(", ")||"N/A"},{l:"Est Premium",v:sub.estimated_annual_premium?"$"+Number(sub.estimated_annual_premium).toLocaleString():"N/A"},{l:"Created",v:sub.created_at?new Date(sub.created_at).toLocaleDateString():"N/A"}] as any[]).map((f:any)=>(
                <div key={f.l} style={{background:C.bg3,borderRadius:8,padding:"8px 12px"}}><div style={{fontSize:11,color:C.t3}}>{f.l}</div><div style={{fontSize:13,fontWeight:600,marginTop:2}}>{f.v}</div></div>
              ))}
            </div>
            {sub.risk_profile&&<div style={{marginTop:10,display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:12,color:C.t3}}>Risk:</span><span style={{background:(RC[sub.risk_profile]||C.t3)+"22",border:"1px solid "+(RC[sub.risk_profile]||C.t3)+"44",borderRadius:20,padding:"2px 10px",fontSize:12,color:RC[sub.risk_profile]||C.t3,textTransform:"capitalize"}}>{sub.risk_profile}</span></div>}
          </div>
          <div style={{display:"flex",gap:4,borderBottom:"1px solid "+C.bd}}>
            {[{k:"cl",label:"Checklist "+done+"/"+cl.length},{k:"notes",label:"Notes "+ns.length}].map(t=>(
              <button key={t.k} onClick={()=>setTab(t.k)} style={{background:tab===t.k?C.bg2:"transparent",border:tab===t.k?"1px solid "+C.bd:"1px solid transparent",borderBottom:tab===t.k?"1px solid "+C.bg2:"none",borderRadius:"8px 8px 0 0",padding:"8px 16px",color:tab===t.k?C.tx:C.t3,fontSize:13,cursor:"pointer",marginBottom:-1}}>{t.label}</button>
            ))}
          </div>
          {tab==="cl"&&(<div style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:"0 12px 12px 12px",padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <span style={{fontSize:13,color:C.t3}}>{rD}/{req} required</span>
              <div style={{background:C.bg3,borderRadius:10,overflow:"hidden",width:100,height:6}}><div style={{background:pct===100?C.gr:C.bl,height:"100%",width:pct+"%",transition:"width 0.3s"}}/></div>
            </div>
            {cl.length===0?(<p style={{textAlign:"center",color:C.t3,fontSize:13}}>Run SUBMISSION_WORKFLOW_SCHEMA.sql to enable checklist</p>):cl.map((item:any)=>(
              <div key={item.id} onClick={()=>toggle(item)} style={{display:"flex",gap:10,padding:"9px 10px",borderRadius:8,marginBottom:4,cursor:"pointer",background:item.is_completed?"rgba(16,185,129,0.06)":"transparent",border:"1px solid "+(item.is_completed?"rgba(16,185,129,0.2)":C.bd)}}>
                <div style={{width:18,height:18,borderRadius:4,border:"2px solid "+(item.is_completed?C.gr:C.t3),background:item.is_completed?C.gr:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>{item.is_completed&&<span style={{color:"#fff",fontSize:10}}>&#x2713;</span>}</div>
                <div style={{flex:1}}><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:13,fontWeight:600,color:item.is_completed?C.t2:C.tx,textDecoration:item.is_completed?"line-through":"none"}}>{item.item_name}</span>{item.is_required&&<span style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:20,padding:"1px 6px",fontSize:10,color:C.rd}}>Req</span>}</div></div>
              </div>
            ))}
          </div>)}
          {tab==="notes"&&(<div style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:"0 12px 12px 12px",padding:18}}>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <textarea value={nt} onChange={e=>setNt(e.target.value)} placeholder="Add note..." rows={3} style={{flex:1,background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"8px 12px",color:C.tx,fontSize:13,resize:"vertical",outline:"none"}}/>
              <button onClick={addNote} disabled={sv||!nt.trim()} style={{alignSelf:"flex-end",background:C.bl,border:"none",borderRadius:8,padding:"10px 14px",color:"#fff",fontSize:13,cursor:"pointer",opacity:nt.trim()?1:0.5}}>{sv?"Saving...":"Add"}</button>
            </div>
            {ns.map((n:any)=>(<div key={n.id} style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"10px 12px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:600,color:C.bl}}>{n.created_by}</span><span style={{fontSize:11,color:C.t3}}>{new Date(n.created_at).toLocaleString()}</span></div><p style={{margin:0,fontSize:13,lineHeight:1.5}}>{n.content}</p></div>))}
          </div>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:12,padding:18}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 14px"}}>Workflow Progress</h3>
            <div style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:30,fontWeight:700,color:pct===100?C.gr:C.bl}}>{pct}%</div><div style={{fontSize:12,color:C.t3}}>complete</div></div>
            {([{l:"Lead Capture",d:true,c:C.gr},{l:"Submission",d:sub.status!=="draft",c:sub.status==="draft"?C.or:C.gr,a:sub.status==="draft"},{l:"Market Placement",d:["submitted","accepted"].includes(sub.status),c:C.t3},{l:"Quote Mgmt",d:sub.status==="accepted",c:C.t3}] as any[]).map((s:any,i:number)=>(
              <div key={s.l} style={{display:"flex",gap:10,marginBottom:8,alignItems:"center"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:s.d?s.c:(s.a?"rgba(59,130,246,0.15)":C.bg3),border:"2px solid "+(s.d?s.c:(s.a?C.bl:C.bd)),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.d?<span style={{color:"#fff",fontSize:10,fontWeight:700}}>&#x2713;</span>:<span style={{color:s.a?C.bl:C.t3,fontSize:10}}>{i+1}</span>}</div>
                <span style={{fontSize:13,color:s.d||s.a?C.tx:C.t3}}>{s.l}</span>
              </div>
            ))}
          </div>
          <div style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:12,padding:18}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 10px"}}>Quick Links</h3>
            {[["/market-submissions","Market Placements"],["/quotes","Quotes"],["/pipeline","Pipeline Overview"]].map(([h,l])=>(
              <Link key={h} href={h} style={{display:"block",background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"9px 12px",color:C.tx,textDecoration:"none",fontSize:13,marginBottom:8}}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}