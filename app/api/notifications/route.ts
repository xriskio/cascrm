import{type NextRequest,NextResponse}from"next/server"
import{supabaseAdmin}from"@/lib/supabase/admin"
export const dynamic="force-dynamic"
export const runtime="nodejs"
export async function GET(req:NextRequest){
  try{
    const s=new URL(req.url).searchParams
    const limit=parseInt(s.get("limit")||"20")
    const unreadOnly=s.get("unread")==="true"
    let q=supabaseAdmin.from("notifications").select("*").order("created_at",{ascending:false}).limit(limit)
    if(unreadOnly)q=q.eq("is_read",false)
    const{data,error}=await q
    if(error){
      // Table may not exist yet - return empty gracefully
      return NextResponse.json({notifications:[],unreadCount:0})
    }
    const unreadCount=(data||[]).filter((n:any)=>!n.is_read).length
    return NextResponse.json({notifications:data||[],unreadCount})
  }catch(e:any){
    return NextResponse.json({notifications:[],unreadCount:0})
  }
}
export async function POST(req:NextRequest){
  try{
    const b=await req.json()
    const{data,error}=await supabaseAdmin.from("notifications").insert({title:b.title,message:b.message,type:b.type||"info",is_read:false,user_id:b.userId||null}).select().single()
    if(error)throw error
    return NextResponse.json(data,{status:201})
  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}