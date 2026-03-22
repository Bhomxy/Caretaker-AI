import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useApp } from '../../hooks/useApp'
import { useModal } from '../../hooks/useModal'
import { usePropertiesList } from '../../hooks/usePropertiesList'
import {
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
  PROPERTY_TYPE_FILTER_ALL,
  PROPERTY_TYPE_OPTIONS,
} from '../../lib/constants'
import AddPropertyModal from '../../modals/AddPropertyModal'
import PropertyCard from './PropertyCard'

/** PRD §8.2 */
export default function PropertiesPage() {
  const { managerId, user, showToast } = useApp()
  const { open, openModal, closeModal } = useModal()
  const [addPropertyModalKey, setAddPropertyModalKey] = useState(0)
  const { loading, rows, error, refetch } = usePropertiesList(managerId)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState(PROPERTY_TYPE_FILTER_ALL)

  const managerLabel =
    user?.user_metadata?.full_name?.trim() || user?.email || '—'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (typeFilter !== PROPERTY_TYPE_FILTER_ALL && r.typeKey !== typeFilter) {
        return false
      }
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      )
    })
  }, [rows, search, typeFilter])

  return (
    <div className="space-y-6">
      {error ? (
        <div
          className="rounded-xl border border-gold-pale bg-gold-pale/50 px-4 py-3 text-sm font-semibold text-yellow-900"
          role="status"
        >
          Could not load all property data: {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
          <div className="min-w-[180px] max-w-md flex-1">
            <label htmlFor="prop-search" className={FORM_LABEL_CLASS}>
              Search
            </label>
            <input
              id="prop-search"
              className={FORM_INPUT_CLASS}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or location"
              autoComplete="off"
            />
          </div>
          <div className="w-full min-w-[160px] sm:w-48">
            <label htmlFor="prop-type-filter" className={FORM_LABEL_CLASS}>
              Type
            </label>
            <select
              id="prop-type-filter"
              className={FORM_INPUT_CLASS}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {PROPERTY_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => {
            setAddPropertyModalKey((k) => k + 1)
            openModal()
          }}
        >
          Add property
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <Skeleton key={k} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="🏢"
            title={rows.length === 0 ? 'No properties yet' : 'No matches'}
            subtitle={
              rows.length === 0
                ? 'Add your first building to start tracking units and tenants.'
                : 'Try a different search or type filter.'
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <PropertyCard key={row.id} row={row} />
          ))}
        </div>
      )}

      <AddPropertyModal
        key={addPropertyModalKey}
        open={open}
        onClose={closeModal}
        managerId={managerId}
        managerLabel={managerLabel}
        showToast={showToast}
        onCreated={() => refetch()}
      />
    </div>
  )
}
