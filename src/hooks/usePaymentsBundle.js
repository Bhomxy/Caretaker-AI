import { useCallback, useEffect, useState } from 'react'
import { fetchPaymentsBundle } from '../lib/queries/payments'

const empty = {
  loading: false,
  rentRollRows: [],
  approvalsRows: [],
  invoiceRows: [],
  receiptRows: [],
  summary: {
    totalExpected: 0,
    collectedMonth: 0,
    outstanding: 0,
    dueThisMonth: 0,
  },
  propertyOptions: [],
  error: null,
  partial: false,
}

/**
 * @param {string | null} managerId
 */
export function usePaymentsBundle(managerId) {
  const [state, setState] = useState(() => ({
    ...empty,
    loading: Boolean(managerId),
  }))

  const refetch = useCallback(async () => {
    if (!managerId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    const bundle = await fetchPaymentsBundle(managerId)
    setState({
      loading: false,
      rentRollRows: bundle.rentRollRows,
      approvalsRows: bundle.approvalsRows,
      invoiceRows: bundle.invoiceRows,
      receiptRows: bundle.receiptRows,
      summary: bundle.summary,
      propertyOptions: bundle.propertyOptions,
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
      const bundle = await fetchPaymentsBundle(managerId)
      if (cancelled) return
      setState({
        loading: false,
        rentRollRows: bundle.rentRollRows,
        approvalsRows: bundle.approvalsRows,
        invoiceRows: bundle.invoiceRows,
        receiptRows: bundle.receiptRows,
        summary: bundle.summary,
        propertyOptions: bundle.propertyOptions,
        error: bundle.error,
        partial: bundle.partial,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [managerId])

  return { ...state, refetch }
}
