import { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import {
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
  PROPERTY_TYPE_OPTIONS,
} from '../lib/constants'
import { insertProperty } from '../lib/queries/properties'

const SUBMIT_TYPES = PROPERTY_TYPE_OPTIONS.filter((o) => o.value !== 'all')

/**
 * PRD §8.2 — Add property.
 */
export default function AddPropertyModal({
  open,
  onClose,
  managerId,
  managerLabel,
  onCreated,
  showToast,
}) {
  const [name, setName] = useState('')
  const [propertyType, setPropertyType] = useState('residential')
  const [location, setLocation] = useState('')
  const [numberOfUnits, setNumberOfUnits] = useState('')
  const [expectedMonthlyRevenue, setExpectedMonthlyRevenue] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next = {}
    if (!name.trim()) next.name = 'Property name is required.'
    if (!location.trim()) next.location = 'Location is required.'
    const n = Number(numberOfUnits)
    if (!numberOfUnits.trim() || !Number.isFinite(n) || n < 1) {
      next.numberOfUnits = 'Enter a valid number of units (minimum 1).'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!managerId || !validate()) return
    setSubmitting(true)
    const n = Number(numberOfUnits)
    const { id, error } = await insertProperty(managerId, {
      name: name.trim(),
      location: location.trim(),
      propertyType,
      numberOfUnits: n,
      expectedMonthlyRevenue: expectedMonthlyRevenue.trim(),
    })
    setSubmitting(false)
    if (error) {
      showToast?.(error, { variant: 'error' })
      return
    }
    showToast?.('Property added.')
    onCreated?.(id)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add property"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-property-form"
            disabled={submitting || !managerId}
          >
            {submitting ? 'Saving…' : 'Save property'}
          </Button>
        </>
      }
    >
      <form id="add-property-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prop-name" className={FORM_LABEL_CLASS}>
            Property name *
          </label>
          <input
            id="prop-name"
            className={FORM_INPUT_CLASS}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ocean View Apartments"
            autoComplete="off"
          />
          {errors.name ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="prop-type" className={FORM_LABEL_CLASS}>
            Property type
          </label>
          <select
            id="prop-type"
            className={FORM_INPUT_CLASS}
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            {SUBMIT_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="prop-location" className={FORM_LABEL_CLASS}>
            Location *
          </label>
          <input
            id="prop-location"
            className={FORM_INPUT_CLASS}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Lekki Phase 1, Lagos"
            autoComplete="off"
          />
          {errors.location ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.location}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="prop-units" className={FORM_LABEL_CLASS}>
            Number of units *
          </label>
          <input
            id="prop-units"
            type="number"
            min={1}
            className={FORM_INPUT_CLASS}
            value={numberOfUnits}
            onChange={(e) => setNumberOfUnits(e.target.value)}
            placeholder="e.g. 12"
          />
          {errors.numberOfUnits ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.numberOfUnits}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="prop-manager" className={FORM_LABEL_CLASS}>
            Assigned manager
          </label>
          <input
            id="prop-manager"
            readOnly
            className={`${FORM_INPUT_CLASS} bg-page text-ink-secondary`}
            value={managerLabel || '—'}
          />
        </div>

        <div>
          <label htmlFor="prop-revenue" className={FORM_LABEL_CLASS}>
            Expected monthly revenue (₦)
          </label>
          <input
            id="prop-revenue"
            type="number"
            min={0}
            className={FORM_INPUT_CLASS}
            value={expectedMonthlyRevenue}
            onChange={(e) => setExpectedMonthlyRevenue(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </form>
    </Modal>
  )
}
