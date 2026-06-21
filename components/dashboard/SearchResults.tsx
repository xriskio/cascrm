"use client"
import{useState,useEffect,useRef}from"react"
import Link from"next/link"
const BG2="#141416",BG3="#1A1A1E",BD="rgba(192,192,200,0.18)",TEXT="#E2E2E8",T2="#9A9AAA",T3="#62626E",FONT="Inter,DM Sans,system-ui,sans-serif"
interface SearchResultsProps{query:string;open:boolean;onClose:()=>void}
export default function SearchResults({query,open,onClose}:SearchResultsProps){
  const[results,setResults]=useState<any>(null)
  const[loading,setLoading]=useState(false)
  useEffect(()=>{
    if(!open||query.length<2){setResults(null);return}
    const t=setTimeout(async()=>{
      setLoading(true)
      try{
        const r=await fetch("/api/search?q="+encodeURIComponent(query))
        const d=await r.json()
        setResults(d)
      }catch(e){console.error(e)}finally{setLoading(false)}
    },250)
    return()=>clearTimeout(t)
  },[query,open])
  if(!open||query.length<2)return null
  const SECTIONS=[
    {key:"clients",label:"Clients",icon:"\u25C9",color:"#22C55E",href:"/clients/",name:(r:any)=>r.name||r.business_name||"Client"},
    {key:"renewals",label:"Renewals",icon:"\u21BB",color:"#F59E0B",href:"/renewals/",name:(r:any)=>r.named_insured||r.client_name||r.policy_number||"Renewal"},
    {key:"leads",label:"Leads",icon:"\u2299",color:"#8B5CF6",href:"/leads/",name:(r:any)=>r.contact_name||r.company_name||"Lead"},
    {key:"submissions",label:"Submissions",icon:"\u25A1",color:"#3B82F6",href:"/submissions/",name:(r:any)=>r.client_name||r.tracking_number||"Submission"}
  ]
  const hasResults=results&&SECTIONS.some(s=>results[s.key]?.length>0)
  return(
    <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:BG2,border:"1px solid "+BD,borderRadius:12,boxShadow:"0 16px 48px rgba(0,0,0,0.7)",zIndex:200,overflow:"hidden",fontFamily:FONT}}>
      {loading&&<div style={{padding:"12px 14px",fontSize:12,color:T3}}>Searching...</div>}
      {!loading&&results&&!hasResults&&<div style={{padding:"12px 14px",fontSize:12,color:T3}}>No results for \"{query}\"</div>}
      {!loading&&results&&SECTIONS.map(s=>{
        const items=results[s.key]||[]
        if(!items.length)return null
        return(
          <div key={s.key}>
            <div style={{padding:"6px 14px 2px",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px",color:T3}}>{s.label}</div>
            {items.map((r:any)=>(
              <Link key={r.id} href={s.href+r.id} onClick={onClose} style={{textDecoration:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",cursor:"pointer"}} onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background=BG3}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background="transparent"}}>
                  <div style={{width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,background:s.color+"22",color:s.color,flexShrink:0}}>{s.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:500,color:TEXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name(r)}</div>
                    {r.status&&<div style={{fontSize:10,color:T3}}>{r.status}</div>}
                  </div>
                  <span style={{color:T3,fontSize:12}}>\u2192</span>
                </div>
              </Link>
            ))}
          </div>
        )
      })}
    </div>
  )
}