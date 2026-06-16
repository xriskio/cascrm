"use client"

import { useState, useEffect } from "react"
import { checkUserTableSchema } from "@/app/actions/user-actions"

export default function SchemaCheckPage() {
  const [loading, setLoading] = useState(true)
  const [schemaInfo, setSchemaInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkSchema() {
      try {
        const result = await checkUserTableSchema()
        setSchemaInfo(result)
      } catch (err) {
        console.error("Error checking schema:", err)
        setError(err instanceof Error ? err.message : "Failed to check schema")
      } finally {
        setLoading(false)
      }
    }

    checkSchema()
  }, [])

  if (loading) return <div className="p-6">Checking database schema...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Database Schema Check</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-md shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Users Table</h2>

        {schemaInfo && (
          <div>
            <p className="mb-2">
              <span className="font-medium">Table exists:</span> {schemaInfo.exists ? "Yes" : "No"}
            </p>

            {schemaInfo.error && (
              <p className="text-red-600 mb-2">
                <span className="font-medium">Error:</span> {schemaInfo.error}
              </p>
            )}

            {schemaInfo.fields && (
              <div>
                <p className="font-medium mb-1">Fields:</p>
                <ul className="list-disc pl-6">
                  {schemaInfo.fields.map((field: string) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Required Schema:</h3>
          <code className="block whitespace-pre-wrap bg-gray-100 p-3 rounded text-sm">
            {`CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  user_role TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)`}
          </code>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            If the schema doesn't match, run the migration script to fix it. The migration can be found in:
            <code className="block mt-1 p-2 bg-gray-100 rounded">/supabase/migrations/recreate_users_table.sql</code>
          </p>
        </div>
      </div>
    </div>
  )
}
