import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useApp } from '../../hooks/useApp'
import { useDashboard } from '../../hooks/useDashboard'
import ActionQueue from './ActionQueue'
import MetricCards from './MetricCards'
import RecentComplaints from './RecentComplaints'

/** PRD §8.1 */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { managerId } = useApp()
  const {
    loading,
    metrics,
    actionQueue,
    recentComplaints,
    error,
    partial,
  } = useDashboard(managerId)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Export coming soon"
          >
            Export
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/properties')}
          >
            Add property
          </Button>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-gold-d/40 bg-gold-pale px-4 py-3 text-sm font-semibold text-ink"
          role="alert"
        >
          {partial
            ? `${error} Some figures may be incomplete until tables match the shared Supabase contract.`
            : error}
        </div>
      ) : null}

      <MetricCards metrics={metrics} loading={loading} />
      <ActionQueue actionQueue={actionQueue} loading={loading} />
      <RecentComplaints rows={recentComplaints} loading={loading} />
    </div>
  )
}
