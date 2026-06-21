"use client"
import{useState,useEffect}from"react"
import Link from"next/link"
import{createClient}from"@/lib/supabase/client"
const C={bg:"#0A0A0B",bg1:"#0C0C0E",bg2:"#141416",bg3:"#1E1E24",bd:"rgba(200,200,210,0.13)",tx:"#F0F0F2",t3:"#8888A0",bl:"#3B82F6",gr:"#10B981",pu:"#8B5CF6"}
export default function QuoteComparePage(){
  const[subs,setSubs]=useState<any[]>([])
  const[loading,setLoading]=useState(true)
  useEffect(()=>{
    const sb=createClient()
    sb.from("submissions").select("id,tracking_number,client_name,policy_type,status,created_at").order("created_at",{ascending:false}).limit(50)
      .then(({data})=>{setSubs(data||[]);setLoading(false)})
  },[])
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,system-ui,sans-serif",color:C.tx}}>
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.bd,padding:"16px 28px",position:"sticky",top:0,zIndex:40}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <Link href="/quotes" style={{color:C.t3,fontSize:13,textDecoration:"none"}}>Quotes</Link><span style={{color:C.t3}}>/</span>
            <span style={{fontWeight:700,fontSize:15}}>Quote Comparison</span>
          </div>
          <Link href="/pipeline" style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"7px 14px",color:C.t3,fontSize:13,textDecoration:"none"}}>Pipeline</Link>
        </div>
        <p style={{fontSize:13,color:C.t3,marginTop:8}}>Select a submission to compare its carrier quotes side by side, accept, and bind.</p>
      </div>
      <div style={{padding:"24px 28px",maxWidth:900}}>
        {loading?<p style={{color:C.t3}}>Loading submissions...</p>:subs.length===0?(
          <div style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:12,padding:40,textAlign:"center"}}>
            <p style={{color:C.t3}}>No submissions found. Create a submission first to get carrier quotes.</p>
            <Link href="/submissions/new" style={{display:"inline-block",marginTop:14,background:C.bl,borderRadius:8,padding:"9px 18px",color:"#fff",fontSize:13,textDecoration:"none",fontWeight:600}}>New Submission</Link>
          </div>
        ):subs.map(s=>{
          const sc:Record<string,string>={draft:"#A78BFA",ready:"#F59E0B",submitted:"#3B82F6",accepted:"#10B981",declined:"#EF4444"}
          const c=sc[s.status]||C.t3
          return(
            <div key={s.id} style={{background:C.bg2,border:"1px solid "+C.bd,borderRadius:12,padding:"16px 20px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:14}}>{s.client_name||s.tracking_number||s.id.slice(0,8)}</span>
                  <span style={{background:c+"22",border:"1px solid "+c+"44",borderRadius:20,padding:"2px 10px",fontSize:11,color:c,textTransform:"capitalize"}}>{s.status}</span>
                </div>
                <div style={{fontSize:12,color:C.t3}}>{s.policy_type||"Commercial"} • {s.tracking_number||s.id.slice(0,8)} • {s.created_at?new Date(s.created_at).toLocaleDateString():""}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Link href={"/submissions/"+s.id+"/workflow"} style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"7px 12px",color:C.t3,fontSize:12,textDecoration:"none"}}>Workflow</Link>
                <Link href={"/submissions/"+s.id+"/placements"} style={{background:C.bg3,border:"1px solid "+C.bd,borderRadius:8,padding:"7px 12px",color:C.t3,fontSize:12,textDecoration:"none"}}>Placements</Link>
                <Link href={"/quotes/compare/"+s.id} style={{background:C.pu,borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:12,textDecoration:"none",fontWeight:600}}>Compare Quotes →</Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}