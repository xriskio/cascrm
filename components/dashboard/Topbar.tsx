'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SearchResults from '@/components/dashboard/SearchResults'
import NotificationBell from '@/components/dashboard/NotificationBell'
const BG1='#0C0C0E',BG2='#141416',BG3='#1A1A1E',BD='rgba(192,192,200,0.10)',BDM='rgba(192,192,200,0.18)'
const TEXT='#E2E2E8',T2='#9A9AAA',T3='#62626E',BLUE='#3B82F6',BLUE_BG='rgba(59,130,246,0.10)',BLUE_BD='rgba(59,130,246,0.25)'
const FONT='Inter, DM Sans, system-ui, sans-serif',MONO='"JetBrains Mono","DM Mono",monospace'
interface TopbarProps { onNewSubmission?: () => void }
export default function Topbar({ onNewSubmission }: TopbarProps) {
  const [searchQ,setSearchQ]=useState('')
  const [searchOpen,setSearchOpen]=useState(false)
  const [dateStr,setDateStr]=useState('')
  const [copilotOpen,setCopilotOpen]=useState(false)
  const inputRef=useRef<HTMLInputElement>(null)
  const searchRef=useRef<HTMLDivElement>(null)
  const copilotRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    setDateStr(new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}))
  },[])
  useEffect(()=>{
    const fn=(e:KeyboardEvent)=>{
      if(e.key==='/'&&!(document.activeElement instanceof HTMLInputElement)){e.preventDefault();inputRef.current?.focus()}
      if(e.key==='Escape'){setSearchOpen(false);setSearchQ('');setCopilotOpen(false)}
    }
    window.addEventListener('keydown',fn)
    return()=>window.removeEventListener('keydown',fn)
  },[])
  useEffect(()=>{
    const fn=(e:MouseEvent)=>{
      if(searchRef.current&&!searchRef.current.contains(e.target as Node))setSearchOpen(false)
      if(copilotRef.current&&!copilotRef.current.contains(e.target as Node))setCopilotOpen(false)
    }
    document.addEventListener('mousedown',fn)
    return()=>document.removeEventListener('mousedown',fn)
  },[])
  const QUICK=[
    {label:'Renewals expiring this month',href:'/renewals'},
    {label:'Clients with pending quotes',href:'/quotes'},
    {label:'Recent submissions',href:'/submissions'},
    {label:'Open tasks',href:'/tasks'},
  ]
  return(
    <div style={{height:52,background:BG1,borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',gap:12,padding:'0 20px',flexShrink:0,fontFamily:FONT}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{fontSize:14,fontWeight:600,letterSpacing:'-0.3px',color:TEXT}}>Dashboard</div>
        <div style={{fontSize:11,color:T3,fontFamily:MONO}}>{dateStr}</div>
      </div>
      <div ref={searchRef} style={{flex:1,maxWidth:420,position:'relative'}}>
        <div style={{display:'flex',alignItems:'center',gap:7,background:BG2,border:`1px solid ${searchOpen?BLUE_BD:BDM}`,borderRadius:8,padding:'0 11px',height:32,cursor:'text',boxShadow:searchOpen?'0 0 0 3px rgba(59,130,246,0.08)':'none',transition:'border-color 0.15s,box-shadow 0.15s'}}
          onClick={()=>inputRef.current?.focus()}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input ref={inputRef} value={searchQ} onChange={e=>setSearchQ(e.target.value)} onFocus={()=>setSearchOpen(true)}
            placeholder="Search clients, policies, renewals… (Press / to focus)" autoComplete="off"
            style={{flex:1,border:'none',background:'transparent',fontFamily:FONT,fontSize:12,color:TEXT,outline:'none'}}/>
          {searchQ?(
            <button onClick={e=>{e.stopPropagation();setSearchQ('');inputRef.current?.focus()}}
              style={{background:'none',border:'none',cursor:'pointer',color:T3,fontSize:16,lineHeight:1,padding:'0 2px'}}>×</button>
          ):(
            <span style={{fontSize:9.5,fontFamily:MONO,background:BG3,color:T3,padding:'1px 4px',borderRadius:3,border:`1px solid ${BDM}`,flexShrink:0}}>/</span>
          )}
        </div>
        <SearchResults query={searchQ} open={searchOpen&&searchQ.length>1} onClose={()=>{setSearchOpen(false);setSearchQ('')}}/>
      </div>
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6}}>
        <div ref={copilotRef} style={{position:'relative'}}>
          <div onClick={()=>setCopilotOpen(v=>!v)} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:20,background:copilotOpen?'rgba(59,130,246,0.20)':BLUE_BG,border:`1px solid ${BLUE_BD}`,fontSize:11.5,fontWeight:500,color:BLUE,cursor:'pointer',fontFamily:FONT}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:BLUE,flexShrink:0,display:'inline-block'}}/>
            AI Copilot
          </div>
          {copilotOpen&&(
            <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:300,background:BG2,border:`1px solid ${BDM}`,borderRadius:12,boxShadow:'0 16px 48px rgba(0,0,0,0.7)',zIndex:300,overflow:'hidden',fontFamily:FONT}}>
              <div style={{padding:'12px 14px 8px',borderBottom:`1px solid ${BD}`}}>
                <div style={{fontSize:13,fontWeight:600,color:TEXT}}>AI Copilot</div>
                <div style={{fontSize:11,color:T3,marginTop:2}}>Quick navigation & insights</div>
              </div>
              <div style={{padding:10}}>
                {QUICK.map(a=>(
                  <Link key={a.href} href={a.href} onClick={()=>setCopilotOpen(false)} style={{textDecoration:'none'}}>
                    <div style={{padding:'8px 10px',marginBottom:4,borderRadius:6,background:BG3,fontSize:12,color:TEXT,cursor:'pointer',border:`1px solid ${BD}`}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=BLUE_BD}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=BD}}>
                      {a.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <NotificationBell/>
        <button onClick={onNewSubmission} style={{display:'flex',alignItems:'center',gap:5,padding:'0 14px',height:32,background:BLUE,color:'#fff',border:'none',borderRadius:8,fontFamily:FONT,fontSize:13,fontWeight:500,cursor:'pointer',whiteSpace:'nowrap',transition:'opacity 0.12s'}}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.opacity='0.85'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.opacity='1'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Submission
        </button>
      </div>
    </div>
  )
}
