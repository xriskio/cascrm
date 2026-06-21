"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const C = {bg:"#0A0A0B",bg1:"#0C0C0E",bg2:"#141416",bg3:"#1E1E24",border:"rgba(200,200,210,0.13)",text:"#F0F0F2",t2:"#C8C8D4",t3:"#8888A0",blue:"#3B82F6",green:"#10B981",orange:"#F59E0B",red:"#EF4444",purple:"#8B5CF6",silver:"#C0C0C8"}
const STAGES=[{id:"lead",label:"Lead Capture",color:"#3B82F6",desc:"Incoming leads from all sources",href:"/leads/pipeline"},{id:"submission",label:"Submission",color:"#8B5CF6",desc:"Risk assessment and underwriting",href:"/submissions/list"},{id:"placement",label:"Market Placement",color:"#F59E0B",desc:"Sending to carriers for quotes",href:"/market-submissions"},{id:"quote",label:"Quote Management",color:"#10B981",desc:"Quote comparison and binding",href:"/quotes"}]
const SC:Record<string,string>={new:"#3B82F6",contacted:"#06B6D4",qualified:"#8B5CF6",draft:"#A78BFA",ready:"#F59E0B",submitted:"#F97316",pending:"#FB923C",sent:"#F59E0B",quoted:"#FBBF24",received:"#34D399",reviewed:"#10B981",selected:"#059669",bound:"#065F46",lost:"#EF4444",declined:"#EF4444",withdrawn:"#6B7280"}
interface Item{id:string;display_name:string;company?:string;status:string;priority?:string;amount?:number;created_at:string;href:string}
export default function PipelinePage(){
  const [items,setItems]=useState<Record<string,Item[]>>({lead:[],submission:[],placement:[],quote:[]})
  const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState("")
  const [totals,setTotals]=useState({leads:0,submissions:0,placements:0,quotes:0,bound_value:0})
  const fetchAll=useCallback(async()=>{
    setLoading(true)
    const sb=createClient()
    const [lr,sr,mr,qr]=await Promise.all([
      sb.from("leads").select("id,contact_name,company_name,status,priority,value,created_at").order("created_at",{ascending:false}).limit(50),
      sb.from("submissions").select("id,tracking_number,client_name,status,estimated_annual_premium,created_at").order("created_at",{ascending:false}).limit(50),
      sb.from("market_submissions").select("id,carrier_name,status,estimated_premium,created_at").order("created_at",{ascending:false}).limit(50),
      sb.from("quotes").select("id,carrier_name,quote_number,status,annual_premium,created_at").order("created_at",{ascending:false}).limit(50),
    ])
    const ld:Item[]=(lr.data||[]).map((l:any)=>({id:l.id,display_name:l.contact_name||"Unknown Lead",company:l.company_name,status:l.status||"new",priority:l.priority,amount:l.value,created_at:l.created_at,href:"/leads/pipeline"}))
    const sd:Item[]=(sr.data||[]).map((s:any)=>({id:s.id,display_name:s.tracking_number||"Submission",company:s.client_name,status:s.status||"draft",amount:s.estimated_annual_premium,created_at:s.created_at,href:"/submissions/list"}))
    const md:Item[]=(mr.data||[]).map((m:any)=>({id:m.id,display_name:m.carrier_name||"Market Placement",status:m.status||"pending",amount:m.estimated_premium,created_at:m.created_at,href:"/market-submissions"}))
    const qd:Item[]=(qr.data||[]).map((q:any)=>({id:q.id,display_name:q.carrier_name||"Quote",company:q.quote_number,status:q.status||"received",amount:q.annual_premium,created_at:q.created_at,href:"/quotes"}))
    setItems({lead:ld,submission:sd,placement:md,quote:qd})
    const bv=qd.filter(q=>q.status==="bound").reduce((s,q)=>s+(Number(q.amount)||0),0)
    setTotals({leads:ld.length,submissions:sd.length,placements:md.length,quotes:qd.length,bound_value:bv})
    setLoading(false)
  },[])
  useEffect(()=>{fetchAll()},[fetchAll])
  const filt=(id:string)=>{let a=items[id]||[];if(search)a=a.filter(i=>i.display_name.toLowerCase().includes(search.toLowerCase())||(i.company||"").toLowerCase().includes(search.toLowerCase()));return a}
  const fmtD=(d:string)=>new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"})
  const PR:Record<string,string>={urgent:"#EF4444",high:"#F59E0B",medium:"#3B82F6",low:"#10B981"}
  return(
    <div style={{minHeight:"100vh",background:"#0A0A0B",fontFamily:"Inter,system-ui,sans-serif",color:"#F0F0F2"}}>
      <div style={{background:"#0C0C0E",borderBottom:"1px solid rgba(200,200,210,0.13)",padding:"20px 28px",position:"sticky",top:0,zIndex:40}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div><h1 style={{fontSize:22,fontWeight:700,margin:0}}>4-Workflow Pipeline</h1><p style={{fontSize:13,color:"#8888A0",margin:"2px 0 0"}}>Lead Capture → Submission → Market Placement → Quote Management</p></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:"#141416",border:"1px solid rgba(200,200,210,0.13)",borderRadius:8,padding:"7px 12px",color:"#F0F0F2",fontSize:13,width:180,outline:"none"}}/>
            <button onClick={fetchAll} style={{background:"#1E1E24",border:"1px solid rgba(200,200,210,0.13)",borderRadius:8,padding:"7px 14px",color:"#C8C8D4",fontSize:13,cursor:"pointer"}}>Refresh</button>
            <Link href="/leads/new" style={{background:"#3B82F6",borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:13,textDecoration:"none",fontWeight:600}}>+ New Lead</Link>
          </div>
        </div>
        <div style={{display:"flex",gap:14,marginTop:16,flexWrap:"wrap"}}>
          {([{l:"Active Leads",v:totals.leads,c:"#3B82F6"},{l:"In Submission",v:totals.submissions,c:"#8B5CF6"},{l:"At Market",v:totals.placements,c:"#F59E0B"},{l:"Quotes",v:totals.quotes,c:"#10B981"}] as any[]).map((m:any)=>(
            <div key={m.l} style={{background:"#141416",border:"1px solid rgba(200,200,210,0.13)",borderRadius:10,padding:"10px 18px",minWidth:100}}>
              <div style={{fontSize:20,fontWeight:700,color:m.c}}>{m.v}</div>
              <div style={{fontSize:11,color:"#8888A0",marginTop:2}}>{m.l}</div>
            </div>
          ))}
          <div style={{background:"#141416",border:"1px solid rgba(200,200,210,0.13)",borderRadius:10,padding:"10px 18px",minWidth:100}}>
            <div style={{fontSize:20,fontWeight:700,color:"#C0C0C8"}}>{"$"+totals.bound_value.toLocaleString()}</div>
            <div style={{fontSize:11,color:"#8888A0",marginTop:2}}>Bound Value</div>
          </div>
        </div>
      </div>
      {loading?(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh"}}><p style={{color:"#8888A0",fontSize:14}}>Loading pipeline data...</p></div>):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,padding:"20px 24px"}}>
          {STAGES.map(stage=>{
            const si=filt(stage.id),st=si.reduce((s,i)=>s+(Number(i.amount)||0),0)
            return(
              <div key={stage.id} style={{display:"flex",flexDirection:"column"}}>
                <div style={{background:"#141416",border:"1px solid rgba(200,200,210,0.13)",borderTop:"3px solid "+stage.color,borderRadius:"10px 10px 0 0",padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div><div style={{fontWeight:700,fontSize:14}}>{stage.label}</div><div style={{fontSize:11,color:"#8888A0"}}>{stage.desc}</div></div>
                    <span style={{background:stage.color+"22",border:"1px solid "+stage.color+"44",borderRadius:20,padding:"2px 10px",fontSize:12,color:stage.color,fontWeight:600}}>{si.length}</span>
                  </div>
                  {st>0&&<div style={{marginTop:8,fontSize:12,color:"#8888A0"}}>Value: <span style={{color:"#10B981",fontWeight:600}}>{"$"+st.toLocaleString()}</span></div>}
                </div>
                <div style={{background:"#0C0C0E",border:"1px solid rgba(200,200,210,0.13)",borderTop:"none",borderRadius:"0 0 10px 10px",padding:8,maxHeight:560,overflowY:"auto",flex:1}}>
                  {si.length===0?(<div style={{padding:"28px 12px",textAlign:"center",color:"#8888A0",fontSize:13}}>No items in this stage</div>):si.map(item=>{
                    const c=SC[item.status]||"#8888A0"
                    return(
                      <Link key={item.id} href={item.href} style={{textDecoration:"none",display:"block",marginBottom:6}}>
                        <div style={{background:"#141416",border:"1px solid rgba(200,200,210,0.13)",borderLeft:"3px solid "+c,borderRadius:8,padding:"10px 12px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:4}}>
                            <div style={{fontWeight:600,fontSize:13}}>{item.display_name}</div>
                            {item.priority&&<div style={{width:8,height:8,borderRadius:"50%",background:PR[item.priority]||"#8888A0",flexShrink:0,marginTop:3}}/>}
                          </div>
                          {item.company&&<div style={{fontSize:12,color:"#8888A0",marginBottom:6}}>{item.company}</div>}
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginTop:6}}>
                            <span style={{background:c+"22",border:"1px solid "+c+"44",borderRadius:20,padding:"2px 8px",fontSize:11,color:c,textTransform:"capitalize"}}>{item.status.replace(/_/g," ")}</span>
                            <div style={{display:"flex",gap:8}}>
                              {item.amount?<span style={{fontSize:12,color:"#10B981",fontWeight:600}}>{"$"+Number(item.amount).toLocaleString()}</span>:null}
                              <span style={{fontSize:11,color:"#8888A0"}}>{fmtD(item.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                  <div style={{paddingTop:6,borderTop:"1px solid rgba(200,200,210,0.13)"}}>
                    <Link href={stage.href} style={{display:"block",textAlign:"center",padding:"8px",fontSize:12,color:stage.color,textDecoration:"none",fontWeight:500}}>View all {stage.label} →</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div style={{padding:"14px 28px",borderTop:"1px solid rgba(200,200,210,0.13)",background:"#0C0C0E",display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
        {STAGES.map((s,i)=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:8}}>
            <Link href={s.href} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",background:s.color+"18",border:"1px solid "+s.color+"33",borderRadius:20,textDecoration:"none"}}>
              <span style={{fontSize:12,color:s.color,fontWeight:600}}>{s.label}</span>
            </Link>
            {i<STAGES.length-1&&<span style={{color:"#8888A0",fontSize:16}}>→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}