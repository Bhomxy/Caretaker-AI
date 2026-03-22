import { useCallback, useEffect, useState } from 'react'
import { fetchPropertiesList } from '../lib/queries/properties'

const empty = {
  loading: false,
  rows: [],
  error: null,
}

/**
 * PRD §8.2 — list + rollups for property cards.
 * @param {string | null} managerId
 */
export function usePropertiesList(managerId) {
  const [state, setState] = useState(() => ({
    ...empty,
    loading: Boolean(managerId),
  }))

  const refetch = useCallback(() => {
    if (!managerId) return
    queueMicrotask(() => {
      setState((s) => ({ ...s, loading: true, error: null }))
    })
    ;(async () => {
      const res = await fetchPropertiesList(managerId)
      setState({
        loading: false,
        rows: res.rows,
        error: res.error,
      })
    })()
  }, [managerId])

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
      const res = await fetchPropertiesList(managerId)
      if (cancelled) return
      setState({
        loading: false,
        rows: res.rows,
        error: res.error,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [managerId])

  return { ...state, refetch }
}
