import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'

/** PRD §7 — Communication. Full inbox ships post-MVP. */
export default function InboxPage() {
  return (
    <Card title="Inbox">
      <EmptyState
        icon="💬"
        title="Inbox is almost here"
        subtitle="WhatsApp threads and AI handoff will appear in this space."
      />
    </Card>
  )
}
