import { Link, useLocation } from 'react-router-dom'
import { Bell, Inbox, Search } from 'lucide-react'
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
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-6">
      <h1 className="shrink-0 text-[15px] font-bold tracking-tight text-ink">
        {title}
      </h1>

      <div className="mx-auto hidden min-w-0 max-w-[260px] flex-1 md:block">
        <div className="flex items-center gap-2 rounded-lg border-[1.5px] border-border bg-page px-3 py-1.5 transition-colors focus-within:border-teal">
          <Search
            className="h-4 w-4 shrink-0 text-ink-muted"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            disabled
            placeholder="Search…"
            className="min-w-0 flex-1 bg-transparent font-sans text-[13px] text-ink outline-none placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-60"
            title="Search (coming later)"
          />
          <kbd className="hidden shrink-0 rounded bg-card px-1.5 py-0.5 font-mono text-[10px] text-ink-muted ring-1 ring-border sm:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Link
          to="/inbox"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border-[1.5px] border-border text-ink-secondary transition-colors hover:bg-page hover:text-ink"
          title="Inbox"
          aria-label="Open inbox"
        >
          <Inbox className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </Link>
        <button
          type="button"
          className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border-[1.5px] border-border text-ink-secondary transition-colors hover:bg-page hover:text-ink"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </button>
        <div
          className="ml-1"
          title={user?.email ?? ''}
        >
          <Avatar name={displayName} size="compact" tone="light" />
        </div>
      </div>
    </header>
  )
}
