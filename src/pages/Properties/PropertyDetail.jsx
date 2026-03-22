import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BackButton from '../../components/ui/BackButton'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useApp } from '../../hooks/useApp'
import { usePropertyDetail } from '../../hooks/usePropertyDetail'
import { PROPERTY_CARD_ACCENTS } from '../../lib/constants'
import { formatDate, formatNaira, pickField, tenantMonthlyRentHint } from '../../lib/utils'
import UnitGrid from './UnitGrid'

const TABS = [
  { id: 'units', label: 'Units' },
  { id: 'tenants', label: 'Tenants' },
  { id: 'complaints', label: 'Complaints' },
  { id: 'leases', label: 'Leases' },
]

/**
 * PRD §8.2 — property detail subview.
 */
export default function PropertyDetailPage() {
  const { propertyId } = useParams()
  const navigate = useNavigate()
  const { managerId } = useApp()
  const {
    loading,
    property,
    summary,
    tenants,
    complaints,
    units,
    leaseRows,
    error,
  } = usePropertyDetail(managerId, propertyId)

  const [tab, setTab] = useState('units')

  useEffect(() => {
    queueMicrotask(() => setTab('units'))
  }, [propertyId])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Card>
          <Skeleton className="h-48 w-full" />
        </Card>
      </div>
    )
  }

  if (!property || !summary) {
    return (
      <div className="space-y-4">
        <BackButton to="/properties" />
        <Card>
          <p className="text-sm font-semibold text-red-600">
            {error || 'Property not found.'}
          </p>
          <Link
            to="/properties"
            className="mt-3 inline-block text-sm font-semibold text-teal-d hover:text-teal-dk"
          >
            Back to properties
          </Link>
        </Card>
      </div>
    )
  }

  const accent =
    PROPERTY_CARD_ACCENTS[summary.accentIndex % PROPERTY_CARD_ACCENTS.length]

  const openComplaints = complaints.filter((c) => {
    const st = String(c.status ?? 'open').toLowerCase()
    return !['resolved', 'closed', 'cancelled'].includes(st)
  })

  return (
    <div className="space-y-6">
      {error ? (
        <div
          className="rounded-xl border border-gold-pale bg-gold-pale/50 px-4 py-3 text-sm font-semibold text-yellow-900"
          role="status"
        >
          Some sections may be incomplete: {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <BackButton to="/properties" label="Properties" />
      </div>

      <div
        className={`overflow-hidden rounded-xl border border-border bg-card shadow-soft ${accent} border-l-4`}
      >
        <div className="border-b border-border px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-ink">{summary.name}</h1>
              <p className="mt-1 text-sm text-ink-secondary">{summary.location}</p>
              <p className="mt-2 text-xs text-ink-muted">
                Manager ·{' '}
                <span className="font-semibold text-ink-secondary">
                  {summary.managerLabel}
                </span>
              </p>
            </div>
            <span className="rounded-full bg-teal-pale px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-dk">
              {summary.typeLabel}
            </span>
          </div>
        </div>
        <div className="grid gap-3 border-b border-border bg-page/80 px-5 py-4 sm:grid-cols-4">
          <Stat label="Total units" value={String(summary.totalUnits || '—')} />
          <Stat label="Occupied" value={String(summary.occupied)} />
          <Stat label="Vacant" value={String(summary.vacant)} />
          <Stat label="Open complaints" value={String(summary.openComplaints)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg border-l-[3px] px-4 py-2 text-xs font-bold transition-colors ${
              tab === t.id
                ? 'border-teal-d bg-teal-pale/50 text-ink'
                : 'border-transparent text-ink-muted hover:bg-page'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card bodyClassName="p-0">
        <div className="p-5">
          {tab === 'units' ? <UnitGrid units={units} /> : null}

          {tab === 'tenants' ? (
            tenants.length === 0 ? (
              <EmptyState
                icon="👥"
                title="No tenants yet"
                subtitle="Add tenants from the Tenants page when Phase 7 ships."
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
                        Unit
                      </th>
                      <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                        Rent / mo
                      </th>
                      <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => (
                      <tr
                        key={t.id}
                        className="cursor-pointer transition-colors hover:bg-teal-pale/50"
                        onClick={() => navigate(`/tenants/${t.id}`)}
                      >
                        <td className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                          {pickField(t, ['full_name', 'name']) ?? '—'}
                        </td>
                        <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                          {pickField(t, ['unit', 'unit_number']) ?? '—'}
                        </td>
                        <td className="border-b border-border px-4 py-3 text-sm text-ink">
                          {formatNaira(tenantMonthlyRentHint(t))}
                        </td>
                        <td
                          className="border-b border-border px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            to={`/tenants/${t.id}`}
                            className="text-xs font-semibold text-teal-d hover:text-teal-dk"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : null}

          {tab === 'complaints' ? (
            openComplaints.length === 0 ? (
              <EmptyState
                icon="✓"
                title="No open complaints"
                subtitle="New issues from tenants appear here once logged by Caretaker AI."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                        Type
                      </th>
                      <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                        Status
                      </th>
                      <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                        Logged
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {openComplaints.map((c) => (
                      <tr
                        key={c.id}
                        className="cursor-pointer transition-colors hover:bg-teal-pale/50"
                      >
                        <td className="border-b border-border px-4 py-3 text-sm text-ink">
                          <Link
                            to={`/complaints/${c.id}`}
                            className="font-semibold text-teal-d hover:text-teal-dk"
                          >
                            {pickField(c, ['type', 'category', 'complaint_type']) ??
                              '—'}
                          </Link>
                        </td>
                        <td className="border-b border-border px-4 py-3">
                          <Badge status={c.status} />
                        </td>
                        <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                          {formatDate(c.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : null}

          {tab === 'leases' ? (
            leaseRows.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No lease rows"
                subtitle="Lease dates on tenant records will show here."
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
                        Unit
                      </th>
                      <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                        Start
                      </th>
                      <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                        Expiry
                      </th>
                      <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaseRows.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-teal-pale/50"
                      >
                        <td className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                          {row.tenantName}
                        </td>
                        <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                          {row.unit}
                        </td>
                        <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                          {formatDate(row.leaseStart)}
                        </td>
                        <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                          {formatDate(row.leaseEnd)}
                        </td>
                        <td className="border-b border-border px-4 py-3">
                          <Badge status={row.leaseStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : null}
        </div>
      </Card>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-extrabold text-ink">{value}</p>
    </div>
  )
}
