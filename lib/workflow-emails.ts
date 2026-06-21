import{Resend}from "resend"
const r=new Resend(process.env.RESEND_API_KEY)
export async function sendLeadWelcome(e:string,n:string){return r.emails.send({from:"Casurance <noreply@casurance.com>",to:e,subject:"Application Started",text:"Hi "+n})}
export async function sendLeadQualified(a:string,c:string){return r.emails.send({from:"Casurance <noreply@casurance.com>",to:a,subject:"Qualified Lead: "+c,text:c})}
export async function sendQuoteReceived(a:string,i:string){return r.emails.send({from:"Casurance <noreply@casurance.com>",to:a,subject:"Quote: "+i,text:i})}
export async function sendBindingConfirmation(e:string,n:string,pol:string){return r.emails.send({from:"Casurance <noreply@casurance.com>",to:e,subject:"Policy Bound - "+pol,text:"Hi "+n+", policy "+pol+" is now active."})}
export async function sendSubmissionReady(a:string,i:string,cov:string){if(!process.env.RESEND_API_KEY)return;return r.emails.send({from:"Casurance <noreply@casurance.com>",to:a,subject:"Submission Ready: "+i,text:i+" docs complete. Coverage: "+cov})}
export async function sendQuotePresentation(e:string,n:string,i:string,cnt:number){if(!process.env.RESEND_API_KEY)return;return r.emails.send({from:"Casurance <noreply@casurance.com>",to:e,subject:"Your Quotes Ready",text:"Hi "+n+", "+cnt+" quotes for "+i+" ready. Expires 30d."})}