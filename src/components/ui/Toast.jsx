/**
 * Toast — PRD §6 / cursorrules: bottom-right, ~2.8s auto-dismiss.
 */
export default function Toast({ message, variant = 'success', onDismiss }) {
  if (!message) return null

  const icon =
    variant === 'error' ? '⚠' : variant === 'info' ? 'ℹ' : '✓'

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex max-w-[min(100vw-3rem,24rem)] items-center gap-2 rounded-xl bg-sidebar px-5 py-3 text-sm font-semibold text-white shadow-soft-lg"
      role="status"
      aria-live="polite"
    >
      <span aria-hidden>{icon}</span>
      <span className="flex-1 text-left">{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      ) : null}
    </div>
  )
}
