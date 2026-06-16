import { executeFixDatabaseSchema } from "./actions"

export default async function FixDatabasePage() {
  const result = await executeFixDatabaseSchema()
  
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Database Schema Fix</h1>
      {result.success ? (
        <div style={{ background: '#d4edda', color: '#155724', padding: '20px', borderRadius: '8px' }}>
          <h2>✅ Success!</h2>
          <p>Production database schema has been fixed.</p>
          <p>All tables now have the correct columns.</p>
          <br />
          <a href="/" style={{ color: '#155724', fontWeight: 'bold' }}>← Go to Home</a>
        </div>
      ) : (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '20px', borderRadius: '8px' }}>
          <h2>❌ Error</h2>
          <p>{result.error}</p>
          <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
            {result.details}
          </pre>
        </div>
      )}
    </div>
  )
}
