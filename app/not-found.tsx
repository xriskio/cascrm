import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-muted to-muted dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-foreground dark:text-gray-100">404</h1>
        <h2 className="text-2xl font-semibold text-muted-foreground dark:text-gray-300">
          Page Not Found
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground max-w-md">
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </p>
        <div className="pt-4">
          <Link href="/dashboard">
            <Button size="lg">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
