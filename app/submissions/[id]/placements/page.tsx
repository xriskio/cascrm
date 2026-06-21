"use client"
import{useState,useEffect,useCallback}from"react"
import{useParams}from"next/navigation"
import Link from"next/link"
import{createClient}from"@/lib/supabase/client"
const C={bg:"#0A0A0B",bg1:"#0C0C0E",bg2:"#141416",bg3:"#1E1E24",bd:"rgba(200,200,210,0.13)",tx:"#F0F0F2",t3:"#8888A0",bl:"#3B82F6",gr:"#10B981",or:"#F59E0B",rd:"#EF4444",pu:"#8B5CF6"}
const SC:Record<string,string>={submitted:"#3B82F6",acknowledged:"#06B6D4",under_review:"#8B5CF6",quoted:"#10B981",declined:"#EF4444",withdrawn:"#6B7280",bound:"#065F46"}
export default function PlacementTrackerPage(){
  const{id}=useParams() as{id:string}
  const[sub,setSub]=useState<any>(null)
  const[pls,setPls]=useState<any[]>([])
  const[loading,setLoading]=useState(true)
  const[adding,setAdding]=useState(false)
  const[form,setForm]=useState({carrier:"",carrier_email:"",coverage_types:"GL,WC",special_requirements:""})
  const load=useCallback(async()=>{
    setLoading(true)
    const sb=createClient()
    const[sr,pr]=await Promise.all([
      sb.from("submissions").select("*").eq("id",id).single(),
      sb.from("market_submissions").select("*").eq("submission_id",id).order("created_at",{ascending:false}),
    ])
    setSub(sr.data);setPls(pr.data||[]);setLoading(false)
  },[id])
  useEffect(()=>{load()},[load])
  const addPlacement=async()=>{
    if(!form.carrier)return
    setAdding(true)
    const res=await fetch("/api/workflow/placements",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({submissionId:id,carrier:form.carrier,carrierEmail:form.carrier_email,coverageTypes:form.coverage_types.split(","),specialRequirements:form.special_requirements,assignedAgent:"agent"})})
    if(res.ok){setForm({carrier:"",carrier_email:"",coverage_types:"GL,WC",special_requirements:""});load()}
    setAdding(false)
  }
  const updateStatus=async(plId:string,status:string)=>{
    await fetch("/api/workflow/placements/"+plId+"/status",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({newStatus:status})})
    load()
  }
  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg}}><p style={{color:C.t3}}>Loading placements...</p></div>
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,system-ui,sans-serif",color:C.tx}}>
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.bd,padding:"16px 28px",position:"sticky",top:0,zIndex:40,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Link href="/market-submissions" style={{color:C.t3,fontSize:13,textDecoration:"none"}}>Market</Link><span style={{color:C.t3}}>/</span>
          <span style={{fontWeight:600,fontSize:14}}>{sub?.tracking_number||sub?.id?.slice(0,8)||"Submission"}</span>
          <span style={{background:C.pu+"22",border:"1px solid "+C.pu+"44",borderRadius:20,padding:"3px 10px",fontSize:12,color:C.pu}}>{pls.length} Carrier{pls.length!==1?"s":""}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Link href="/pipeline" style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"8px 14px",color:C.t3,fontSize:13,textDecoration:"none"}}>Pipeline</Link>
          <Link href="/quotes" style={{background:C.gr,borderRadius:8,padding:"8px 14px",color:"#fff",fontSize:13,textDecoration:"none",fontWeight:600}}>View Quotes</Link>
        </div>
      </div>
      <div style={{padding:"20px 24px",maxWidth:1200}}>
        <div style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:12,padding:18,marginBottom:20}}>
          <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 14px"}}>Send to New Carrier</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <input placeholder="Carrier name *" value={form.carrier} onChange={e=>setForm(f=>({...f,carrier:e.target.value}))} style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"9px 12px",color:C.tx,fontSize:13,outline:"none"}}/>
            <input placeholder="Carrier email" value={form.carrier_email} onChange={e=>setForm(f=>({...f,carrier_email:e.target.value}))} style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"9px 12px",color:C.tx,fontSize:13,outline:"none"}}/>
            <input placeholder="Coverage types (GL,WC,Auto)" value={form.coverage_types} onChange={e=>setForm(f=>({...f,coverage_types:e.target.value}))} style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"9px 12px",color:C.tx,fontSize:13,outline:"none"}}/>
            <input placeholder="Special requirements" value={form.special_requirements} onChange={e=>setForm(f=>({...f,special_requirements:e.target.value}))} style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"9px 12px",color:C.tx,fontSize:13,outline:"none"}}/>
          </div>
          <button onClick={addPlacement} disabled={adding||!form.carrier} style={{background:C.bl,border:"none",borderRadius:8,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",opacity:form.carrier?1:0.5}}>{adding?"Sending...":"Send to Carrier"}</button>
        </div>
        {pls.length===0?(
          <div style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:12,padding:40,textAlign:"center"}}><p style={{color:C.t3,fontSize:14}}>No carriers yet. Send submission to carriers above.</p></div>
        ):pls.map(pl=>{
          const sc=SC[pl.status]||C.t3
          const NEXT_STATUS:Record<string,string>={submitted:"acknowledged",acknowledged:"under_review",under_review:"quoted",quoted:"bound"}
          const next=NEXT_STATUS[pl.status]
          return(
            <div key={pl.id} style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:12,padding:18,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:8,background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏦</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:C.tx}}>{pl.carrier_name||pl.carrier}</div>
                    <div style={{fontSize:12,color:C.t3}}>{pl.placement_number||pl.id.slice(0,8)} {pl.carrier_email?"| "+pl.carrier_email:""}</div>
                  </div>
                  <span style={{background:sc+"22",border:"1px solid "+sc+"44",borderRadius:20,padding:"3px 10px",fontSize:12,color:sc,textTransform:"capitalize"}}>{pl.status?.replace(/_/g," ")}</span>
                </div>
                <div style={{display:"flex",gap:8}}>
                  {next&&<button onClick={()=>updateStatus(pl.id,next)} style={{background:next==="bound"?C.gr:C.bl,border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",textTransform:"capitalize"}}>{next.replace(/_/g," ")} &#x2192;</button>}
                  {pl.status!=="declined"&&pl.status!=="bound"&&<button onClick={()=>updateStatus(pl.id,"declined")} style={{background:"transparent",border:"1px solid "+C.rd,borderRadius:8,padding:"7px 12px",color:C.rd,fontSize:12,cursor:"pointer"}}>Decline</button>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
                {[{l:"Submitted",v:pl.submitted_date?new Date(pl.submitted_date).toLocaleDateString():"N/A"},{l:"Acknowledged",v:pl.acknowledged_date?new Date(pl.acknowledged_date).toLocaleDateString():"Pending"},{l:"Quote Date",v:pl.quote_received_date?new Date(pl.quote_received_date).toLocaleDateString():"Pending"},{l:"Appetite",v:pl.carrier_appetite||"N/A"}].map(f=>(
                  <div key={f.l} style={{background:C.bg3,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:C.t3}}>{f.l}</div><div style={{fontSize:12,fontWeight:600,marginTop:2}}>{f.v}</div></div>
                ))}
              </div>
              {pl.carrier_feedback&&<div style={{marginTop:10,background:C.bg3,borderRadius:8,padding:"8px 12px",fontSize:13,color:C.t3}}>Carrier: {pl.carrier_feedback}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}