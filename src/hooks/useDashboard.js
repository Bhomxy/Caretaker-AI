import { useEffect, useState } from 'react'
import { fetchDashboardBundle } from '../lib/queries/dashboard'

const emptyMetrics = {
  totalUnits: 0,
  activeTenants: 0,
  openComplaints: 0,
  ytdCharges: 0,
}

const emptyQueue = {
  pendingApprovals: 0,
  staleUnassigned: 0,
  expiringLeases: 0,
}

const emptyOccupancy = {
  totalUnits: 0,
  occupiedUnits: 0,
  vacantUnits: 0,
  byProperty: [],
}

const emptyArrears = { outstanding: 0, overdue: 0 }

const emptyState = {
  loading: false,
  metrics: emptyMetrics,
  actionQueue: emptyQueue,
  recentComplaints: [],
  collectionMonths: [],
  activityItems: [],
  occupancy: emptyOccupancy,
  arrears: emptyArrears,
  error: null,
  partial: false,
}

/**
 * Dashboard data — PRD §8.1. Scoped to `managerId`.
 */
export function useDashboard(managerId) {
  const [state, setState] = useState(() => ({
    ...emptyState,
    loading: Boolean(managerId),
  }))

  useEffect(() => {
    let cancelled = false

    if (!managerId) {
      queueMicrotask(() => {
        if (!cancelled) setState(emptyState)
      })
      return () => {
        cancelled = true
      }
    }

    queueMicrotask(() => {
      if (!cancelled) {
        setState((s) => ({ ...s, loading: true, error: null }))
      }
    })

    ;(async () => {
      const bundle = await fetchDashboardBundle(managerId)
      if (cancelled) return
      setState({
        loading: false,
        metrics: bundle.metrics,
        actionQueue: bundle.actionQueue,
        recentComplaints: bundle.recentComplaints,
        collectionMonths: bundle.collectionMonths ?? [],
        activityItems: bundle.activityItems ?? [],
        occupancy: bundle.occupancy ?? emptyOccupancy,
        arrears: bundle.arrears ?? emptyArrears,
        error: bundle.error,
        partial: bundle.partial,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [managerId])

  return state
}
