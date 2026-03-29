import { supabase } from '../supabase'
import { pickField } from '../utils'

/**
 * @param {string} managerId
 */
export async function fetchInboxThreadsBundle(managerId) {
  const { data: threads, error: tErr } = await supabase
    .from('inbox_threads')
    .select('*')
    .eq('manager_id', managerId)
    .order('last_message_at', { ascending: false })

  if (tErr) {
    return { threads: [], tenantMap: {}, propertyMap: {}, error: tErr.message }
  }

  const list = threads ?? []
  const tenantIds = [...new Set(list.map((t) => t.tenant_id).filter(Boolean))]

  const [tenRes, propRes] = await Promise.all([
    tenantIds.length
      ? supabase
          .from('tenants')
          .select('id, full_name, name, unit, unit_number, property_id, phone')
          .in('id', tenantIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from('properties')
      .select('*')
      .eq('manager_id', managerId),
  ])

  const tenantMap = Object.fromEntries(
    (tenRes.data ?? []).map((t) => [
      t.id,
      {
        name: pickField(t, ['full_name', 'name']) ?? '—',
        unit: pickField(t, ['unit', 'unit_number']) ?? '—',
        propertyId: t.property_id,
        phone: pickField(t, ['phone']) ?? '—',
      },
    ])
  )

  const propertyMap = Object.fromEntries(
    (propRes.data ?? []).map((p) => [
      p.id,
      pickField(p, ['name', 'title', 'property_name']) ?? '—',
    ])
  )

  const rows = list.map((th) => {
    const t = th.tenant_id ? tenantMap[th.tenant_id] : null
    const pid = t?.propertyId
    return {
      id: th.id,
      tenantId: th.tenant_id,
      tenantName: t?.name ?? 'Unknown tenant',
      unit: t?.unit ?? '—',
      propertyName: pid ? propertyMap[pid] ?? '—' : '—',
      preview: th.last_message_preview ?? '—',
      lastAt: th.last_message_at,
      unread: Number(th.unread_count ?? 0),
      aiActive: Boolean(th.ai_active),
      threadStatus: String(th.thread_status ?? 'open'),
    }
  })

  return {
    threads: rows,
    tenantMap,
    propertyMap,
    error: propRes.error?.message ?? null,
  }
}

/**
 * @param {string} managerId
 * @param {string} threadId
 */
export async function fetchInboxMessages(managerId, threadId) {
  const { data: th, error: thErr } = await supabase
    .from('inbox_threads')
    .select('id')
    .eq('manager_id', managerId)
    .eq('id', threadId)
    .maybeSingle()

  if (thErr) return { data: [], error: thErr }
  if (!th) return { data: [], error: new Error('Thread not found.') }

  const { data, error } = await supabase
    .from('inbox_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) return { data: [], error }
  return { data: data ?? [], error: null }
}

/**
 * @param {string} managerId
 * @param {string} threadId
 * @param {Record<string, unknown>} patch
 */
export async function updateInboxThread(managerId, threadId, patch) {
  const { error } = await supabase
    .from('inbox_threads')
    .update(patch)
    .eq('id', threadId)
    .eq('manager_id', managerId)

  return { error }
}

/**
 * @param {string} managerId
 * @param {string} threadId
 * @param {{ body: string; direction?: string; isAi?: boolean }} payload
 */
export async function insertInboxMessage(managerId, threadId, payload) {
  const { data: th, error: thErr } = await supabase
    .from('inbox_threads')
    .select('id')
    .eq('manager_id', managerId)
    .eq('id', threadId)
    .maybeSingle()

  if (thErr) return { error: thErr }
  if (!th) return { error: new Error('Thread not found.') }

  const { error } = await supabase.from('inbox_messages').insert({
    thread_id: threadId,
    body: payload.body,
    direction: payload.direction ?? 'outbound',
    is_ai: payload.isAi ?? false,
  })

  if (error) return { error }

  const preview =
    payload.body.length > 80 ? `${payload.body.slice(0, 80)}…` : payload.body
  await supabase
    .from('inbox_threads')
    .update({
      last_message_preview: preview,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', threadId)
    .eq('manager_id', managerId)

  return { error: null }
}
