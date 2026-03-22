import { useEffect, useState } from 'react'
import { fetchVendorsList } from '../lib/queries/vendors'

const empty = {
  loading: false,
  rows: [],
  propertyOptions: [],
  error: null,
}

/**
 * PRD §8.8 — vendor grid + property options for Add Vendor.
 * @param {string | null} managerId
 */
export function useVendorsList(managerId) {
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
      const res = await fetchVendorsList(managerId)
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
      const res = await fetchVendorsList(managerId)
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
