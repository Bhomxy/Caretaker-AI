import { supabase } from '../supabase'
import {
  normalizeTenantPaymentStatus,
  pickField,
} from '../utils'

function propertyDisplayName(row) {
  return pickField(row, ['name', 'title', 'property_name']) ?? '—'
}

/**
 * @param {string} managerId
 */
export async function fetchTenantListBundle(managerId) {
  const [tenRes, propRes, compRes] = await Promise.all([
    supabase
      .from('tenants')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false }),
    supabase
      .from('properties')
      .select('*')
      .eq('manager_id', managerId)
      .order('id', { ascending: true }),
    supabase
      .from('complaints')
      .select('tenant_id')
      .eq('manager_id', managerId),
  ])

  const err =
    tenRes.error?.message ||
    propRes.error?.message ||
    compRes.error?.message ||
    null

  if (tenRes.error) {
    return { rows: [], propertyOptions: [], error: err }
  }

  const tenants = tenRes.data ?? []
  const properties = propRes.data ?? []
  const propMap = Object.fromEntries(
    properties.map((p) => [p.id, propertyDisplayName(p)])
  )

  const complaintCount = {}
  for (const c of compRes.data ?? []) {
    if (!c.tenant_id) continue
    complaintCount[c.tenant_id] = (complaintCount[c.tenant_id] ?? 0) + 1
  }

  const rows = tenants.map((t) => {
    const pid = t.property_id
    const statusRaw = pickField(t, ['payment_status', 'status', 'rent_status'])
    return {
      id: t.id,
      raw: t,
      name: pickField(t, ['full_name', 'name']) ?? '—',
      sinceLabel: pickField(t, ['created_at'])
        ? new Date(t.created_at).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '—',
      unit: pickField(t, ['unit', 'unit_number']) ?? '—',
      propertyId: pid,
      propertyName: pid ? propMap[pid] ?? '—' : '—',
      serviceChargeAnnual: pickField(t, [
        'annual_service_charge',
        'annual_rent',
        'service_charge_annual',
      ]),
      statusKey: normalizeTenantPaymentStatus(statusRaw),
      complaintsCount: complaintCount[t.id] ?? 0,
      phone: pickField(t, ['phone', 'phone_number', 'mobile']) ?? '—',
    }
  })

  const propertyOptions = properties.map((p) => ({
    id: p.id,
    label: propertyDisplayName(p),
  }))

  return {
    rows,
    propertyOptions,
    error: propRes.error || compRes.error ? err : null,
  }
}

/**
 * @param {string} managerId
 * @param {string} tenantId
 */
export async function fetchTenantDetailBundle(managerId, tenantId) {
  const { data: tenant, error: tErr } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .eq('manager_id', managerId)
    .maybeSingle()

  if (tErr) {
    return {
      tenant: null,
      propertyName: null,
      complaints: [],
      invoices: [],
      error: tErr.message,
    }
  }
  if (!tenant) {
    return {
      tenant: null,
      propertyName: null,
      complaints: [],
      invoices: [],
      error: null,
    }
  }

  const pid = tenant.property_id

  const [propRes, compRes, invRes] = await Promise.all([
    pid
      ? supabase
          .from('properties')
          .select('*')
          .eq('id', pid)
          .eq('manager_id', managerId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('complaints')
      .select('*')
      .eq('manager_id', managerId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('*')
      .eq('manager_id', managerId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false }),
  ])

  const propertyName = propRes.data
    ? propertyDisplayName(propRes.data)
    : null

  const errMsg =
    compRes.error?.message || invRes.error?.message || null

  return {
    tenant,
    propertyName,
    complaints: compRes.error ? [] : (compRes.data ?? []),
    invoices: invRes.error ? [] : (invRes.data ?? []),
    error: errMsg,
  }
}

/**
 * @param {string} managerId
 * @param {object} payload
 */
export async function insertTenant(managerId, payload) {
  const row = {
    manager_id: managerId,
    full_name: payload.fullName,
    phone: payload.phone.trim(),
    property_id: payload.propertyId,
    unit: payload.unit.trim(),
    annual_service_charge:
      payload.annualServiceCharge !== '' &&
      payload.annualServiceCharge != null
        ? Number(payload.annualServiceCharge)
        : null,
    caution_deposit:
      payload.cautionDeposit !== '' && payload.cautionDeposit != null
        ? Number(payload.cautionDeposit)
        : null,
    lease_start_date: payload.leaseStart || null,
    lease_expiry_date: payload.leaseExpiry || null,
    payment_status: payload.paymentStatus,
  }

  const { data, error } = await supabase.from('tenants').insert(row).select('id')

  if (error) return { id: null, error: error.message }
  const first = Array.isArray(data) ? data[0] : data
  return { id: first?.id ?? null, error: null }
}
