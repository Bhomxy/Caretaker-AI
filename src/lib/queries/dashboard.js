import { supabase } from '../supabase'
import { pickField } from '../utils'

const TERMINAL_COMPLAINT = new Set(['resolved', 'closed', 'cancelled'])

function startOfYearIso() {
  const y = new Date().getFullYear()
  return `${y}-01-01T00:00:00.000Z`
}

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 86400000).toISOString()
}

function isoDaysFromNow(days) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * @param {string} managerId
 * @returns {Promise<{ value: number, error: Error | null }>}
 */
export async function fetchTotalUnits(managerId) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('manager_id', managerId)

  if (error) return { value: 0, error }
  const sum = (data ?? []).reduce((s, row) => {
    const n = Number(
      pickField(row, [
        'number_of_units',
        'unit_count',
        'total_units',
        'units',
      ]) ?? 0
    )
    return s + (Number.isFinite(n) ? n : 0)
  }, 0)
  return { value: sum, error: null }
}

/**
 * @param {string} managerId
 */
export async function fetchActiveTenantsCount(managerId) {
  const { count, error } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true })
    .eq('manager_id', managerId)

  if (error) return { value: 0, error }
  return { value: count ?? 0, error: null }
}

/**
 * @param {string} managerId
 */
export async function fetchOpenComplaintsCount(managerId) {
  const { data, error } = await supabase
    .from('complaints')
    .select('id, status')
    .eq('manager_id', managerId)

  if (error) return { value: 0, error }
  const n = (data ?? []).filter((row) => {
    const st = String(row.status ?? 'open')
      .toLowerCase()
      .replace(/-/g, '_')
    return !TERMINAL_COMPLAINT.has(st)
  }).length
  return { value: n, error: null }
}

/**
 * @param {string} managerId
 */
export async function fetchYtdChargesTotal(managerId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('manager_id', managerId)

  if (error) return { value: 0, error }
  const start = new Date(startOfYearIso()).getTime()
  let sum = 0
  for (const row of data ?? []) {
    const paidAt = pickField(row, ['paid_at', 'payment_date', 'created_at'])
    if (!paidAt) continue
    if (new Date(paidAt).getTime() < start) continue
    const st = String(row.status ?? '').toLowerCase()
    if (st && !['paid', 'completed', 'success', 'approved'].includes(st)) {
      continue
    }
    const amt = Number(
      pickField(row, ['amount', 'amount_ngn', 'total', 'value']) ?? 0
    )
    if (Number.isFinite(amt)) sum += amt
  }
  return { value: sum, error: null }
}

/**
 * @param {string} managerId
 */
export async function fetchPendingApprovalsCount(managerId) {
  const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('manager_id', managerId)
    .in('status', [
      'awaiting_approval',
      'awaiting-approval',
      'pending_approval',
      'pending approval',
    ])

  if (!error) return { value: count ?? 0, error: null }

  const { data, error: err2 } = await supabase
    .from('invoices')
    .select('id, status')
    .eq('manager_id', managerId)

  if (err2) return { value: 0, error: err2 }
  const pending = (data ?? []).filter((row) => {
    const s = String(row.status ?? '').toLowerCase()
    return (
      s.includes('await') ||
      s.includes('pending') ||
      s.includes('approval')
    )
  }).length
  return { value: pending, error: null }
}

/**
 * Complaints with no vendor, created at least 48h ago, not resolved.
 * @param {string} managerId
 */
export async function fetchStaleUnassignedComplaintsCount(managerId) {
  const { data, error } = await supabase
    .from('complaints')
    .select('id, status, vendor_id, created_at')
    .eq('manager_id', managerId)
    .lt('created_at', isoDaysAgo(48))

  if (error) return { value: 0, error }
  const n = (data ?? []).filter((row) => {
    if (row.vendor_id != null) return false
    const st = String(row.status ?? '').toLowerCase()
    if (st.includes('resolved') || st.includes('closed')) return false
    return true
  }).length
  return { value: n, error: null }
}

/**
 * Tenants with lease ending within 60 days (inclusive).
 * @param {string} managerId
 */
export async function fetchExpiringLeasesCount(managerId) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('manager_id', managerId)

  if (error) return { value: 0, error }
  const today = todayIsoDate()
  const end = isoDaysFromNow(60)
  const n = (data ?? []).filter((row) => {
    const exp = pickField(row, [
      'lease_expiry_date',
      'lease_expiry',
      'lease_end_date',
      'lease_end',
    ])
    if (!exp) return false
    const d = String(exp).slice(0, 10)
    return d >= today && d <= end
  }).length
  return { value: n, error: null }
}

/**
 * @param {string} managerId
 * @param {number} limit
 */
export async function fetchRecentComplaints(managerId, limit = 4) {
  const { data: rows, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('manager_id', managerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { data: [], error }

  const list = rows ?? []
  const tenantIds = [...new Set(list.map((r) => r.tenant_id).filter(Boolean))]
  const propIds = [...new Set(list.map((r) => r.property_id).filter(Boolean))]

  const [tenRes, propRes] = await Promise.all([
    tenantIds.length
      ? supabase.from('tenants').select('id, full_name, name').in('id', tenantIds)
      : Promise.resolve({ data: [] }),
    propIds.length
      ? supabase
          .from('properties')
          .select('id, name, title, property_name')
          .in('id', propIds)
      : Promise.resolve({ data: [] }),
  ])

  const tenantMap = Object.fromEntries(
    (tenRes.data ?? []).map((t) => [
      t.id,
      pickField(t, ['full_name', 'name']) ?? '—',
    ])
  )
  const propMap = Object.fromEntries(
    (propRes.data ?? []).map((p) => [
      p.id,
      pickField(p, ['name', 'title', 'property_name']) ?? '—',
    ])
  )

  const data = list.map((c) => ({
    id: c.id,
    type: pickField(c, ['type', 'category', 'complaint_type']) ?? '—',
    status: c.status ?? '—',
    created_at: c.created_at,
    tenantName: tenantMap[c.tenant_id] ?? '—',
    propertyName: propMap[c.property_id] ?? '—',
  }))

  return { data, error: null }
}

/**
 * Full dashboard fetch — aggregates errors into a single message if needed.
 * @param {string} managerId
 */
export async function fetchDashboardBundle(managerId) {
  const [
    units,
    tenants,
    openComplaints,
    ytd,
    approvals,
    stale,
    expiring,
    recent,
  ] = await Promise.all([
    fetchTotalUnits(managerId),
    fetchActiveTenantsCount(managerId),
    fetchOpenComplaintsCount(managerId),
    fetchYtdChargesTotal(managerId),
    fetchPendingApprovalsCount(managerId),
    fetchStaleUnassignedComplaintsCount(managerId),
    fetchExpiringLeasesCount(managerId),
    fetchRecentComplaints(managerId, 4),
  ])

  const errors = [
    units.error,
    tenants.error,
    openComplaints.error,
    ytd.error,
    approvals.error,
    stale.error,
    expiring.error,
    recent.error,
  ].filter(Boolean)

  const firstError = errors[0]
  const errorMessage = firstError
    ? firstError.message || 'Could not load dashboard data.'
    : null

  return {
    metrics: {
      totalUnits: units.value,
      activeTenants: tenants.value,
      openComplaints: openComplaints.value,
      ytdCharges: ytd.value,
    },
    actionQueue: {
      pendingApprovals: approvals.value,
      staleUnassigned: stale.value,
      expiringLeases: expiring.value,
    },
    recentComplaints: recent.data,
    error: errorMessage,
    partial: errors.length > 0,
  }
}
