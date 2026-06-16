#!/bin/bash

# Set environment variables
export SUPABASE_URL="https://nybxlheqpgktxpwkuigg.supabase.co"
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55YnhsaGVxcGdrdHhwd2t1aWdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzExNjExMiwiZXhwIjoyMDYyNjkyMTEyfQ.UWQr3HeAOg-oypBqJMgfmN1w-HTdoH6o3bVUvVuWkjw"

echo "🚀 Starting renewal import process..."
echo "📊 Supabase URL: $SUPABASE_URL"
echo "🔑 Service Key: [REDACTED]"

# Run the import script
node scripts/import-renewals-complete.js
