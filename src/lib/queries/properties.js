import { supabase } from '../supabase'
import {
  leaseStatusForExpiry,
  normalizePropertyTypeForFilter,
  pickField,
  tenantMonthlyRentHint,
} from '../utils'

const TERMINAL_COMPLAINT = new Set(['resolved', 'closed', 'cancelled'])

function isOpenComplaintStatus(status) {
  const st = String(status ?? 'open')
    .toLowerCase()
    .replace(/-/g, '_')
  return !TERMINAL_COMPLAINT.has(st)
}

function propertyName(row) {
  return pickField(row, ['name', 'title', 'property_name']) ?? 'Untitled property'
}

function propertyLocation(row) {
  return pickField(row, ['location', 'address', 'area']) ?? '—'
}

function totalUnitsOnProperty(row) {
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

function expectedRevenueFromProperty(row) {
  const v = pickField(row, [
    'expected_monthly_revenue',
    'monthly_revenue',
    'expected_revenue',
  ])
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * @param {string} managerId
 * @returns {Promise<{ rows: object[], error: string | null }>}
 */
export async function fetchPropertiesList(managerId) {
  const [propRes, tenantRes, complaintRes] = await Promise.all([
    supabase
      .from('properties')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false }),
    supabase.from('tenants').select('*').eq('manager_id', managerId),
    supabase
      .from('complaints')
      .select('id, status, property_id')
      .eq('manager_id', managerId),
  ])

  const err =
    propRes.error?.message ||
    tenantRes.error?.message ||
    complaintRes.error?.message ||
    null
  if (propRes.error) {
    return { rows: [], error: err }
  }

  const tenants = tenantRes.data ?? []
  const complaints = complaintRes.data ?? []
  const properties = propRes.data ?? []

  const tenantsByProp = new Map()
  for (const t of tenants) {
    const pid = t.property_id
    if (!pid) continue
    if (!tenantsByProp.has(pid)) tenantsByProp.set(pid, [])
    tenantsByProp.get(pid).push(t)
  }

  const openComplaintsByProp = new Map()
  for (const c of complaints) {
    if (!c.property_id || !isOpenComplaintStatus(c.status)) continue
    openComplaintsByProp.set(
      c.property_id,
      (openComplaintsByProp.get(c.property_id) ?? 0) + 1
    )
  }

  const rows = properties.map((p, index) => {
    const tlist = tenantsByProp.get(p.id) ?? []
    const totalUnits = totalUnitsOnProperty(p)
    const occupied = tlist.length
    const vacant =
      totalUnits > 0 ? Math.max(0, totalUnits - occupied) : Math.max(0, 0)
    const fromTenants = tlist.reduce((s, t) => {
      const m = tenantMonthlyRentHint(t)
      return s + (m ?? 0)
    }, 0)
    const expected = expectedRevenueFromProperty(p)
    const revenueMonthly =
      expected != null && expected > 0 ? expected : fromTenants

    const rawType = pickField(p, ['property_type', 'type', 'category'])
    const typeKey = normalizePropertyTypeForFilter(rawType)

    return {
      id: p.id,
      raw: p,
      name: propertyName(p),
      location: propertyLocation(p),
      typeKey,
      typeLabel:
        typeKey === 'mixed-use'
          ? 'Mixed-use'
          : typeKey.charAt(0).toUpperCase() + typeKey.slice(1),
      totalUnits,
      occupied,
      vacant,
      openComplaints: openComplaintsByProp.get(p.id) ?? 0,
      revenueMonthly,
      managerLabel:
        pickField(p, ['manager_name', 'assigned_manager', 'manager']) ??
        'You',
      accentIndex: index % 4,
      occupancyPct:
        totalUnits > 0
          ? Math.min(100, Math.round((occupied / totalUnits) * 100))
          : 0,
    }
  })

  return { rows, error: tenantRes.error || complaintRes.error ? err : null }
}

/**
 * @param {string} managerId
 * @param {object} payload
 */
export async function insertProperty(managerId, payload) {
  const row = {
    manager_id: managerId,
    name: payload.name,
    location: payload.location,
    property_type: payload.propertyType,
    number_of_units: payload.numberOfUnits,
    expected_monthly_revenue:
      payload.expectedMonthlyRevenue != null &&
      payload.expectedMonthlyRevenue !== ''
        ? Number(payload.expectedMonthlyRevenue)
        : null,
  }

  const { data, error } = await supabase
    .from('properties')
    .insert(row)
    .select('id')

  if (error) return { id: null, error: error.message }
  const first = Array.isArray(data) ? data[0] : data
  return { id: first?.id ?? null, error: null }
}

async function fetchUnitsTable(propertyId) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('property_id', propertyId)

  if (error) return { data: [], failed: true }
  return { data: data ?? [], failed: false }
}

