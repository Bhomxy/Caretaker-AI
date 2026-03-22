import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import {
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
  VENDOR_TRADE_FILTER_ALL,
  VENDOR_TRADE_OPTIONS,
} from '../../lib/constants'
import { useApp } from '../../hooks/useApp'
import { useModal } from '../../hooks/useModal'
import { useVendorsList } from '../../hooks/useVendorsList'
import AddVendorModal from '../../modals/AddVendorModal'
import VendorCard from './VendorCard'

/** PRD §8.8 */
export default function VendorsPage() {
  const { managerId, showToast } = useApp()
  const { open, openModal, closeModal } = useModal()
  const [addVendorModalKey, setAddVendorModalKey] = useState(0)
  const { loading, rows, propertyOptions, error, refetch } =
    useVendorsList(managerId)

  const [search, setSearch] = useState('')
  const [tradeFilter, setTradeFilter] = useState(VENDOR_TRADE_FILTER_ALL)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (
        tradeFilter !== VENDOR_TRADE_FILTER_ALL &&
        r.tradeSlug !== tradeFilter
      ) {
        return false
      }
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.tradeLabel.toLowerCase().includes(q)
      )
    })
  }, [rows, search, tradeFilter])

  return (
    <div className="space-y-6">
      {error ? (
        <div
          className="rounded-xl border border-teal-pale bg-teal-pale/40 px-4 py-3 text-sm font-semibold text-teal-dk"
          role="status"
        >
          Could not load all vendor data: {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
          <div className="min-w-[160px] max-w-xs flex-1">
            <label htmlFor="vendor-search" className={FORM_LABEL_CLASS}>
              Search
            </label>
            <input
              id="vendor-search"
              className={FORM_INPUT_CLASS}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or phone"
              autoComplete="off"
            />
          </div>
          <div className="w-full min-w-[160px] sm:w-52">
            <label htmlFor="vendor-trade" className={FORM_LABEL_CLASS}>
              Trade
            </label>
            <select
              id="vendor-trade"
              className={FORM_INPUT_CLASS}
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
            >
              {VENDOR_TRADE_OPTIONS.map((o) => (
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
            setAddVendorModalKey((k) => k + 1)
            openModal()
          }}
        >
          Add vendor
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <Skeleton key={k} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="🔧"
            title={rows.length === 0 ? 'No vendors yet' : 'No matches'}
            subtitle={
              rows.length === 0
                ? 'Add plumbers, electricians, and other trades you work with in Lagos.'
                : 'Try another search or trade filter.'
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <VendorCard key={row.id} row={row} />
          ))}
        </div>
      )}

      <AddVendorModal
        key={addVendorModalKey}
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
