"use client"
import{useState,useEffect}from"react"
import Link from"next/link"
import{createClient}from"@/lib/supabase/client"
const BG="#0A0A0B",BG1="#0C0C0E",BD="rgba(192,192,200,0.10)",TEXT="#E2E2E8",T2="#9A9AAA",T3="#62626E",FONT="Inter,DM Sans,system-ui,sans-serif"
const STAGES=[{id:"leads",label:"Lead Capture",icon:"🎯",color:"#3B82F6",href:"/leads",desc:"Prospects & qualification"},{id:"submissions",label:"Submission",icon:"📋",color:"#8B5CF6",href:"/submissions",desc:"Risk assessment & docs"},{id:"market",label:"Market Placement",icon:"📡",color:"#F59E0B",href:"/market-submissions",desc:"Carrier placement & quotes"},{id:"quotes",label:"Quote & Bind",icon:"✅",color:"#10B981",href:"/quotes",desc:"Accept & bind policy"}]
export default function PipelinePage(){
  const[stats,setStats]=useState<Record<string,any>>({})
  const[loading,setLoading]=useState(true)
  useEffect(()=>{loadStats()},[]) 
  async function loadStats(){
    try{
      const supabase=createClient()
      const[{count:leads},{count:subs},{count:market},{count:quotes}]=await Promise.all([
        supabase.from("leads").select("*",{count:"exact",head:true}),
        supabase.from("submissions").select("*",{count:"exact",head:true}),
        supabase.from("market_submissions").select("*",{count:"exact",head:true}),
        supabase.from("quotes").select("*",{count:"exact",head:true})
      ])
      setStats({leads:leads||0,submissions:subs||0,market:market||0,quotes:quotes||0})
    }catch(e){console.error(e)}finally{setLoading(false)}
  }
  const counts=[stats.leads,stats.submissions,stats.market,stats.quotes]
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:FONT,padding:28,color:TEXT}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.5px",margin:0}}>Policy Pipeline</h1>
          <p style={{color:T2,margin:"6px 0 0",fontSize:13}}>Lead \u2192 Submission \u2192 Market Placement \u2192 Quote \u2192 Bound</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:32}}>
          {STAGES.map((s,i)=>(
            <div key={s.id} style={{background:BG1,border:`1px solid ${BD}`,borderRadius:12,padding:20,position:"relative"}}>
              {i<3&&<div style={{position:"absolute",right:-8,top:"50%",transform:"translateY(-50%)",zIndex:1,color:T3,fontSize:18,lineHeight:1}}>›</div>}
              <div style={{fontSize:28,marginBottom:12}}>{s.icon}</div>
              <div style={{fontSize:13,fontWeight:600,color:TEXT,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:11,color:T2,marginBottom:16}}>{s.desc}</div>
              <div style={{fontSize:28,fontWeight:700,color:s.color,marginBottom:4,fontVariantNumeric:"tabular-nums"}}>
                {loading?"—":counts[i]??0}
              </div>
              <div style={{fontSize:10,color:T3,marginBottom:16}}>active records</div>
              <Link href={s.href} style={{textDecoration:"none"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:500,color:s.color,padding:"5px 10px",borderRadius:6,border:`1px solid ${s.color}33`,background:`${s.color}11`,cursor:"pointer"}}>
                  View {s.label} →
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div style={{background:BG1,border:`1px solid ${BD}`,borderRadius:12,padding:24}}>
          <div style={{fontSize:14,fontWeight:600,color:TEXT,marginBottom:4}}>Pipeline Overview</div>
          <div style={{fontSize:12,color:T2}}>Track your deals from lead capture through to bound policy. Click any stage above to manage records in that phase.</div>
        </div>
      </div>
    </div>
  )
}