import{type NextRequest,NextResponse}from'next/server'
import{supabaseAdmin as sb}from'@/lib/supabase/admin'
export const dynamic='force-dynamic',maxDuration=60
export async function POST(req:NextRequest){
  const b=await req.json().catch(()=>({}))
  const tok=b.token||req.headers.get('x-qq-token')||process.env.QQ_BEARER_TOKEN||process.env.QQCATALYST_BEARER_TOKEN
  if(!tok)return NextResponse.json({success:false,error:'No token. Set QQ_BEARER_TOKEN in Railway or pass in body.token'},{status:400})
  const d=new Date().toISOString().slice(0,10),all:any[]=[]; let pg=1
  while(pg<=50){
    const r=await fetch('https://api.qqcatalyst.com/v1/Contacts/LastModifiedCreated?startDate=2000-01-01&endDate='+d+'&pageNumber='+pg+'&pageSize=500',{headers:{Authorization:'Bearer '+tok,Accept:'application/json'}})
    if(!r.ok){const t=await r.text();return NextResponse.json({success:false,error:'QQ '+r.status+'t contacts: '+t.slice(0,300)},{status:500})}
    const j=await r.json(),rows=j?.Data||j?.data||[]
    if(!rows.length)break;all.push(...rows);if(pg>=(j?.PagesTotal||1))break;pg++
  }
  if(!all.length)return NextResponse.json({success:false,error:'0 contacts from QQCatalyst. Get fresh token: app.qqcatalyst.com/apideveloper'},{status:502})
  await sb.from('qqcatalyst_contacts').upsert(all.map((c:any)=>({entity_id:String(c.EntityID||c.ContactID||c.ID||''),customer_id:c.CustomerID?String(c.CustomerID):null,first_name:c.FirstName||null,last_name:c.LastName||null,full_name:c.FullName||c.Name||null,email:c.Email||c.PrimaryEmail||null,phone:c.Phone||c.PrimaryPhone||null,business_name:c.BusinessName||c.CompanyName||null,contact_type:c.ContactType||null,qq_status:c.Status||null,producer:c.AgentName||null,raw_data:c,synced_at:new Date().toISOString(),updated_at:new Date().toISOString()})).filter((c:any)=>c.entity_id),{onConflict:'entity_id'})
  const lr=all.map((c:any)=>({email:c.Email||c.PrimaryEmail||null,phone:c.Phone||c.PrimaryPhone||null,contact_name:(c.FullName||c.Name||((c.FirstName||'')+' '+(c.LastName||'')).trim())||'Unknown',company_name:c.BusinessName||c.CompanyName||null,source:'qqcatalyst',status:'new',stage:'lead_capture'})).filter((l:any)=>l.email||l.phone)
  if(lr.length)await sb.from('leads').upsert(lr,{onConflict:'email',ignoreDuplicates:true})
  const cr=all.map((c:any)=>({qq_catalyst_id:String(c.EntityID||c.ContactID||c.ID||''),contact_name:c.FullName||c.Name||null,first_name:c.FirstName||null,last_name:c.LastName||null,email:c.Email||c.PrimaryEmail||null,phone:c.Phone||c.PrimaryPhone||null,business_name:c.BusinessName||null,source:'qqcatalyst'})).filter((c:any)=>c.qq_catalyst_id)
  if(cr.length)await sb.from('clients').upsert(cr,{onConflict:'qq_catalyst_id'})
  return NextResponse.json({success:true,contacts:all.length,leads:lr.length,clients:cr.length,message:'Synced '+all.length+' contacts'})
}