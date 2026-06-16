import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  const { count, error } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error:", error)
    process.exit(1)
  }

  console.log(`✅ Total clients in database: ${count}`)
  
  // Get a sample
  const { data, error: sampleError } = await supabase
    .from("clients")
    .select("*")
    .limit(3)

  if (!sampleError && data) {
    console.log("\n📋 Sample clients:")
    data.forEach((client: any, i: number) => {
      console.log(`\n${i + 1}. ${client.name || client.contact_name}`)
      console.log(`   Email: ${client.email || "N/A"}`)
      console.log(`   Policies: ${client.policy_count || 0}`)
      console.log(`   Premium: $${client.total_premium || 0}`)
    })
  }
}

main()
