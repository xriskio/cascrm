import{type NextRequest,NextResponse}from"next/server"
import{supabaseAdmin}from"@/lib/supabase/admin"
export const dynamic="force-dynamic"
export const runtime="nodejs"
export async function POST(req:NextRequest,{params}:{params:{leadId:string}}){try{const{qualificationReason,assignedAgent,leadScore}=await req.json();const{data,error}=await supabaseAdmin.from("leads").update({status:"qualified",stage:"submission_prep",notes:qualificationReason,lead_score:leadScore||75}).eq("id",params.leadId).select().single();if(error)throw error;await supabaseAdmin.from("lead_notes").insert({lead_id:params.leadId,content:"Lead qualified. Reason: "+qualificationReason,note_type:"qualified",created_by:assignedAgent||"system"});return NextResponse.json(data)}catch(e:any){return NextResponse.json({error:e.message},{status:500})}}
