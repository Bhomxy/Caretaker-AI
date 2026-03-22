import { useCallback, useEffect, useState } from 'react'
import { fetchVendorDetailBundle } from '../lib/queries/vendors'

const empty = {
  loading: false,
  vendor: null,
  summary: null,
  assignedProperties: [],
  activeComplaints: [],
  completedComplaints: [],
  totalSpend: 0,
  error: null,
}

function bundleToState(bundle) {
  if (!bundle.vendor) {
    return {
      loading: false,
      vendor: null,
      summary: null,
      assignedProperties: [],
      activeComplaints: [],
      completedComplaints: [],
      totalSpend: 0,
      error: bundle.error ?? 'Vendor not found.',
    }
  }
  return {
    loading: false,
    vendor: bundle.vendor,
    summary: bundle.summary,
    assignedProperties: bundle.assignedProperties,
    activeComplaints: bundle.activeComplaints,
    completedComplaints: bundle.completedComplaints,
    totalSpend: bundle.totalSpend,
    error: bundle.error,
  }
}

/**
 * PRD §8.8 — vendor profile + jobs.
 * @param {string | null} managerId
 * @param {string | undefined} vendorId
 */
export function useVendorDetail(managerId, vendorId) {
  const [state, setState] = useState(() => ({
    ...empty,
    loading: Boolean(managerId && vendorId),
  }))

  const refetch = useCallback(async () => {
    if (!managerId || !vendorId) return
    const bundle = await fetchVendorDetailBundle(managerId, vendorId)
    setState(bundleToState(bundle))
  }, [managerId, vendorId])

  useEffect(() => {
    let cancelled = false

    if (!managerId || !vendorId) {
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
      const bundle = await fetchVendorDetailBundle(managerId, vendorId)
      if (cancelled) return
      setState(bundleToState(bundle))
    })()

    return () => {
      cancelled = true
    }
  }, [managerId, vendorId])

  return { ...state, refetch }
}
