import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BackButton from '../../components/ui/BackButton'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import { useApp } from '../../hooks/useApp'
import { supabase } from '../../lib/supabase'
import { formatDate, pickField } from '../../lib/utils'

/**
 * PRD §8.4 — minimal detail; full triage UI in Phase 9.
 */
export default function ComplaintDetail() {
  const { complaintId } = useParams()
  const { managerId } = useApp()
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    if (!managerId || !complaintId) {
      queueMicrotask(() => {
        if (!cancelled) setLoading(false)
      })
      return () => {
        cancelled = true
      }
    }

    const run = async () => {
      setLoading(true)
      setError(null)
      const { data, error: qErr } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', complaintId)
        .eq('manager_id', managerId)
        .maybeSingle()

      if (cancelled) return
      if (qErr) {
        setError(qErr.message)
        setRow(null)
      } else if (!data) {
        setError('Complaint not found.')
        setRow(null)
      } else {
        setRow(data)
      }
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [managerId, complaintId])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    )
  }

  if (error || !row) {
    return (
      <div className="space-y-4">
        <BackButton to="/complaints" />
        <Card>
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <Link
            to="/complaints"
            className="mt-3 inline-block text-sm font-semibold text-teal-d hover:text-teal-dk"
          >
            Back to complaints
          </Link>
        </Card>
      </div>
    )
  }

  const type =
    pickField(row, ['type', 'category', 'complaint_type']) ?? '—'
  const desc =
    pickField(row, ['description', 'details', 'body', 'message']) ?? '—'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <BackButton to="/complaints" />
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="font-mono text-sm text-teal-d">{String(row.id)}</p>
            <h2 className="mt-1 text-lg font-extrabold text-ink">{type}</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Logged {formatDate(row.created_at)}
            </p>
          </div>
          <Badge status={row.status} />
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-secondary">
            Description
          </p>
          <p className="text-sm leading-relaxed text-ink">{desc}</p>
        </div>
        <p className="mt-6 text-xs text-ink-muted">
          Vendor assignment and timeline ship in Phase 9.
        </p>
      </Card>
    </div>
  )
}