function unitLabelFromTenant(t) {
  const u = pickField(t, ['unit', 'unit_number', 'unit_label'])
  return u != null && String(u).trim() !== '' ? String(u).trim() : null
}

/**
 * @param {string} managerId
 * @param {string} propertyId
 */
export async function fetchPropertyDetailBundle(managerId, propertyId) {
  const { data: property, error: pErr } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .eq('manager_id', managerId)
    .maybeSingle()

  if (pErr) {
    return {
      property: null,
      tenants: [],
      complaints: [],
      units: [],
      error: pErr.message,
    }
  }
  if (!property) {
    return {
      property: null,
      tenants: [],
      complaints: [],
      units: [],
      error: null,
    }
  }

  const [tenRes, compRes, unitsTry] = await Promise.all([
    supabase
      .from('tenants')
      .select('*')
      .eq('manager_id', managerId)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true }),
    supabase
      .from('complaints')
      .select('*')
      .eq('manager_id', managerId)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false }),
    fetchUnitsTable(propertyId),
  ])

  const tenants = tenRes.data ?? []
  const complaints = compRes.data ?? []

  const errMsg =
    tenRes.error?.message ||
    compRes.error?.message ||
    null

  let units = []
  const tableRows = unitsTry.data
  if (!unitsTry.failed && tableRows.length > 0) {
    const tenantById = Object.fromEntries(
      tenants.map((t) => [t.id, t])
    )
    units = tableRows.map((u) => {
      const tid = u.tenant_id
      const tenant = tid ? tenantById[tid] : null
      const num =
        pickField(u, ['unit_number', 'label', 'name', 'code']) ?? '—'
      return {
        unitNumber: String(num),
        occupied: Boolean(tenant),
        tenantName: tenant
          ? pickField(tenant, ['full_name', 'name']) ?? '—'
          : null,
        rent: tenant ? tenantMonthlyRentHint(tenant) : null,
      }
    })
  } else {
    const total = totalUnitsOnProperty(property)
    const slotCount = Math.max(total, tenants.length, 1)
    const assigned = new Set()
    units = []
    for (let i = 1; i <= slotCount; i++) {
      const label = String(i)
      let tenant =
        tenants.find(
          (t) =>
            !assigned.has(t.id) &&
            (unitLabelFromTenant(t) === label ||
              unitLabelFromTenant(t) === `Unit ${label}`)
        ) ?? null
      if (!tenant) {
        tenant =
          tenants.find(
            (t) => !assigned.has(t.id) && unitLabelFromTenant(t) == null
          ) ?? null
      }
      if (!tenant) {
        tenant = tenants.find((t) => !assigned.has(t.id)) ?? null
      }
      if (tenant) assigned.add(tenant.id)
      units.push({
        unitNumber: label,
        occupied: Boolean(tenant),
        tenantName: tenant
          ? pickField(tenant, ['full_name', 'name']) ?? '—'
          : null,
        rent: tenant ? tenantMonthlyRentHint(tenant) : null,
      })
    }
  }

  const rawType = pickField(property, ['property_type', 'type', 'category'])
  const typeKey = normalizePropertyTypeForFilter(rawType)
  const totalUnits = totalUnitsOnProperty(property)
  const occupied = tenants.length
  const vacant =
    totalUnits > 0 ? Math.max(0, totalUnits - occupied) : 0
  const openComplaints = complaints.filter((c) =>
    isOpenComplaintStatus(c.status)
  ).length

  const summary = {
    name: propertyName(property),
    location: propertyLocation(property),
    typeKey,
    typeLabel:
      typeKey === 'mixed-use'
        ? 'Mixed-use'
        : typeKey.charAt(0).toUpperCase() + typeKey.slice(1),
    managerLabel:
      pickField(property, [
        'manager_name',
        'assigned_manager',
        'manager',
      ]) ?? 'You',
    totalUnits,
    occupied,
    vacant,
    openComplaints,
    accentIndex:
      (typeof propertyId === 'string'
        ? propertyId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
        : 0) % 4,
  }

  const leaseRows = tenants.map((t) => {
    const end = pickField(t, [
      'lease_expiry_date',
      'lease_expiry',
      'lease_end_date',
      'lease_end',
    ])
    const start = pickField(t, [
      'lease_start_date',
      'lease_start',
      'lease_begin',
    ])
    return {
      id: t.id,
      tenantName: pickField(t, ['full_name', 'name']) ?? '—',
      unit: pickField(t, ['unit', 'unit_number']) ?? '—',
      leaseStart: start,
      leaseEnd: end,
      leaseStatus: leaseStatusForExpiry(end),
    }
  })

  return {
    property,
    summary,
    tenants,
    complaints,
    units,
    leaseRows,
    error: errMsg,
  }
}
