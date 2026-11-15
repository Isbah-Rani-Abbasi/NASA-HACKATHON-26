/*
 * Line-art astronauts and a ringed planet that hang from strings under the
 * CHRONO letters on the landing page. White suits, bold black ink, glossy black visors.
 */
const INK = '#0b0b0f'

/** Where the two strings meet each figure, as % of its width. */
export const ATTACH = {
  reach: [26, 74],
  wave: [24, 60],
  planet: [30, 70],
}

function Glove({ x, y }) {
  return <circle cx={x} cy={y} r="5.5" fill="#fff" stroke={INK} strokeWidth="2.4" />
}

function Limb({ d, w = 11 }) {
  return (
    <>
      <path d={d} stroke={INK} strokeWidth={w + 5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={d} stroke="#fff" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  )
}

/** A floating astronaut. pose: 'reach' (both hands on the strings) or 'wave'. */
export function HangingAstronaut({ pose = 'reach', size = 80, flip = false, patch = '#3b82f6' }) {
  const reach = pose === 'reach'
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" aria-hidden="true" style={{ transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible' }}>
      {/* Backpack */}
      <rect x="22" y="44" width="14" height="30" rx="4" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <path d="M25 52 H33 M25 58 H33" stroke={INK} strokeWidth="1.6" />

      {/* Legs */}
      <Limb d="M44 88 Q38 100 34 110" />
      <Limb d={reach ? 'M60 88 Q72 94 76 104' : 'M60 88 Q68 98 62 110'} />
      <path d="M26 108 Q32 104 40 110 Q38 116 30 116 Q24 115 26 108 Z" fill="#fff" stroke={INK} strokeWidth="2.4" />
      {reach ? (
        <path d="M70 102 Q78 100 84 106 Q82 113 74 112 Q68 110 70 102 Z" fill="#fff" stroke={INK} strokeWidth="2.4" />
      ) : (
        <path d="M54 108 Q60 104 68 110 Q66 116 58 116 Q52 115 54 108 Z" fill="#fff" stroke={INK} strokeWidth="2.4" />
      )}

      {/* Arms */}
      <Limb d="M40 60 Q32 40 26 10" w={9} />
      {reach ? <Limb d="M64 60 Q70 40 74 10" w={9} /> : <Limb d="M66 62 Q80 58 88 44" w={9} />}
      <Glove x={26} y={9} />
      {reach ? <Glove x={74} y={9} /> : <Glove x={89} y={41} />}
      {!reach && <path d="M86 36 L84 30 M90 35 L91 29 M93 38 L96 33" stroke={INK} strokeWidth="2" strokeLinecap="round" />}

      {/* Torso */}
      <path d="M36 56 Q52 50 68 56 L68 86 Q52 94 36 86 Z" fill="#fff" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <rect x="44" y="64" width="18" height="11" rx="2" fill="#fff" stroke={INK} strokeWidth="2" />
      <rect x="46.5" y="67" width="5" height="5" fill={patch} />
      <rect x="53" y="67" width="3" height="5" fill="#ef4444" />
      <rect x="57.5" y="67" width="2.5" height="5" fill={INK} />
      <path d="M38 82 Q52 88 66 82" stroke={INK} strokeWidth="1.6" fill="none" />

      {/* Helmet with glossy black visor */}
      <circle cx="52" cy="36" r="21" fill="#fff" stroke={INK} strokeWidth="2.8" />
      <ellipse cx="55" cy="35" rx="15" ry="13.5" fill={INK} />
      <path d="M58 25 Q66 27 68 34" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <circle cx="47" cy="40" r="1.6" fill="#fff" opacity="0.8" />
    </svg>
  )
}

/** Blue striped planet with a white outline ring, hanging like the astronauts. */
export function HangingPlanet({ size = 90 }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 100 90" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id="hang-planet-clip">
          <circle cx="50" cy="50" r="33" />
        </clipPath>
      </defs>
      <path d="M8 44 Q50 22 92 44" fill="none" stroke="#fff" strokeWidth="2.4" />
      <circle cx="50" cy="50" r="33" fill="#3f6fb0" />
      <g clipPath="url(#hang-planet-clip)" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M18 34 Q40 26 62 32 T90 30" />
        <path d="M14 48 Q36 40 58 46 T90 44" />
        <path d="M14 62 Q38 56 60 62 T90 60" />
        <path d="M22 76 Q42 70 70 76" />
      </g>
      <circle cx="50" cy="50" r="33" fill="none" stroke="#fff" strokeWidth="2.6" />
      <path d="M6 56 Q50 80 94 56" fill="none" stroke="#fff" strokeWidth="2.4" />
    </svg>
  )
}

/** Small orange "cookie" planet. */
export function CookieDot({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#e0a14a" />
      {[
        [8, 8],
        [15, 9],
        [10, 15],
        [16, 15],
        [12, 11],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" fill="#5b3a1a" />
      ))}
    </svg>
  )
}
