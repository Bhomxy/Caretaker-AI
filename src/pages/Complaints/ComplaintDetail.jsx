import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BackButton from '../../components/ui/BackButton'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useApp } from '../../hooks/useApp'
import { useComplaintDetail } from '../../hooks/useComplaintDetail'
import {
  parseComplaintAttachmentUrls,
  updateComplaint,
} from '../../lib/queries/complaints'
import {
  formatAgeShort,
  formatDate,
  normalizeComplaintPriority,
  normalizeComplaintStatusKey,
  pickField,
} from '../../lib/utils'
import ActivityTimeline from './ActivityTimeline'

function buildTimelineEntries(complaint) {
  if (!complaint) return []
  const entries = [
    {
      key: 'created',
      at: complaint.created_at,
      title: 'Complaint logged',
      detail:
        'Captured from tenant WhatsApp. Managers do not create complaints manually.',
    },
  ]

  const rawLog = pickField(complaint, ['activity_log', 'timeline', 'events'])
  if (rawLog) {
    try {
      const parsed = typeof rawLog === 'string' ? JSON.parse(rawLog) : rawLog
      if (Array.isArray(parsed)) {
        parsed.forEach((item, idx) => {
          if (!item || typeof item !== 'object') return
          entries.push({
            key: `log-${idx}`,
            at: item.at || item.created_at || complaint.updated_at,
            title: String(item.title || item.type || 'Update'),
            detail: item.detail || item.message || item.body || '',
          })
        })
      }
    } catch {
      /* ignore malformed log */
    }
  }

  if (
    complaint.updated_at &&
    complaint.updated_at !== complaint.created_at
  ) {
    entries.push({
      key: 'updated',
      at: complaint.updated_at,
      title: 'Record updated',
      detail: `Latest status: ${complaint.status ?? '—'}.`,
    })
  }

  return entries.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  )
}

/**
 * PRD §8.4 — complaint triage & detail.
 */
