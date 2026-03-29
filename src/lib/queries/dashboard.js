import { supabase } from '../supabase'
import {
  normalizeTenantPaymentStatus,
  pickField,
  tenantMonthlyRentHint,
} from '../utils'

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
          .select('*')
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
 * Last 6 calendar months of payment totals (PRD §8.1 collection chart).
 * @param {string} managerId
 */
export async function fetchMonthlyCollection(managerId) {
  const { data, error } = await supabase
    .from('payments')
    .select('amount, created_at')
    .eq('manager_id', managerId)

  if (error) return { months: [], error }

  const now = new Date()
  const buckets = []
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('en-NG', { month: 'short' }),
      total: 0,
    })
  }

  for (const row of data ?? []) {
    const raw = pickField(row, ['created_at'])
    if (!raw) continue
    const dt = new Date(raw)
    if (Number.isNaN(dt.getTime())) continue
    const key = `${dt.getFullYear()}-${dt.getMonth()}`
    const bucket = buckets.find((b) => b.key === key)
    if (!bucket) continue
    const amt = Number(pickField(row, ['amount', 'amount_ngn', 'total']) ?? 0)
    if (Number.isFinite(amt)) bucket.total += amt
  }

  return {
    months: buckets.map(({ label, total }) => ({ label, total })),
    error: null,
  }
}

/**
 * Mixed activity for dashboard feed (PRD §8.1).
 * @param {string} managerId
 * @param {number} limit
 */
