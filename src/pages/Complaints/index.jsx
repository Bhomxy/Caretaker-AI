import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import {
  COMPLAINT_PRIORITY_FILTER_ALL,
  COMPLAINT_PRIORITY_FILTER_OPTIONS,
  COMPLAINT_STATUS_FILTER_ALL,
  COMPLAINT_STATUS_FILTER_OPTIONS,
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
} from '../../lib/constants'
import { useApp } from '../../hooks/useApp'
import { useModal } from '../../hooks/useModal'
import { useComplaintsList } from '../../hooks/useComplaintsList'
import { bulkUpdateComplaints } from '../../lib/queries/complaints'
import { shortRecordId } from '../../lib/utils'
import BulkAssignVendorModal from '../../modals/BulkAssignVendorModal'
import ComplaintTable from './ComplaintTable'

const PROPERTY_FILTER_ALL = 'all'

function SummaryCard({ label, value, loading }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-soft">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      {loading ? (
        <div className="mt-2 h-8 w-12 animate-pulse rounded bg-border" />
      ) : (
        <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
      )}
    </div>
  )
}

/** PRD §8.4 */
export default function ComplaintsPage() {
  const { managerId, showToast } = useApp()
  const {
    open: bulkOpen,
    openModal: openBulkModal,
    closeModal: closeBulkModal,
  } = useModal()

  const { loading, rows, counts, propertyOptions, vendorOptions, error, refetch } =
    useComplaintsList(managerId)

  const [search, setSearch] = useState('')
  const [propertyFilter, setPropertyFilter] = useState(PROPERTY_FILTER_ALL)
  const [statusFilter, setStatusFilter] = useState(COMPLAINT_STATUS_FILTER_ALL)
  const [priorityFilter, setPriorityFilter] = useState(
    COMPLAINT_PRIORITY_FILTER_ALL
  )
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (
        propertyFilter !== PROPERTY_FILTER_ALL &&
        r.raw.property_id !== propertyFilter
      ) {
        return false
      }
      if (
        statusFilter !== COMPLAINT_STATUS_FILTER_ALL &&
        r.statusKey !== statusFilter
      ) {
        return false
      }
      if (
        priorityFilter !== COMPLAINT_PRIORITY_FILTER_ALL &&
        r.priorityKey !== priorityFilter
      ) {
        return false
      }
      if (!q) return true
      const idStr = String(r.id).toLowerCase()
      return (
        r.tenantName.toLowerCase().includes(q) ||
        idStr.includes(q) ||
        shortRecordId(r.id).toLowerCase().includes(q)
      )
    })
  }, [rows, search, propertyFilter, statusFilter, priorityFilter])

  const visibleIds = useMemo(() => filtered.map((r) => r.id), [filtered])

  useEffect(() => {
    queueMicrotask(() => setSelectedIds(new Set()))
  }, [search, propertyFilter, statusFilter, priorityFilter])

  function toggleOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll(ids) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const allOn = ids.length > 0 && ids.every((id) => next.has(id))
      if (allOn) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }

  async function handleBulkResolved() {
    const ids = [...selectedIds]
    if (!ids.length || !managerId) {
      showToast?.('Select complaints to mark resolved.', { variant: 'info' })
      return
    }
    const { error: err } = await bulkUpdateComplaints(managerId, ids, {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    })
    if (err) {
      showToast?.(err, { variant: 'error' })
      return
    }
    showToast?.('Marked selected as resolved.')
    setSelectedIds(new Set())
    refetch()
  }

  async function handleBulkAssignVendor(vendorId) {
    const ids = [...selectedIds]
    if (!ids.length || !managerId) return
    const { error: err } = await bulkUpdateComplaints(managerId, ids, {
      vendor_id: vendorId,
    })
    if (err) {
      showToast?.(err, { variant: 'error' })
      return
    }
    showToast?.('Vendor assigned.')
    setSelectedIds(new Set())
    refetch()
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div
          className="rounded-xl border border-teal-pale bg-teal-pale/40 px-4 py-3 text-sm font-semibold text-teal-dk"
          role="status"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total" value={counts.total} loading={loading} />
        <SummaryCard label="Open" value={counts.open} loading={loading} />
        <SummaryCard
          label="In progress"
          value={counts.inProgress}
          loading={loading}
        />
        <SummaryCard
          label="Resolved"
          value={counts.resolved}
          loading={loading}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[140px] max-w-xs flex-1">
          <label htmlFor="cmp-search" className={FORM_LABEL_CLASS}>
            Search
          </label>
          <input
            id="cmp-search"
            className={FORM_INPUT_CLASS}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tenant or ID"
            autoComplete="off"
          />
        </div>
        <div className="w-full min-w-[140px] sm:w-44">
          <label htmlFor="cmp-prop" className={FORM_LABEL_CLASS}>
            Property
          </label>
          <select
            id="cmp-prop"
            className={FORM_INPUT_CLASS}
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
          >
            <option value={PROPERTY_FILTER_ALL}>All properties</option>
            {propertyOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full min-w-[130px] sm:w-40">
          <label htmlFor="cmp-status" className={FORM_LABEL_CLASS}>
            Status
          </label>
          <select
            id="cmp-status"
            className={FORM_INPUT_CLASS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {COMPLAINT_STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full min-w-[130px] sm:w-40">
          <label htmlFor="cmp-priority" className={FORM_LABEL_CLASS}>
            Priority
          </label>
          <select
            id="cmp-priority"
            className={FORM_INPUT_CLASS}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            {COMPLAINT_PRIORITY_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedIds.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-teal-pale/30 px-4 py-3 shadow-soft">
          <span className="text-xs font-bold text-ink-secondary">
            {selectedIds.size} selected
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openBulkModal}
            disabled={!vendorOptions.length}
            title={
              vendorOptions.length ? '' : 'Add vendors first'
            }
          >
            Assign vendor
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleBulkResolved}
          >
            Mark resolved
          </Button>
        </div>
      ) : null}

      <Card bodyClassName="p-0">
        {loading ? (
          <ComplaintTable
            rows={[]}
            loading
            selectedIds={selectedIds}
            onToggleOne={toggleOne}
            onToggleAll={toggleAll}
            visibleIds={visibleIds}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title={rows.length === 0 ? 'No complaints' : 'No matches'}
            subtitle={
              rows.length === 0
                ? 'When tenants message on WhatsApp, Caretaker AI will log issues here.'
                : 'Try adjusting filters or search.'
            }
          />
        ) : (
          <ComplaintTable
            rows={filtered}
            loading={false}
            selectedIds={selectedIds}
            onToggleOne={toggleOne}
            onToggleAll={toggleAll}
            visibleIds={visibleIds}
          />
        )}
      </Card>

      <BulkAssignVendorModal
        open={bulkOpen}
        onClose={closeBulkModal}
        vendorOptions={vendorOptions}
        selectedCount={selectedIds.size}
        onAssign={handleBulkAssignVendor}
      />
    </div>
  )
}
