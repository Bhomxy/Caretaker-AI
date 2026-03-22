import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'

/** PRD §7 — Operations. */
export default function InsightsPage() {
  return (
    <Card title="AI Insights">
      <EmptyState
        icon="📊"
        title="Portfolio intelligence"
        subtitle="Spend, complaints, and trends from Caretaker AI will show here."
      />
    </Card>
  )
}
