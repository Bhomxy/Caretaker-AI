import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { formatAgeShort, getInitials } from '../../lib/utils'

function accentForKind(kind) {
  if (kind === 'complaint') return 'bg-blue text-white'
  if (kind === 'invoice') return 'bg-gold-d text-white'
  if (kind === 'receipt') return 'bg-teal-dk text-white'
  return 'bg-ink-muted text-white'
}

/**
 * PRD §8.1 — caretaker-ai.html activity list (avatar + divider rows).
 * @param {{
 *   items: { at: string; kind: string; title: string; subtitle: string }[]
 *   loading: boolean
 * }} props
 */
export default function ActivityFeed({ items, loading }) {
  if (loading) {
    return (
      <div className="space-y-3 px-1 py-1">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!items?.length) {
    return (
      <EmptyState
        icon="⚡"
        title="Quiet portfolio"
        subtitle="Complaints, invoices, and receipts will stream in here as the AI works."
      />
    )
  }

  return (
    <ul className="divide-y divide-border px-1 py-1">
      {items.map((item, idx) => {
        const initials = getInitials(item.subtitle?.split('·')[0]?.trim() ?? '')
        return (
          <li
            key={`${item.at}-${idx}`}
            className="flex gap-2.5 py-2.5 first:pt-0 last:pb-0"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${accentForKind(item.kind)}`}
            >
              {initials || '•'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium leading-snug text-ink">
                {item.title}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-ink-muted">
                {item.subtitle}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink-muted">
                {formatAgeShort(item.at)}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
