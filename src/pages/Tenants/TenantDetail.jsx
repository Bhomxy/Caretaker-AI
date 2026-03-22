import { Link, useNavigate, useParams } from 'react-router-dom'
import BackButton from '../../components/ui/BackButton'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useApp } from '../../hooks/useApp'
import { useTenantDetail } from '../../hooks/useTenantDetail'
import {
  formatDate,
  formatNaira,
  normalizeTenantPaymentStatus,
  pickField,
} from '../../lib/utils'

/**
 * PRD §8.3 — tenant profile.
 */
export default function TenantDetailPage() {
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const { managerId, showToast } = useApp()
  const {
    loading,
    tenant,
    propertyName,
    complaints,
    invoices,
    error,
  } = useTenantDetail(managerId, tenantId)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Card>
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="space-y-4">
        <BackButton to="/tenants" />
        <Card>
          <p className="text-sm font-semibold text-red-600">
            {error || 'Tenant not found.'}
          </p>
          <Link
            to="/tenants"
            className="mt-3 inline-block text-sm font-semibold text-teal-d hover:text-teal-dk"
          >
            Back to tenants
          </Link>
        </Card>
      </div>
    )
  }

  const name = pickField(tenant, ['full_name', 'name']) ?? '—'
  const unit = pickField(tenant, ['unit', 'unit_number']) ?? '—'
  const statusKey = normalizeTenantPaymentStatus(
    pickField(tenant, ['payment_status', 'status', 'rent_status'])
  )
  const phone = pickField(tenant, ['phone', 'phone_number', 'mobile']) ?? '—'
  const charge = pickField(tenant, [
    'annual_service_charge',
    'annual_rent',
    'service_charge_annual',
  ])
  const deposit = pickField(tenant, ['caution_deposit', 'deposit'])
  const leaseStart = pickField(tenant, [
    'lease_start_date',
    'lease_start',
    'lease_begin',
  ])
  const leaseEnd = pickField(tenant, [
    'lease_expiry_date',
    'lease_expiry',
    'lease_end_date',
    'lease_end',
  ])

  return (
    <div className="space-y-6">
      {error ? (
        <div
          className="rounded-xl border border-teal-pale bg-teal-pale/40 px-4 py-3 text-sm font-semibold text-teal-dk"
          role="status"
        >
          Some sections may be incomplete: {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <BackButton to="/tenants" label="Tenants" />
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-start gap-5 border-b border-border px-5 py-6">
          <Avatar name={name} size="lg" tone="light" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold text-ink">{name}</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              Unit {unit}
              {propertyName ? ` · ${propertyName}` : ''}
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Lease {formatDate(leaseStart)} — {formatDate(leaseEnd)}
            </p>
            <div className="mt-3">
              <Badge status={statusKey} />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              showToast?.('Open Inbox to message this tenant on WhatsApp.')
              navigate('/inbox')
            }}
          >
            Open WhatsApp thread
          </Button>
        </div>

        <div className="grid gap-4 border-b border-border px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Unit" value={unit} />
          <Info label="Property" value={propertyName ?? '—'} />
          <Info label="Annual service charge" value={formatNaira(charge)} />
          <Info label="Caution deposit" value={formatNaira(deposit)} />
          <Info label="Lease expiry" value={formatDate(leaseEnd)} />
          <Info label="Phone" value={phone} />
          <Info label="Status" value={<Badge status={statusKey} />} />
          <Info label="Complaints" value={String(complaints.length)} />
        </div>
      </Card>

      <Card title="AI summary">
        <p className="text-sm leading-relaxed text-ink-secondary">
          Risk level, payment behaviour, and last AI interaction will appear
          here when your Caretaker AI backend attaches a summary for this tenant.
        </p>
      </Card>

      <Card title="Complaint history">
        {complaints.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No complaints"
            subtitle="Issues raised for this tenant will list here."
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
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer transition-colors hover:bg-teal-pale/50"
                    onClick={() => navigate(`/complaints/${c.id}`)}
                  >
                    <td className="border-b border-border px-4 py-3 text-sm font-semibold text-teal-d">
                      {pickField(c, ['type', 'category', 'complaint_type']) ??
                        '—'}
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
        )}
      </Card>

      <Card title="Payment history">
        {invoices.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="No invoices on file"
            subtitle="Invoices and payments from the AI billing flow will show here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Reference
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Amount
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Status
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Due
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="transition-colors hover:bg-teal-pale/50"
                  >
                    <td className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                      {pickField(inv, ['reference', 'invoice_number', 'id']) ??
                        '—'}
                    </td>
                    <td className="border-b border-border px-4 py-3 text-sm text-ink">
                      {formatNaira(
                        pickField(inv, ['amount', 'total', 'value'])
                      )}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      <Badge
                        status={pickField(inv, ['status', 'payment_status'])}
                      />
                    </td>
                    <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                      {formatDate(
                        pickField(inv, ['due_date', 'due_at', 'created_at'])
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  )
}
