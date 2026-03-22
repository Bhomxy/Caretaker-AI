import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { formatAgeShort, shortRecordId } from '../../lib/utils'

/**
 * PRD §8.4 — complaints table with selection.
 */
export default function ComplaintTable({
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
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-10 border-b border-border px-3 py-3 text-left">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-teal-d"
                checked={allSelected}
                onChange={() => onToggleAll(visibleIds)}
                aria-label="Select all visible"
              />
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              ID
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Tenant
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Type
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Property
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Unit
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Priority
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Status
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Age
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Vendor
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="cursor-pointer transition-colors hover:bg-teal-pale/50"
              onClick={() => navigate(`/complaints/${r.id}`)}
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
                  aria-label={`Select complaint ${shortRecordId(r.id)}`}
                />
              </td>
              <td className="border-b border-border px-4 py-3 font-mono text-xs text-teal-d">
                {shortRecordId(r.id)}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                {r.tenantName}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {r.type}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {r.propertyName}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {r.unit}
              </td>
              <td className="border-b border-border px-4 py-3">
                <Badge status={r.priorityKey} />
              </td>
              <td className="border-b border-border px-4 py-3">
                <Badge status={r.statusKey} />
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {formatAgeShort(r.created_at)}
              </td>
              <td className="max-w-[140px] truncate border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {r.vendorName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
