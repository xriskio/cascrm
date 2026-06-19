import { supabase } from '@/lib/supabase/client'

export interface AuditLogData {
  action: 'create' | 'update' | 'delete' | 'view'
  tableName: string
  recordId: string | number
  oldData?: any
  newData?: any
  userId?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await supabase.from('audit_logs').insert({
      action: data.action,
      table_name: data.tableName,
      record_id: String(data.recordId),
      old_data: data.oldData,
      new_data: data.newData,
      user_id: data.userId,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
