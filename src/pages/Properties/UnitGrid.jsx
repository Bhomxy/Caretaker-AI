import { formatNaira } from '../../lib/utils'

/**
 * PRD §8.2 — Units tab.
 * @param {{ unitNumber: string, occupied: boolean, tenantName: string | null, rent: number | null }[]} props.units
 */
export default function UnitGrid({ units }) {
  if (!units.length) {
    return (
      <p className="text-sm text-ink-secondary">
        No unit layout yet. Add tenants or a units table in Supabase.
      </p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {units.map((u) => (
        <div
          key={u.unitNumber}
          className={`rounded-xl border px-4 py-3 shadow-soft ${
            u.occupied
              ? 'border-teal-pale bg-teal-pale/40'
              : 'border-border bg-page'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            Unit {u.unitNumber}
          </p>
          {u.occupied ? (
            <>
              <p className="mt-1 truncate text-sm font-bold text-ink">
                {u.tenantName}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-ink-secondary">
                {u.rent != null ? `${formatNaira(u.rent)}/mo` : 'Rent —'}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm font-semibold text-ink-muted">
              Vacant
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
