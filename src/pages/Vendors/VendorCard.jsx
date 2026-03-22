import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import Badge from '../../components/ui/Badge'

/**
 * PRD §8.8 — vendor grid card.
 */
export default function VendorCard({ row }) {
  return (
    <Link
      to={`/vendors/${row.id}`}
      className="group block rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-extrabold text-ink group-hover:text-teal-d">
            {row.name}
          </h3>
          <span className="mt-1.5 inline-block rounded-full bg-teal-pale px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-dk">
            {row.tradeLabel}
          </span>
        </div>
        <Badge status={row.status} />
      </div>
      <p className="mt-3 text-xs font-semibold text-ink-secondary">{row.phone}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            Jobs done
          </p>
          <p className="text-sm font-extrabold text-ink">{row.jobsDone}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            Rating
          </p>
          {row.rating != null && Number.isFinite(row.rating) ? (
            <span className="inline-flex items-center gap-0.5 text-sm font-extrabold text-ink">
              <Star
                className="h-3.5 w-3.5 fill-gold text-gold"
                strokeWidth={1.5}
                aria-hidden
              />
              {row.rating.toFixed(1)}
            </span>
          ) : (
            <span className="text-sm font-semibold text-ink-muted">—</span>
          )}
        </div>
      </div>
    </Link>
  )
}
