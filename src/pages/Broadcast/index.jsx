import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useApp } from '../../hooks/useApp'
import {
  BROADCAST_TEMPLATE_PRESETS,
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
} from '../../lib/constants'
import { fetchBroadcastLogs, insertBroadcastLog } from '../../lib/queries/broadcast'
import { fetchTenantListBundle } from '../../lib/queries/tenants'
import { formatDate, formatNaira, tenantMonthlyRentHint } from '../../lib/utils'

const STEPS = [
  { n: 1, label: 'Template' },
  { n: 2, label: 'Compose' },
  { n: 3, label: 'Audience' },
  { n: 4, label: 'Schedule' },
]

/** PRD §8.7 */
export default function BroadcastPage() {
  const { managerId, showToast } = useApp()
  const [step, setStep] = useState(1)
  const [templateKey, setTemplateKey] = useState(
    BROADCAST_TEMPLATE_PRESETS[0].key
  )
  const [body, setBody] = useState(BROADCAST_TEMPLATE_PRESETS[0].defaultBody)
  const [audience, setAudience] = useState('all')
  const [propertyId, setPropertyId] = useState('all')
  const [unitQuery, setUnitQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [scheduleLocal, setScheduleLocal] = useState('')
  const [tenantRows, setTenantRows] = useState([])
  const [propertyOptions, setPropertyOptions] = useState([])
  const [tenantsLoading, setTenantsLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadTenants = useCallback(async () => {
    if (!managerId) return
    setTenantsLoading(true)
    const bundle = await fetchTenantListBundle(managerId)
    setTenantRows(bundle.rows ?? [])
    setPropertyOptions(bundle.propertyOptions ?? [])
    setTenantsLoading(false)
  }, [managerId])

  const loadHistory = useCallback(async () => {
    if (!managerId) return
    setHistoryLoading(true)
    const { data } = await fetchBroadcastLogs(managerId)
    setHistory(data ?? [])
    setHistoryLoading(false)
  }, [managerId])

  useEffect(() => {
    queueMicrotask(() => {
      void loadTenants()
      void loadHistory()
    })
  }, [loadTenants, loadHistory])

  const applyTemplate = (key) => {
    setTemplateKey(key)
    const preset = BROADCAST_TEMPLATE_PRESETS.find((p) => p.key === key)
    if (preset) setBody(preset.defaultBody)
  }

  const matchedTenants = useMemo(() => {
    let list = tenantRows
    if (audience === 'overdue') {
      list = list.filter((r) => r.statusKey === 'overdue')
    } else if (audience === 'due-month') {
      list = list.filter(
        (r) => r.statusKey === 'pending' || r.statusKey === 'overdue'
      )
    } else if (audience === 'property') {
      if (propertyId !== 'all') {
        list = list.filter((r) => r.propertyId === propertyId)
      }
    } else if (audience === 'unit') {
      const q = unitQuery.trim().toLowerCase()
      if (q) {
        list = list.filter((r) => String(r.unit).toLowerCase().includes(q))
      }
    }
    return list
  }, [tenantRows, audience, propertyId, unitQuery])

  useEffect(() => {
    const ids = matchedTenants.map((r) => r.id)
    queueMicrotask(() => setSelectedIds(new Set(ids)))
  }, [matchedTenants])

  const toggleTenant = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllMatched = () => {
    if (selectedIds.size === matchedTenants.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(matchedTenants.map((r) => r.id)))
    }
  }

  const persistLog = async (status) => {
    if (!managerId) return
    const preview =
      body.trim().length > 120 ? `${body.trim().slice(0, 120)}…` : body.trim()
    const scheduledFor = scheduleLocal
      ? new Date(scheduleLocal).toISOString()
      : null
    const { error } = await insertBroadcastLog(managerId, {
      templateKey,
      bodyPreview: preview || '(empty)',
      recipientCount: selectedIds.size,
      scheduledFor: status === 'scheduled' ? scheduledFor : null,
      status,
    })
    if (error) {
      showToast(error.message ?? 'Could not save broadcast.', {
        variant: 'error',
      })
      return false
    }
    return true
  }

  const handleSendNow = async () => {
    if (!body.trim()) {
      showToast('Add message text before sending.', { variant: 'error' })
      return
    }
    if (!selectedIds.size) {
      showToast('Select at least one tenant.', { variant: 'error' })
      return
    }
    setSubmitting(true)
    const ok = await persistLog('sent')
    setSubmitting(false)
    if (!ok) return
    showToast(
      `Broadcast queued for ${selectedIds.size} tenant${selectedIds.size === 1 ? '' : 's'} — WhatsApp will send when connected.`,
      { variant: 'info' }
    )
    void loadHistory()
    setStep(1)
  }

  const handleSaveDraft = async () => {
    setSubmitting(true)
    const ok = await persistLog('draft')
    setSubmitting(false)
    if (!ok) return
    showToast('Draft saved.')
    void loadHistory()
  }

  const handleSchedule = async () => {
    if (!scheduleLocal) {
      showToast('Pick a date and time to schedule.', { variant: 'error' })
      return
    }
    setSubmitting(true)
    const ok = await persistLog('scheduled')
    setSubmitting(false)
    if (!ok) return
    showToast('Broadcast scheduled.')
    void loadHistory()
    setStep(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s.n}
            type="button"
            onClick={() => setStep(s.n)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              step === s.n
                ? 'bg-teal-d text-white'
                : 'bg-page text-ink-muted ring-1 ring-border hover:text-ink-secondary'
            }`}
          >
            {s.n}. {s.label}
          </button>
        ))}
      </div>

      <Card title="New broadcast">
        {step === 1 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {BROADCAST_TEMPLATE_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => applyTemplate(p.key)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors ${
                  templateKey === p.key
                    ? 'border-teal-d bg-teal-pale text-teal-dk'
                    : 'border-border bg-card hover:bg-page'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <label htmlFor="bc-body" className={FORM_LABEL_CLASS}>
              Message
            </label>
            <textarea
              id="bc-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className={`${FORM_INPUT_CLASS} min-h-[180px] resize-y`}
              placeholder="Edit the template or write your own message…"
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="bc-audience" className={FORM_LABEL_CLASS}>
                Audience group
              </label>
              <select
                id="bc-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className={FORM_INPUT_CLASS}
              >
                <option value="all">All tenants</option>
                <option value="overdue">Overdue tenants</option>
                <option value="due-month">Due this month (pending + overdue)</option>
                <option value="property">By property</option>
                <option value="unit">By unit (search)</option>
              </select>
            </div>
            {audience === 'property' ? (
              <div>
                <label htmlFor="bc-prop" className={FORM_LABEL_CLASS}>
                  Property
                </label>
                <select
                  id="bc-prop"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className={FORM_INPUT_CLASS}
                >
                  <option value="all">All properties</option>
                  {propertyOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {audience === 'unit' ? (
              <div>
                <label htmlFor="bc-unit" className={FORM_LABEL_CLASS}>
                  Unit contains
                </label>
                <input
                  id="bc-unit"
                  value={unitQuery}
                  onChange={(e) => setUnitQuery(e.target.value)}
                  className={FORM_INPUT_CLASS}
                  placeholder="e.g. B2"
                />
              </div>
            ) : null}

            {tenantsLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : matchedTenants.length === 0 ? (
              <EmptyState
                icon="👥"
                title="No tenants match"
                subtitle="Adjust filters or add tenants to reach someone with this broadcast."
              />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-ink">
                    Sending to {selectedIds.size} of {matchedTenants.length}{' '}
                    tenants
                  </p>
                  <button
                    type="button"
                    onClick={toggleAllMatched}
                    className="text-xs font-bold text-teal-d hover:text-teal-dk"
                  >
                    {selectedIds.size === matchedTenants.length
                      ? 'Clear all'
                      : 'Select all matched'}
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
                  <ul className="divide-y divide-border">
                    {matchedTenants.map((r) => (
                      <li
                        key={r.id}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors hover:bg-teal-pale/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleTenant(r.id)}
                          className="h-4 w-4 rounded border-border text-teal-d"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-ink">
                            {r.name}
                          </p>
                          <p className="truncate text-xs text-ink-muted">
                            {r.unit} · {r.propertyName} ·{' '}
                            {formatNaira(tenantMonthlyRentHint(r.raw))}/mo
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-page px-4 py-3 text-sm text-ink-secondary">
              <p className="font-bold text-ink">Summary</p>
              <p className="mt-1">
                Template:{' '}
                <span className="font-semibold text-ink">
                  {BROADCAST_TEMPLATE_PRESETS.find((p) => p.key === templateKey)
                    ?.label ?? templateKey}
                </span>
              </p>
              <p>
                Recipients:{' '}
                <span className="font-semibold text-ink">
                  {selectedIds.size}
                </span>
              </p>
              <p className="mt-2 line-clamp-4 text-xs leading-relaxed">
                {body || '—'}
              </p>
            </div>
            <div>
              <label htmlFor="bc-when" className={FORM_LABEL_CLASS}>
                Schedule for (optional)
              </label>
              <input
                id="bc-when"
                type="datetime-local"
                value={scheduleLocal}
                onChange={(e) => setScheduleLocal(e.target.value)}
                className={FORM_INPUT_CLASS}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={submitting}
                onClick={() => void handleSendNow()}
              >
                Send now
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => void handleSchedule()}
              >
                Save schedule
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={() => void handleSaveDraft()}
              >
                Save draft
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </Button>
          ) : null}
          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
            >
              Continue
            </Button>
          ) : null}
        </div>
      </Card>

      <Card title="Broadcast history">
        {historyLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !history.length ? (
          <EmptyState
            icon="📜"
            title="No broadcasts logged"
            subtitle="Sent, scheduled, and draft messages will be listed here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Date
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Template
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Count
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr
                    key={h.id}
                    className="hover:bg-teal-pale/50"
                  >
                    <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                      {formatDate(h.created_at)}
                    </td>
                    <td className="max-w-[200px] border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                      <span className="line-clamp-2">
                        {h.body_preview ?? h.template_key ?? '—'}
                      </span>
                    </td>
                    <td className="border-b border-border px-4 py-3 text-sm text-ink">
                      {h.recipient_count ?? 0}
                    </td>
                    <td className="border-b border-border px-4 py-3 text-sm capitalize text-ink-secondary">
                      {h.status ?? '—'}
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
