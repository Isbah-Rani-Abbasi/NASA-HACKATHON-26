import { motion } from 'motion/react'
import { useId } from 'react'

const INK = '#0b1020'

/*
 * One 200-unit-wide strip of a cartoon world map (local coords, globe radius 50).
 * The strip scrolls sideways under a circular clip so the planet appears to rotate,
 * starting on the Americas like the reference sticker.
 */
const LAND = [
  // North America
  'M-34 -38 C-26 -46 -8 -46 4 -40 C12 -36 20 -34 22 -28 C22 -22 14 -22 12 -16 C10 -10 4 -10 2 -4 C0 2 4 6 8 8 C4 10 -2 6 -6 2 C-12 -2 -18 -4 -22 -10 C-28 -16 -32 -22 -36 -28 C-38 -32 -38 -36 -34 -38 Z',
  // Central America
  'M6 6 C10 9 14 12 17 17 C15 18 11 15 8 12 Z',
  // South America
  'M14 18 C22 16 30 20 34 28 C36 36 30 42 26 50 C22 58 18 64 15 58 C13 48 11 40 10 32 C10 26 11 21 14 18 Z',
  // Greenland
  'M14 -50 C22 -54 30 -50 28 -43 C24 -38 18 -40 15 -45 Z',
  // Europe
  'M48 -38 C56 -44 68 -42 74 -34 C76 -28 68 -24 62 -24 C56 -22 50 -26 48 -32 Z',
  // Africa
  'M48 -16 C58 -20 70 -16 74 -6 C78 6 72 20 66 30 C62 36 58 32 56 24 C54 14 48 6 46 -2 C44 -8 44 -12 48 -16 Z',
  // Asia
  'M84 -42 C104 -50 134 -46 146 -32 C152 -20 142 -10 132 -8 C122 -6 114 2 106 -2 C96 -6 90 -16 86 -26 C84 -32 82 -38 84 -42 Z',
  // India
  'M110 -2 C116 0 118 8 114 16 C110 10 106 4 110 -2 Z',
  // Australia
  'M132 20 C142 16 152 22 150 30 C146 36 134 34 130 28 C128 24 128 22 132 20 Z',
]

const DESERT = [
  // Western North America / Mexico
  'M-24 -14 C-18 -16 -12 -10 -8 -2 C-6 4 -10 4 -14 0 C-18 -4 -24 -8 -24 -14 Z',
  // Andes edge of South America
  'M12 24 C16 26 16 36 16 46 C15 52 13 52 13 44 C12 36 11 28 12 24 Z',
  // Sahara
  'M50 -12 C58 -14 68 -12 72 -6 C72 0 62 2 54 0 C50 -2 48 -8 50 -12 Z',
  // Central Asia / Australia interior
  'M100 -30 C112 -34 124 -30 126 -24 C120 -20 108 -22 100 -26 Z',
  'M136 24 C142 22 146 26 144 30 C140 31 136 28 136 24 Z',
]

const SWIRLS = [
  ['M-48 -10 q14 -6 26 2', 0.25],
  ['M-46 20 q16 -8 30 0', 0.2],
  ['M-30 40 q14 -6 24 2', 0.22],
  ['M36 -4 q8 -6 18 -2', 0.18],
  ['M78 34 q14 -6 26 2', 0.2],
  ['M120 -20 q10 -4 18 2', 0.18],
  ['M150 40 q14 -6 26 2', 0.22],
  ['M168 -20 q12 -6 22 0', 0.2],
]

function MapStrip({ dx, ids }) {
  return (
    <g transform={`translate(${dx} 0)`}>
      {SWIRLS.map(([d, o]) => (
        <path key={d} d={d} stroke="#9fd2ff" strokeWidth="5" strokeLinecap="round" fill="none" opacity={o} />
      ))}
      {LAND.map((d) => (
        <path key={d} d={d} fill={`url(#${ids.land})`} />
      ))}
      <g clipPath={`url(#${ids.landClip}-${dx})`}>
        {DESERT.map((d) => (
          <path key={d} d={d} fill={`url(#${ids.desert})`} />
        ))}
      </g>
      {/* Bold comic coastlines + a light coastal highlight */}
      {LAND.map((d) => (
        <path key={`o${d}`} d={d} fill="none" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      ))}
      <path d="M-34 -36 C-36 -30 -32 -22 -26 -14" stroke="#f7efd9" strokeWidth="1.2" fill="none" opacity="0.8" />
      <path d="M14 20 C11 30 12 44 15 56" stroke="#f7efd9" strokeWidth="1.2" fill="none" opacity="0.8" />
      {/* Caribbean islands */}
      <ellipse cx="14" cy="6" rx="3" ry="1.1" fill="#6abf4b" stroke={INK} strokeWidth="1" />
      <ellipse cx="20" cy="9" rx="1.6" ry="0.9" fill="#6abf4b" stroke={INK} strokeWidth="0.8" />
      <ellipse cx="2" cy="-32" rx="1.6" ry="0.8" fill="#0f2f63" opacity="0.6" />
    </g>
  )
}

