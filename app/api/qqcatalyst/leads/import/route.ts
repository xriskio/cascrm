export const dynamic="force-dynamic"
import{NextResponse}from"next/server"
import{supabaseAdmin}from"@/lib/supabase/admin"
const A=process.env.QQCATALYST_API_URL||""
const B=process.env.QQ_BEARER_TOKEN||""
async function g(p:string){const r=await fetch(A+"/"+p,{headers:{Authorization:"Bearer "+B},cache:"no-store"});if(!r.ok)throw new Error("QQ "+r.status);return r.json()}
export async function POST(){try{const t=new Date().toISOString().split("T")[0];const a:any[]=[];for(let i=1;i<=5;i++){const d=await g("Contacts/LastModifiedCreated?startDate=2000-01-01&endDate="+t+"&pageNumber="+i+"&pageSize=100");if(!d?.IsSuccess||!d?.Data?.length)break;a.push(...d.Data);if(i>=(d.PagesTotal||1))break}const rows=a.filter((c:any)=>String(c.ContactType||"").toLowerCase().includes("prospect")).map((c:any)=>({lead_id:"QQ-"+c.ContactID,contact_name:c.ContactName||"Unknown",email:c.Email||null,phone:c.Phone||null,source:"QQCatalyst",status:"new",priority:"medium",date_entered:new Date().toISOString()}));if(!rows.length)return NextResponse.json({success:true,imported:0});const{e}=await supabaseAdmin.from("leads").upsert(rows,{onConflict:"lead_id"}).then(v=>({e:v.error}));if(e)throw e;return NextResponse.json({success:true,imported:rows.length})}catch(e:any){return NextResponse.json({success:false,error:e.message},{status:500})}}
