import { useEffect, useState } from 'react'
import { fetchComplaintsListBundle } from '../lib/queries/complaints'

const empty = {
  loading: false,
  rows: [],
  counts: { total: 0, open: 0, inProgress: 0, resolved: 0 },
  propertyOptions: [],
  vendorOptions: [],
  error: null,
}

/**
 * PRD §8.4 — complaints list + filter options + summary counts.
 * @param {string | null} managerId
 */
export function useComplaintsList(managerId) {
  const [state, setState] = useState(() => ({
    ...empty,
    loading: Boolean(managerId),
  }))

  const refetch = () => {
    if (!managerId) return
    queueMicrotask(() => {
      setState((s) => ({ ...s, loading: true, error: null }))
    })
    ;(async () => {
      const res = await fetchComplaintsListBundle(managerId)
      setState({
        loading: false,
        rows: res.rows,
        counts: res.counts,
        propertyOptions: res.propertyOptions,
        vendorOptions: res.vendorOptions,
        error: res.error,
      })
    })()
  }

  useEffect(() => {
    let cancelled = false

    if (!managerId) {
      queueMicrotask(() => {
        if (!cancelled) setState(empty)
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
      const res = await fetchComplaintsListBundle(managerId)
      if (cancelled) return
      setState({
        loading: false,
        rows: res.rows,
        counts: res.counts,
        propertyOptions: res.propertyOptions,
        vendorOptions: res.vendorOptions,
        error: res.error,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [managerId])

  return { ...state, refetch }
}
