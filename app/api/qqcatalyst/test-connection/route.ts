import {NextRequest,NextResponse} from 'next/server'
import {ping} from '@/lib/qqcatalyst/api-enhanced'
export const dynamic = 'force-dynamic'
export async function GET(_req: NextRequest) {
  const env = { QQ_BEARER_TOKEN: !!process.env.QQ_BEARER_TOKEN, QQCATALYST_BEARER_TOKEN: !!process.env.QQCATALYST_BEARER_TOKEN, QQ_CLIENT_ID: !!process.env.QQ_CLIENT_ID }
  const p = await ping()
  return NextResponse.json({ status: p.ok ? 'connected' : 'failed', ping: p, env }, { status: p.ok ? 200 : 503 })
}