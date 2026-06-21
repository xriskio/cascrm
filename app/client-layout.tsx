'use client'
import type React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/auth')
  // Dashboard manages its own Sidebar+Topbar internally
  const isDashboard = pathname === '/dashboard' || pathname?.startsWith('/dashboard/')

  if (isAuthPage || isDashboard) {
    return <>{children}</>
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#0A0A0B', fontFamily:'Inter,DM Sans,system-ui,sans-serif' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Topbar />
        <main style={{ flex:1, overflowY:'auto', background:'#0A0A0B' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
