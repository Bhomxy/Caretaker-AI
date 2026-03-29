import { supabase } from '../supabase'
import {
  normalizeComplaintPriority,
  normalizeComplaintStatusKey,
  pickField,
} from '../utils'

function tenantDisplayName(row) {
  return pickField(row, ['full_name', 'name']) ?? '—'
}

function propertyDisplayName(row) {
  return pickField(row, ['name', 'title', 'property_name']) ?? '—'
}

function vendorDisplayName(row) {
  return pickField(row, ['name', 'company_name']) ?? '—'
}

/**
 * @param {string} managerId
 */
export async function fetchComplaintsListBundle(managerId) {
  const { data: complaints, error: cErr } = await supabase
    .from('complaints')
    .select('*')
    .eq('manager_id', managerId)
    .order('created_at', { ascending: false })

  const errMsg = cErr?.message ?? null
  if (cErr) {
    return {
      rows: [],
      counts: { total: 0, open: 0, inProgress: 0, resolved: 0 },
      propertyOptions: [],
      vendorOptions: [],
      error: errMsg,
    }
  }

  const list = complaints ?? []
  const tenantIds = [...new Set(list.map((c) => c.tenant_id).filter(Boolean))]
  const propertyIds = [...new Set(list.map((c) => c.property_id).filter(Boolean))]
  const vendorIds = [...new Set(list.map((c) => c.vendor_id).filter(Boolean))]

  const [tenRes, propRes, venRes, allPropsRes, allVenRes] = await Promise.all([
    tenantIds.length
      ? supabase
          .from('tenants')
          .select('id, full_name, name, unit, unit_number')
          .eq('manager_id', managerId)
          .in('id', tenantIds)
      : Promise.resolve({ data: [] }),
    propertyIds.length
      ? supabase
          .from('properties')
          .select('*')
          .eq('manager_id', managerId)
          .in('id', propertyIds)
      : Promise.resolve({ data: [] }),
    vendorIds.length
      ? supabase
          .from('vendors')
          .select('id, name, company_name')
          .eq('manager_id', managerId)
          .in('id', vendorIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from('properties')
      .select('*')
      .eq('manager_id', managerId)
      .order('id', { ascending: true }),
    supabase
      .from('vendors')
      .select('id, name, company_name')
      .eq('manager_id', managerId)
      .order('id', { ascending: true }),
  ])

  const tenantMap = Object.fromEntries(
    (tenRes.data ?? []).map((t) => [
      t.id,
      {
        name: tenantDisplayName(t),
        unit: pickField(t, ['unit', 'unit_number']) ?? '—',
      },
    ])
  )
  const propertyMap = Object.fromEntries(
    (propRes.data ?? []).map((p) => [p.id, propertyDisplayName(p)])
  )
  const vendorMap = Object.fromEntries(
    (venRes.data ?? []).map((v) => [v.id, vendorDisplayName(v)])
  )

  const rows = list.map((c) => {
    const st = normalizeComplaintStatusKey(c.status)
    const pr = normalizeComplaintPriority(
      pickField(c, ['priority', 'severity', 'urgency'])
    )
    const tinfo = c.tenant_id ? tenantMap[c.tenant_id] : null
    return {
      id: c.id,
      raw: c,
      type: pickField(c, ['type', 'category', 'complaint_type']) ?? '—',
      statusKey: st,
      statusRaw: c.status,
      priorityKey: pr,
      tenantName: tinfo?.name ?? '—',
      unit: tinfo?.unit ?? pickField(c, ['unit', 'unit_number']) ?? '—',
      propertyName: c.property_id ? propertyMap[c.property_id] ?? '—' : '—',
      vendorName: c.vendor_id ? vendorMap[c.vendor_id] ?? '—' : '—',
      vendorId: c.vendor_id ?? null,
      created_at: c.created_at,
    }
  })

  let open = 0
  let inProgress = 0
  let resolved = 0
  for (const r of rows) {
    if (r.statusKey === 'open') open += 1
    else if (r.statusKey === 'in-progress') inProgress += 1
    else resolved += 1
  }

  const counts = {
    total: rows.length,
    open,
    inProgress,
    resolved,
  }

  const propertyOptions = (allPropsRes.data ?? []).map((p) => ({
    id: p.id,
    label: propertyDisplayName(p),
  }))

  const vendorOptions = (allVenRes.data ?? []).map((v) => ({
    id: v.id,
    label: vendorDisplayName(v),
  }))

  const extraErr =
    tenRes.error?.message ||
    propRes.error?.message ||
    venRes.error?.message ||
    allPropsRes.error?.message ||
    allVenRes.error?.message ||
    null

  return {
    rows,
    counts,
    propertyOptions,
    vendorOptions,
    error: extraErr,
  }
}

/**
 * @param {string} managerId
 * @param {string} complaintId
 * @param {Record<string, unknown>} patch
 */
export async function updateComplaint(managerId, complaintId, patch) {
  const body = {
    ...patch,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase
    .from('complaints')
    .update(body)
    .eq('id', complaintId)
    .eq('manager_id', managerId)

  return { error: error?.message ?? null }
}

/**
 * @param {string} managerId
 * @param {string[]} ids
 * @param {Record<string, unknown>} patch
 */
export async function bulkUpdateComplaints(managerId, ids, patch) {
  if (!ids.length) return { error: null }
  const body = {
    ...patch,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase
    .from('complaints')
    .update(body)
    .eq('manager_id', managerId)
    .in('id', ids)

  return { error: error?.message ?? null }
}

/**
 * @param {string} managerId
 * @param {string} complaintId
 */
export async function fetchComplaintDetailBundle(managerId, complaintId) {
  const { data: complaint, error: cErr } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', complaintId)
    .eq('manager_id', managerId)
    .maybeSingle()

  if (cErr) {
    return {
      complaint: null,
      tenant: null,
      property: null,
      assignedVendor: null,
      vendorOptions: [],
      error: cErr.message,
    }
  }
  if (!complaint) {
    return {
      complaint: null,
      tenant: null,
      property: null,
      assignedVendor: null,
      vendorOptions: [],
      error: null,
    }
  }

  const tid = complaint.tenant_id
  const pid = complaint.property_id
  const vid = complaint.vendor_id

  const [tenRes, propRes, venRes, vendorsRes] = await Promise.all([
    tid
      ? supabase
          .from('tenants')
          .select('*')
          .eq('id', tid)
          .eq('manager_id', managerId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    pid
      ? supabase
          .from('properties')
          .select('*')
          .eq('id', pid)
          .eq('manager_id', managerId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    vid
      ? supabase
          .from('vendors')
          .select('*')
          .eq('id', vid)
          .eq('manager_id', managerId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('vendors')
      .select('id, name, company_name')
      .eq('manager_id', managerId)
      .order('id', { ascending: true }),
  ])

  const vendorOptions = (vendorsRes.data ?? []).map((v) => ({
    id: v.id,
    label: vendorDisplayName(v),
  }))

  const errMsg =
    tenRes.error?.message ||
    propRes.error?.message ||
    venRes.error?.message ||
    vendorsRes.error?.message ||
    null

  return {
    complaint,
    tenant: tenRes.data ?? null,
    property: propRes.data ?? null,
    assignedVendor: venRes.data ?? null,
    vendorOptions,
    error: errMsg,
  }
}

/** Image / file URLs from complaint row (WhatsApp attachments). */
export function parseComplaintAttachmentUrls(row) {
  if (!row) return []
  const raw = pickField(row, [
    'attachments',
    'photo_urls',
    'images',
    'image_urls',
    'media_urls',
  ])
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw)
      return Array.isArray(p) ? p.map(String).filter(Boolean) : []
    } catch {
      return []
    }
  }
  return []
}
