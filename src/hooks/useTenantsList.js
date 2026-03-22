import { useEffect, useState } from 'react'
import { fetchTenantListBundle } from '../lib/queries/tenants'

const empty = {
  loading: false,
  rows: [],
  propertyOptions: [],
  error: null,
}

/**
 * PRD §8.3 — tenant table + property filter options.
 * @param {string | null} managerId
 */
export function useTenantsList(managerId) {
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
      const res = await fetchTenantListBundle(managerId)
      setState({
        loading: false,
        rows: res.rows,
        propertyOptions: res.propertyOptions,
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
      const res = await fetchTenantListBundle(managerId)
      if (cancelled) return
      setState({
        loading: false,
        rows: res.rows,
        propertyOptions: res.propertyOptions,
        error: res.error,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [managerId])

  return { ...state, refetch }
}
