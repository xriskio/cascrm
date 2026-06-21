import{type NextRequest,NextResponse}from"next/server"
import{supabaseAdmin}from"@/lib/supabase/admin"
export const dynamic="force-dynamic"
export const runtime="nodejs"
export async function GET(req:NextRequest){
  try{
    const q=(new URL(req.url).searchParams.get("q")||"").trim()
    if(q.length<2)return NextResponse.json({clients:[],renewals:[],leads:[],submissions:[]})
    const like="%25"+encodeURIComponent(q)+"%25"
    const ilike=q.toLowerCase()
    const[{data:c},{data:r},{data:l},{data:s}]=await Promise.all([
      supabaseAdmin.from("clients").select("id,name,business_name,email,city,state").or("name.ilike.%"+ilike+"%,email.ilike.%"+ilike+"%").limit(5),
      supabaseAdmin.from("renewals").select("id,client_name,named_insured,policy_number,lob,status").or("client_name.ilike.%"+ilike+"%,policy_number.ilike.%"+ilike+"%").limit(5),
      supabaseAdmin.from("leads").select("id,contact_name,company_name,email,status").or("contact_name.ilike.%"+ilike+"%,company_name.ilike.%"+ilike+"%").limit(5),
      supabaseAdmin.from("submissions").select("id,client_name,policy_type,tracking_number,status").or("client_name.ilike.%"+ilike+"%,tracking_number.ilike.%"+ilike+"%").limit(5)
    ])
    return NextResponse.json({clients:c||[],renewals:r||[],leads:l||[],submissions:s||[],query:q})
  }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}