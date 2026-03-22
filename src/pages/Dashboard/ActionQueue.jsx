import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Skeleton from '../../components/ui/Skeleton'

function QueueRow({ title, count, to, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
        <Skeleton className="h-4 w-3/5 max-w-md" />
        <Skeleton className="h-4 w-8" />
      </div>
    )
  }

  if (!count || count < 1) return null

  return (
    <Link
      to={to}
      className="flex items-center justify-between border-b border-border py-3 text-sm font-semibold text-ink transition-colors last:border-0 hover:bg-teal-pale/50"
    >
      <span>{title}</span>
      <span className="rounded-full bg-gold-pale px-2.5 py-0.5 text-xs font-bold text-gold-d">
        {count}
      </span>
    </Link>
  )
}

/**
 * PRD §8.1 — action queue; green “all caught up” when empty.
 */
export default function ActionQueue({ actionQueue, loading }) {
  const pending = actionQueue?.pendingApprovals ?? 0
  const stale = actionQueue?.staleUnassigned ?? 0
  const expiring = actionQueue?.expiringLeases ?? 0

  const hasAny = pending > 0 || stale > 0 || expiring > 0

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft">
      <div className="border-b border-border px-5 py-4">
        <span className="text-sm font-bold text-ink">Action queue</span>
        <p className="mt-0.5 text-xs text-ink-muted">
          Needs your attention right now
        </p>
      </div>
      <div className="px-5 py-1">
        {loading ? (
          <>
            <QueueRow loading />
            <QueueRow loading />
            <QueueRow loading />
          </>
        ) : hasAny ? (
          <>
            <QueueRow
              title="Payments awaiting your approval"
              count={pending}
              to="/payments?tab=approvals"
            />
            <QueueRow
              title="Complaints unassigned for 48+ hours"
              count={stale}
              to="/complaints"
            />
            <QueueRow
              title="Leases expiring within 60 days"
              count={expiring}
              to="/tenants"
            />
          </>
        ) : (
          <div className="flex items-center gap-3 py-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-pale text-green">
              <CheckCircle2 className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-green">You&apos;re all caught up</p>
              <p className="text-xs text-ink-muted">Nothing needs you right now.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