export default function ComplaintDetailPage() {
  const { complaintId } = useParams()
  const { managerId, showToast } = useApp()
  const {
    loading,
    complaint,
    tenant,
    property,
    assignedVendor,
    vendorOptions,
    error,
    refetch,
  } = useComplaintDetail(managerId, complaintId)

  const [vendorSelect, setVendorSelect] = useState('')
  const [savingVendor, setSavingVendor] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    if (!complaint) return
    queueMicrotask(() => {
      setVendorSelect(complaint.vendor_id ? String(complaint.vendor_id) : '')
    })
  }, [complaint])

  const timelineEntries = useMemo(
    () => buildTimelineEntries(complaint),
    [complaint]
  )

  const attachmentUrls = useMemo(
    () => parseComplaintAttachmentUrls(complaint),
    [complaint]
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="space-y-4">
        <BackButton to="/complaints" />
        <Card>
          <p className="text-sm font-semibold text-red-600">
            {error || 'Complaint not found.'}
          </p>
          <Link
            to="/complaints"
            className="mt-3 inline-block text-sm font-semibold text-teal-d hover:text-teal-dk"
          >
            Back to complaints
          </Link>
        </Card>
      </div>
    )
  }

  const type =
    pickField(complaint, ['type', 'category', 'complaint_type']) ?? '—'
  const desc =
    pickField(complaint, ['description', 'details', 'body', 'message']) ?? '—'
  const statusKey = normalizeComplaintStatusKey(complaint.status)
  const priorityKey = normalizeComplaintPriority(
    pickField(complaint, ['priority', 'severity', 'urgency'])
  )

  const tenantName = tenant
    ? pickField(tenant, ['full_name', 'name']) ?? '—'
    : '—'
  const tenantUnit = tenant
    ? pickField(tenant, ['unit', 'unit_number']) ?? '—'
    : pickField(complaint, ['unit', 'unit_number']) ?? '—'
  const propertyName = property
    ? pickField(property, ['name', 'title', 'property_name']) ?? '—'
    : '—'

  async function applyStatus(nextStatus) {
    if (!managerId) return
    setSavingStatus(true)
    const patch = { status: nextStatus }
    if (nextStatus === 'resolved') {
      patch.resolved_at = new Date().toISOString()
    }
    if (nextStatus === 'open') {
      patch.resolved_at = null
    }
    const { error: err } = await updateComplaint(
      managerId,
      complaint.id,
      patch
    )
    setSavingStatus(false)
    if (err) {
      showToast?.(err, { variant: 'error' })
      return
    }
    showToast?.('Status updated.')
    refetch()
  }

  async function applyVendor() {
    if (!managerId) return
    setSavingVendor(true)
    const vid = vendorSelect || null
    const { error: err } = await updateComplaint(managerId, complaint.id, {
      vendor_id: vid,
    })
    setSavingVendor(false)
    if (err) {
      showToast?.(err, { variant: 'error' })
      return
    }
    showToast?.('Vendor assignment saved.')
    setVendorSelect('')
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

      <div className="flex flex-wrap items-center gap-3">
        <BackButton to="/complaints" label="Complaints" />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:items-start lg:gap-6">
        <div className="space-y-6">
          <Card bodyClassName="p-0">
            <div className="border-b border-border px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-teal-d">
                    {String(complaint.id)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge status={priorityKey} />
                    <Badge status={complaint.status ?? statusKey} />
                  </div>
                  <h1 className="mt-2 text-xl font-extrabold text-ink">{type}</h1>
                  <p className="mt-2 text-sm text-ink-secondary">
                    {propertyName}
                    {tenantUnit !== '—' ? ` · Unit ${tenantUnit}` : ''}
                    {tenantName !== '—' ? ` · ${tenantName}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Logged {formatDate(complaint.created_at)} ·{' '}
                    {formatAgeShort(complaint.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusKey === 'open' ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={savingStatus}
                        onClick={() => applyStatus('in-progress')}
                      >
                        Mark in progress
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={savingStatus}
                        onClick={() => applyStatus('resolved')}
                      >
                        Mark resolved
                      </Button>
                    </>
                  ) : null}
                  {statusKey === 'in-progress' ? (
                    <>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={savingStatus}
                        onClick={() => applyStatus('resolved')}
                      >
                        Mark resolved
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={savingStatus}
                        onClick={() => applyStatus('open')}
                      >
                        Reopen
                      </Button>
                    </>
                  ) : null}
                  {statusKey === 'resolved' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={savingStatus}
                      onClick={() => applyStatus('open')}
                    >
                      Reopen
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="px-5 py-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-secondary">
                Parsed context
              </p>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Property
                  </dt>
                  <dd className="text-sm font-semibold text-ink">{propertyName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Unit
                  </dt>
                  <dd className="text-sm font-semibold text-ink">{tenantUnit}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Tenant
                  </dt>
                  <dd className="text-sm font-semibold text-ink">{tenantName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Channel
                  </dt>
                  <dd className="text-sm font-semibold text-ink">WhatsApp</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-border px-5 py-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-secondary">
                Issue description
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">{desc}</p>
            </div>
          </Card>

          <Card title="Photo attachments">
            {attachmentUrls.length === 0 ? (
              <EmptyState
                icon="🖼"
                title="No images on file"
                subtitle="Photos tenants send on WhatsApp will display here when the backend stores URLs on this complaint."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {attachmentUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg border border-border bg-page"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-32 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </a>
                ))}
              </div>
            )}
          </Card>

          <Card title="Activity timeline">
            <ActivityTimeline entries={timelineEntries} />
          </Card>
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0 lg:sticky lg:top-6">
          <Card title="Tenant">
            {tenant ? (
              <div className="flex items-start gap-3">
                <Avatar name={tenantName} size="md" tone="light" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-ink">{tenantName}</p>
                  <p className="text-xs text-ink-muted">Unit {tenantUnit}</p>
                  <Link
                    to={`/tenants/${tenant.id}`}
                    className="mt-2 inline-block text-xs font-bold text-teal-d hover:text-teal-dk"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-secondary">
                No tenant linked on this record.
              </p>
            )}
          </Card>

          <Card title="Vendor assignment">
            <p className="mb-2 text-xs text-ink-muted">
              Currently:{' '}
              <span className="font-semibold text-ink">
                {assignedVendor
                  ? pickField(assignedVendor, ['name', 'company_name']) ?? '—'
                  : 'Unassigned'}
              </span>
            </p>
            <label
              htmlFor="detail-vendor"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-secondary"
            >
              Assign or reassign
            </label>
            <select
              id="detail-vendor"
              className="mb-3 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-teal"
              value={vendorSelect}
              onChange={(e) => setVendorSelect(e.target.value)}
            >
              <option value="">Unassigned</option>
              {vendorOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full"
              disabled={savingVendor || !vendorOptions.length}
              onClick={applyVendor}
            >
              {savingVendor ? 'Saving…' : 'Save assignment'}
            </Button>
          </Card>

          <Card title="Update status">
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={savingStatus}
                onClick={() => applyStatus('open')}
              >
                Open
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={savingStatus}
                onClick={() => applyStatus('in-progress')}
              >
                In progress
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={savingStatus}
                onClick={() => applyStatus('resolved')}
              >
                Resolved
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
