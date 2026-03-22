const VARIANTS = {
  primary:
    'bg-teal-d text-white hover:bg-teal-dk active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60',
  outline:
    'border border-border bg-transparent text-ink hover:bg-page active:scale-[0.98]',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-page active:scale-[0.98]',
}

const SIZES = {
  md: 'px-4 py-2 text-sm gap-1.5',
  sm: 'px-3 py-1.5 text-xs gap-1',
}

/**
 * Button — cursorrules (primary / outline / ghost).
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-all ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
