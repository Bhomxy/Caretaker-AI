import { useSearchParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import { useApp } from '../../hooks/useApp'
import { usePaymentsBundle } from '../../hooks/usePaymentsBundle'
import {
  PAYMENTS_TAB_APPROVALS,
  PAYMENTS_TAB_INVOICES,
  PAYMENTS_TAB_OPTIONS,
  PAYMENTS_TAB_RECEIPTS,
  PAYMENTS_TAB_RENT_ROLL,
} from '../../lib/constants'
import { formatNaira } from '../../lib/utils'
import Approvals from './Approvals'
import Invoices from './Invoices'
import Receipts from './Receipts'
import RentRoll from './RentRoll'

const TAB_IDS = new Set(PAYMENTS_TAB_OPTIONS.map((o) => o.id))

function PaymentSummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const items = [
    { label: 'Total expected (mo.)', value: formatNaira(summary.totalExpected) },
    { label: 'Collected this month', value: formatNaira(summary.collectedMonth) },
    { label: 'Outstanding (est.)', value: formatNaira(summary.outstanding) },
    {
      label: 'Due this month',
      value: String(summary.dueThisMonth),
      hint: 'tenants',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-border bg-card px-4 py-3 shadow-soft-xs"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {it.label}
          </p>
          <p className="mt-1 text-xl font-extrabold text-ink">{it.value}</p>
          {it.hint ? (
            <p className="text-[10px] font-medium text-ink-muted">{it.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/** PRD §8.5 */
export default function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { managerId, showToast } = useApp()
  const bundle = usePaymentsBundle(managerId)

  const rawTab = searchParams.get('tab')
  const tab =
    rawTab && TAB_IDS.has(rawTab) ? rawTab : PAYMENTS_TAB_RENT_ROLL

  const setTab = (next) => {
    if (next === PAYMENTS_TAB_RENT_ROLL) {
      const p = new URLSearchParams(searchParams)
      p.delete('tab')
      setSearchParams(p, { replace: true })
    } else {
      const p = new URLSearchParams(searchParams)
      p.set('tab', next)
      setSearchParams(p, { replace: true })
    }
  }

  const tabTitle =
    PAYMENTS_TAB_OPTIONS.find((o) => o.id === tab)?.label ?? 'Payments'

  return (
    <div className="space-y-4">
      {bundle.partial && !bundle.error ? (
        <p
          className="rounded-xl border border-gold-d/30 bg-gold-pale/50 px-4 py-2 text-xs font-semibold text-ink-secondary"
          role="status"
        >
          Some payment data could not be loaded (receipts or ledger). Check that
          the latest SQL from{' '}
          <code className="rounded bg-white/80 px-1 font-mono text-[11px]">
            supabase/schema.sql
          </code>{' '}
          has been applied.
        </p>
      ) : null}

      <PaymentSummaryCards
        summary={bundle.summary}
        loading={bundle.loading}
      />

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {PAYMENTS_TAB_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setTab(o.id)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
              tab === o.id
                ? 'bg-teal-pale text-teal-dk'
                : 'text-ink-muted hover:bg-page hover:text-ink-secondary'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <Card title={tabTitle}>
        {tab === PAYMENTS_TAB_RENT_ROLL ? (
          <RentRoll
            rows={bundle.rentRollRows}
            propertyOptions={bundle.propertyOptions}
            loading={bundle.loading}
            error={bundle.error}
          />
        ) : null}
        {tab === PAYMENTS_TAB_APPROVALS ? (
          <Approvals
            rows={bundle.approvalsRows}
            loading={bundle.loading}
            error={bundle.error}
            managerId={managerId}
            onAfterAction={() => bundle.refetch()}
            showToast={showToast}
          />
        ) : null}
        {tab === PAYMENTS_TAB_INVOICES ? (
          <Invoices
            rows={bundle.invoiceRows}
            loading={bundle.loading}
            error={bundle.error}
            showToast={showToast}
          />
        ) : null}
        {tab === PAYMENTS_TAB_RECEIPTS ? (
          <Receipts
            rows={bundle.receiptRows}
            loading={bundle.loading}
            error={bundle.error}
            showToast={showToast}
          />
        ) : null}
      </Card>
    </div>
  )
}
