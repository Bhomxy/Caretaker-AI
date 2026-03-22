/** @param {string | number | Date | null | undefined} date */
export function formatDate(date) {
  if (date == null) return '—'
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** @param {string | number | Date | null | undefined} date */
export function formatAgeShort(date) {
  if (date == null) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  const now = Date.now()
  const ms = now - d.getTime()
  const days = Math.floor(ms / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return '1 day'
  return `${days} days`
}

/** @param {number | string | null | undefined} amount */
export function formatNaira(amount) {
  if (amount == null || amount === '') return '—'
  return `₦${Number(amount).toLocaleString('en-NG')}`
}

/** @param {string | null | undefined} name */
export function getInitials(name) {
  if (!name?.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** First non-empty field from row (handles varying Supabase schemas). */
export function pickField(row, keys) {
  if (!row) return null
  for (const k of keys) {
    const v = row[k]
    if (v != null && v !== '') return v
  }
  return null
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

/** Map DB value to filter key: residential | mixed-use | commercial */
export function normalizePropertyTypeForFilter(raw) {
  const s = String(raw ?? '').toLowerCase()
  if (s.includes('mixed')) return 'mixed-use'
  if (s.includes('commercial')) return 'commercial'
  return 'residential'
}

/**
 * Lease row badge key — aligns with STATUS_STYLES (active / expiring / expired).
 * @returns {'pending' | 'active' | 'expiring' | 'expired'}
 */
export function leaseStatusForExpiry(dateVal) {
  if (dateVal == null || dateVal === '') return 'pending'
  const end = String(dateVal).slice(0, 10)
  const today = todayIsoDate()
  if (end < today) return 'expired'
  const future = new Date(`${end}T12:00:00`)
  const t = new Date(`${today}T12:00:00`)
  const days = Math.floor((future.getTime() - t.getTime()) / 86400000)
  if (days <= 60) return 'expiring'
  return 'active'
}

/** Monthly rent hint from tenant row (flexible columns). */
export function tenantMonthlyRentHint(row) {
  if (!row) return null
  const m = pickField(row, ['monthly_rent', 'rent', 'monthly_service_charge'])
  if (m != null && Number(m) > 0) return Number(m)
  const annual = pickField(row, [
    'annual_service_charge',
    'annual_rent',
    'service_charge_annual',
  ])
  if (annual != null && Number(annual) > 0) return Number(annual) / 12
  return null
}

/** Normalizes payment / rent status for filters and badges. */
export function normalizeTenantPaymentStatus(raw) {
  const s = String(raw ?? 'pending').toLowerCase()
  if (s.includes('overdue')) return 'overdue'
  if (s.includes('paid') || s === 'cleared') return 'paid'
  return 'pending'
}
