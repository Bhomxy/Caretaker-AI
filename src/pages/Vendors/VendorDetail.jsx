import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import BackButton from '../../components/ui/BackButton'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useApp } from '../../hooks/useApp'
import { useVendorDetail } from '../../hooks/useVendorDetail'
import {
  complaintJobCost,
  updateComplaintJobCost,
} from '../../lib/queries/vendors'
import { formatDate, formatNaira, pickField } from '../../lib/utils'

function shortId(id) {
  if (id == null) return '—'
  const s = String(id)
  return s.length > 10 ? `${s.slice(0, 8)}…` : s
}

function CompletedJobRow({ complaint, managerId, showToast, onSaved }) {
  const initialCost = complaintJobCost(complaint)
  const [cost, setCost] = useState(
    initialCost != null ? String(initialCost) : ''
  )
  const [notes, setNotes] = useState(
    pickField(complaint, ['job_notes', 'resolution_notes', 'notes']) ?? ''
  )
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const { error } = await updateComplaintJobCost(managerId, complaint.id, {
      cost,
      notes,
    })
    setSaving(false)
    if (error) {
      showToast?.(error, { variant: 'error' })
      return
    }
    showToast?.('Job cost saved.')
    onSaved?.()
  }

  return (
    <tr className="transition-colors hover:bg-teal-pale/40">
      <td className="border-b border-border px-4 py-3 font-mono text-xs text-teal-d">
        <Link
          to={`/complaints/${complaint.id}`}
          className="font-semibold hover:text-teal-dk"
        >
          {shortId(complaint.id)}
        </Link>
      </td>
      <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
        {pickField(complaint, ['type', 'category', 'complaint_type']) ?? '—'}
      </td>
      <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
        {formatDate(
          pickField(complaint, [
            'resolved_at',
            'closed_at',
            'updated_at',
            'created_at',
          ])
        )}
      </td>
      <td className="border-b border-border px-4 py-3">
        <input
          type="number"
          min={0}
          className="w-full min-w-[6rem] rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-teal"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="₦"
          aria-label="Job cost"
        />
      </td>
      <td className="border-b border-border px-4 py-3">
        <input
          className="w-full min-w-[8rem] rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-teal"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          aria-label="Job notes"
        />
      </td>
      <td className="border-b border-border px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={saving}
          onClick={save}
        >
          {saving ? '…' : 'Save'}
        </Button>
      </td>
    </tr>
  )
}

/**
 * PRD §8.8 — vendor detail subview.
 */
export default function VendorDetailPage() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const { managerId, showToast } = useApp()
  const {
    loading,
    vendor,
    summary,
    assignedProperties,
    activeComplaints,
    completedComplaints,
    totalSpend,
    error,
    refetch,
  } = useVendorDetail(managerId, vendorId)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Card>
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    )
  }

  if (!vendor || !summary) {
    return (
      <div className="space-y-4">
        <BackButton to="/vendors" />
        <Card>
          <p className="text-sm font-semibold text-red-600">
            {error || 'Vendor not found.'}
          </p>
          <Link
            to="/vendors"
            className="mt-3 inline-block text-sm font-semibold text-teal-d hover:text-teal-dk"
          >
            Back to vendors
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div
          className="rounded-xl border border-teal-pale bg-teal-pale/40 px-4 py-3 text-sm font-semibold text-teal-dk"
          role="status"
        >
          Some data may be incomplete: {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <BackButton to="/vendors" label="Vendors" />
      </div>

      <Card bodyClassName="p-0">
        <div className="border-b border-border px-5 py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-ink">{summary.name}</h1>
              <span className="mt-2 inline-block rounded-full bg-teal-pale px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-dk">
                {summary.tradeLabel}
              </span>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Badge status={summary.status} />
                {summary.rating != null && Number.isFinite(summary.rating) ? (
                  <span className="inline-flex items-center gap-0.5 text-sm font-extrabold text-ink">
                    <Star
                      className="h-4 w-4 fill-gold text-gold"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    {summary.rating.toFixed(1)}
                  </span>
                ) : null}
                <span className="text-xs font-semibold text-ink-muted">
                  {summary.jobsDone} jobs completed
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Total maintenance spend
              </p>
              <p className="text-lg font-extrabold text-ink">
                {formatNaira(totalSpend)}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Phone
              </p>
              <p className="text-sm font-semibold text-ink">{summary.phone}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Email
              </p>
              <p className="text-sm font-semibold text-ink">{summary.email}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Notes
              </p>
              <p className="text-sm text-ink-secondary">{summary.notes}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Assigned properties">
        {assignedProperties.length === 0 ? (
          <EmptyState
            icon="🏢"
            title="No properties linked"
            subtitle="Edit the vendor in Supabase or re-save with property checkboxes when assigned_properties is available."
          />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {assignedProperties.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/properties/${p.id}`}
                  className="inline-flex rounded-full border border-border bg-page px-3 py-1 text-xs font-semibold text-teal-d hover:bg-teal-pale/50"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Active jobs">
        {activeComplaints.length === 0 ? (
          <EmptyState
            icon="✓"
            title="No active assignments"
            subtitle="Complaints assigned to this vendor will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    ID
                  </th>
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
                {activeComplaints.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer transition-colors hover:bg-teal-pale/50"
                    onClick={() => navigate(`/complaints/${c.id}`)}
                  >
                    <td className="border-b border-border px-4 py-3 font-mono text-xs text-teal-d">
                      {shortId(c.id)}
                    </td>
                    <td className="border-b border-border px-4 py-3 text-sm text-ink">
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

      <Card title="Completed jobs">
        {completedComplaints.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No completed jobs yet"
            subtitle="Resolved complaints assigned to this vendor show here with optional job cost."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    ID
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Type
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Closed
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Cost (₦)
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Notes
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {completedComplaints.map((c) => (
                  <CompletedJobRow
                    key={c.id}
                    complaint={c}
                    managerId={managerId}
                    showToast={showToast}
                    onSaved={refetch}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="AI last contact">
        <p className="text-sm leading-relaxed text-ink-secondary">
          The most recent message Caretaker AI sent to this vendor will appear
          here once WhatsApp vendor messaging is connected on the backend.
        </p>
      </Card>
    </div>
  )
}
