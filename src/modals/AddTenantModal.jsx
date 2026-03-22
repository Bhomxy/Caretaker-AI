import { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from '../lib/constants'
import { insertTenant } from '../lib/queries/tenants'

const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
]

/**
 * PRD §8.3 — Add tenant.
 */
export default function AddTenantModal({
  open,
  onClose,
  managerId,
  propertyOptions,
  showToast,
  onCreated,
}) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [unit, setUnit] = useState('')
  const [annualServiceCharge, setAnnualServiceCharge] = useState('')
  const [cautionDeposit, setCautionDeposit] = useState('')
  const [leaseStart, setLeaseStart] = useState('')
  const [leaseExpiry, setLeaseExpiry] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next = {}
    if (!fullName.trim()) next.fullName = 'Full name is required.'
    const p = phone.trim()
    if (!p) next.phone = 'Phone is required.'
    else if (!/\d/.test(p)) next.phone = 'Use a valid phone (e.g. +234 803 123 4567).'
    if (!propertyId) next.propertyId = 'Choose a property.'
    if (!unit.trim()) next.unit = 'Unit is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!managerId || !validate()) return
    if (!propertyOptions.length) {
      showToast?.('Add a property before adding tenants.', { variant: 'error' })
      return
    }
    setSubmitting(true)
    const { id, error } = await insertTenant(managerId, {
      fullName: fullName.trim(),
      phone: phone.trim(),
      propertyId,
      unit: unit.trim(),
      annualServiceCharge,
      cautionDeposit,
      leaseStart: leaseStart || '',
      leaseExpiry: leaseExpiry || '',
      paymentStatus,
    })
    setSubmitting(false)
    if (error) {
      showToast?.(error, { variant: 'error' })
      return
    }
    showToast?.('Tenant added.')
    onCreated?.(id)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add tenant"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-tenant-form"
            disabled={submitting || !managerId}
          >
            {submitting ? 'Saving…' : 'Save tenant'}
          </Button>
        </>
      }
    >
      <form id="add-tenant-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tn-name" className={FORM_LABEL_CLASS}>
            Full name *
          </label>
          <input
            id="tn-name"
            className={FORM_INPUT_CLASS}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Emeka Okafor"
            autoComplete="name"
          />
          {errors.fullName ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.fullName}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="tn-phone" className={FORM_LABEL_CLASS}>
            Phone * (+234 format)
          </label>
          <input
            id="tn-phone"
            className={FORM_INPUT_CLASS}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 803 123 4567"
            autoComplete="tel"
          />
          {errors.phone ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="tn-property" className={FORM_LABEL_CLASS}>
            Property *
          </label>
          <select
            id="tn-property"
            className={FORM_INPUT_CLASS}
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          >
            <option value="">Select property</option>
            {propertyOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          {errors.propertyId ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.propertyId}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="tn-unit" className={FORM_LABEL_CLASS}>
            Unit *
          </label>
          <input
            id="tn-unit"
            className={FORM_INPUT_CLASS}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g. 3B"
          />
          {errors.unit ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.unit}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="tn-charge" className={FORM_LABEL_CLASS}>
            Annual service charge (₦)
          </label>
          <input
            id="tn-charge"
            type="number"
            min={0}
            className={FORM_INPUT_CLASS}
            value={annualServiceCharge}
            onChange={(e) => setAnnualServiceCharge(e.target.value)}
            placeholder="e.g. 2400000"
          />
        </div>

        <div>
          <label htmlFor="tn-deposit" className={FORM_LABEL_CLASS}>
            Caution deposit (₦)
          </label>
          <input
            id="tn-deposit"
            type="number"
            min={0}
            className={FORM_INPUT_CLASS}
            value={cautionDeposit}
            onChange={(e) => setCautionDeposit(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tn-lease-start" className={FORM_LABEL_CLASS}>
              Lease start
            </label>
            <input
              id="tn-lease-start"
              type="date"
              className={FORM_INPUT_CLASS}
              value={leaseStart}
              onChange={(e) => setLeaseStart(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="tn-lease-end" className={FORM_LABEL_CLASS}>
              Lease expiry
            </label>
            <input
              id="tn-lease-end"
              type="date"
              className={FORM_INPUT_CLASS}
              value={leaseExpiry}
              onChange={(e) => setLeaseExpiry(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="tn-pay" className={FORM_LABEL_CLASS}>
            Payment status
          </label>
          <select
            id="tn-pay"
            className={FORM_INPUT_CLASS}
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            {PAYMENT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  )
}
