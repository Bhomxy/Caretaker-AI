import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { formatDate, formatNaira, shortRecordId } from '../../lib/utils'

/**
 * @param {{
 *   rows: object[]
 *   loading: boolean
 *   error: string | null
 *   showToast: (msg: string, opts?: object) => void
 * }} props
 */
export default function Receipts({ rows, loading, error, showToast }) {
  const viewPdf = (url) => {
    if (!url) {
      showToast('No PDF on file for this receipt yet.', { variant: 'info' })
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const resend = () => {
    showToast('Resend queued — WhatsApp will deliver when messaging is live.', {
      variant: 'info',
    })
  }

  if (error) {
    return (
      <p className="text-sm font-semibold text-red-600" role="alert">
        {error}
      </p>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!rows.length) {
    return (
      <EmptyState
        icon="🧾"
        title="No receipts sent yet"
        subtitle="After you approve a payment, receipts appear here with send timestamps."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Receipt ID
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Tenant
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Unit
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Property
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Amount
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Payment date
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Sent
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-teal-pale/60">
              <td className="border-b border-border px-4 py-3 font-mono text-xs font-semibold text-teal-dk">
                {shortRecordId(r.id)}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm font-semibold text-ink">
                {r.tenantName}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {r.unit}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {r.propertyName}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink">
                {formatNaira(r.amount)}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {formatDate(r.paymentDate)}
              </td>
              <td className="border-b border-border px-4 py-3 text-sm text-ink-secondary">
                {formatDate(r.sentAt)}
              </td>
              <td className="border-b border-border px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => viewPdf(r.pdfUrl)}
                  >
                    View PDF
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => viewPdf(r.pdfUrl)}
                  >
                    Download
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resend}
                  >
                    Resend
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
