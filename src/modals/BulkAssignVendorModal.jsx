import { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { FORM_INPUT_CLASS, FORM_LABEL_CLASS } from '../lib/constants'

/**
 * PRD §8.4 — bulk assign vendor to selected complaints.
 */
export default function BulkAssignVendorModal({
  open,
  onClose,
  vendorOptions,
  selectedCount,
  onAssign,
}) {
  const [vendorId, setVendorId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!vendorId) return
    setSubmitting(true)
    await onAssign?.(vendorId)
    setSubmitting(false)
    setVendorId('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign vendor"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="bulk-vendor-form"
            disabled={submitting || !vendorId}
          >
            {submitting ? 'Applying…' : 'Assign to selected'}
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-ink-secondary">
        Choose a vendor for{' '}
        <span className="font-bold text-ink">{selectedCount}</span> selected
        complaint{selectedCount === 1 ? '' : 's'}.
      </p>
      <form id="bulk-vendor-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bulk-vendor" className={FORM_LABEL_CLASS}>
            Vendor
          </label>
          <select
            id="bulk-vendor"
            className={FORM_INPUT_CLASS}
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            required
          >
            <option value="">Select vendor</option>
            {vendorOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  )
}
