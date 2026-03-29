import { supabase } from '../supabase'
import {
  normalizeTenantPaymentStatus,
  pickField,
  tenantMonthlyRentHint,
  todayIsoDate,
} from '../utils'

/** @param {string | null | undefined} raw */
function normalizeInvoiceStatusKey(raw) {
  const s = String(raw ?? '')
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .trim()
  if (
    s.includes('await') ||
    s.includes('pending-approval') ||
    s === 'pendingapproval'
  ) {
    return 'awaiting-approval'
  }
  if (s.includes('disput')) return 'disputed'
  if (s.includes('paid') || s === 'cleared') return 'paid'
  if (s.includes('sent') || s.includes('invoice')) return 'invoice-sent'
  return s || 'pending'
}

/** @param {string | null | undefined} st */
export function isInvoiceAwaitingApproval(st) {
  const k = normalizeInvoiceStatusKey(st)
  return k === 'awaiting-approval'
}

function firstOfNextMonthIso() {
  const d = new Date()
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return next.toISOString().slice(0, 10)
}

/** @param {string} dueIso */
function daysFromToday(dueIso) {
  const due = new Date(`${dueIso}T12:00:00`)
  const t = new Date(`${todayIsoDate()}T12:00:00`)
  return Math.round((due.getTime() - t.getTime()) / 86400000)
}

