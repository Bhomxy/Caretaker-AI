import { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import {
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
  VENDOR_TRADE_FORM_OPTIONS,
} from '../lib/constants'
import { insertVendor } from '../lib/queries/vendors'

/**
 * PRD §8.8 / §9 — Add vendor.
 */
export default function AddVendorModal({
  open,
  onClose,
  managerId,
  propertyOptions,
  showToast,
  onCreated,
}) {
  const [name, setName] = useState('')
  const [trade, setTrade] = useState('plumber')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedPropertyIds, setSelectedPropertyIds] = useState(() => new Set())
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function toggleProperty(id) {
    setSelectedPropertyIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function validate() {
    const next = {}
    if (!name.trim()) next.name = 'Name or company is required.'
    const p = phone.trim()
    if (!p) next.phone = 'Phone is required.'
    else if (!/\d/.test(p)) next.phone = 'Enter a valid phone number.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!managerId || !validate()) return
    setSubmitting(true)
    const propertyIds = [...selectedPropertyIds]
    const { id, error } = await insertVendor(managerId, {
      name: name.trim(),
      trade,
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      propertyIds,
    })
    setSubmitting(false)
    if (error && !id) {
      showToast?.(error, { variant: 'error' })
      return
    }
    if (error && id) {
      showToast?.(error, { variant: 'info' })
    } else {
      showToast?.('Vendor added.')
    }
    onCreated?.(id)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add vendor"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-vendor-form"
            disabled={submitting || !managerId}
          >
            {submitting ? 'Saving…' : 'Save vendor'}
          </Button>
        </>
      }
    >
      <form id="add-vendor-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="v-name" className={FORM_LABEL_CLASS}>
            Name / company *
          </label>
          <input
            id="v-name"
            className={FORM_INPUT_CLASS}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chidi Electricals"
            autoComplete="organization"
          />
          {errors.name ? (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="v-trade" className={FORM_LABEL_CLASS}>
            Trade *
          </label>
          <select
            id="v-trade"
            className={FORM_INPUT_CLASS}
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
          >
            {VENDOR_TRADE_FORM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="v-phone" className={FORM_LABEL_CLASS}>
            Phone *
          </label>
          <input
            id="v-phone"
            className={FORM_INPUT_CLASS}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 803 123 4567"
            autoComplete="tel"
          />
          {errors.phone ? (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="v-email" className={FORM_LABEL_CLASS}>
            Email
          </label>
          <input
            id="v-email"
            type="email"
            className={FORM_INPUT_CLASS}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Optional"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="v-notes" className={FORM_LABEL_CLASS}>
            Notes
          </label>
          <textarea
            id="v-notes"
            rows={3}
            className={`${FORM_INPUT_CLASS} resize-y`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Service areas, rates, or other context"
          />
        </div>

        <div>
          <p className={FORM_LABEL_CLASS}>Assigned properties</p>
          {propertyOptions.length === 0 ? (
            <p className="text-xs text-ink-muted">
              Add properties first to assign this vendor to buildings.
            </p>
          ) : (
            <ul className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border bg-page px-3 py-2">
              {propertyOptions.map((p) => (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-teal-d"
                      checked={selectedPropertyIds.has(p.id)}
                      onChange={() => toggleProperty(p.id)}
                    />
                    <span className="truncate">{p.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </Modal>
  )
}
