import { useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import Toggle from '../../components/ui/Toggle'
import { FORM_INPUT_CLASS } from '../../lib/constants'
import {
  insertInboxMessage,
  updateInboxThread,
} from '../../lib/queries/inbox'

/**
 * @param {{
 *   managerId: string | null
 *   thread: object | null
 *   messages: object[]
 *   messagesLoading: boolean
 *   onReloadMessages: () => Promise<void> | void
 *   onThreadsRefresh: () => Promise<void> | void
 *   showToast: (msg: string, opts?: object) => void
 * }} props
 */
export default function ChatView({
  managerId,
  thread,
  messages,
  messagesLoading,
  onReloadMessages,
  onThreadsRefresh,
  showToast,
}) {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  if (!thread) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-bold text-ink-secondary">
          Select a thread to view messages
        </p>
        <p className="mt-1 max-w-sm text-xs font-medium text-ink-muted">
          You can pause the AI, reply manually, then hand the conversation back
          when you are done.
        </p>
      </div>
    )
  }

  const handleToggleAi = async (aiActive) => {
    if (!managerId) return
    setBusy(true)
    const { error } = await updateInboxThread(managerId, thread.id, {
      ai_active: aiActive,
    })
    setBusy(false)
    if (error) {
      showToast(error.message ?? 'Could not update thread.', {
        variant: 'error',
      })
      return
    }
    showToast(
      aiActive ? 'AI responses resumed for this thread.' : 'AI paused — you are in control.',
      { variant: 'info' }
    )
    await onThreadsRefresh()
  }

  const handleStatus = async (threadStatus) => {
    if (!managerId) return
    setBusy(true)
    const { error } = await updateInboxThread(managerId, thread.id, {
      thread_status: threadStatus,
    })
    setBusy(false)
    if (error) {
      showToast(error.message ?? 'Could not update status.', {
        variant: 'error',
      })
      return
    }
    await onThreadsRefresh()
  }

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || !managerId) return
    setBusy(true)
    const { error } = await insertInboxMessage(managerId, thread.id, {
      body: text,
      direction: 'outbound',
      isAi: false,
    })
    setBusy(false)
    if (error) {
      showToast(error.message ?? 'Message not sent.', { variant: 'error' })
      return
    }
    setDraft('')
    await onReloadMessages()
    await onThreadsRefresh()
  }

  const handBack = async () => {
    await handleToggleAi(true)
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name={thread.tenantName} size="lg" tone="light" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-ink">
              {thread.tenantName}
            </p>
            <p className="truncate text-xs font-medium text-ink-muted">
              {thread.unit} · {thread.propertyName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={thread.threadStatus}
              disabled={busy || !managerId}
              onChange={(e) => void handleStatus(e.target.value)}
              className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-bold text-ink outline-none focus:border-teal"
            >
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Toggle
            checked={thread.aiActive}
            disabled={busy || !managerId}
            onChange={(v) => void handleToggleAi(v)}
            label={thread.aiActive ? 'AI active' : 'Manager active'}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || thread.aiActive || !managerId}
            onClick={() => void handBack()}
          >
            Hand back to AI
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messagesLoading ? (
          <div className="space-y-2">
            <Skeleton className="ml-auto h-10 w-3/4 max-w-md" />
            <Skeleton className="h-10 w-3/4 max-w-md" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs font-semibold text-ink-muted">
            No messages loaded for this thread.
          </p>
        ) : (
          messages.map((m) => {
            const outbound = String(m.direction ?? '').toLowerCase() === 'outbound'
            const ai = Boolean(m.is_ai)
            return (
              <div
                key={m.id}
                className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-soft-xs ${
                    outbound
                      ? 'rounded-br-md bg-teal-d text-white'
                      : 'rounded-bl-md border border-border bg-card text-ink'
                  }`}
                >
                  {ai ? (
                    <span className="mb-1 block text-[10px] font-extrabold text-gold">
                      ✦ AI
                    </span>
                  ) : null}
                  {m.body}
                  <p
                    className={`mt-1 text-[10px] font-semibold ${
                      outbound ? 'text-white/80' : 'text-ink-muted'
                    }`}
                  >
                    {new Date(m.created_at).toLocaleString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message as manager…"
            className={FORM_INPUT_CLASS}
            disabled={busy || !managerId}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
          />
          <Button
            type="button"
            disabled={busy || !draft.trim() || !managerId}
            onClick={() => void handleSend()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
