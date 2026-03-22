/**
 * Modal shell — PRD §6 / cursorrules (overlay click closes — wire onClose in Phase 4).
 */
export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sidebar/60 px-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[580px] overflow-y-auto rounded-2xl border border-border bg-card shadow-soft-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-5">
            <h2 id="modal-title" className="text-base font-extrabold text-ink">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-xl text-ink-muted transition-colors hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        ) : null}
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-card px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
