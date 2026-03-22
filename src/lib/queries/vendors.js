import { supabase } from '../supabase'
import {
  normalizeVendorTradeSlug,
  pickField,
  vendorTradeLabel,
} from '../utils'

const TERMINAL_COMPLAINT = new Set(['resolved', 'closed', 'cancelled'])

function isTerminalStatus(status) {
  const st = String(status ?? 'open').toLowerCase()
  return TERMINAL_COMPLAINT.has(st)
}

function vendorDisplayName(row) {
  return (
    pickField(row, ['name', 'company_name', 'business_name', 'full_name']) ??
    'Vendor'
  )
}

/** Exported for vendor detail job-cost UI. */
export function complaintJobCost(row) {
  const v = pickField(row, ['job_cost', 'cost', 'maintenance_cost', 'amount'])
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function readAssignedPropertyIds(vendorRow) {
  const raw = pickField(vendorRow, [
    'assigned_property_ids',
    'property_ids',
    'linked_property_ids',
    'assigned_properties',
  ])
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw)
      return Array.isArray(p) ? p.filter(Boolean) : []
    } catch {
      return []
    }
  }
  return []
}

function normalizeVendorStatus(raw) {
  const s = String(raw ?? 'available').toLowerCase()
  if (s.includes('busy')) return 'busy'
  if (s.includes('inactive')) return 'inactive'
  return 'available'
}

/**
 * @param {string} managerId
 */
export async function fetchVendorsList(managerId) {
  const [venRes, compRes, propRes] = await Promise.all([
    supabase
      .from('vendors')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false }),
    supabase
      .from('complaints')
      .select('vendor_id, status')
      .eq('manager_id', managerId),
    supabase
      .from('properties')
      .select('id, name, title, property_name')
      .eq('manager_id', managerId)
      .order('id', { ascending: true }),
  ])

  const err =
    venRes.error?.message || compRes.error?.message || propRes.error?.message || null
  if (venRes.error) {
    return { rows: [], propertyOptions: [], error: err }
  }

  const propertyOptions = (propRes.data ?? []).map((p) => ({
    id: p.id,
    label: pickField(p, ['name', 'title', 'property_name']) ?? '—',
  }))

  const jobsDoneByVendor = {}
  for (const c of compRes.data ?? []) {
    if (!c.vendor_id || !isTerminalStatus(c.status)) continue
    jobsDoneByVendor[c.vendor_id] = (jobsDoneByVendor[c.vendor_id] ?? 0) + 1
  }

  const rows = (venRes.data ?? []).map((v) => {
    const tradeRaw = pickField(v, ['trade', 'trade_type', 'category', 'specialty'])
    const tradeSlug = normalizeVendorTradeSlug(tradeRaw)
    const ratingRaw = pickField(v, ['rating', 'star_rating', 'avg_rating', 'stars'])
    const rating =
      ratingRaw != null && ratingRaw !== '' ? Number(ratingRaw) : null
    return {
      id: v.id,
      raw: v,
      name: vendorDisplayName(v),
      tradeSlug,
      tradeLabel: vendorTradeLabel(tradeSlug),
      phone: pickField(v, ['phone', 'phone_number', 'mobile']) ?? '—',
      status: normalizeVendorStatus(
        pickField(v, ['status', 'availability', 'vendor_status'])
      ),
      jobsDone: jobsDoneByVendor[v.id] ?? 0,
      rating: Number.isFinite(rating) ? rating : null,
    }
  })

  return {
    rows,
    propertyOptions,
    error: compRes.error || propRes.error ? err : null,
  }
}

/**
 * @param {string} managerId
 * @param {object} payload
 */
export async function insertVendor(managerId, payload) {
  const row = {
    manager_id: managerId,
    name: payload.name.trim(),
    trade: payload.trade,
    phone: payload.phone.trim(),
    email: payload.email?.trim() || null,
    notes: payload.notes?.trim() || null,
    status: 'available',
  }

  const { data, error } = await supabase.from('vendors').insert(row).select('id')

  if (error) return { id: null, error: error.message }

  const first = Array.isArray(data) ? data[0] : data
  const id = first?.id ?? null
  if (!id) return { id: null, error: 'Could not read new vendor id.' }

  if (payload.propertyIds?.length) {
    const { error: uErr } = await supabase
      .from('vendors')
      .update({ assigned_properties: JSON.stringify(payload.propertyIds) })
      .eq('id', id)
      .eq('manager_id', managerId)

    if (uErr) {
      return {
        id,
        error: `Vendor saved; property links failed (${uErr.message}). Add a text/json column assigned_properties if missing.`,
      }
    }
  }

  return { id, error: null }
}

