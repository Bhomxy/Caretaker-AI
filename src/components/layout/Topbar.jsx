import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { getPageTitle } from '../../lib/route-meta'
import { useApp } from '../../hooks/useApp'

export default function Topbar() {
  const { pathname } = useLocation()
  const { user } = useApp()

  const title = getPageTitle(pathname)
  const displayName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Manager'

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-lg font-extrabold tracking-tight text-ink">{title}</h1>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-page px-3 py-2 text-xs font-semibold text-ink-muted opacity-60"
          title="Search (coming later)"
        >
          <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded bg-card px-1.5 py-0.5 font-mono text-[10px] text-ink-muted ring-1 ring-border sm:inline">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-teal-pale hover:text-ink"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>

        <div className="ml-1" title={user?.email ?? ''}>
          <Avatar name={displayName} size="compact" tone="light" />
        </div>
      </div>
    </header>
  )
}
