import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import { useApp } from '../../hooks/useApp'
import { useInbox, useInboxMessages } from '../../hooks/useInbox'
import ChatView from './ChatView'
import ThreadList from './ThreadList'

/** PRD §8.6 */
export default function InboxPage() {
  const { managerId, showToast } = useApp()
  const { threads, loading, error, refetchThreads } = useInbox(managerId)
  const [selectedId, setSelectedId] = useState(null)

  const { messages, loading: msgLoading, error: msgErr, reload } =
    useInboxMessages(managerId, selectedId)

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedId) ?? null,
    [threads, selectedId]
  )

  useEffect(() => {
    if (selectedId && !threads.some((t) => t.id === selectedId)) {
      queueMicrotask(() => setSelectedId(null))
    }
  }, [threads, selectedId])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,340px)_1fr]">
      <Card title="Threads" bodyClassName="p-0 overflow-hidden">
        <ThreadList
          threads={threads}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </Card>
      <Card title="Conversation" bodyClassName="p-0 overflow-hidden">
        {msgErr ? (
          <p
            className="border-b border-border px-4 py-2 text-xs font-semibold text-red-600"
            role="alert"
          >
            {msgErr}
          </p>
        ) : null}
        <ChatView
          managerId={managerId}
          thread={selectedThread}
          messages={messages}
          messagesLoading={msgLoading}
          onReloadMessages={() => reload()}
          onThreadsRefresh={() => refetchThreads()}
          showToast={showToast}
        />
      </Card>
    </div>
  )
}
