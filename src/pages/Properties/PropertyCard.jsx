import { Link } from 'react-router-dom'
import { PROPERTY_CARD_ACCENTS } from '../../lib/constants'
import { formatNaira } from '../../lib/utils'

/**
 * PRD §8.2 — property card (grid cell).
 * @param {object} props
 * @param {object} props.row — enriched row from `fetchPropertiesList`
 */
export default function PropertyCard({ row }) {
  const accent =
    PROPERTY_CARD_ACCENTS[row.accentIndex % PROPERTY_CARD_ACCENTS.length]

  return (
    <Link
      to={`/properties/${row.id}`}
      className="group block rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-soft-lg"
    >
      <div
        className={`rounded-t-xl border-l-4 ${accent} overflow-hidden rounded-b-none`}
      >
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-extrabold text-ink group-hover:text-teal-d">
                {row.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-ink-muted">
                {row.location}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-teal-pale px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-dk">
              {row.typeLabel}
            </span>
          </div>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div>
              <p className="font-bold uppercase tracking-widest text-ink-muted">
                Units
              </p>
              <p className="mt-0.5 font-semibold text-ink">
                {row.totalUnits > 0
                  ? `${row.occupied}/${row.totalUnits} occupied`
                  : `${row.occupied} tenant${row.occupied === 1 ? '' : 's'}`}
              </p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-ink-muted">
                Revenue
              </p>
              <p className="mt-0.5 font-semibold text-ink">
                {formatNaira(row.revenueMonthly)}/mo
              </p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-ink-muted">
                Open issues
              </p>
              <p className="mt-0.5 font-semibold text-ink">
                {row.openComplaints}
              </p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-ink-muted">
                Manager
              </p>
              <p className="mt-0.5 truncate font-semibold text-ink">
                {row.managerLabel}
              </p>
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              <span>Occupancy</span>
              <span>{row.occupancyPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-page">
              <div
                className="h-full rounded-full bg-teal-d transition-all group-hover:bg-teal-dk"
                style={{ width: `${row.occupancyPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
