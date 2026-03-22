import { useMemo, useState } from 'react'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import {
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
  RENT_ROLL_STATUS_FILTER_ALL,
  RENT_ROLL_STATUS_OPTIONS,
} from '../../lib/constants'
import { formatDate, formatNaira } from '../../lib/utils'

/**
 * @param {{
 *   rows: object[]
 *   propertyOptions: { id: string; label: string }[]
 *   loading: boolean
 *   error: string | null
 * }} props
 */
export default function RentRoll({ rows, propertyOptions, loading, error }) {
  const [propertyId, setPropertyId] = useState('all')
  const [status, setStatus] = useState(RENT_ROLL_STATUS_FILTER_ALL)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (propertyId !== 'all' && r.propertyId !== propertyId) return false
      if (status !== RENT_ROLL_STATUS_FILTER_ALL && r.statusKey !== status) {
        return false
      }
      return true
    })
  }, [rows, propertyId, status])

  if (error) {
    return (
      <p className="text-sm font-semibold text-red-600" role="alert">
        {error}
      </p>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full max-w-md" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!rows.length) {
    return (
      <EmptyState
        icon="📋"
        title="No tenants on the rent roll"
        subtitle="Add tenants to properties to track charges, due dates, and AI payment actions."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[160px] flex-1">
          <label htmlFor="rr-property" className={FORM_LABEL_CLASS}>
            Property
          </label>
          <select
            id="rr-property"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className={FORM_INPUT_CLASS}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[160px] flex-1">
          <label htmlFor="rr-status" className={FORM_LABEL_CLASS}>
            Status
          </label>
          <select
            id="rr-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={FORM_INPUT_CLASS}
          >
            {RENT_ROLL_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
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
                Charge
              </th>
              <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Due
              </th>
              <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Status
              </th>
              <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Last AI action
              </th>
              <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Timeline
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.tenantId}
                className="transition-colors hover:bg-teal-pale/60"
              >
                <td className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                  {r.tenantName}
                </td>
                <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                  {r.unit}
                </td>
                <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                  {r.propertyName}
                </td>
                <td className="border-b border-border px-4 py-3 text-sm text-ink">
                  {formatNaira(r.chargeAmount)}
                </td>
                <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                  {formatDate(r.dueDate)}
                </td>
                <td className="border-b border-border px-4 py-3">
                  <Badge status={r.statusKey} />
                </td>
                <td className="max-w-[200px] border-b border-border px-4 py-3 text-xs font-medium leading-snug text-ink-secondary">
                  {r.lastAiAction}
                </td>
                <td className="border-b border-border px-4 py-3 text-xs font-semibold text-ink-secondary">
                  {r.daysLabel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-xs font-semibold text-ink-muted">
          No rows match these filters.
        </p>
      ) : null}
    </div>
  )
}
