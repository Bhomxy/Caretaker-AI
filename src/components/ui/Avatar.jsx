import { getInitials } from '../../lib/utils'

const SIZE_CLASS = {
  sm: 'h-8 w-8 text-[10px]',
  /** Topbar */
  compact: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
}

/** Sidebar / dark surfaces */
const TONE_DARK =
  'bg-teal-d/40 font-bold text-teal-pale'
/** Topbar / light card surfaces */
const TONE_LIGHT =
  'bg-teal-pale font-bold text-teal-dk'

/**
 * User or tenant avatar — cursorrules (initials or image).
 */
export default function Avatar({
  name,
  src,
  alt = '',
  size = 'md',
  tone = 'dark',
  className = '',
}) {
  const sizeCls = SIZE_CLASS[size] ?? SIZE_CLASS.md
  const toneCls = tone === 'light' ? TONE_LIGHT : TONE_DARK

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={`shrink-0 rounded-full object-cover ${sizeCls} ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${toneCls} ${sizeCls} ${className}`}
      aria-hidden={!name}
    >
      {getInitials(name)}
    </div>
  )
}
