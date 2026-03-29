import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppShellLayout from './components/layout/AppShellLayout'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard/index'
import PropertiesPage from './pages/Properties/index'
import PropertyDetailPage from './pages/Properties/PropertyDetail'
import TenantsPage from './pages/Tenants/index'
import TenantDetailPage from './pages/Tenants/TenantDetail'
import ComplaintsPage from './pages/Complaints/index'
import ComplaintDetail from './pages/Complaints/ComplaintDetail'
import PaymentsPage from './pages/Payments/index'
import InboxPage from './pages/Inbox/index'
import BroadcastPage from './pages/Broadcast/index'
import VendorsPage from './pages/Vendors/index'
import VendorDetailPage from './pages/Vendors/VendorDetail'
import InsightsPage from './pages/Insights/index'
import SettingsPage from './pages/Settings/index'
import { isSupabaseConfigured } from './lib/supabase'

function MissingEnvScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="w-full max-w-xl rounded-xl border border-gold-d/35 bg-card p-6 shadow-soft">
        <h1 className="text-lg font-extrabold text-ink">
          Missing Supabase environment variables
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-ink-secondary">
          Set <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> in your deployment environment,
          then redeploy.
        </p>
        <p className="mt-3 text-xs font-semibold text-ink-muted">
          Vercel → Project Settings → Environment Variables
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (!isSupabaseConfigured()) {
    return <MissingEnvScreen />
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShellLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route
                path="/properties/:propertyId"
                element={<PropertyDetailPage />}
              />
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/tenants/:tenantId" element={<TenantDetailPage />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
              <Route
                path="/complaints/:complaintId"
                element={<ComplaintDetail />}
              />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/broadcast" element={<BroadcastPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
