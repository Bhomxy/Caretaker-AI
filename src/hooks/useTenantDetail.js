import { useEffect, useState } from 'react'
import { fetchTenantDetailBundle } from '../lib/queries/tenants'

const empty = {
  loading: false,
  tenant: null,
  propertyName: null,
  complaints: [],
  invoices: [],
  error: null,
}

/**
 * PRD §8.3 — tenant profile subview.
 * @param {string | null} managerId
 * @param {string | undefined} tenantId
 */
export function useTenantDetail(managerId, tenantId) {
  const [state, setState] = useState(() => ({
    ...empty,
    loading: Boolean(managerId && tenantId),
  }))

  useEffect(() => {
    let cancelled = false

    if (!managerId || !tenantId) {
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
      const bundle = await fetchTenantDetailBundle(managerId, tenantId)
      if (cancelled) return
      if (!bundle.tenant) {
        setState({
          loading: false,
          tenant: null,
          propertyName: null,
          complaints: [],
          invoices: [],
          error: bundle.error ?? 'Tenant not found.',
        })
        return
      }
      setState({
        loading: false,
        tenant: bundle.tenant,
        propertyName: bundle.propertyName,
        complaints: bundle.complaints,
        invoices: bundle.invoices,
        error: bundle.error,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [managerId, tenantId])

  return state
}
