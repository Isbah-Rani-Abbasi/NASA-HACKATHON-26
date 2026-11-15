import { motion } from 'motion/react'

const OUTLINE = '#0b1020'

/** Ringed blue gas giant with white wind streaks (poster style). */
function GasGiant() {
  return (
    <svg viewBox="-70 -50 140 100" className="h-full w-full" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id="lp-gas-clip">
          <circle r="36" />
        </clipPath>
      </defs>
      <path d="M-66 6 A66 11 0 0 1 66 -6" fill="none" stroke="#2c4f86" strokeWidth="4" transform="rotate(-10)" />
      <circle r="36" fill="#3f6fb0" />
      <g clipPath="url(#lp-gas-clip)" fill="none" stroke="#e8f0ff" strokeLinecap="round">
        {[
          ['M-40 -24 q12 -4 24 0 t24 0 t24 0', 2.4],
          ['M-30 -12 q10 -5 20 0 t20 0', 1.6],
          ['M-44 0 q14 -4 28 0 t28 0 t28 0', 2.8],
          ['M-20 12 q10 -4 20 0 t20 0 t20 0', 1.6],
          ['M-42 24 q12 -4 24 0 t24 0', 2.2],
        ].map(([d, w]) => (
          <path key={d} d={d} strokeWidth={w} opacity="0.85" />
        ))}
      </g>
      <path d="M-66 6 A66 11 0 0 0 66 -6" fill="none" stroke="#2c4f86" strokeWidth="4" transform="rotate(-10)" />
      <circle cx="44" cy="-30" r="4" fill="#e5e7eb" />
    </svg>
  )
}

/** Small cratered "cookie" planet. */
function CookiePlanet() {
  return (
    <svg viewBox="-30 -30 60 60" className="h-full w-full">
      <circle r="26" fill="#e3b778" stroke={OUTLINE} strokeWidth="3" />
      {[
        [-10, -8, 4],
        [8, -12, 3],
        [10, 6, 5],
        [-8, 12, 3.5],
        [0, 0, 2.5],
      ].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#6b3f1d" />
      ))}
      <ellipse cx="-9" cy="-14" rx="6" ry="2.5" fill="white" opacity="0.5" />
    </svg>
  )
}

/** Distant grey moon. */
function DistantMoon() {
  return (
    <svg viewBox="-30 -30 60 60" className="h-full w-full">
      <circle r="24" fill="#cbd5e1" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="-8" cy="-6" r="5" fill="#94a3b8" />
      <circle cx="9" cy="8" r="4" fill="#94a3b8" />
      <circle cx="6" cy="-11" r="2.5" fill="#94a3b8" />
    </svg>
  )
}

/** Teal ringed planet. */
function TealRinged() {
  return (
    <svg viewBox="-60 -40 120 80" className="h-full w-full" style={{ overflow: 'visible' }}>
      <ellipse rx="54" ry="12" fill="none" stroke="#5eead4" strokeWidth="4" transform="rotate(14)" opacity="0.7" />
      <circle r="26" fill="#14b8a6" stroke={OUTLINE} strokeWidth="3" />
      <path d="M-24 -6 Q0 -14 24 -6" stroke="#99f6e4" strokeWidth="3" fill="none" />
      <path d="M-22 10 Q0 4 22 10" stroke="#0f766e" strokeWidth="3" fill="none" />
      <path d="M-52 3 A54 12 0 0 0 52 -3" fill="none" stroke="#ccfbf1" strokeWidth="4" transform="rotate(14)" />
    </svg>
  )
}

/** Orange-striped planet. */
function OrangeStriped() {
  return (
    <svg viewBox="-34 -34 68 68" className="h-full w-full">
      <defs>
        <clipPath id="lp-orange-clip">
          <circle r="30" />
        </clipPath>
      </defs>
      <circle r="30" fill="#fb923c" stroke={OUTLINE} strokeWidth="3" />
      <g clipPath="url(#lp-orange-clip)">
        <path d="M-34 -14 Q0 -22 34 -14 V-8 Q0 -16 -34 -8Z" fill="#c2410c" />
        <path d="M-34 4 Q0 -4 34 4 V11 Q0 3 -34 11Z" fill="#fdba74" />
        <path d="M-34 18 Q0 12 34 18 V24 Q0 18 -34 24Z" fill="#c2410c" />
      </g>
      <circle r="30" fill="none" stroke={OUTLINE} strokeWidth="3" />
      <ellipse cx="-11" cy="-15" rx="8" ry="3.5" fill="white" opacity="0.45" transform="rotate(-25 -11 -15)" />
    </svg>
  )
}

// Positions are percentages of the viewport; depth controls size, blur and drift speed.
const PLANETS = [
  { C: GasGiant, top: '64%', left: '74%', w: 150, depth: 0.9, drift: 26 },
  { C: CookiePlanet, top: '84%', left: '40%', w: 56, depth: 0.7, drift: 18 },
  { C: DistantMoon, top: '10%', left: '88%', w: 46, depth: 0.4, drift: 30 },
  { C: TealRinged, top: '70%', left: '54%', w: 120, depth: 0.8, drift: 22 },
  { C: OrangeStriped, top: '42%', left: '88%', w: 90, depth: 0.6, drift: 20 },
  { C: DistantMoon, top: '88%', left: '8%', w: 30, depth: 0.3, drift: 34 },
]

/** Full-screen layer of stylized planets drifting slowly at different depths. */
export default function LandingPlanets() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden" aria-hidden="true">
      {PLANETS.map(({ C, top, left, w, depth, drift }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top,
            left,
            width: w,
            height: w,
            opacity: 0.35 + depth * 0.6,
            filter: depth < 0.5 ? 'blur(1px)' : 'none',
          }}
          animate={{
            x: [0, 24 * depth, -18 * depth, 0],
            y: [0, -16 * depth, 12 * depth, 0],
            rotate: [0, 6, -4, 0],
          }}
          transition={{ duration: drift, repeat: Infinity, ease: 'easeInOut' }}
        >
          <C />
        </motion.div>
      ))}
    </div>
  )
}
