"use client"
import{useState,useEffect,useRef}from"react"
import Link from"next/link"
const BG1="#0C0C0E",BG2="#141416",BG3="#1A1A1E",BD="rgba(192,192,200,0.10)",BDM="rgba(192,192,200,0.18)",TEXT="#E2E2E8",T2="#9A9AAA",T3="#62626E",FONT="Inter,DM Sans,system-ui,sans-serif"
export default function NotificationBell(){
  const[open,setOpen]=useState(false)
  const[count,setCount]=useState(0)
  const[items,setItems]=useState<any[]>([])
  const[loading,setLoading]=useState(false)
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    fetchCount()
    const fn=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)}
    document.addEventListener("mousedown",fn)
    return()=>document.removeEventListener("mousedown",fn)
  },[])
  async function fetchCount(){
    try{
      const r=await fetch("/api/notifications?limit=1&unread=true")
      if(r.ok){const d=await r.json();setCount(d.unreadCount||0)}
    }catch(e){}
  }
  async function fetchNotifs(){
    if(items.length>0)return
    setLoading(true)
    try{
      const r=await fetch("/api/notifications?limit=10")
      if(r.ok){const d=await r.json();setItems(d.notifications||[])}
    }catch(e){}finally{setLoading(false)}
  }
  function toggle(){setOpen(v=>{if(!v)fetchNotifs();return!v})}
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={toggle} title="Notifications" style={{width:34,height:34,borderRadius:8,border:"1px solid "+(open?BDM:BD),background:open?BG2:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transition:"background 0.12s",color:T2}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {count>0&&<span style={{position:"absolute",top:6,right:6,minWidth:8,height:8,borderRadius:"50%",background:"#EF4444",border:"1.5px solid "+BG1,fontSize:9,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:count>9?"0 2px":"0"}}>{count>9?"9+":count}</span>}
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:320,background:BG2,border:"1px solid "+BDM,borderRadius:12,boxShadow:"0 16px 48px rgba(0,0,0,0.7)",zIndex:300,overflow:"hidden",fontFamily:FONT}}>
          <div style={{padding:"12px 14px 10px",borderBottom:"1px solid "+BD,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600,color:TEXT}}>Notifications</span>
            {count>0&&<span style={{fontSize:11,background:"#EF444422",color:"#EF4444",padding:"2px 7px",borderRadius:10}}>{count} unread</span>}
          </div>
          {loading&&<div style={{padding:"12px 14px",fontSize:12,color:T3}}>Loading...</div>}
          {!loading&&items.length===0&&<div style={{padding:"20px 14px",textAlign:"center",fontSize:12,color:T3}}>No notifications</div>}
          {!loading&&items.map((n:any)=>(
            <div key={n.id} style={{padding:"10px 14px",borderBottom:"1px solid "+BD,background:n.is_read?"transparent":"rgba(59,130,246,0.04)"}}>
              <div style={{fontSize:12,fontWeight:n.is_read?400:500,color:TEXT,marginBottom:2}}>{n.title||n.message||"Notification"}</div>
              <div style={{fontSize:11,color:T3}}>{n.created_at?new Date(n.created_at).toLocaleDateString():""}</div>
            </div>
          ))}
          <div style={{padding:"8px 14px"}}>
            <Link href="/notifications" onClick={()=>setOpen(false)} style={{fontSize:12,color:"#3B82F6",textDecoration:"none"}}>View all notifications \u2192</Link>
          </div>
        </div>
      )}
    </div>
  )
}