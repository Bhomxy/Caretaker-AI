import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useApp } from '../../hooks/useApp'
import { useDashboard } from '../../hooks/useDashboard'
import ActionQueue from './ActionQueue'
import ActivityFeed from './ActivityFeed'
import CollectionChart, { SegmentedTabs } from './CollectionChart'
import MetricCards from './MetricCards'
import OccupancyCard from './OccupancyCard'
import RecentComplaints from './RecentComplaints'

function greetingForHour(d = new Date()) {
  const h = d.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/** PRD §8.1 — layout aligned with caretaker-ai.html prototype */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { managerId, user } = useApp()
  const [colPeriod, setColPeriod] = useState('monthly')
  const {
    loading,
    metrics,
    actionQueue,
    recentComplaints,
    collectionMonths,
    activityItems,
    occupancy,
    arrears,
    error,
    partial,
  } = useDashboard(managerId)

  const showSchemaHint =
    typeof error === 'string' &&
    /schema cache|could not find the table|relation .+ does not exist|42P01/i.test(
      error
    )

  const displayName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split('@')[0] ||
    'there'

  const dateSubtitle = useMemo(
    () =>
      new Date().toLocaleDateString('en-NG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  )

  const year = new Date().getFullYear()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">
            {greetingForHour()}, {displayName}{' '}
            <span aria-hidden className="inline-block">
              👋
            </span>
          </h2>
          <p className="mt-1 text-[12.5px] font-medium text-ink-muted">
            Portfolio overview · {dateSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Export coming soon"
          >
            Export
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/properties')}
          >
            + Add property
          </Button>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-gold-d/40 bg-gold-pale px-4 py-3 text-sm font-semibold text-ink"
          role="alert"
        >
          <p>
            {partial
              ? `${error} Some figures may be incomplete until the database matches the app.`
              : error}
          </p>
          {showSchemaHint ? (
            <p className="mt-2 text-xs font-medium leading-relaxed text-ink-secondary">
              Fix: In Supabase open{' '}
              <span className="font-bold text-ink">SQL</span> → New query, paste
              the file{' '}
              <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-[11px] text-ink">
                supabase/schema.sql
              </code>{' '}
              from this project, then click{' '}
              <span className="font-bold text-ink">Run</span>. Refresh the app
              after it succeeds.
            </p>
          ) : null}
        </div>
      ) : null}

      <MetricCards metrics={metrics} loading={loading} />
      <ActionQueue actionQueue={actionQueue} loading={loading} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_310px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card
            title={`Service charge collection — ${year}`}
            headerRight={
              <SegmentedTabs value={colPeriod} onChange={setColPeriod} />
            }
            bodyClassName="p-[18px]"
          >
            <CollectionChart
              months={collectionMonths}
              period={colPeriod}
              loading={loading}
              ytdTotal={metrics?.ytdCharges ?? 0}
              outstanding={arrears?.outstanding ?? 0}
              overdue={arrears?.overdue ?? 0}
            />
          </Card>
          <RecentComplaints rows={recentComplaints} loading={loading} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <OccupancyCard occupancy={occupancy} loading={loading} />
          <Card
            title="Live activity"
            headerRight={
              <span className="rounded-full bg-green-pale px-2 py-0.5 text-[11px] font-bold text-green">
                ● Live
              </span>
            }
            bodyClassName="bg-teal-pale/50 px-3 py-2"
          >
            <ActivityFeed items={activityItems} loading={loading} />
          </Card>
        </div>
      </div>
    </div>
  )
}
