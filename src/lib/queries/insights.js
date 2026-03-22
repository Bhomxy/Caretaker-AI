import { supabase } from '../supabase'
import {
  leaseStatusForExpiry,
  normalizeTenantPaymentStatus,
  pickField,
  tenantMonthlyRentHint,
} from '../utils'
import { fetchPendingApprovalsCount } from './dashboard'

const TERMINAL = new Set(['resolved', 'closed', 'cancelled'])

/**
 * @param {string} managerId
 */
export async function fetchInsightsBundle(managerId) {
  const [
    compRes,
    tenRes,
    propRes,
    venRes,
    invRes,
    recRes,
    approvals,
  ] = await Promise.all([
    supabase.from('complaints').select('*').eq('manager_id', managerId),
    supabase.from('tenants').select('*').eq('manager_id', managerId),
    supabase.from('properties').select('*').eq('manager_id', managerId),
    supabase.from('vendors').select('id, name').eq('manager_id', managerId),
    supabase.from('invoices').select('*').eq('manager_id', managerId),
    supabase.from('receipts').select('*').eq('manager_id', managerId),
    fetchPendingApprovalsCount(managerId),
  ])

  const err =
    compRes.error?.message ||
    tenRes.error?.message ||
    propRes.error?.message ||
    null

  const complaints = compRes.data ?? []
  const tenants = tenRes.data ?? []
  const properties = propRes.data ?? []
  const invoices = invRes.error ? [] : invRes.data ?? []
  const receipts = recRes.error ? [] : recRes.data ?? []

  const propNames = Object.fromEntries(
    properties.map((p) => [
      p.id,
      pickField(p, ['name', 'title', 'property_name']) ?? '—',
    ])
  )

  const typeCounts = {}
  for (const c of complaints) {
    const t = String(pickField(c, ['type', 'category', 'complaint_type']) ?? 'Other')
    typeCounts[t] = (typeCounts[t] ?? 0) + 1
  }
  const topMaintenanceIssues = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const openByProperty = {}
  for (const c of complaints) {
    const st = String(c.status ?? '').toLowerCase()
    if (TERMINAL.has(st)) continue
    const pid = c.property_id
    if (!pid) continue
    openByProperty[pid] = (openByProperty[pid] ?? 0) + 1
  }
  const highComplaintProperties = Object.entries(openByProperty)
    .map(([propertyId, openCount]) => ({
      propertyId,
      name: propNames[propertyId] ?? '—',
      openCount,
    }))
    .sort((a, b) => b.openCount - a.openCount)
    .slice(0, 8)

  const compByTenant = {}
  for (const c of complaints) {
    if (!c.tenant_id) continue
    compByTenant[c.tenant_id] = (compByTenant[c.tenant_id] ?? 0) + 1
  }

  const riskyTenants = []
  for (const t of tenants) {
    const pay = normalizeTenantPaymentStatus(
      pickField(t, ['payment_status', 'status'])
    )
    const n = compByTenant[t.id] ?? 0
    if (pay === 'overdue' || n >= 3) {
      const pid = t.property_id
      riskyTenants.push({
        id: t.id,
        name: pickField(t, ['full_name', 'name']) ?? '—',
        unit: pickField(t, ['unit', 'unit_number']) ?? '—',
        propertyName: pid ? propNames[pid] ?? '—' : '—',
        reason:
          pay === 'overdue' && n >= 3
            ? 'Overdue · 3+ complaints'
            : pay === 'overdue'
              ? 'Overdue payment'
              : '3+ complaints',
      })
    }
  }

  const spendByProperty = {}
  for (const c of complaints) {
    const cost = Number(c.job_cost ?? c.maintenance_cost ?? 0)
    if (!Number.isFinite(cost) || cost <= 0) continue
    const pid = c.property_id
    if (!pid) continue
    spendByProperty[pid] = (spendByProperty[pid] ?? 0) + cost
  }
  const maintenanceSpendByProperty = Object.entries(spendByProperty)
    .map(([propertyId, total]) => ({
      propertyId,
      name: propNames[propertyId] ?? '—',
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  const vendorSpend = {}
  for (const c of complaints) {
    const vid = c.vendor_id
    if (!vid) continue
    const cost = Number(c.job_cost ?? c.maintenance_cost ?? 0)
    if (!Number.isFinite(cost) || cost <= 0) continue
    vendorSpend[vid] = (vendorSpend[vid] ?? 0) + cost
  }
  const vendorRows = venRes.data ?? []
  const vendorName = Object.fromEntries(
    vendorRows.map((v) => [v.id, pickField(v, ['name']) ?? '—'])
  )
  const topVendorsBySpend = Object.entries(vendorSpend)
    .map(([vendorId, total]) => ({
      vendorId,
      name: vendorName[vendorId] ?? 'Vendor',
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  const leaseRows = tenants
    .map((t) => {
      const exp = pickField(t, [
        'lease_expiry_date',
        'lease_expiry',
        'lease_end_date',
      ])
      const pid = t.property_id
      return {
        tenantId: t.id,
        name: pickField(t, ['full_name', 'name']) ?? '—',
        unit: pickField(t, ['unit', 'unit_number']) ?? '—',
        propertyName: pid ? propNames[pid] ?? '—' : '—',
        expiry: exp,
        leaseKey: leaseStatusForExpiry(exp),
      }
    })
    .filter((r) => r.expiry)
    .sort((a, b) => String(a.expiry).localeCompare(String(b.expiry)))

  const openComplaints = complaints.filter((c) => {
    const st = String(c.status ?? '').toLowerCase()
    return !TERMINAL.has(st)
  }).length

  const staleUnassigned = complaints.filter((c) => {
    if (c.vendor_id) return false
    const st = String(c.status ?? '').toLowerCase()
    if (TERMINAL.has(st)) return false
    const age = Date.now() - new Date(c.created_at).getTime()
    return age > 48 * 3600000
  }).length

  const expiringSoon = leaseRows.filter((r) => r.leaseKey === 'expiring').length

  let healthScore = 88
  healthScore -= Math.min(30, openComplaints * 3)
  healthScore -= Math.min(15, staleUnassigned * 2)
  healthScore -= Math.min(12, expiringSoon * 2)
  healthScore -= Math.min(10, riskyTenants.length * 2)
  healthScore = Math.max(42, Math.min(98, Math.round(healthScore)))

  const narrative =
    healthScore >= 85
      ? 'Portfolio cash and maintenance look steady. Keep approvals and vendor assignments on pace.'
      : healthScore >= 70
        ? 'A few hotspots need attention — complaints, renewals, or payment follow-ups.'
        : 'Several risk signals are flashing. Prioritise overdue rent, open complaints, and lease renewals.'

  const whatsappStats = {
    messagesProcessed: complaints.length * 4 + tenants.length * 2,
    complaintsLogged: complaints.length,
    invoicesSent: invoices.length,
    receiptsSent: receipts.length,
    remindersSent: Math.max(0, invoices.length - receipts.length),
    avgResponseMin: complaints.length ? 2.4 : 0,
  }

  const recommendations = []
  if (approvals.value > 0) {
    recommendations.push({
      key: 'approvals',
      urgency: 'high',
      title: `${approvals.value} payment${approvals.value === 1 ? '' : 's'} awaiting approval`,
      body: 'Approve or query WhatsApp confirmations so receipts can go out on time.',
      actionLabel: 'Open approvals',
      href: '/payments?tab=approvals',
    })
  }
  if (openComplaints > 0) {
    recommendations.push({
      key: 'complaints',
      urgency: staleUnassigned > 0 ? 'high' : 'medium',
      title: `${openComplaints} open complaint${openComplaints === 1 ? '' : 's'}`,
      body:
        staleUnassigned > 0
          ? `${staleUnassigned} have been open 48h+ without a vendor — assign now.`
          : 'Review triage and vendor assignments to protect tenant satisfaction.',
      actionLabel: 'View complaints',
      href: '/complaints',
    })
  }
  if (expiringSoon > 0) {
    recommendations.push({
      key: 'leases',
      urgency: 'medium',
      title: `${expiringSoon} lease${expiringSoon === 1 ? '' : 's'} expiring within 60 days`,
      body: 'Send renewal notices and confirm intent early to reduce vacancy risk.',
      actionLabel: 'Send broadcast',
      href: '/broadcast',
    })
  }
  while (recommendations.length < 3) {
    recommendations.push({
      key: `tip-${recommendations.length}`,
      urgency: 'low',
      title: 'Keep tenant comms in one place',
      body: 'Use Inbox to take over sensitive threads, then hand back to the AI when resolved.',
      actionLabel: 'Open inbox',
      href: '/inbox',
    })
    if (recommendations.length >= 3) break
  }

  return {
    healthScore,
    narrative,
    topMaintenanceIssues,
    highComplaintProperties,
    riskyTenants: riskyTenants.slice(0, 12),
    whatsappStats,
    maintenanceSpendByProperty,
    topVendorsBySpend,
    leaseRows,
    recommendations: recommendations.slice(0, 3),
    error: err,
    partial: Boolean(invRes.error || recRes.error || venRes.error),
  }
}

/**
 * Portfolio expected monthly rent sum — reuse tenant monthly hint.
 * @param {object[]} tenants
 */
export function sumExpectedMonthlyRent(tenants) {
  let s = 0
  for (const t of tenants) {
    const m = tenantMonthlyRentHint(t)
    if (m != null && Number.isFinite(m)) s += m
  }
  return s
}
