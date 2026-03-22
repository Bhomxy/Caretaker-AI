import { Link, useSearchParams } from 'react-router-dom'
import Card from '../../components/ui/Card'

/** PRD §8.5 — tabs for deep-links from Dashboard; full tables in Phase 10. */
export default function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'approvals' ? 'approvals' : 'rent-roll'

  const setTab = (next) => {
    if (next === 'rent-roll') {
      const p = new URLSearchParams(searchParams)
      p.delete('tab')
      setSearchParams(p, { replace: true })
    } else {
      setSearchParams({ tab: next }, { replace: true })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTab('rent-roll')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
            tab === 'rent-roll'
              ? 'bg-teal-pale text-teal-dk'
              : 'text-ink-muted hover:bg-page hover:text-ink-secondary'
          }`}
        >
          Rent roll
        </button>
        <button
          type="button"
          onClick={() => setTab('approvals')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
            tab === 'approvals'
              ? 'bg-teal-pale text-teal-dk'
              : 'text-ink-muted hover:bg-page hover:text-ink-secondary'
          }`}
        >
          Approvals
        </button>
      </div>

      {tab === 'rent-roll' ? (
        <Card title="Rent roll">
          <p className="text-sm text-ink-secondary">
            Tenant payment status for the current period ships in Phase 10.
          </p>
        </Card>
      ) : (
        <Card title="Approvals">
          <p className="text-sm text-ink-secondary">
            Payments awaiting your approval (WhatsApp confirmations) ship in
            Phase 10.
          </p>
          <Link
            to="/"
            className="mt-3 inline-block text-xs font-semibold text-teal-d hover:text-teal-dk"
          >
            ← Dashboard
          </Link>
        </Card>
      )}
    </div>
  )
}
