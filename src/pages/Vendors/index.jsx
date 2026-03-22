import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'

/** PRD §7 — Operations. Phase 8 will add vendor management. */
export default function VendorsPage() {
  return (
    <Card title="Vendors">
      <EmptyState
        icon="🔧"
        title="Vendor directory"
        subtitle="Plumbers, electricians, and AC techs will be managed here."
      />
    </Card>
  )
}
