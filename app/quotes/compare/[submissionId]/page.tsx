"use client"
import{useState,useEffect,useCallback}from"react"
import{useParams}from"next/navigation"
import Link from"next/link"
import{createClient}from"@/lib/supabase/client"
const C={bg:"#0A0A0B",bg1:"#0C0C0E",bg2:"#141416",bg3:"#1E1E24",bd:"rgba(200,200,210,0.13)",tx:"#F0F0F2",t3:"#8888A0",bl:"#3B82F6",gr:"#10B981",or:"#F59E0B",rd:"#EF4444"}
const COMP:Record<string,string>={best:"#10B981",competitive:"#3B82F6",moderate:"#F59E0B",high:"#EF4444"}
const QS:Record<string,string>={received:"#A78BFA",presented:"#3B82F6",accepted:"#10B981",bound:"#065F46",declined:"#EF4444"}
export default function QuoteComparePage(){
  const{submissionId}=useParams() as{submissionId:string}
  const[quotes,setQuotes]=useState<any[]>([])
  const[sub,setSub]=useState<any>(null)
  const[loading,setLoading]=useState(true)
  const[act,setAct]=useState<string|null>(null)
  const load=useCallback(async()=>{
    setLoading(true)
    const sb=createClient()
    const[qr,sr]=await Promise.all([
      sb.from("quotes").select("*").eq("submission_id",submissionId).order("annual_premium",{ascending:true}),
      sb.from("submissions").select("*").eq("id",submissionId).single(),
    ])
    setQuotes(qr.data||[]);setSub(sr.data);setLoading(false)
  },[submissionId])
  useEffect(()=>{load()},[load])
  const accept=async(id:string)=>{
    setAct(id)
    await fetch("/api/workflow/quotes/"+id+"/accept",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({acceptedBy:"agent",authorizationEmail:"agent@casurance.com"})})
    load();setAct(null)
  }
  const bind=async(id:string)=>{
    const pol="POL-"+new Date().getFullYear()+"-"+Math.floor(Math.random()*9999).toString().padStart(4,"0")
    await fetch("/api/workflow/quotes/"+id+"/bind",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({policyNumber:pol,bindingConfirmationNumber:"BIND-2026-001"})})
    load()
  }
  const bestP=quotes.length>0?Math.min(...quotes.map(q=>parseFloat(q.annual_premium)||Infinity)):0
  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg}}><p style={{color:C.t3}}>Loading quotes...</p></div>
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,system-ui,sans-serif",color:C.tx}}>
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.bd,padding:"16px 28px",position:"sticky",top:0,zIndex:40}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Link href="/quotes" style={{color:C.t3,fontSize:13,textDecoration:"none"}}>Quotes</Link><span style={{color:C.t3}}>/</span>
            <span style={{fontWeight:600,fontSize:14}}>{sub?.insured_name||sub?.client_name||"Submission"}</span>
            <span style={{background:C.bl+"22",border:"1px solid "+C.bl+"44",borderRadius:20,padding:"3px 10px",fontSize:12,color:C.bl}}>{quotes.length} Quote{quotes.length!==1?"s":""}</span>
          </div>
          <Link href="/pipeline" style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"8px 14px",color:C.t3,fontSize:13,textDecoration:"none"}}>Pipeline</Link>
        </div>
      </div>
      <div style={{padding:"20px 24px",maxWidth:1400}}>
        {quotes.length===0?(
          <div style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:12,padding:60,textAlign:"center"}}><p style={{color:C.t3,fontSize:14}}>No quotes yet. Create placements to receive carrier quotes.</p></div>
        ):(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:C.bg2,borderBottom:"1px solid "+C.bd}}>
                {["Carrier","AM Best","Coverage","Premium","Delta","Rating","Status","Action"].map(h=>(
                  <th key={h} style={{padding:"12px 14px",textAlign:"left",color:C.t3,fontWeight:600,fontSize:12}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {quotes.map((q,i)=>{
                  const best=parseFloat(q.annual_premium)===bestP
                  const sc=QS[q.quote_status]||C.t3
                  const cc=COMP[q.competitiveness]||C.t3
                  const prem=parseFloat(q.annual_premium)||0
                  const cov=(q.coverage_types||[]).join(",")||(q.limits?Object.keys(q.limits).join(","):"N/A")
                  const delt=q.premium_percentage_delta?parseFloat(q.premium_percentage_delta):null
                  return(
                    <tr key={q.id} style={{borderBottom:"1px solid "+C.bd,background:best?"rgba(16,185,129,0.06)":i%2===0?C.bg2:C.bg1}}>
                      <td style={{padding:"12px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          {best&&<span style={{background:C.gr+"22",border:"1px solid "+C.gr+"44",borderRadius:20,padding:"1px 8px",fontSize:10,color:C.gr,fontWeight:600}}>BEST</span>}
                          <span style={{fontWeight:600}}>{q.carrier_name||q.carrier||"Unknown"}</span>
                        </div>
                      </td>
                      <td style={{padding:"12px 14px",color:C.t3,fontSize:12}}>{q.carrier_financial_strength||"N/A"}</td>
                      <td style={{padding:"12px 14px",color:C.t3,fontSize:11}}>{cov}</td>
                      <td style={{padding:"12px 14px",fontWeight:700,color:C.gr,fontSize:15}}>{ "$" + prem.toLocaleString()}</td>
                      <td style={{padding:"12px 14px",color:delt!==null&&delt<0?C.gr:C.or,fontWeight:600}}>{delt!==null?(delt>0?"+":"")+delt.toFixed(1)+"%":"N/A"}</td>
                      <td style={{padding:"12px 14px"}}><span style={{background:cc+"22",border:"1px solid "+cc+"44",borderRadius:20,padding:"2px 10px",fontSize:11,color:cc,textTransform:"capitalize"}}>{q.competitiveness||"N/A"}</span></td>
                      <td style={{padding:"12px 14px"}}><span style={{background:sc+"22",border:"1px solid "+sc+"44",borderRadius:20,padding:"2px 8px",fontSize:11,color:sc,textTransform:"capitalize"}}>{(q.quote_status||"received").replace(/_/g," ")}</span></td>
                      <td style={{padding:"12px 14px"}}>
                        {q.quote_status==="received"&&<button onClick={()=>accept(q.id)} disabled={act===q.id} style={{background:C.bl,border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600}}>{act===q.id?"...":"Accept"}</button>}
                        {q.quote_status==="accepted"&&<button onClick={()=>bind(q.id)} style={{background:C.gr,border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600}}>Bind Policy</button>}
                        {q.quote_status==="bound"&&<span style={{color:C.gr,fontWeight:600,fontSize:13}}>Bound &#x2713;</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}