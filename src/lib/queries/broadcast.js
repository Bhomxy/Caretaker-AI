import { supabase } from '../supabase'

/**
 * @param {string} managerId
 * @param {{
 *   templateKey: string
 *   bodyPreview: string
 *   recipientCount: number
 *   scheduledFor?: string | null
 *   status?: string
 * }} payload
 */
export async function insertBroadcastLog(managerId, payload) {
  const { error } = await supabase.from('broadcast_logs').insert({
    manager_id: managerId,
    template_key: payload.templateKey,
    body_preview: payload.bodyPreview,
    recipient_count: payload.recipientCount,
    scheduled_for: payload.scheduledFor ?? null,
    status: payload.status ?? 'sent',
  })
  return { error }
}

/**
 * @param {string} managerId
 */
export async function fetchBroadcastLogs(managerId) {
  const { data, error } = await supabase
    .from('broadcast_logs')
    .select('*')
    .eq('manager_id', managerId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { data: [], error }
  return { data: data ?? [], error: null }
}
