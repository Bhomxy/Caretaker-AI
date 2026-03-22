import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AppContext } from './app-context'
import Toast from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { useNavBadgeCounts } from '../hooks/useNavBadgeCounts'

const TOAST_DURATION_MS = 2800

export function AppProvider({ children }) {
  const { user, managerId, signOut } = useAuth()
  const { openComplaintsCount, pendingApprovalsCount, totalUnitsCount } =
    useNavBadgeCounts(managerId)

  const [toast, setToast] = useState(null)
  const timeoutRef = useRef(null)

  const dismissToast = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setToast(null)
  }, [])

  const showToast = useCallback(
    (message, options = {}) => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const duration = options.duration ?? TOAST_DURATION_MS
      const variant = options.variant ?? 'success'

      setToast({ id, message, variant })

      timeoutRef.current = setTimeout(() => {
        setToast((t) => (t?.id === id ? null : t))
        timeoutRef.current = null
      }, duration)
    },
    []
  )

  useEffect(
    () => () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current)
      }
    },
    []
  )

  const value = useMemo(
    () => ({
      user,
      managerId,
      signOut,
      openComplaintsCount,
      pendingApprovalsCount,
      totalUnitsCount,
      showToast,
      dismissToast,
    }),
    [
      user,
      managerId,
      signOut,
      openComplaintsCount,
      pendingApprovalsCount,
      totalUnitsCount,
      showToast,
      dismissToast,
    ]
  )

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast ? (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      ) : null}
    </AppContext.Provider>
  )
}
