import { useCallback, useEffect, useState } from 'react'
import {
  fetchInboxMessages,
  fetchInboxThreadsBundle,
} from '../lib/queries/inbox'

/**
 * @param {string | null} managerId
 */
export function useInbox(managerId) {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(Boolean(managerId))
  const [error, setError] = useState(null)

  const loadThreads = useCallback(async () => {
    if (!managerId) {
      setThreads([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const bundle = await fetchInboxThreadsBundle(managerId)
    setThreads(bundle.threads)
    setError(bundle.error)
    setLoading(false)
  }, [managerId])

  useEffect(() => {
    let cancelled = false
    if (!managerId) {
      queueMicrotask(() => {
        if (!cancelled) {
          setThreads([])
          setLoading(false)
          setError(null)
        }
      })
      return () => {
        cancelled = true
      }
    }
    queueMicrotask(() => {
      if (cancelled) return
      setLoading(true)
    })
    ;(async () => {
      const bundle = await fetchInboxThreadsBundle(managerId)
      if (cancelled) return
      setThreads(bundle.threads)
      setError(bundle.error)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [managerId])

  return { threads, loading, error, refetchThreads: loadThreads }
}

/**
 * @param {string | null} managerId
 * @param {string | null} threadId
 */
export function useInboxMessages(managerId, threadId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!managerId || !threadId) {
      setMessages([])
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchInboxMessages(managerId, threadId)
    setMessages(data)
    setError(err?.message ?? null)
    setLoading(false)
  }, [managerId, threadId])

  useEffect(() => {
    let cancelled = false
    if (!managerId || !threadId) {
      queueMicrotask(() => {
        if (!cancelled) setMessages([])
      })
      return () => {
        cancelled = true
      }
    }
    queueMicrotask(() => {
      if (cancelled) return
      setLoading(true)
    })
    ;(async () => {
      const { data, error: err } = await fetchInboxMessages(
        managerId,
        threadId
      )
      if (cancelled) return
      setMessages(data)
      setError(err?.message ?? null)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [managerId, threadId])

  return { messages, loading, error, reload }
}