/**
 * Illustrated sticker-style Earth as an SVG <g>, for embedding in other SVGs.
 * Painterly ocean, green/tan continents, bold black coastlines, glossy white sticker border,
 * slow rotation and drifting clouds.
 */
export function EarthStickerG({ cx = 0, cy = 0, r = 50, spin = 90 }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ids = {
    ocean: `earth-${raw}-ocean`,
    land: `earth-${raw}-land`,
    desert: `earth-${raw}-desert`,
    shade: `earth-${raw}-shade`,
    clip: `earth-${raw}-clip`,
    landClip: `earth-${raw}-landclip`,
  }
  return (
    <g transform={`translate(${cx} ${cy}) scale(${r / 50})`}>
      <defs>
        <radialGradient id={ids.ocean} cx="38%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#4f9ee0" />
          <stop offset="60%" stopColor="#2a64b0" />
          <stop offset="100%" stopColor="#173c78" />
        </radialGradient>
        <linearGradient id={ids.land} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7cc85a" />
          <stop offset="100%" stopColor="#3f8f3a" />
        </linearGradient>
        <linearGradient id={ids.desert} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0be6c" />
          <stop offset="100%" stopColor="#d08b3c" />
        </linearGradient>
        <radialGradient id={ids.shade} cx="34%" cy="30%" r="85%">
          <stop offset="55%" stopColor="rgba(5,8,22,0)" />
          <stop offset="100%" stopColor="rgba(5,8,22,0.45)" />
        </radialGradient>
        <clipPath id={ids.clip}>
          <circle r="48.5" />
        </clipPath>
        {[0, 200].map((dx) => (
          <clipPath key={dx} id={`${ids.landClip}-${dx}`}>
            {LAND.map((d) => (
              <path key={d} d={d} />
            ))}
          </clipPath>
        ))}
      </defs>

      {/* Glossy white sticker border with a soft shadow */}
      <circle cx="2" cy="4" r="58" fill="rgba(0,0,0,0.3)" />
      <circle r="57" fill="#ffffff" />
      <circle r="57" fill="none" stroke="#e5e7eb" strokeWidth="1.2" />

      <circle r="50" fill={`url(#${ids.ocean})`} />
      <g clipPath={`url(#${ids.clip})`}>
        <motion.g animate={{ x: [0, -200] }} transition={{ duration: spin, repeat: Infinity, ease: 'linear' }}>
          <MapStrip dx={0} ids={ids} />
          <MapStrip dx={200} ids={ids} />
        </motion.g>
        {/* Clouds drift a bit faster than the land */}
        <motion.g animate={{ x: [0, -200] }} transition={{ duration: spin * 0.55, repeat: Infinity, ease: 'linear' }} fill="white" opacity="0.55">
          {[0, 200].map((dx) =>
            [
              [-40, -24, 10],
              [-10, 30, 8],
              [30, -30, 7],
              [70, 16, 9],
              [120, -40, 8],
              [160, 26, 10],
            ].map(([x, y, w]) => <ellipse key={`${dx}${x}`} cx={x + dx} cy={y} rx={w} ry={w * 0.32} />),
          )}
        </motion.g>
        <circle r="50" fill={`url(#${ids.shade})`} />
      </g>
      <circle r="50" fill="none" stroke={INK} strokeWidth="3.2" />
      <path d="M-34 -30 Q-22 -42 -6 -44" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.45" />
    </g>
  )
}

/** Standalone sticker Earth. */
export default function EarthSticker({ size = 160, className = '', spin = 90 }) {
  return (
    <svg width={size} height={size} viewBox="-62 -62 124 124" className={className} role="img" aria-label="Planet Earth" style={{ overflow: 'visible' }}>
      <EarthStickerG spin={spin} />
    </svg>
  )
}
