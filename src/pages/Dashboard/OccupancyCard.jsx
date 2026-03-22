import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'

/**
 * Donut + per-property bars — caretaker-ai.html style (PRD §8.1 occupancy).
 * @param {{
 *   occupancy: {
 *     totalUnits: number
 *     occupiedUnits: number
 *     vacantUnits: number
 *     byProperty: { id: string; name: string; occupied: number; total: number }[]
 *   }
 *   loading: boolean
 * }} props
 */
export default function OccupancyCard({ occupancy, loading }) {
  const navigate = useNavigate()
  const { totalUnits, occupiedUnits, vacantUnits, byProperty } = occupancy

  if (loading) {
    return (
      <Card title="Occupancy">
        <Skeleton className="h-40 w-full" />
      </Card>
    )
  }

  if (!totalUnits) {
    return (
      <Card title="Occupancy">
        <EmptyState
          icon="🏢"
          title="No units on file"
          subtitle="Add properties with unit counts to see portfolio occupancy."
        />
      </Card>
    )
  }

  const pct = Math.min(100, Math.round((occupiedUnits / totalUnits) * 100))

  return (
    <Card title="Occupancy" bodyClassName="p-[18px]">
      <div className="mb-3.5 flex items-center gap-3">
        <div
          className="relative h-[68px] w-[68px] shrink-0 rounded-full"
          style={{
            background: `conic-gradient(var(--color-teal) 0% ${pct}%, var(--color-border) ${pct}% 100%)`,
          }}
          aria-hidden
        >
          <div className="absolute inset-[11px] rounded-full bg-card" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-teal"
              aria-hidden
            />
            <span className="flex-1">Occupied</span>
            <span className="font-bold text-ink">
              {occupiedUnits} unit{occupiedUnits === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-border"
              aria-hidden
            />
            <span className="flex-1">Vacant</span>
            <span className="font-bold text-ink">
              {vacantUnits} unit{vacantUnits === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        {byProperty.map((p) => {
          const barPct =
            p.total > 0 ? Math.min(100, Math.round((p.occupied / p.total) * 100)) : 0
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => navigate(`/properties/${p.id}`)}
              className="w-full cursor-pointer text-left transition-opacity hover:opacity-90"
            >
              <div className="mb-0.5 flex justify-between text-xs font-semibold text-ink">
                <span className="truncate pr-2">{p.name}</span>
                <span className="shrink-0 text-ink-muted">
                  {p.occupied}/{p.total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-teal transition-all"
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
