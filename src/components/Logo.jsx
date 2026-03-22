import { APP_NAME } from '../lib/constants'

/**
 * Prefers `src/assets/logo-caretaker.svg` (true vector, transparent) when present,
 * otherwise `logo-caretaker.png`. Drop your Figma SVG export in as `logo-caretaker.svg`.
 *
 * If an SVG still shows a box, remove the background `<rect>` in the file or re-export
 * from Figma with a transparent frame (no fill on the parent).
 */
const svgMods = import.meta.glob('../assets/logo-caretaker.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})
const pngMods = import.meta.glob('../assets/logo-caretaker.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

const logoSrc = Object.values(svgMods)[0] ?? Object.values(pngMods)[0]

if (typeof logoSrc !== 'string') {
  throw new Error('Missing logo: add src/assets/logo-caretaker.svg or .png')
}

export default function Logo({ className = '' }) {
  return (
    <img
      src={logoSrc}
      alt={APP_NAME}
      decoding="async"
      draggable={false}
      className={`pointer-events-none block h-auto w-full max-w-full select-none object-contain object-left ${className}`}
    />
  )
}
