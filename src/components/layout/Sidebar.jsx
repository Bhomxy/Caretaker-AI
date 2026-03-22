import { NavLink } from 'react-router-dom'
import {
  Building2,
  ChevronDown,
  CircleAlert,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Sparkles,
  Settings,
  UsersRound,
  Wallet,
  Wrench,
} from 'lucide-react'
import Logo from '../Logo'
import Avatar from '../ui/Avatar'
import { NAV_SECTIONS } from '../../lib/constants'
import { useApp } from '../../hooks/useApp'

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  properties: Building2,
  tenants: UsersRound,
  complaints: CircleAlert,
  payments: Wallet,
  inbox: Inbox,
  broadcast: Megaphone,
  vendors: Wrench,
  insights: Sparkles,
  settings: Settings,
}

const ICON_STROKE = 1.75

function SidebarNavIcon({ name, isActive }) {
  const Icon = NAV_ICONS[name]
  if (!Icon) return null
  return (
    <Icon
      className={`size-[18px] shrink-0 transition-opacity ${
        isActive ? 'opacity-100' : 'opacity-80'
      }`}
      strokeWidth={ICON_STROKE}
      aria-hidden
    />
  )
}

function NavBadge({ variant, count }) {
  if (!count || count < 1) return null
  const cls =
    variant === 'complaints'
      ? 'bg-red-pale text-red'
      : 'bg-gold-pale text-gold-d'
  return (
    <span
      className={`ml-auto min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${cls}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function Sidebar() {
  const { user, signOut, openComplaintsCount, pendingApprovalsCount } = useApp()

  const displayName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Manager'

  return (
    <aside
      className="flex h-screen w-[244px] shrink-0 flex-col border-r border-sidebar-mid bg-sidebar text-white"
      aria-label="Main navigation"
    >
      <div className="px-3 pt-5 pb-2">
        <NavLink
          to="/"
          end
          className="block w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <Logo className="max-h-[52px] w-full object-contain object-left" />
        </NavLink>
      </div>

      <div className="mt-6 px-4">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-sidebar-mid/60 px-3 py-2.5 text-left shadow-soft-xs transition-colors hover:bg-sidebar-mid"
        >
          <Layers
            className="size-[18px] shrink-0 text-teal-pale/90"
            strokeWidth={ICON_STROKE}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">Main portfolio</p>
            <p className="text-[10px] font-semibold text-white/50">0 units</p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-white/40" aria-hidden />
        </button>
      </div>

      <nav className="mt-5 flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
              {section.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const badgeCount =
                  item.badge === 'complaints'
                    ? openComplaintsCount
                    : item.badge === 'approvals'
                      ? pendingApprovalsCount
                      : 0
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        'flex min-h-[40px] items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-[color,background-color,box-shadow,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
                        isActive
                          ? 'bg-white text-teal-d shadow-soft'
                          : 'text-white/75 hover:bg-white/[0.08] hover:text-white',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <SidebarNavIcon name={item.icon} isActive={isActive} />
                        <span className="min-w-0 flex-1 truncate leading-snug">
                          {item.label}
                        </span>
                        {item.badge === 'complaints' ? (
                          <NavBadge variant="complaints" count={badgeCount} />
                        ) : null}
                        {item.badge === 'approvals' ? (
                          <NavBadge variant="approvals" count={badgeCount} />
                        ) : null}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} size="md" tone="dark" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{displayName}</p>
            <p className="truncate text-[11px] font-semibold text-white/45">
              Property Manager
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  )
}
