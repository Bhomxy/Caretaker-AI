import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import { formatAgeShort } from '../../lib/utils'

function shortId(id) {
  if (id == null) return '—'
  const s = String(id)
  return s.length > 8 ? `${s.slice(0, 6)}…` : s
}

/**
 * PRD §8.1 — last 4 complaints, row → detail.
 */
export default function RecentComplaints({ rows, loading }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-3 p-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (!rows?.length) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <span className="text-sm font-bold text-ink">Recent complaints</span>
        </div>
        <EmptyState
          icon="📋"
          title="No complaints yet"
          subtitle="When tenants raise issues on WhatsApp, they will show up here."
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className="text-sm font-bold text-ink">Recent complaints</span>
        <Link
          to="/complaints"
          className="inline-flex items-center gap-0.5 text-xs font-bold text-teal-d hover:text-teal-dk"
        >
          View all
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['ID', 'Tenant', 'Type', 'Property', 'Status', 'Age'].map((col) => (
                <th
                  key={col}
                  className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => navigate(`/complaints/${row.id}`)}
                className="cursor-pointer transition-colors hover:bg-teal-pale"
              >
                <td className="border-b border-border px-4 py-3 font-mono text-sm text-teal-d">
                  {shortId(row.id)}
                </td>
                <td className="border-b border-border px-4 py-3 text-sm text-ink">
                  {row.tenantName}
                </td>
                <td className="border-b border-border px-4 py-3 text-sm text-ink">
                  {row.type}
                </td>
                <td className="border-b border-border px-4 py-3 text-sm text-ink">
                  {row.propertyName}
                </td>
                <td className="border-b border-border px-4 py-3">
                  <Badge status={row.status} />
                </td>
                <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                  {formatAgeShort(row.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
