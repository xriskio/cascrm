"use client"
import{useEffect}from"react"
import{useRouter}from"next/navigation"
export default function SubmissionWorkflowRedirect(){
  const r=useRouter()
  useEffect(()=>{r.replace("/submissions/list")},[r])
  return null
}