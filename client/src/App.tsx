import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { ThemeProvider } from './components/theme-provider'
import { NotificationProvider } from './components/notifications/notification-context'
import { Toaster } from './components/ui/toaster'
import AppLayout from './components/AppLayout'

// Pages
import LoginPage from './pages/login'
import DashboardPage from './pages/dashboard'
import ClientsPage from './pages/clients'
import ClientDetailPage from './pages/clients/[id]'
import RenewalsPage from './pages/renewals'
import RenewalDetailPage from './pages/renewals/[id]'
import RenewalWorkflowListPage from './pages/renewal-workflow'
import RenewalWorkflowDetailPage from './pages/renewal-workflow/[workflowId]'
import LeadsPage from './pages/leads'
import SubmissionsPage from './pages/submissions'
import QuotesPage from './pages/quotes'
import TasksPage from './pages/tasks'
import MarketSubmissionsPage from './pages/market-submissions'
import CallLogPage from './pages/call-log'
import ServiceRequestsPage from './pages/service-requests'
import InspectionsPage from './pages/inspections'
import ContactsPage from './pages/contacts'
import CarrierContactsPage from './pages/carrier-contacts'
import DocumentsPage from './pages/documents'
import ReportsPage from './pages/reports'
import NotificationsPage from './pages/notifications'
import ProfilePage from './pages/profile'
import SettingsPage from './pages/settings'
import AdminPage from './pages/admin'
import AgencyResourcesPage from './pages/agency-resources'
import PoliciesPage from './pages/policies'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/renewals" element={<RenewalsPage />} />
        <Route path="/renewals/:id" element={<RenewalDetailPage />} />
        <Route path="/renewal-workflow" element={<RenewalWorkflowListPage />} />
        <Route path="/renewal-workflow/:workflowId" element={<RenewalWorkflowDetailPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/market-submissions" element={<MarketSubmissionsPage />} />
        <Route path="/call-log" element={<CallLogPage />} />
        <Route path="/service-requests" element={<ServiceRequestsPage />} />
        <Route path="/inspections" element={<InspectionsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/carrier-contacts" element={<CarrierContactsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/agency-resources" element={<AgencyResourcesPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
