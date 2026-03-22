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
  closed: 'bg-green-pale text-green-800',
  cancelled: 'bg-gray-100 text-gray-700',
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
  /** PRD §8.5 rent roll / invoices */
  'invoice-sent': 'bg-blue-pale text-blue-700',
  'due-soon': 'bg-gold-pale text-yellow-800',
  upcoming: 'bg-gray-100 text-gray-700',
  disputed: 'bg-red-pale text-red-700',
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

/** PRD §8.4 — complaint list filters */
export const COMPLAINT_STATUS_FILTER_ALL = 'all'

/** @type {{ value: string; label: string }[]} */
export const COMPLAINT_STATUS_FILTER_OPTIONS = [
  { value: COMPLAINT_STATUS_FILTER_ALL, label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
]

export const COMPLAINT_PRIORITY_FILTER_ALL = 'all'

/** @type {{ value: string; label: string }[]} */
export const COMPLAINT_PRIORITY_FILTER_OPTIONS = [
  { value: COMPLAINT_PRIORITY_FILTER_ALL, label: 'All priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

/** PRD §8.8 — vendor trade filter + Add Vendor form */
export const VENDOR_TRADE_FILTER_ALL = 'all'

/** @type {{ value: string; label: string }[]} */
export const VENDOR_TRADE_OPTIONS = [
  { value: VENDOR_TRADE_FILTER_ALL, label: 'All trades' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'ac-technician', label: 'AC Technician' },
  { value: 'pest-control', label: 'Pest Control' },
  { value: 'security', label: 'Security' },
  { value: 'painter', label: 'Painter' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'general', label: 'General' },
]

/** Subset for Add Vendor modal (no “all”). */
export const VENDOR_TRADE_FORM_OPTIONS = VENDOR_TRADE_OPTIONS.filter(
  (o) => o.value !== VENDOR_TRADE_FILTER_ALL
)

/** Accent bar on property cards (theme utilities only). */
export const PROPERTY_CARD_ACCENTS = [
  'border-teal-d',
  'border-gold-d',
  'border-blue',
  'border-purple',
]

/** PRD §8.5 — Payments deep links */
export const PAYMENTS_TAB_RENT_ROLL = 'rent-roll'
export const PAYMENTS_TAB_APPROVALS = 'approvals'
export const PAYMENTS_TAB_INVOICES = 'invoices'
export const PAYMENTS_TAB_RECEIPTS = 'receipts'

/** @type {{ id: string; label: string }[]} */
export const PAYMENTS_TAB_OPTIONS = [
  { id: PAYMENTS_TAB_RENT_ROLL, label: 'Rent roll' },
  { id: PAYMENTS_TAB_APPROVALS, label: 'Approvals' },
  { id: PAYMENTS_TAB_INVOICES, label: 'Invoices' },
  { id: PAYMENTS_TAB_RECEIPTS, label: 'Receipts' },
]

/** PRD §8.5 — rent roll status filter */
export const RENT_ROLL_STATUS_FILTER_ALL = 'all'

/** @type {{ value: string; label: string }[]} */
export const RENT_ROLL_STATUS_OPTIONS = [
  { value: RENT_ROLL_STATUS_FILTER_ALL, label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'awaiting-approval', label: 'Awaiting approval' },
  { value: 'invoice-sent', label: 'Invoice sent' },
  { value: 'due-soon', label: 'Due soon' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
]

/** PRD §8.7 — broadcast template keys */
export const BROADCAST_TEMPLATE_KEYS = [
  'service-charge-reminder',
  'lease-renewal',
  'maintenance-notice',
  'general-announcement',
  'custom',
]

/** @type {{ key: string; label: string; defaultBody: string }[]} */
export const BROADCAST_TEMPLATE_PRESETS = [
  {
    key: 'service-charge-reminder',
    label: 'Service charge reminder',
    defaultBody:
      'Hello, this is a friendly reminder that your service charge for this period is due. Please pay via your usual channel. Reply here if you need assistance.',
  },
  {
    key: 'lease-renewal',
    label: 'Lease renewal notice',
    defaultBody:
      'Your lease is approaching renewal. We will share the renewal terms shortly. Kindly confirm if you intend to renew so we can prepare the paperwork.',
  },
  {
    key: 'maintenance-notice',
    label: 'Maintenance notice',
    defaultBody:
      'Scheduled maintenance will take place in the building this week. Access may be required for your unit — we will coordinate via this chat.',
  },
  {
    key: 'general-announcement',
    label: 'General announcement',
    defaultBody:
      'Important update for all residents: please read and acknowledge. Thank you for your cooperation.',
  },
  {
    key: 'custom',
    label: 'Custom message',
    defaultBody: '',
  },
]

/** Settings — localStorage keys (PRD §8.10) */
export const SETTINGS_STORAGE_NOTIFICATIONS = 'caretaker_settings_notifications_v1'
export const SETTINGS_STORAGE_AI = 'caretaker_settings_ai_v1'
