import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'

/** PRD §7 — Account. */
export default function SettingsPage() {
  return (
    <Card title="Settings">
      <EmptyState
        icon="⚙️"
        title="Account & preferences"
        subtitle="Profile, notifications, and team access will be configured here."
      />
    </Card>
  )
}
