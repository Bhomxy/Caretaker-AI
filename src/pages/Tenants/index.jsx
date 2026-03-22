import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import {
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
  TENANT_STATUS_FILTER_ALL,
  TENANT_STATUS_OPTIONS,
} from '../../lib/constants'
import { useApp } from '../../hooks/useApp'
import { useModal } from '../../hooks/useModal'
import { useTenantsList } from '../../hooks/useTenantsList'
import AddTenantModal from '../../modals/AddTenantModal'
import { exportTenantsCsv } from '../../lib/tenantExport'
import TenantTable from './TenantTable'

const PROPERTY_FILTER_ALL = 'all'

/** PRD §8.3 */
export default function TenantsPage() {
  const navigate = useNavigate()
  const { managerId, showToast } = useApp()
  const { open, openModal, closeModal } = useModal()
  const [addTenantModalKey, setAddTenantModalKey] = useState(0)
  const { loading, rows, propertyOptions, error, refetch } =
    useTenantsList(managerId)

  const [search, setSearch] = useState('')
  const [propertyFilter, setPropertyFilter] = useState(PROPERTY_FILTER_ALL)
  const [statusFilter, setStatusFilter] = useState(TENANT_STATUS_FILTER_ALL)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (
        propertyFilter !== PROPERTY_FILTER_ALL &&
        r.propertyId !== propertyFilter
      ) {
        return false
      }
      if (
        statusFilter !== TENANT_STATUS_FILTER_ALL &&
        r.statusKey !== statusFilter
      ) {
        return false
      }
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.unit.toLowerCase().includes(q) ||
        String(r.phone).toLowerCase().includes(q)
      )
    })
  }, [rows, search, propertyFilter, statusFilter])

  const visibleIds = useMemo(() => filtered.map((r) => r.id), [filtered])

  useEffect(() => {
    queueMicrotask(() => setSelectedIds(new Set()))
  }, [search, propertyFilter, statusFilter])

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

  function handleExportSelected() {
    const chosen = filtered.filter((r) => selectedIds.has(r.id))
    if (!chosen.length) {
      showToast?.('Select at least one tenant to export.', { variant: 'info' })
      return
    }
    exportTenantsCsv(chosen)
    showToast?.('Export downloaded.')
  }

  function handleBulkBroadcast() {
    if (!selectedIds.size) {
      showToast?.('Select tenants to include in a broadcast.', { variant: 'info' })
      return
    }
    showToast?.('Broadcast will use Inbox once WhatsApp is connected.')
    navigate('/broadcast')
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div
          className="rounded-xl border border-teal-pale bg-teal-pale/40 px-4 py-3 text-sm font-semibold text-teal-dk"
          role="status"
        >
          Could not load all tenant data: {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
          <div className="min-w-[160px] max-w-xs flex-1">
            <label htmlFor="tn-search" className={FORM_LABEL_CLASS}>
              Search
            </label>
            <input
              id="tn-search"
              className={FORM_INPUT_CLASS}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or unit"
              autoComplete="off"
            />
          </div>
          <div className="w-full min-w-[160px] sm:w-52">
            <label htmlFor="tn-prop" className={FORM_LABEL_CLASS}>
              Property
            </label>
            <select
              id="tn-prop"
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
          <div className="w-full min-w-[140px] sm:w-44">
            <label htmlFor="tn-status" className={FORM_LABEL_CLASS}>
              Status
            </label>
            <select
              id="tn-status"
              className={FORM_INPUT_CLASS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {TENANT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/broadcast')}
          >
            Broadcast
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setAddTenantModalKey((k) => k + 1)
              openModal()
            }}
          >
            Add tenant
          </Button>
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
            onClick={handleBulkBroadcast}
          >
            Send broadcast
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExportSelected}
          >
            Export selected
          </Button>
        </div>
      ) : null}

      <Card bodyClassName="p-0">
        {loading ? (
          <TenantTable
            rows={[]}
            loading
            selectedIds={selectedIds}
            onToggleOne={toggleOne}
            onToggleAll={toggleAll}
            visibleIds={visibleIds}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title={rows.length === 0 ? 'No tenants yet' : 'No matches'}
            subtitle={
              rows.length === 0
                ? 'Add tenants to link them to units and service charges.'
                : 'Try another search or filter.'
            }
          />
        ) : (
          <TenantTable
            rows={filtered}
            loading={false}
            selectedIds={selectedIds}
            onToggleOne={toggleOne}
            onToggleAll={toggleAll}
            visibleIds={visibleIds}
          />
        )}
      </Card>

      <AddTenantModal
        key={addTenantModalKey}
        open={open}
        onClose={closeModal}
        managerId={managerId}
        propertyOptions={propertyOptions}
        showToast={showToast}
        onCreated={() => refetch()}
      />
    </div>
  )
}
