export const APP_NAME = 'Caretaker AI'

/**
 * Status badge styles — cursorrules + PRD §10. Theme / neutral utilities only (no hex in JSX).
 */
export const STATUS_STYLES = {
  paid: 'bg-green-pale text-green-800',
  overdue: 'bg-red-pale text-red-700',
  /** Lease / contract health (property detail tab). */
  active: 'bg-green-pale text-green-800',
  expiring: 'bg-gold-pale text-yellow-800',
  expired: 'bg-red-pale text-red-700',
  pending: 'bg-gray-100 text-gray-700',
  'awaiting-approval': 'bg-gold-pale text-yellow-800',
  open: 'bg-gold-pale text-yellow-800',
  'in-progress': 'bg-blue-pale text-blue-700',
  resolved: 'bg-green-pale text-green-800',
  critical: 'bg-red-pale text-red-700',
  high: 'bg-gold-pale text-yellow-800',
  medium: 'bg-gray-100 text-gray-700',
  low: 'bg-green-pale text-green-800',
  available: 'bg-green-pale text-green-800',
  busy: 'bg-blue-pale text-blue-700',
  inactive: 'bg-gray-100 text-gray-700',
  sent: 'bg-green-pale text-green-800',
  scheduled: 'bg-purple-pale text-purple-700',
  draft: 'bg-gray-100 text-gray-700',
}

/**
 * PRD §7 — sidebar groups. Badges: open complaints (red), pending approvals (amber).
 * `icon` keys map to Lucide components in `Sidebar.jsx`.
 * @type {{ to: string; label: string; end?: boolean; badge?: 'complaints' | 'approvals'; icon: string }[]}
 */
export const MAIN_NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: 'dashboard' },
  { to: '/properties', label: 'Properties', icon: 'properties' },
  { to: '/tenants', label: 'Tenants', icon: 'tenants' },
  { to: '/complaints', label: 'Complaints', badge: 'complaints', icon: 'complaints' },
  { to: '/payments', label: 'Payments', badge: 'approvals', icon: 'payments' },
]

/** PRD §7 — grouped navigation for the sidebar. */
export const NAV_SECTIONS = [
  { title: 'Main', items: MAIN_NAV_ITEMS },
  {
    title: 'Communication',
    items: [
      { to: '/inbox', label: 'Inbox', icon: 'inbox' },
      { to: '/broadcast', label: 'Broadcast', icon: 'broadcast' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/vendors', label: 'Vendors', icon: 'vendors' },
      { to: '/insights', label: 'AI Insights', icon: 'insights' },
    ],
  },
  {
    title: 'Account',
    items: [{ to: '/settings', label: 'Settings', icon: 'settings' }],
  },
]

/** Flat list — docs / quick imports */
export const NAV_ITEMS = MAIN_NAV_ITEMS

/** Alias — phased plan / docs */
export const MVP_NAV_ITEMS = NAV_ITEMS

/** Form label — cursorrules form field pattern */
export const FORM_LABEL_CLASS =
  'mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-secondary'

/** Text input — cursorrules form field pattern */
export const FORM_INPUT_CLASS =
  'w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal'

/** PRD §8.2 — property type filter + forms */
export const PROPERTY_TYPE_FILTER_ALL = 'all'

/** @type {{ value: string; label: string }[]} */
export const PROPERTY_TYPE_OPTIONS = [
  { value: PROPERTY_TYPE_FILTER_ALL, label: 'All types' },
  { value: 'residential', label: 'Residential' },
  { value: 'mixed-use', label: 'Mixed-use' },
  { value: 'commercial', label: 'Commercial' },
]

/** PRD §8.3 — tenant payment status filter */
export const TENANT_STATUS_FILTER_ALL = 'all'

/** @type {{ value: string; label: string }[]} */
export const TENANT_STATUS_OPTIONS = [
  { value: TENANT_STATUS_FILTER_ALL, label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
]

/** Accent bar on property cards (theme utilities only). */
export const PROPERTY_CARD_ACCENTS = [
  'border-teal-d',
  'border-gold-d',
  'border-blue',
  'border-purple',
]
