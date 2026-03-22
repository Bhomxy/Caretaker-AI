import { useApp } from './useApp'

/**
 * Toast API — must be used under AppProvider (authenticated shell).
 */
export function useToast() {
  const { showToast, dismissToast } = useApp()
  return { showToast, dismissToast }
}
