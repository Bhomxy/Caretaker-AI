import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { formatNaira } from '../../lib/utils'

/**
 * PRD §8.3 — tenant table + selection column.
 */
export default function TenantTable({
  rows,
  loading,
  selectedIds,
  onToggleOne,
  onToggleAll,
  visibleIds,
}) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="space-y-3 p-5">
        {[1, 2, 3, 4, 5].map((k) => (
          <Skeleton key={k} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  const allSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.has(id))

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-border px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted w-10">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-teal-d"
                checked={allSelected}
                onChange={() => onToggleAll(visibleIds)}
                aria-label="Select all visible"
              />
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Tenant
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Unit
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Property
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Service charge
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Status
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Complaints
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Phone
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              View
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="cursor-pointer transition-colors hover:bg-teal-pale/50"
              onClick={() => navigate(`/tenants/${r.id}`)}
            >
              <td
                className="border-b border-border px-3 py-3"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-teal-d"
                  checked={selectedIds.has(r.id)}
                  onChange={() => onToggleOne(r.id)}
                  aria-label={`Select ${r.name}`}
                />
              </td>
              <td className="border-b border-border px-4 py-3">
                <p className="text-sm font-bold text-ink">{r.name}</p>
                <p className="text-[11px] font-semibold text-ink-muted">
                  Since {r.sinceLabel}
                </p>
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {r.unit}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {r.propertyName}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                {formatNaira(r.serviceChargeAnnual)}
              </td>
              <td className="border-b border-border px-4 py-3">
                <Badge status={r.statusKey} />
              </td>
              <td
                className={`border-b border-border px-4 py-3 text-sm font-semibold ${
                  r.complaintsCount > 3 ? 'text-red' : 'text-ink-secondary'
                }`}
              >
                {r.complaintsCount}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {r.phone}
              </td>
              <td
                className="border-b border-border px-4 py-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/tenants/${r.id}`)}
                  className="text-xs font-semibold text-teal-d hover:text-teal-dk"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