export async function fetchActivityFeedItems(managerId, limit = 8) {
  const [compRes, invRes, recRes] = await Promise.all([
    supabase
      .from('complaints')
      .select('id, type, status, created_at, tenant_id')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('invoices')
      .select('id, status, amount, created_at, tenant_id')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('receipts')
      .select('id, amount, sent_at, tenant_id')
      .eq('manager_id', managerId)
      .order('sent_at', { ascending: false })
      .limit(6),
  ])

  const tenantIds = new Set()
  for (const r of compRes.data ?? []) {
    if (r.tenant_id) tenantIds.add(r.tenant_id)
  }
  for (const r of invRes.data ?? []) {
    if (r.tenant_id) tenantIds.add(r.tenant_id)
  }
  for (const r of recRes.data ?? []) {
    if (r.tenant_id) tenantIds.add(r.tenant_id)
  }

  const ids = [...tenantIds]
  const { data: tenRows } = ids.length
    ? await supabase
        .from('tenants')
        .select('id, full_name, name')
        .in('id', ids)
    : { data: [] }

  const tenantName = Object.fromEntries(
    (tenRows ?? []).map((t) => [
      t.id,
      pickField(t, ['full_name', 'name']) ?? '—',
    ])
  )

  /** @type {{ at: string; kind: string; title: string; subtitle: string }[]} */
  const items = []

  for (const c of compRes.data ?? []) {
    items.push({
      at: c.created_at,
      kind: 'complaint',
      title: `Complaint · ${pickField(c, ['type', 'category']) ?? 'Issue'}`,
      subtitle: `${tenantName[c.tenant_id] ?? 'Tenant'} · ${String(c.status ?? '')}`,
    })
  }
  for (const inv of invRes.data ?? []) {
    items.push({
      at: inv.created_at,
      kind: 'invoice',
      title: 'Invoice issued',
      subtitle: `${tenantName[inv.tenant_id] ?? 'Tenant'} · ${String(inv.status ?? '')}`,
    })
  }
  for (const r of recRes.data ?? []) {
    items.push({
      at: r.sent_at,
      kind: 'receipt',
      title: 'Receipt sent',
      subtitle: tenantName[r.tenant_id] ?? 'Tenant',
    })
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  return {
    items: items.slice(0, limit),
    error:
      compRes.error?.message ||
      invRes.error?.message ||
      recRes.error?.message ||
      null,
  }
}

function totalUnitsOnPropertyRow(row) {
  const n = Number(
    pickField(row, [
      'number_of_units',
      'unit_count',
      'total_units',
      'units',
    ]) ?? 0
  )
  return Number.isFinite(n) && n > 0 ? n : 0
}

/**
 * Portfolio capacity vs assigned tenants (dashboard occupancy widget).
 * @param {string} managerId
 */
export async function fetchOccupancySummary(managerId) {
  const { data: properties, error: pErr } = await supabase
    .from('properties')
    .select('*')
    .eq('manager_id', managerId)
  const { data: tenantRows, error: tErr } = await supabase
    .from('tenants')
    .select('property_id')
    .eq('manager_id', managerId)

  if (pErr) {
    return {
      totalUnits: 0,
      occupiedUnits: 0,
      vacantUnits: 0,
      byProperty: [],
      error: pErr,
    }
  }

  const props = properties ?? []
  let totalCap = 0
  const counts = new Map()
  for (const t of tenantRows ?? []) {
    if (!t.property_id) continue
    counts.set(t.property_id, (counts.get(t.property_id) ?? 0) + 1)
  }

  const byProperty = []
  for (const p of props) {
    const cap = totalUnitsOnPropertyRow(p)
    totalCap += cap
    const occ = counts.get(p.id) ?? 0
    byProperty.push({
      id: p.id,
      name: pickField(p, ['name', 'title', 'property_name']) ?? '—',
      occupied: occ,
      total: cap,
    })
  }

  const occupiedUnits = (tenantRows ?? []).filter((t) => t.property_id).length
  const vacantUnits = Math.max(0, totalCap - occupiedUnits)

  return {
    totalUnits: totalCap,
    occupiedUnits,
    vacantUnits,
    byProperty,
    error: tErr,
  }
}

/**
 * One-month rent still “on the table” (est.) for dashboard summary row.
 * @param {string} managerId
 */
export async function fetchRentArrearsEstimate(managerId) {
  const { data: tenantRows, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('manager_id', managerId)

  if (error) {
    return { outstanding: 0, overdue: 0, error }
  }

  let outstanding = 0
  let overdue = 0
  for (const t of tenantRows ?? []) {
    const m = tenantMonthlyRentHint(t)
    if (m == null || !Number.isFinite(m)) continue
    const st = normalizeTenantPaymentStatus(
      pickField(t, ['payment_status', 'status', 'rent_status'])
    )
    if (st === 'paid') continue
    outstanding += m
    if (st === 'overdue') overdue += m
  }
  return { outstanding, overdue, error: null }
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
    collection,
    activity,
    occupancy,
    arrears,
  ] = await Promise.all([
    fetchTotalUnits(managerId),
    fetchActiveTenantsCount(managerId),
    fetchOpenComplaintsCount(managerId),
    fetchYtdChargesTotal(managerId),
    fetchPendingApprovalsCount(managerId),
    fetchStaleUnassignedComplaintsCount(managerId),
    fetchExpiringLeasesCount(managerId),
    fetchRecentComplaints(managerId, 4),
    fetchMonthlyCollection(managerId),
    fetchActivityFeedItems(managerId, 8),
    fetchOccupancySummary(managerId),
    fetchRentArrearsEstimate(managerId),
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
    collection.error,
    activity.error,
    occupancy.error,
    arrears.error,
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
    collectionMonths: collection.months ?? [],
    activityItems: activity.items ?? [],
    occupancy: {
      totalUnits: occupancy.totalUnits ?? 0,
      occupiedUnits: occupancy.occupiedUnits ?? 0,
      vacantUnits: occupancy.vacantUnits ?? 0,
      byProperty: occupancy.byProperty ?? [],
    },
    arrears: {
      outstanding: arrears.outstanding ?? 0,
      overdue: arrears.overdue ?? 0,
    },
    error: errorMessage,
    partial: errors.length > 0,
  }
}
