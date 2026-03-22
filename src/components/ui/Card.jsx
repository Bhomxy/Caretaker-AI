/**
 * Card — white surface, border-border, soft elevation.
 */
export default function Card({
  title,
  headerRight = null,
  children,
  className = '',
  bodyClassName = 'p-5',
}) {
  return (
    <div className={`rounded-xl border border-border bg-card shadow-soft ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-[18px] py-3.5">
          <span className="text-[13.5px] font-bold text-ink">{title}</span>
          {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}
