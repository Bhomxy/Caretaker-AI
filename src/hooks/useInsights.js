import { useCallback, useEffect, useState } from 'react'
import { fetchInsightsBundle } from '../lib/queries/insights'

const empty = {
  loading: false,
  healthScore: 0,
  narrative: '',
  topMaintenanceIssues: [],
  highComplaintProperties: [],
  riskyTenants: [],
  whatsappStats: {
    messagesProcessed: 0,
    complaintsLogged: 0,
    invoicesSent: 0,
    receiptsSent: 0,
    remindersSent: 0,
    avgResponseMin: 0,
  },
  maintenanceSpendByProperty: [],
  topVendorsBySpend: [],
  leaseRows: [],
  recommendations: [],
  error: null,
  partial: false,
}

/**
 * @param {string | null} managerId
 */
export function useInsights(managerId) {
  const [state, setState] = useState(() => ({
    ...empty,
    loading: Boolean(managerId),
  }))

  const refresh = useCallback(async () => {
    if (!managerId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    const bundle = await fetchInsightsBundle(managerId)
    setState({
      loading: false,
      healthScore: bundle.healthScore,
      narrative: bundle.narrative,
      topMaintenanceIssues: bundle.topMaintenanceIssues,
      highComplaintProperties: bundle.highComplaintProperties,
      riskyTenants: bundle.riskyTenants,
      whatsappStats: bundle.whatsappStats,
      maintenanceSpendByProperty: bundle.maintenanceSpendByProperty,
      topVendorsBySpend: bundle.topVendorsBySpend,
      leaseRows: bundle.leaseRows,
      recommendations: bundle.recommendations,
      error: bundle.error,
      partial: bundle.partial,
    })
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
      const bundle = await fetchInsightsBundle(managerId)
      if (cancelled) return
      setState({
        loading: false,
        healthScore: bundle.healthScore,
        narrative: bundle.narrative,
        topMaintenanceIssues: bundle.topMaintenanceIssues,
        highComplaintProperties: bundle.highComplaintProperties,
        riskyTenants: bundle.riskyTenants,
        whatsappStats: bundle.whatsappStats,
        maintenanceSpendByProperty: bundle.maintenanceSpendByProperty,
        topVendorsBySpend: bundle.topVendorsBySpend,
        leaseRows: bundle.leaseRows,
        recommendations: bundle.recommendations,
        error: bundle.error,
        partial: bundle.partial,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [managerId])

  return { ...state, refresh }
}
