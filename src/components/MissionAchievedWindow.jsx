import { motion } from 'motion/react'
import { EarthStickerG } from './EarthSticker'

/** Animated "mission achieved" scene shown on the victory screen. */
export default function MissionAchievedWindow({ missionId }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/15">
      {missionId === 'apollo-13' ? <Splashdown /> : <PolarLanderTransmit />}
    </div>
  )
}

/** Apollo 13: three parachutes lower the capsule into the Pacific Ocean. */
function Splashdown() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="Apollo capsule splashing down in the Pacific Ocean under three parachutes">
      <defs>
        <linearGradient id="sd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f9be8" />
          <stop offset="100%" stopColor="#bfe3ff" />
        </linearGradient>
        <linearGradient id="sd-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d6fb8" />
          <stop offset="100%" stopColor="#0b3a6b" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#sd-sky)" />
      <circle cx="270" cy="34" r="16" fill="#fff6c9" opacity="0.9" />
      {[
        [40, 30],
        [120, 20],
        [220, 45],
      ].map(([x, y], i) => (
        <motion.g key={i} animate={{ x: [0, 12, 0] }} transition={{ duration: 8 + i * 2, repeat: Infinity }}>
          <ellipse cx={x} cy={y} rx="18" ry="6" fill="white" opacity="0.85" />
          <ellipse cx={x + 12} cy={y - 3} rx="12" ry="5" fill="white" opacity="0.85" />
        </motion.g>
      ))}

      {/* Recovery ship */}
      <g transform="translate(232 118)">
        <path d="M0 10 L60 10 L54 18 L6 18 Z" fill="#475569" />
        <rect x="18" y="0" width="22" height="10" fill="#64748b" />
        <rect x="26" y="-6" width="6" height="6" fill="#94a3b8" />
      </g>

      {/* Descending capsule + parachutes */}
      <motion.g initial={{ y: -120 }} animate={{ y: 0 }} transition={{ duration: 3.2, ease: 'easeOut' }}>
        <motion.g animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 2.4, repeat: Infinity }} style={{ originX: 0.5, originY: 0.1 }}>
          {[-26, 0, 26].map((dx, i) => (
            <g key={i}>
              <path d={`M${150 + dx - 18} ${46 + Math.abs(dx) * 0.2} Q${150 + dx} ${14 + Math.abs(dx) * 0.2} ${150 + dx + 18} ${46 + Math.abs(dx) * 0.2} Z`} fill={i === 1 ? '#ef4444' : '#f8fafc'} stroke="#e2e8f0" />
              <path d={`M${150 + dx - 12} ${44 + Math.abs(dx) * 0.2} Q${150 + dx} ${24 + Math.abs(dx) * 0.2} ${150 + dx + 12} ${44 + Math.abs(dx) * 0.2}`} fill="none" stroke={i === 1 ? '#f8fafc' : '#ef4444'} strokeWidth="3" />
              <line x1={150 + dx - 18} y1={46 + Math.abs(dx) * 0.2} x2="146" y2="100" stroke="#cbd5e1" strokeWidth="0.6" />
              <line x1={150 + dx + 18} y1={46 + Math.abs(dx) * 0.2} x2="154" y2="100" stroke="#cbd5e1" strokeWidth="0.6" />
            </g>
          ))}
          <path d="M138 112 L144 98 L156 98 L162 112 Z" fill="#cbd5e1" stroke="#64748b" />
          <rect x="146" y="102" width="8" height="5" rx="1" fill="#1e293b" />
        </motion.g>
      </motion.g>

      {/* Ocean */}
      <rect y="122" width="320" height="58" fill="url(#sd-sea)" />
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M-40 ${128 + i * 14} q20 -5 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`}
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
          animate={{ x: [0, 40] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <motion.ellipse
        cx="150"
        cy="122"
        fill="none"
        stroke="white"
        strokeWidth="2"
        initial={{ rx: 0, ry: 0, opacity: 0 }}
        animate={{ rx: [0, 40], ry: [0, 6], opacity: [0, 1, 0] }}
        transition={{ delay: 3.1, duration: 1.4, repeat: Infinity, repeatDelay: 1.6 }}
      />
      <text x="12" y="172" fontSize="9" fontWeight="800" fill="white" fontFamily="Orbitron, sans-serif">
        SPLASHDOWN · PACIFIC OCEAN
      </text>
    </svg>
  )
}

/** Mars Polar Lander: safely on the polar ice, beaming data home. */
function PolarLanderTransmit() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="Mars Polar Lander standing on the polar ice transmitting data to Earth">
      <defs>
        <linearGradient id="pl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a0f1a" />
          <stop offset="100%" stopColor="#c98a6a" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#pl-sky)" />
      <EarthStickerG cx={286} cy={30} r={6} />
      <text x="276" y="16" fontSize="7" fill="#e0f2fe" fontWeight="700" textAnchor="end">
        EARTH
      </text>
      <path d="M0 132 Q60 120 120 130 T240 126 T320 130 V180 H0Z" fill="#f1f5f9" />
      <path d="M0 150 Q80 140 160 152 T320 148 V180 H0Z" fill="#e2e8f0" />
      <path d="M30 140 q20 -4 40 0 M200 150 q25 -4 50 0" stroke="#cbd5e1" strokeWidth="2" fill="none" />

      <motion.g initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.2 }}>
        {/* Legs */}
        <path d="M128 132 L118 146 M172 132 L182 146 M150 134 L150 148" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        {/* Body */}
        <path d="M122 118 L178 118 L172 134 L128 134 Z" fill="#cbd5e1" stroke="#64748b" />
        {/* Solar panels */}
        <path d="M122 120 L88 112 L92 104 L124 114 Z M178 120 L212 112 L208 104 L176 114 Z" fill="#1e3a8a" stroke="#93c5fd" />
        {/* Mast + dish */}
        <line x1="160" y1="118" x2="168" y2="96" stroke="#94a3b8" strokeWidth="2" />
        <path d="M160 92 Q170 104 180 92 Z" fill="#f8fafc" stroke="#64748b" />
        <motion.circle cx="170" cy="94" r="2" fill="#00E676" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
        {/* Robotic arm digging ice */}
        <motion.path
          d="M130 126 L112 118 L104 132"
          stroke="#e2e8f0"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          animate={{ rotate: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ originX: 1, originY: 0.57 }}
        />
      </motion.g>

      {/* Data packets travelling to Earth */}
      {[0, 1, 2, 3].map((i) => (
        <motion.rect
          key={i}
          width="5"
          height="3"
          rx="1"
          fill="#00E676"
          initial={{ x: 172, y: 90, opacity: 0 }}
          animate={{ x: 284, y: 30, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, delay: 1.2 + i * 0.55, repeat: Infinity, repeatDelay: 0 }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx="170"
          cy="94"
          fill="none"
          stroke="#00E676"
          strokeWidth="1"
          initial={{ r: 2, opacity: 1 }}
          animate={{ r: 30, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6 }}
        />
      ))}
      <text x="12" y="172" fontSize="9" fontWeight="800" fill="#334155" fontFamily="Orbitron, sans-serif">
        LANDER STABLE · TRANSMITTING ICE CORE DATA
      </text>
    </svg>
  )
}