/**
 * @param {string} managerId
 * @param {string} complaintId
 * @param {{ cost: string | number, notes?: string }} payload
 */
export async function updateComplaintJobCost(managerId, complaintId, payload) {
  const n = Number(payload.cost)
  if (!Number.isFinite(n) || n < 0) {
    return { error: 'Enter a valid cost amount.' }
  }

  const updates = {
    job_cost: n,
    updated_at: new Date().toISOString(),
  }
  const rawNotes = payload.notes
  const notesTrim = typeof rawNotes === 'string' ? rawNotes.trim() : undefined
  if (notesTrim) updates.job_notes = notesTrim
  else if (rawNotes !== undefined) updates.job_notes = null

  let { error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('id', complaintId)
    .eq('manager_id', managerId)

  if (error) {
    const alt = { maintenance_cost: n, updated_at: updates.updated_at }
    if ('job_notes' in updates) alt.job_notes = updates.job_notes
    const retry = await supabase
      .from('complaints')
      .update(alt)
      .eq('id', complaintId)
      .eq('manager_id', managerId)
    if (retry.error) return { error: retry.error.message }
  }

  return { error: null }
}

/**
 * @param {string} managerId
 * @param {string} vendorId
 */
export async function fetchVendorDetailBundle(managerId, vendorId) {
  const { data: vendor, error: vErr } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .eq('manager_id', managerId)
    .maybeSingle()

  if (vErr) {
    return {
      vendor: null,
      assignedProperties: [],
      activeComplaints: [],
      completedComplaints: [],
      totalSpend: 0,
      error: vErr.message,
    }
  }
  if (!vendor) {
    return {
      vendor: null,
      assignedProperties: [],
      activeComplaints: [],
      completedComplaints: [],
      totalSpend: 0,
      error: null,
    }
  }

  const [compRes, propRes] = await Promise.all([
    supabase
      .from('complaints')
      .select('*')
      .eq('manager_id', managerId)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false }),
    supabase
      .from('properties')
      .select('id, name, title, property_name')
      .eq('manager_id', managerId),
  ])

  const propMap = Object.fromEntries(
    (propRes.data ?? []).map((p) => [
      p.id,
      pickField(p, ['name', 'title', 'property_name']) ?? '—',
    ])
  )

  const assignedIds = readAssignedPropertyIds(vendor)
  const assignedProperties = assignedIds.map((id) => ({
    id,
    name: propMap[id] ?? '—',
  }))

  const complaints = compRes.error ? [] : (compRes.data ?? [])
  const activeComplaints = complaints.filter((c) => !isTerminalStatus(c.status))
  const completedComplaints = complaints.filter((c) => isTerminalStatus(c.status))

  let totalSpend = 0
  for (const c of completedComplaints) {
    const cost = complaintJobCost(c)
    if (cost != null) totalSpend += cost
  }

  const tradeRaw = pickField(vendor, ['trade', 'trade_type', 'category'])
  const tradeSlug = normalizeVendorTradeSlug(tradeRaw)
  const ratingRaw = pickField(vendor, ['rating', 'star_rating', 'avg_rating'])
  const rating =
    ratingRaw != null && ratingRaw !== '' ? Number(ratingRaw) : null

  const summary = {
    name: vendorDisplayName(vendor),
    tradeLabel: vendorTradeLabel(tradeSlug),
    tradeSlug,
    phone: pickField(vendor, ['phone', 'phone_number', 'mobile']) ?? '—',
    email: pickField(vendor, ['email', 'email_address']) ?? '—',
    notes: pickField(vendor, ['notes', 'description']) ?? '—',
    status: normalizeVendorStatus(
      pickField(vendor, ['status', 'availability', 'vendor_status'])
    ),
    jobsDone: completedComplaints.length,
    rating: Number.isFinite(rating) ? rating : null,
  }

  return {
    vendor,
    summary,
    assignedProperties,
    activeComplaints,
    completedComplaints,
    totalSpend,
    error: compRes.error?.message || propRes.error?.message || null,
  }
}
