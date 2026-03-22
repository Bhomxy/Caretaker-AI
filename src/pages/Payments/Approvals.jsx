import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { formatDate, formatNaira } from '../../lib/utils'
import {
  approveInvoice,
  bulkApproveInvoices,
  queryInvoice,
} from '../../lib/queries/payments'

/**
 * @param {{
 *   rows: object[]
 *   loading: boolean
 *   error: string | null
 *   managerId: string | null
 *   onAfterAction: () => Promise<void> | void
 *   showToast: (msg: string, opts?: object) => void
 * }} props
 */
export default function Approvals({
  rows,
  loading,
  error,
  managerId,
  onAfterAction,
  showToast,
}) {
  const [selected, setSelected] = useState(() => new Set())
  const [busyId, setBusyId] = useState(null)
  const [bulkBusy, setBulkBusy] = useState(false)

  const allIds = useMemo(() => rows.map((r) => r.id), [rows])

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === allIds.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allIds))
    }
  }

  const handleApprove = async (id) => {
    if (!managerId) return
    setBusyId(id)
    const { error: err } = await approveInvoice(managerId, id)
    setBusyId(null)
    if (err) {
      showToast(err.message ?? 'Could not approve.', { variant: 'error' })
      return
    }
    showToast('Approved — receipt flow queued for WhatsApp.')
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    await onAfterAction()
  }

  const handleQuery = async (id) => {
    if (!managerId) return
    setBusyId(id)
    const { error: err } = await queryInvoice(managerId, id)
    setBusyId(null)
    if (err) {
      showToast(err.message ?? 'Could not flag query.', { variant: 'error' })
      return
    }
    showToast('Marked as disputed — AI will follow up with the tenant.')
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    await onAfterAction()
  }

  const handleBulkApprove = async () => {
    if (!managerId || !selected.size) return
    setBulkBusy(true)
    const { error: err } = await bulkApproveInvoices(managerId, [...selected])
    setBulkBusy(false)
    if (err) {
      showToast(err.message ?? 'Bulk approve failed.', { variant: 'error' })
      return
    }
    showToast(`Approved ${selected.size} payment${selected.size === 1 ? '' : 's'}.`)
    setSelected(new Set())
    await onAfterAction()
  }

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
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!rows.length) {
    return (
      <EmptyState
        icon="✅"
        title="Nothing waiting for you"
        subtitle="When tenants confirm payment on WhatsApp, those items appear here for approval."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-ink-secondary">
          <input
            type="checkbox"
            checked={allIds.length > 0 && selected.size === allIds.length}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-border text-teal-d focus:ring-teal"
          />
          Select all
        </label>
        <Button
          type="button"
          size="sm"
          disabled={!selected.size || bulkBusy || !managerId}
          onClick={() => void handleBulkApprove()}
        >
          {bulkBusy ? 'Approving…' : `Approve selected (${selected.size})`}
        </Button>
      </div>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-gold-d/30 bg-gold-pale/40 p-4 shadow-soft-xs"
          >
            <div className="flex flex-wrap items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(r.id)}
                onChange={() => toggle(r.id)}
                className="mt-1 h-4 w-4 rounded border-border text-teal-d focus:ring-teal"
                aria-label={`Select ${r.tenantName}`}
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-extrabold text-ink">
                    {r.tenantName}
                    <span className="ml-2 font-semibold text-ink-secondary">
                      · {r.unit} · {r.propertyName}
                    </span>
                  </p>
                  <p className="text-sm font-extrabold text-teal-dk">
                    {formatNaira(r.amount)}
                  </p>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                  Tenant WhatsApp confirmation
                </p>
                <p className="rounded-lg border border-border bg-white px-3 py-2 text-sm leading-relaxed text-ink">
                  {r.confirmation}
                </p>
                <p className="text-xs font-medium text-ink-muted">
                  Logged{' '}
                  {r.confirmedAt
                    ? formatDate(r.confirmedAt)
                    : '—'}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    disabled={busyId === r.id || !managerId}
                    onClick={() => void handleApprove(r.id)}
                  >
                    {busyId === r.id ? 'Working…' : 'Approve'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busyId === r.id || !managerId}
                    onClick={() => void handleQuery(r.id)}
                  >
                    Query
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