function formatDaysLabel(statusKey, days) {
  if (statusKey === 'awaiting-approval') return '—'
  if (statusKey === 'paid') return '—'
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`
  if (days === 0) return 'Due today'
  return `${days} day${days === 1 ? '' : 's'} until due`
}

function lastAiActionForRow(statusKey, latestInv) {
  if (statusKey === 'awaiting-approval') {
    return 'Tenant confirmation received on WhatsApp'
  }
  if (statusKey === 'disputed') {
    return 'Follow-up queued for tenant'
  }
  if (statusKey === 'paid') {
    const sent = pickField(latestInv ?? {}, ['confirmation_at', 'updated_at', 'created_at'])
    return sent ? `Receipt sent · ${new Date(sent).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}` : 'Receipt sent'
  }
  if (statusKey === 'overdue') {
    return 'Auto reminder sent this week'
  }
  if (statusKey === 'invoice-sent' || statusKey === 'due-soon') {
    const issued = pickField(latestInv ?? {}, ['issued_at', 'created_at'])
    return issued
      ? `Invoice sent · ${new Date(issued).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`
      : 'Invoice sent by AI'
  }
  return 'Scheduled reminder before due date'
}

/**
 * @param {object} tenant
 * @param {object | null} latestInv
 * @returns {{ statusKey: string, dueDate: string, days: number, lastAiAction: string }}
 */
function rentRollStatusForTenant(tenant, latestInv) {
  const invSt = latestInv ? normalizeInvoiceStatusKey(latestInv.status) : ''
  const tenantPay = normalizeTenantPaymentStatus(
    pickField(tenant, ['payment_status', 'status', 'rent_status'])
  )

  const dueRaw = pickField(latestInv ?? {}, ['due_date', 'dueDate'])
  const dueDate =
    dueRaw != null && String(dueRaw).trim() !== ''
      ? String(dueRaw).slice(0, 10)
      : firstOfNextMonthIso()

  const days = daysFromToday(dueDate)

  if (latestInv && isInvoiceAwaitingApproval(latestInv.status)) {
    return {
      statusKey: 'awaiting-approval',
      dueDate,
      days,
      lastAiAction: lastAiActionForRow('awaiting-approval', latestInv),
    }
  }

  if (invSt === 'disputed') {
    return {
      statusKey: 'disputed',
      dueDate,
      days,
      lastAiAction: lastAiActionForRow('disputed', latestInv),
    }
  }

  if (tenantPay === 'paid' && (invSt === 'paid' || !latestInv || invSt === '')) {
    return {
      statusKey: 'paid',
      dueDate,
      days,
      lastAiAction: lastAiActionForRow('paid', latestInv),
    }
  }

  if (invSt === 'paid') {
    return {
      statusKey: 'paid',
      dueDate,
      days,
      lastAiAction: lastAiActionForRow('paid', latestInv),
    }
  }

  if (tenantPay === 'overdue' && (!latestInv || invSt === 'invoice-sent' || invSt === 'pending')) {
    return {
      statusKey: 'overdue',
      dueDate,
      days,
      lastAiAction: lastAiActionForRow('overdue', latestInv),
    }
  }

  if (latestInv && (invSt === 'invoice-sent' || invSt === 'pending')) {
    if (days < 0) {
      return {
        statusKey: 'overdue',
        dueDate,
        days,
        lastAiAction: lastAiActionForRow('overdue', latestInv),
      }
    }
    if (days <= 7) {
      return {
        statusKey: 'due-soon',
        dueDate,
        days,
        lastAiAction: lastAiActionForRow('due-soon', latestInv),
      }
    }
    return {
      statusKey: 'invoice-sent',
      dueDate,
      days,
      lastAiAction: lastAiActionForRow('invoice-sent', latestInv),
    }
  }

  if (days < 0) {
    return {
      statusKey: 'overdue',
      dueDate,
      days,
      lastAiAction: lastAiActionForRow('overdue', latestInv),
    }
  }
  if (days <= 7) {
    return {
      statusKey: 'due-soon',
      dueDate,
      days,
      lastAiAction: lastAiActionForRow('due-soon', latestInv),
    }
  }
  return {
    statusKey: 'upcoming',
    dueDate,
    days,
    lastAiAction: lastAiActionForRow('upcoming', latestInv),
  }
}

const RENT_SORT = {
  'awaiting-approval': 0,
  disputed: 1,
  overdue: 2,
  'due-soon': 3,
  'invoice-sent': 4,
  pending: 5,
  upcoming: 6,
  paid: 7,
}

function startOfCurrentMonthIso() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}

function isDueThisCalendarMonth(dueIso) {
  const d = new Date(`${dueIso}T12:00:00`)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  )
}

/**
 * @param {string} managerId
 */
export async function fetchPaymentsBundle(managerId) {
  const [tenRes, propRes, invRes, recRes, payRes] = await Promise.all([
    supabase
      .from('tenants')
      .select('*')
      .eq('manager_id', managerId)
      .order('full_name', { ascending: true }),
    supabase
      .from('properties')
      .select('*')
      .eq('manager_id', managerId),
    supabase
      .from('invoices')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false }),
    supabase
      .from('receipts')
      .select('*')
      .eq('manager_id', managerId)
      .order('sent_at', { ascending: false }),
    supabase
      .from('payments')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false }),
  ])

  const errMsg =
    tenRes.error?.message ||
    propRes.error?.message ||
    invRes.error?.message ||
    null

  const partial =
    Boolean(recRes.error?.message) ||
    Boolean(payRes.error?.message) ||
    Boolean(propRes.error?.message)

  const tenants = tenRes.data ?? []
  const properties = propRes.data ?? []
  const invoices = invRes.data ?? []
  const receipts = recRes.error ? [] : recRes.data ?? []
  const payments = payRes.error ? [] : payRes.data ?? []

  const propMap = Object.fromEntries(
    properties.map((p) => [
      p.id,
      pickField(p, ['name', 'title', 'property_name']) ?? '—',
    ])
  )

  const latestInvByTenant = {}
  for (const inv of invoices) {
    const tid = inv.tenant_id
    if (!tid) continue
    if (!latestInvByTenant[tid]) latestInvByTenant[tid] = inv
  }

  const monthStart = startOfCurrentMonthIso()
  let collectedMonth = 0
  for (const p of payments) {
    const ca = pickField(p, ['created_at', 'paid_at'])
    if (!ca || new Date(ca).getTime() < new Date(monthStart).getTime()) continue
    const amt = Number(pickField(p, ['amount', 'amount_ngn', 'total']) ?? 0)
    if (Number.isFinite(amt)) collectedMonth += amt
  }

  let totalExpected = 0
  for (const t of tenants) {
    const m = tenantMonthlyRentHint(t)
    if (m != null && Number.isFinite(m)) totalExpected += m
  }

  const outstanding = Math.max(0, totalExpected - collectedMonth)

  let dueThisMonth = 0
  const rentRollRows = tenants.map((t) => {
    const latestInv = latestInvByTenant[t.id] ?? null
    const { statusKey, dueDate, days, lastAiAction } = rentRollStatusForTenant(
      t,
      latestInv
    )
    if (
      isDueThisCalendarMonth(dueDate) &&
      statusKey !== 'paid' &&
      statusKey !== 'awaiting-approval'
    ) {
      dueThisMonth += 1
    }
    const pid = t.property_id
    const charge = tenantMonthlyRentHint(t)
    return {
      tenantId: t.id,
      tenantName: pickField(t, ['full_name', 'name']) ?? '—',
      unit: pickField(t, ['unit', 'unit_number']) ?? '—',
      propertyId: pid,
      propertyName: pid ? propMap[pid] ?? '—' : '—',
      chargeAmount: charge,
      dueDate,
      statusKey,
      lastAiAction,
      daysLabel: formatDaysLabel(statusKey, days),
      sortRank: RENT_SORT[statusKey] ?? 99,
    }
  })

  rentRollRows.sort((a, b) => {
    if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank
    return a.tenantName.localeCompare(b.tenantName)
  })

  const tenantById = Object.fromEntries(
    tenants.map((x) => [
      x.id,
      {
        name: pickField(x, ['full_name', 'name']) ?? '—',
        unit: pickField(x, ['unit', 'unit_number']) ?? '—',
        propertyId: x.property_id,
      },
    ])
  )

  const approvalsRows = invoices
    .filter((inv) => isInvoiceAwaitingApproval(inv.status))
    .map((inv) => {
      const info = tenantById[inv.tenant_id] ?? {}
      const pid = info.propertyId
      return {
        id: inv.id,
        tenantId: inv.tenant_id,
        tenantName: info.name ?? '—',
        unit: info.unit ?? '—',
        propertyName: pid ? propMap[pid] ?? '—' : '—',
        amount: inv.amount,
        confirmation:
          pickField(inv, ['tenant_confirmation', 'confirmation_message']) ??
          '—',
        confirmedAt:
          pickField(inv, ['confirmation_at', 'updated_at', 'created_at']) ??
          null,
      }
    })
    .sort((a, b) => {
      const ta = a.confirmedAt ? new Date(a.confirmedAt).getTime() : 0
      const tb = b.confirmedAt ? new Date(b.confirmedAt).getTime() : 0
      return tb - ta
    })

  const invoiceRows = invoices.map((inv) => {
    const info = tenantById[inv.tenant_id] ?? {}
    const pid = info.propertyId
    return {
      id: inv.id,
      tenantId: inv.tenant_id,
      tenantName: info.name ?? '—',
      unit: info.unit ?? '—',
      propertyName: pid ? propMap[pid] ?? '—' : '—',
      amount: inv.amount,
      issueDate:
        pickField(inv, ['issued_at', 'created_at']) ?? inv.created_at,
      dueDate: inv.due_date,
      status: normalizeInvoiceStatusKey(inv.status),
      pdfUrl: inv.pdf_url ?? null,
    }
  })

  const receiptRows = receipts.map((r) => {
    const info = tenantById[r.tenant_id] ?? {}
    const pid = info.propertyId
    return {
      id: r.id,
      tenantId: r.tenant_id,
      tenantName: info.name ?? '—',
      unit: info.unit ?? '—',
      propertyName: pid ? propMap[pid] ?? '—' : '—',
      amount: r.amount,
      paymentDate: r.payment_date,
      sentAt: r.sent_at,
      pdfUrl: r.pdf_url ?? null,
      reference: r.reference,
    }
  })

  const propertyOptions = properties.map((p) => ({
    id: p.id,
    label: pickField(p, ['name', 'title', 'property_name']) ?? '—',
  }))

  return {
    rentRollRows,
    approvalsRows,
    invoiceRows,
    receiptRows,
    summary: {
      totalExpected,
      collectedMonth,
      outstanding,
      dueThisMonth,
    },
    propertyOptions,
    error: errMsg,
    partial: Boolean(partial && !errMsg),
  }
}

/**
 * @param {string} managerId
 * @param {string} invoiceId
 */
export async function approveInvoice(managerId, invoiceId) {
  const { data: inv, error: fe } = await supabase
    .from('invoices')
    .select('*')
    .eq('manager_id', managerId)
    .eq('id', invoiceId)
    .maybeSingle()

  if (fe) return { error: fe }
  if (!inv) return { error: new Error('Invoice not found.') }

  const { error: uErr } = await supabase
    .from('invoices')
    .update({ status: 'paid' })
    .eq('id', invoiceId)
    .eq('manager_id', managerId)

  if (uErr) return { error: uErr }

  if (inv.tenant_id) {
    await supabase
      .from('tenants')
      .update({ payment_status: 'paid' })
      .eq('id', inv.tenant_id)
      .eq('manager_id', managerId)
  }

  const amt = Number(pickField(inv, ['amount']) ?? 0)
  const { error: rErr } = await supabase.from('receipts').insert({
    manager_id: managerId,
    tenant_id: inv.tenant_id,
    invoice_id: invoiceId,
    amount: Number.isFinite(amt) ? amt : null,
    payment_date: todayIsoDate(),
    reference:
      pickField(inv, ['reference']) ??
      `RCPT-${String(invoiceId).replace(/-/g, '').slice(0, 8)}`,
    pdf_url: null,
  })

  if (rErr) return { error: rErr }

  await supabase.from('payments').insert({
    manager_id: managerId,
    tenant_id: inv.tenant_id,
    amount: Number.isFinite(amt) ? amt : null,
    metadata: { source: 'approval', invoice_id: invoiceId },
  })

  return { error: null }
}

/**
 * @param {string} managerId
 * @param {string} invoiceId
 */
export async function queryInvoice(managerId, invoiceId) {
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'disputed' })
    .eq('id', invoiceId)
    .eq('manager_id', managerId)

  if (error) return { error }
  return { error: null }
}

/**
 * @param {string} managerId
 * @param {string[]} invoiceIds
 */
export async function bulkApproveInvoices(managerId, invoiceIds) {
  for (const id of invoiceIds) {
    const { error } = await approveInvoice(managerId, id)
    if (error) return { error }
  }
  return { error: null }
}
