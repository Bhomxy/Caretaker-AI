/**
 * On/off switch — PRD Settings / cursorrules.
 */
export default function Toggle({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) {
  const switchId = id ?? 'toggle-switch'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-50 ${
          checked ? 'border-teal-d bg-teal-d' : 'bg-page'
        }`}
      >
        <span
          className={`pointer-events-none absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-card shadow-soft-xs ring-1 ring-border transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
          aria-hidden
        />
      </button>
      {label ? (
        <label
          htmlFor={switchId}
          className="cursor-pointer text-sm font-semibold text-ink select-none"
        >
          {label}
        </label>
      ) : null}
    </div>
  )
}
