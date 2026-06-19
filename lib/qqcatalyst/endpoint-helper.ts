import { createClient } from "@supabase/supabase-js"
import axios from "axios"

const QQ_API = "https://api.qqcatalyst.com/v1"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function fetchAll<T>(path: string, token: string): Promise<T[]> {
  const all: T[] = []
  let page = 1
  const pageSize = 100

  while (true) {
    try {
      const res = await axios.get<{ items: T[] }>(`${QQ_API}/${path}?pageNumber=${page}&pageSize=${pageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const items = (res.data as any).items ?? (res.data as any).Contacts ?? (res.data as any).Policies ?? []
      if (!items.length) break
      all.push(...items)
      page++

      // Safety limit
      if (page > 50) break
    } catch (error) {
      console.log(`⚠️ Error fetching ${path} page ${page}:`, error)
      break
    }
  }
  return all
}

export async function fetchSingle<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await axios.get<T>(`${QQ_API}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (error) {
    console.log(`⚠️ Error fetching ${path}:`, error)
    return null
  }
}

export async function upsertToSupabase<T>(
  tableName: string,
  data: T[],
  conflictColumns: string | string[],
): Promise<number> {
  if (data.length === 0) return 0

  const { error } = await (supabase.from(tableName) as any).upsert(data, { onConflict: conflictColumns })

  if (error) {
    console.error(`❌ ${tableName} upsert error`, error)
    throw error
  }

  console.log(`✅ upserted ${data.length} ${tableName} records`)
  return data.length
}

// Template for adding new endpoints
export function createEndpointImporter<QQType, SupabaseType>(
  endpointPath: string,
  tableName: string,
  conflictColumns: string | string[],
  transformer: (item: QQType) => SupabaseType,
) {
  return async (token: string): Promise<number> => {
    console.log(`🔄 Fetching ${tableName}...`)
    try {
      const items = await fetchAll<QQType>(endpointPath, token)
      const rows = items.map(transformer)
      return await upsertToSupabase(tableName, rows, conflictColumns)
    } catch (error) {
      console.log(`⚠️ ${tableName} endpoint not available:`, error)
      return 0
    }
  }
}
