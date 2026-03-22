import { useCallback, useState } from 'react'

/**
 * Local modal open state — use with `Modal` from `components/ui/Modal.jsx`.
 */
export function useModal(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen)

  const openModal = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => setOpen(false), [])
  const toggleModal = useCallback(() => setOpen((o) => !o), [])

  return {
    open,
    setOpen,
    openModal,
    closeModal,
    toggleModal,
  }
}
