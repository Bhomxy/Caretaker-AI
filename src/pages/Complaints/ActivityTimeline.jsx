import { formatAgeShort, formatDate } from '../../lib/utils'

/**
 * PRD §8.4 — activity log for a complaint.
 * @param {{ at: string, title: string, detail?: string, key: string }[]} props.entries
 */
export default function ActivityTimeline({ entries }) {
  if (!entries?.length) {
    return (
      <p className="text-sm text-ink-secondary">
        No timeline events yet. When the AI and vendors act on this issue,
        updates can be appended here from the backend.
      </p>
    )
  }

  return (
    <ul className="relative space-y-0 border-l border-border pl-5">
      {entries.map((e) => (
        <li key={e.key} className="relative pb-6 last:pb-0">
          <span
            className="absolute top-1.5 -left-[calc(1.25rem+5px)] h-2.5 w-2.5 rounded-full border-2 border-card bg-teal-d"
            aria-hidden
          />
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            {formatDate(e.at)} · {formatAgeShort(e.at)}
          </p>
          <p className="mt-0.5 text-sm font-bold text-ink">{e.title}</p>
          {e.detail ? (
            <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
              {e.detail}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
