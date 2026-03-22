/**
 * Empty list — PRD §6 / cursorrules (icon + title + subtitle).
 */
export default function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="py-12 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <div className="mb-1 text-sm font-bold text-ink-secondary">{title}</div>
      <div className="text-xs text-ink-muted">{subtitle}</div>
    </div>
  )
}
