import { promises as fs } from "fs"
import path from "path"
import { CopyButton } from "@/components/setup/copy-button"

export default async function SetupPage() {
  const migrationsDir = path.join(process.cwd(), "supabase/migrations")
  const files = await fs.readdir(migrationsDir)
  const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort()

  const migrations = await Promise.all(
    sqlFiles.map(async (file) => {
      const content = await fs.readFile(path.join(migrationsDir, file), "utf-8")
      return { file, content }
    })
  )

  const combinedSQL = migrations.map((m) => `-- Migration: ${m.file}\n${m.content}`).join("\n\n")

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Database Setup Instructions</h1>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Important: Your database is empty</h2>
        <p className="text-yellow-700">
          The Supabase database has no tables. Follow these steps to set up your database and users.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Step 1: Apply Database Migrations</h2>
          <ol className="list-decimal list-inside space-y-3 mb-4">
            <li>
              Go to your{" "}
              <a
                href="https://bkdgdfwotlyvojnrenet.supabase.co/project/default/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                Supabase Dashboard → SQL Editor
              </a>
            </li>
            <li>Copy ALL the SQL below</li>
            <li>Paste it into the SQL Editor</li>
            <li>Click "Run" to execute</li>
          </ol>

          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400">
                {migrations.length} migration files combined ({combinedSQL.split("\n").length} lines)
              </p>
              <CopyButton text={combinedSQL} />
            </div>
            <pre className="text-xs overflow-x-auto max-h-96">{combinedSQL}</pre>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Step 2: Create Users in Supabase Auth</h2>
          <ol className="list-decimal list-inside space-y-3 mb-4">
            <li>
              Go to{" "}
              <a
                href="https://bkdgdfwotlyvojnrenet.supabase.co/project/default/auth/users"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                Supabase Dashboard → Authentication → Users
              </a>
            </li>
            <li>Click "Add user" → "Create new user"</li>
            <li>Create these users:</li>
          </ol>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex items-center gap-4">
              <span className="font-mono bg-white px-3 py-1 rounded">ops@casurance.net</span>
              <span className="text-gray-500">(Set a password)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono bg-white px-3 py-1 rounded">wade@casurance.net</span>
              <span className="text-gray-500">(Set a password)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono bg-white px-3 py-1 rounded">wade@casurance.com</span>
              <span className="text-gray-500">(Set a password)</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            💡 <strong>Tip:</strong> Enable "Auto Confirm User" when creating each user so they can log in immediately.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Step 3: Test Login</h2>
          <p className="mb-4">After completing Steps 1 and 2:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Go to the{" "}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                login page
              </a>
            </li>
            <li>Sign in with one of the users you created</li>
            <li>You should be redirected to the dashboard</li>
          </ol>
        </section>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Why is the database empty?</h3>
        <p className="text-blue-800 text-sm">
          When you migrated from Vercel to Replit, the database migrations weren't automatically applied to your
          Supabase cloud database. These migrations create all the tables (renewals, clients, submissions, etc.) that
          your app needs to function.
        </p>
      </div>
    </div>
  )
}
