import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Subview back — cursorrules.
 * @param {string} [to] — if set, navigates here; otherwise `navigate(-1)`.
 */
export default function BackButton({
  to,
  label = 'Back',
  className = '',
}) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => (to != null ? navigate(to) : navigate(-1))}
      className={`inline-flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm font-semibold text-ink-secondary transition-colors hover:bg-page hover:text-ink ${className}`}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </button>
  )
}
