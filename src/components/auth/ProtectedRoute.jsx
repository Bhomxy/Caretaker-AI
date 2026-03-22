import { Navigate, Outlet } from 'react-router-dom'
import Skeleton from '../ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="w-full max-w-sm space-y-3">
        <Skeleton />
        <Skeleton className="w-4/5" />
        <p className="text-center text-xs font-semibold text-ink-muted">
          Signing you in…
        </p>
      </div>
    </div>
  )
}

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
