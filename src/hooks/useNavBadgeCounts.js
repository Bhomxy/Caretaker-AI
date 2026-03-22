import { useEffect, useState } from 'react'
import {
  fetchOpenComplaintsCount,
  fetchPendingApprovalsCount,
} from '../lib/queries/dashboard'

/**
 * Sidebar badges — PRD §7. Light queries only.
 */
export function useNavBadgeCounts(managerId) {
  const [openComplaintsCount, setOpenComplaintsCount] = useState(0)
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    if (!managerId) {
      queueMicrotask(() => {
        if (!cancelled) {
          setOpenComplaintsCount(0)
          setPendingApprovalsCount(0)
        }
      })
      return () => {
        cancelled = true
      }
    }

    ;(async () => {
      const [open, pend] = await Promise.all([
        fetchOpenComplaintsCount(managerId),
        fetchPendingApprovalsCount(managerId),
      ])
      if (cancelled) return
      setOpenComplaintsCount(open.value)
      setPendingApprovalsCount(pend.value)
    })()

    return () => {
      cancelled = true
    }
  }, [managerId])

  return { openComplaintsCount, pendingApprovalsCount }
}
