import { Link } from 'react-router-dom'
import Skeleton from '../../components/ui/Skeleton'
import { formatNaira } from '../../lib/utils'

function MetricCard({ to, label, value, loading, highlight }) {
  const inner = loading ? (
    <Skeleton className="h-8 w-24" />
  ) : (
    <p className="text-2xl font-extrabold tracking-tight text-ink">{value}</p>
  )

  return (
    <Link
      to={to}
      className={[
        'block rounded-xl border bg-card p-5 shadow-soft transition-colors hover:bg-teal-pale/40',
        highlight
          ? 'border-2 border-red'
          : 'border-border hover:border-border-s',
      ].join(' ')}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      <div className="mt-2">{inner}</div>
    </Link>
  )
}

/**
 * PRD §8.1 — four metric cards, each navigates to the right area.
 */
export default function MetricCards({ metrics, loading }) {
  const open = metrics?.openComplaints ?? 0
  const openHighlight = !loading && open > 5

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        to="/properties"
        label="Total units"
        value={loading ? '' : String(metrics?.totalUnits ?? 0)}
        loading={loading}
      />
      <MetricCard
        to="/tenants"
        label="Active tenants"
        value={loading ? '' : String(metrics?.activeTenants ?? 0)}
        loading={loading}
      />
      <MetricCard
        to="/complaints"
        label="Open complaints"
        value={loading ? '' : String(open)}
        loading={loading}
        highlight={openHighlight}
      />
      <MetricCard
        to="/payments"
        label="Charges collected YTD"
        value={loading ? '' : formatNaira(metrics?.ytdCharges ?? 0)}
        loading={loading}
      />
    </div>
  )
}
