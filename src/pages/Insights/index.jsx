import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useApp } from '../../hooks/useApp'
import { useInsights } from '../../hooks/useInsights'
import { formatDate, formatNaira } from '../../lib/utils'

function BarChart({ rows, loading }) {
  if (loading) {
    return <Skeleton className="h-40 w-full" />
  }
  if (!rows.length) {
    return (
      <EmptyState
        icon="📉"
        title="No complaint types yet"
        subtitle="Once issues are logged, frequency by type appears here."
      />
    )
  }
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <div className="flex h-44 items-end gap-2 border-b border-border pb-1 pl-1">
      {rows.map((r) => (
        <div
          key={r.type}
          className="flex min-w-0 flex-1 flex-col items-center gap-1"
        >
          <div
            className="w-full max-w-[48px] rounded-t-md bg-teal-d/90 transition-all"
            style={{
              height: `${Math.max(8, (r.count / max) * 100)}%`,
              minHeight: '8px',
            }}
            title={`${r.type}: ${r.count}`}
          />
          <span className="line-clamp-2 text-center text-[9px] font-bold uppercase leading-tight text-ink-muted">
            {r.type}
          </span>
        </div>
      ))}
    </div>
  )
}

const URGENCY_STYLES = {
  high: 'border-red-200 bg-red-pale',
  medium: 'border-gold-d/30 bg-gold-pale/60',
  low: 'border-border bg-page',
}

/** PRD §8.9 */
export default function InsightsPage() {
  const { managerId } = useApp()
  const {
    loading,
    healthScore,
    narrative,
    topMaintenanceIssues,
    highComplaintProperties,
    riskyTenants,
    whatsappStats,
    maintenanceSpendByProperty,
    topVendorsBySpend,
    leaseRows,
    recommendations,
    error,
    partial,
    refresh,
  } = useInsights(managerId)

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-pale px-4 py-3 text-sm font-semibold text-red-700"
        role="alert"
      >
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {partial ? (
          <p className="text-xs font-semibold text-ink-muted">
            Some ledger data may be missing until receipts / invoices tables are
            synced.
          </p>
        ) : (
          <span />
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => void refresh()}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
        <Card title="Portfolio health">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <p className="text-sm font-medium leading-relaxed text-ink-secondary">
              {narrative}
            </p>
          )}
        </Card>
        <div className="flex items-center justify-center rounded-xl border border-border bg-card px-6 py-8 shadow-soft">
          {loading ? (
            <Skeleton className="h-28 w-28 rounded-full" />
          ) : (
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-teal-d bg-teal-pale shadow-soft-xs"
              aria-label={`Health score ${healthScore} out of 100`}
            >
              <span className="text-3xl font-extrabold text-teal-dk">
                {healthScore}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Top maintenance issues">
          <BarChart rows={topMaintenanceIssues} loading={loading} />
        </Card>
        <Card title="High-complaint properties">
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : !highComplaintProperties.length ? (
            <EmptyState
              icon="🏢"
              title="No open complaints by property"
              subtitle="Great — or add properties and complaints to see rankings."
            />
          ) : (
            <ol className="space-y-2">
              {highComplaintProperties.map((p, i) => (
                <li
                  key={p.propertyId}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-bold text-ink-muted">{i + 1}.</span>
                  <span className="flex-1 px-2 font-semibold text-ink">
                    {p.name}
                  </span>
                  <span className="font-extrabold text-teal-dk">
                    {p.openCount} open
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card title="High-risk tenants">
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : !riskyTenants.length ? (
          <EmptyState
            icon="🛡️"
            title="No high-risk tenants flagged"
            subtitle="Overdue balances or repeat complaints will surface here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Tenant
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Unit / property
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Signal
                  </th>
                </tr>
              </thead>
              <tbody>
                {riskyTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-teal-pale/50">
                    <td className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                      {t.name}
                    </td>
                    <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                      {t.unit} · {t.propertyName}
                    </td>
                    <td className="border-b border-border px-4 py-3 text-xs font-semibold text-red-700">
                      {t.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="WhatsApp AI activity (estimated)">
        {loading ? (
          <Skeleton className="h-28 w-full" />
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-page px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-ink-muted">
                Messages processed
              </dt>
              <dd className="text-lg font-extrabold text-ink">
                {whatsappStats.messagesProcessed.toLocaleString('en-NG')}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-page px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-ink-muted">
                Complaints logged
              </dt>
              <dd className="text-lg font-extrabold text-ink">
                {whatsappStats.complaintsLogged}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-page px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-ink-muted">
                Invoices sent
              </dt>
              <dd className="text-lg font-extrabold text-ink">
                {whatsappStats.invoicesSent}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-page px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-ink-muted">
                Receipts sent
              </dt>
              <dd className="text-lg font-extrabold text-ink">
                {whatsappStats.receiptsSent}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-page px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-ink-muted">
                Reminders sent
              </dt>
              <dd className="text-lg font-extrabold text-ink">
                {whatsappStats.remindersSent}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-page px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-ink-muted">
                Avg response (est.)
              </dt>
              <dd className="text-lg font-extrabold text-ink">
                {whatsappStats.avgResponseMin
                  ? `${whatsappStats.avgResponseMin} min`
                  : '—'}
              </dd>
            </div>
          </dl>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Maintenance spend by property">
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : !maintenanceSpendByProperty.length ? (
            <EmptyState
              icon="💰"
              title="No logged job costs"
              subtitle="Log costs on resolved complaints to populate this report."
            />
          ) : (
            <ul className="space-y-2">
              {maintenanceSpendByProperty.map((p) => (
                <li
                  key={p.propertyId}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-ink">{p.name}</span>
                  <span className="font-extrabold text-teal-dk">
                    {formatNaira(p.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Top vendors by spend">
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : !topVendorsBySpend.length ? (
            <EmptyState
              icon="🔧"
              title="No vendor spend yet"
              subtitle="Assign vendors and log job costs to rank spend."
            />
          ) : (
            <ul className="space-y-2">
              {topVendorsBySpend.map((v) => (
                <li
                  key={v.vendorId}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-ink">{v.name}</span>
                  <span className="font-extrabold text-teal-dk">
                    {formatNaira(v.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Lease expiry tracker">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : !leaseRows.length ? (
          <EmptyState
            icon="📅"
            title="No lease dates on file"
            subtitle="Add lease expiry when creating tenants to unlock this view."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Tenant
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Property
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Expires
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Status
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaseRows.map((r) => (
                  <tr key={r.tenantId} className="hover:bg-teal-pale/50">
                    <td className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                      {r.name}
                    </td>
                    <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                      {r.unit} · {r.propertyName}
                    </td>
                    <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                      {formatDate(r.expiry)}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      <Badge status={r.leaseKey} />
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      <Link
                        to="/broadcast"
                        className="text-xs font-bold text-teal-d hover:text-teal-dk"
                      >
                        Send renewal notice
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-extrabold text-ink">
          AI recommendations
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {loading
            ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full" />)
            : recommendations.map((rec) => (
                <div
                  key={rec.key}
                  className={`rounded-xl border p-4 shadow-soft-xs ${URGENCY_STYLES[rec.urgency] ?? URGENCY_STYLES.low}`}
                >
                  <p className="text-xs font-extrabold uppercase tracking-wide text-ink-muted">
                    {rec.urgency}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-ink">
                    {rec.title}
                  </p>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-ink-secondary">
                    {rec.body}
                  </p>
                  <Link
                    to={rec.href}
                    className="mt-3 inline-flex text-xs font-bold text-teal-d hover:text-teal-dk"
                  >
                    {rec.actionLabel} →
                  </Link>
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}
