/** Topbar title from pathname — extend when nested routes ship. */
export function getPageTitle(pathname) {
  const base = pathname.split('?')[0].replace(/\/$/, '') || '/'
  if (base === '/') return 'Dashboard'
  const parts = base.split('/').filter(Boolean)
  const root = parts[0]

  if (root === 'complaints' && parts[1]) {
    return 'Complaint'
  }

  if (root === 'properties' && parts[1]) {
    return 'Property'
  }

  if (root === 'tenants' && parts[1]) {
    return 'Tenant'
  }

  const map = {
    properties: 'Properties',
    tenants: 'Tenants',
    complaints: 'Complaints',
    payments: 'Payments',
    inbox: 'Inbox',
    broadcast: 'Broadcast',
    vendors: 'Vendors',
    insights: 'AI Insights',
    settings: 'Settings',
  }
  return map[root] ?? 'Caretaker AI'
}
