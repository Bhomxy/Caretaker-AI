import { Link } from 'react-router-dom'
import Skeleton from '../../components/ui/Skeleton'
import { formatNaira } from '../../lib/utils'

/**
 * @param {{
 *   to: string
 *   icon: string
 *   label: string
 *   value: string
 *   sub: string
 *   subPositive?: boolean
 *   loading: boolean
 *   highlight?: boolean
 * }} props
 */
function MetricCard({
  to,
  icon,
  label,
  value,
  sub,
  subPositive = true,
  loading,
  highlight,
}) {
  return (
    <Link
      to={to}
      className={[
        'block cursor-pointer rounded-[10px] border bg-card p-4 shadow-soft transition-[border-color,box-shadow] hover:border-border-s hover:shadow-soft-xs',
        highlight ? 'border-2 border-red' : 'border-border',
      ].join(' ')}
    >
      <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-pale text-base">
        {icon}
      </div>
      <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-ink-secondary">
        {label}
      </p>
      {loading ? (
        <Skeleton className="mb-2 h-7 w-20" />
      ) : (
        <p className="mb-1 text-[26px] font-extrabold leading-none tracking-tight text-ink">
          {value}
        </p>
      )}
      <p
        className={`text-xs font-medium ${
          subPositive ? 'text-green' : 'text-red'
        }`}
      >
        {sub}
      </p>
    </Link>
  )
}

/**
 * PRD §8.1 — prototype-style metric row (caretaker-ai.html).
 */
export default function MetricCards({ metrics, loading }) {
  const open = metrics?.openComplaints ?? 0
  const openHighlight = !loading && open > 5
  const calm = !loading && open <= 5

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        to="/properties"
        icon="🏢"
        label="Total units"
        value={loading ? '' : String(metrics?.totalUnits ?? 0)}
        sub="Across all properties"
        subPositive
        loading={loading}
      />
      <MetricCard
        to="/tenants"
        icon="👤"
        label="Active tenants"
        value={loading ? '' : String(metrics?.activeTenants ?? 0)}
        sub="Across your portfolio"
        subPositive
        loading={loading}
      />
      <MetricCard
        to="/complaints"
        icon="⚠️"
        label="Open complaints"
        value={loading ? '' : String(open)}
        sub={
          loading
            ? '…'
            : open > 5
              ? '↑ Needs attention'
              : 'Under control'
        }
        subPositive={calm}
        loading={loading}
        highlight={openHighlight}
      />
      <MetricCard
        to="/payments"
        icon="₦"
        label="Charges collected YTD"
        value={loading ? '' : formatNaira(metrics?.ytdCharges ?? 0)}
        sub="Approved payments this year"
        subPositive
        loading={loading}
      />
    </div>
  )
}
