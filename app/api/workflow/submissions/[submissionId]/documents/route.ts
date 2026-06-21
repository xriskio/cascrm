import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { submissionId: string } }) {
  const sb = createClient()
  const { data, error } = await sb.from('submission_documents')
    .select('*').eq('submission_id', params.submissionId)
    .order('uploaded_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ documents: data || [] })
}

export async function POST(req: NextRequest, { params }: { params: { submissionId: string } }) {
  const sb = createClient()
  const { submissionId } = params
  const { documentType, fileName, filePath, mimeType, fileSize, extractedData } = await req.json()

  if (!fileName || !filePath || !documentType)
    return NextResponse.json({ error: 'fileName, filePath and documentType are required' }, { status: 400 })

  const { data, error } = await sb.from('submission_documents').insert({
    submission_id: submissionId,
    document_type: documentType,
    file_name: fileName,
    file_path: filePath,
    mime_type: mimeType,
    file_size: fileSize,
    uploaded_by: 'agent',
    data_extracted: extractedData || null,
    review_status: 'pending',
    virus_scan_status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update checklist: mark matching item as completed if names match
  const { data: items } = await sb.from('underwriting_checklist')
    .select('id,item_name').eq('submission_id', submissionId).eq('is_completed', false)
  const match = (items || []).find(i =>
    i.item_name.toLowerCase().includes(documentType.toLowerCase().replace('_', ' '))
  )
  if (match) {
    await sb.from('underwriting_checklist').update({
      is_completed: true, completed_at: new Date().toISOString(),
      completed_by: 'agent', related_document_id: data.id, updated_at: new Date().toISOString(),
    }).eq('id', match.id)
  }

  return NextResponse.json(data, { status: 201 })
}