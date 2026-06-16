import { redirect } from "next/navigation"

export default function Home() {
  // Simple redirect to login without trying to check auth
  // This avoids potential auth errors on the home page
  redirect("/login")
}
