"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClearSessionPage() {
  const router = useRouter()

  useEffect(() => {
    const allCookies = document.cookie.split(";")
    
    for (const cookie of allCookies) {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
      
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
    }
    
    localStorage.clear()
    sessionStorage.clear()
    
    setTimeout(() => {
      router.replace("/login")
    }, 100)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
        <p className="mt-4 text-white text-lg">Clearing session...</p>
      </div>
    </div>
  )
}
