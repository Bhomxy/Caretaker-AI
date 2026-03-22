import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'

/** PRD §7 — Communication. */
export default function BroadcastPage() {
  return (
    <Card title="Broadcast">
      <EmptyState
        icon="📣"
        title="Broadcast messages"
        subtitle="Send portfolio-wide updates to tenants once messaging is connected."
      />
    </Card>
  )
}
