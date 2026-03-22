import { STATUS_STYLES } from '../../lib/constants'

function formatStatusLabel(statusKey) {
  if (!statusKey) return ''
  return statusKey
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function resolveStatusKey(status) {
  if (status == null || status === '') return 'pending'
  const s = String(status)
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .trim()
  if (STATUS_STYLES[s]) return s
  return 'pending'
}

/**
 * Status badge — cursorrules + PRD §10.
 */
export default function Badge({ status }) {
  const key = resolveStatusKey(status)
  const styles =
    STATUS_STYLES[key] ?? 'bg-gray-100 text-gray-700'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${styles}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
        aria-hidden
      />
      {formatStatusLabel(key)}
    </span>
  )
}
