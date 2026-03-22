import { useMemo } from 'react'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { formatNaira } from '../../lib/utils'

export function SegmentedTabs({ value, onChange }) {
  return (
    <div className="flex gap-0.5 rounded-lg border-[1.5px] border-border bg-page p-0.5">
      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={`rounded-md px-3.5 py-1 text-xs font-semibold transition-all ${
          value === 'monthly'
            ? 'bg-card font-bold text-ink shadow-[0_1px_3px_rgba(13,31,28,0.08)]'
            : 'text-ink-secondary hover:text-ink'
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange('quarterly')}
        className={`rounded-md px-3.5 py-1 text-xs font-semibold transition-all ${
          value === 'quarterly'
            ? 'bg-card font-bold text-ink shadow-[0_1px_3px_rgba(13,31,28,0.08)]'
            : 'text-ink-secondary hover:text-ink'
        }`}
      >
        Quarterly
      </button>
    </div>
  )
}

function bucketQuarterly(months) {
  const out = []
  for (let i = 0; i < months.length; i += 3) {
    const chunk = months.slice(i, i + 3)
    const total = chunk.reduce((s, m) => s + m.total, 0)
    out.push({
      label: `Q${out.length + 1}`,
      total,
    })
  }
  return out.length ? out : months
}

/**
 * PRD §8.1 — bars + summary row (caretaker-ai.html pattern).
 * @param {{
 *   months: { label: string; total: number }[]
 *   period: 'monthly' | 'quarterly'
 *   loading: boolean
 *   ytdTotal: number
 *   outstanding: number
 *   overdue: number
 * }} props
 */
export default function CollectionChart({
  months,
  period,
  loading,
  ytdTotal,
  outstanding,
  overdue,
}) {
  const series = useMemo(() => {
    if (!months?.length) return []
    return period === 'quarterly' ? bucketQuarterly(months) : months
  }, [months, period])

  const sixMonthTotal = useMemo(
    () => (months ?? []).reduce((s, m) => s + m.total, 0),
    [months]
  )

  if (loading) {
    return <Skeleton className="h-52 w-full" />
  }

  if (!months?.length) {
    return (
      <EmptyState
        icon="📈"
        title="No collection data yet"
        subtitle="Approved payments will fill this chart automatically."
      />
    )
  }

  const max = Math.max(...series.map((m) => m.total), 1)
  const flat = series.every((m) => !m.total)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-ink">
          {formatNaira(sixMonthTotal)}
        </span>
        <span className="text-xs font-bold text-green">6-mo window</span>
      </div>
      {flat ? (
        <p className="mb-3 text-xs font-semibold text-ink-muted">
          No payments in this window — bars grow as you approve collections.
        </p>
      ) : null}
      <div className="flex h-[70px] items-end gap-1 border-b border-border pb-1">
        {series.map((m, i) => {
          const h = Math.max(8, (m.total / max) * 100)
          const highlightGold =
            series.length === 6 ? i === 2 : i === Math.floor(series.length / 2)
          const dim =
            period === 'monthly' && series.length === 6 && i > 2 && m.total === 0
          return (
            <div
              key={`${m.label}-${i}`}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className={`w-full rounded-t-sm transition-opacity hover:opacity-75 ${
                  highlightGold ? 'bg-gold' : 'bg-teal'
                }`}
                style={{
                  height: `${h}%`,
                  minHeight: '6px',
                  opacity: dim ? 0.22 : 1,
                }}
                title={`${m.label}: ${formatNaira(m.total)}`}
              />
              <span className="text-[9px] font-semibold text-ink-muted">
                {m.label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {[
          ['Collected (YTD)', ytdTotal, 'text-teal-d'],
          ['Outstanding (est.)', outstanding, 'text-gold-d'],
          ['Overdue (est.)', overdue, 'text-red'],
        ].map(([label, val, color]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-page px-3 py-2.5"
          >
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
              {label}
            </p>
            <p className={`text-[14.5px] font-extrabold ${color}`}>
              {formatNaira(val)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
