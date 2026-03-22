import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { formatAgeShort } from '../../lib/utils'

/**
 * @param {{
 *   threads: object[]
 *   loading: boolean
 *   selectedId: string | null
 *   onSelect: (id: string) => void
 *   error: string | null
 * }} props
 */
export default function ThreadList({
  threads,
  loading,
  selectedId,
  onSelect,
  error,
}) {
  if (error) {
    return (
      <p className="px-3 py-4 text-sm font-semibold text-red-600" role="alert">
        {error}
      </p>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    )
  }

  if (!threads.length) {
    return (
      <div className="p-2">
        <EmptyState
          icon="💬"
          title="No WhatsApp threads yet"
          subtitle="When tenants message your portfolio number, threads appear here for review and handoff."
        />
      </div>
    )
  }

  return (
    <ul className="max-h-[calc(100vh-12rem)] divide-y divide-border overflow-y-auto">
      {threads.map((t) => {
        const active = t.id === selectedId
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t.id)}
              className={`flex w-full gap-3 px-3 py-3 text-left transition-colors ${
                active ? 'bg-teal-pale/80' : 'hover:bg-page'
              }`}
            >
              <Avatar name={t.tenantName} size="md" tone="light" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-ink">
                    {t.tenantName}
                  </span>
                  <span className="shrink-0 text-[10px] font-semibold text-ink-muted">
                    {formatAgeShort(t.lastAt)}
                  </span>
                </div>
                <p className="truncate text-xs text-ink-secondary">
                  {t.unit} · {t.propertyName}
                </p>
                <p className="mt-0.5 truncate text-xs font-medium text-ink-muted">
                  {t.preview}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      t.aiActive
                        ? 'bg-gold-pale text-yellow-800'
                        : 'bg-teal-pale text-teal-dk'
                    }`}
                  >
                    {t.aiActive ? 'AI active' : 'Manager active'}
                  </span>
                  {t.unread > 0 ? (
                    <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-teal-d px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                      {t.unread > 9 ? '9+' : t.unread}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
