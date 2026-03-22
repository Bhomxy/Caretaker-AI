import { useCallback, useEffect, useState } from 'react'
import { fetchComplaintDetailBundle } from '../lib/queries/complaints'

const empty = {
  loading: false,
  complaint: null,
  tenant: null,
  property: null,
  assignedVendor: null,
  vendorOptions: [],
  error: null,
}

function bundleToState(bundle) {
  if (!bundle.complaint) {
    return {
      loading: false,
      complaint: null,
      tenant: null,
      property: null,
      assignedVendor: null,
      vendorOptions: [],
      error: bundle.error ?? 'Complaint not found.',
    }
  }
  return {
    loading: false,
    complaint: bundle.complaint,
    tenant: bundle.tenant,
    property: bundle.property,
    assignedVendor: bundle.assignedVendor,
    vendorOptions: bundle.vendorOptions,
    error: bundle.error,
  }
}

/**
 * PRD §8.4 — complaint detail + related rows.
 * @param {string | null} managerId
 * @param {string | undefined} complaintId
 */
export function useComplaintDetail(managerId, complaintId) {
  const [state, setState] = useState(() => ({
    ...empty,
    loading: Boolean(managerId && complaintId),
  }))

  const refetch = useCallback(async () => {
    if (!managerId || !complaintId) return
    const bundle = await fetchComplaintDetailBundle(managerId, complaintId)
    setState(bundleToState(bundle))
  }, [managerId, complaintId])

  useEffect(() => {
    let cancelled = false

    if (!managerId || !complaintId) {
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
      const bundle = await fetchComplaintDetailBundle(managerId, complaintId)
      if (cancelled) return
      setState(bundleToState(bundle))
    })()

    return () => {
      cancelled = true
    }
  }, [managerId, complaintId])

  return { ...state, refetch }
}
