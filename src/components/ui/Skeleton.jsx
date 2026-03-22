/**
 * Loading skeleton — PRD §6 / cursorrules.
 */
export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`h-4 w-full animate-pulse rounded-lg bg-border ${className}`}
    />
  )
}
