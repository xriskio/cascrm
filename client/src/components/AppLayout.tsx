import { Outlet, useLocation } from 'react-router-dom'
import { TopNavigation } from './top-navigation'

export default function AppLayout() {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (isDashboard) {
    return <Outlet />
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0B]">
      <TopNavigation />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
