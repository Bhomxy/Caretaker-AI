/**
 * Card — white surface, border-border, soft elevation.
 */
export default function Card({
  title,
  children,
  className = '',
  bodyClassName = 'p-5',
}) {
  return (
    <div className={`rounded-xl border border-border bg-card shadow-soft ${className}`}>
      {title ? (
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-sm font-bold text-ink">{title}</span>
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}
