import { useEffect, useState } from 'react'
import { fetchPropertyDetailBundle } from '../lib/queries/properties'

const empty = {
  loading: false,
  property: null,
  summary: null,
  tenants: [],
  complaints: [],
  units: [],
  leaseRows: [],
  error: null,
}

/**
 * PRD §8.2 — property subview data.
 * @param {string | null} managerId
 * @param {string | undefined} propertyId
 */
export function usePropertyDetail(managerId, propertyId) {
  const [state, setState] = useState(() => ({
    ...empty,
    loading: Boolean(managerId && propertyId),
  }))

  useEffect(() => {
    let cancelled = false

    if (!managerId || !propertyId) {
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
      const bundle = await fetchPropertyDetailBundle(managerId, propertyId)
      if (cancelled) return
      if (!bundle.property) {
        setState({
          loading: false,
          property: null,
          summary: null,
          tenants: [],
          complaints: [],
          units: [],
          leaseRows: [],
          error: bundle.error ?? 'Property not found.',
        })
        return
      }
      setState({
        loading: false,
        property: bundle.property,
        summary: bundle.summary,
        tenants: bundle.tenants,
        complaints: bundle.complaints,
        units: bundle.units,
        leaseRows: bundle.leaseRows,
        error: bundle.error,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [managerId, propertyId])

  return state
}
