import { motion } from 'motion/react'
import { useMemo } from 'react'

/**
 * Animated illustrated outpost (lunar or martian).
 * While `animating` is true it plays the Sol sequence: solar rays strike,
 * the shield dome glows, panels charge, greenhouse lights up, science dish pings.
 */
export default function OutpostScene({ theme = 'lunar', animating = false, allocation, event, levels }) {
  const lunar = theme === 'lunar'
  const storm = event && event.type !== 'CALM'
  const stars = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({ x: (i * 137) % 600, y: (i * 53) % 150, r: (i % 3) * 0.4 + 0.5 })),
    [],
  )
  const dust = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ y: 120 + ((i * 37) % 170), d: 3 + (i % 5), delay: (i % 7) * 0.4 })), [])
  const a = allocation || {}
  const shieldStrength = Math.min(1, ((levels?.shielding ?? 50) / 100) * 0.5 + (a.shielding || 0) * 0.1)

  return (
    <svg viewBox="0 0 600 300" className="h-full w-full" role="img" aria-label={`${lunar ? 'Lunar' : 'Martian'} surface outpost`}>
      <defs>
        <linearGradient id="os-sky" x1="0" y1="0" x2="0" y2="1">
          {lunar ? (
            <>
              <stop offset="0%" stopColor="#02040c" />
              <stop offset="100%" stopColor="#0b1226" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#4a1d2a" />
              <stop offset="60%" stopColor="#b8644c" />
              <stop offset="100%" stopColor="#e2a27c" />
            </>
          )}
        </linearGradient>
        <linearGradient id="os-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lunar ? '#9aa0ad' : '#c25a30'} />
          <stop offset="100%" stopColor={lunar ? '#555b68' : '#6e2a17'} />
        </linearGradient>
        <radialGradient id="os-dome" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(0,240,255,0.12)" />
        </radialGradient>
        <radialGradient id="os-earth" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#5fb2ff" />
          <stop offset="100%" stopColor="#123a7a" />
        </radialGradient>
      </defs>

      <rect width="600" height="300" fill="url(#os-sky)" />
      {lunar ? (
        <>
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity="0.8" />
          ))}
          <circle cx="90" cy="60" r="28" fill="url(#os-earth)" />
          <path d="M78 50 q8 -6 14 2 q-2 8 -10 6 z M96 68 q6 -2 8 4 q-4 4 -8 -4z" fill="#3fa34d" opacity="0.9" />
          <circle cx="90" cy="60" r="28" fill="none" stroke="rgba(120,190,255,0.5)" strokeWidth="3" />
        </>
      ) : (
        <>
          <circle cx="510" cy="55" r="12" fill="#fff3d6" opacity="0.85" />
          <circle cx="510" cy="55" r="26" fill="#ffe3b0" opacity="0.2" />
          <circle cx="120" cy="40" r="5" fill="#9c8a7c" />
        </>
      )}

      {/* Distant terrain */}
      <path
        d={lunar ? 'M0 200 Q80 170 160 195 T340 185 T520 190 T600 180 V300 H0Z' : 'M0 190 L60 150 L110 175 L170 130 L240 180 L320 160 L400 190 L470 140 L540 175 L600 160 V300 H0Z'}
        fill={lunar ? '#4b5160' : '#8a3418'}
        opacity="0.8"
      />
      <path d="M0 225 Q150 205 300 222 T600 215 V300 H0Z" fill="url(#os-ground)" />
      {lunar &&
        [
          [70, 265, 30],
          [480, 255, 40],
          [380, 285, 20],
          [160, 285, 16],
        ].map(([x, y, r]) => (
          <g key={x}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.25} fill="rgba(40,44,54,0.5)" />
            <path d={`M${x - r} ${y} A${r} ${r * 0.25} 0 0 0 ${x + r} ${y}`} stroke="rgba(230,232,240,0.4)" fill="none" />
          </g>
        ))}

      {/* Solar storm rays */}
      {animating && storm && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.line
              key={i}
              x1={600}
              y1={i * 20}
              x2={300 + (i - 2) * 30}
              y2={170}
              stroke={event.type === 'SEP' ? '#FF3B5C' : '#FFB800'}
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.15, repeat: 1 }}
            />
          ))}
        </g>
      )}

      {/* Solar panels */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${70 + i * 70} 205)`}>
          <line x1="20" y1="0" x2="20" y2="30" stroke="#94a3b8" strokeWidth="3" />
          <motion.polygon
            points="0,0 44,-10 48,10 4,20"
            fill="#1e3a8a"
            stroke="#93c5fd"
            strokeWidth="1.5"
            animate={animating && a.power ? { fill: ['#1e3a8a', '#FFB800', '#1e3a8a'] } : { fill: '#1e3a8a' }}
            transition={{ duration: 1, repeat: animating ? 1 : 0 }}
          />
          <path d="M11 -2 L15 18 M22 -5 L26 15 M33 -7 L37 13" stroke="#93c5fd" strokeOpacity="0.5" />
        </g>
      ))}

      {/* Life-support tanks */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${210 + i * 22} 200)`}>
          <rect width="16" height="34" rx="8" fill="#e2e8f0" stroke="#64748b" />
          <motion.rect
            x="3"
            width="10"
            rx="5"
            fill="#00F0FF"
            initial={false}
            animate={{ y: 31 - ((levels?.lifeSupport ?? 50) / 100) * 28, height: ((levels?.lifeSupport ?? 50) / 100) * 28 }}
            transition={{ duration: 1.2 }}
          />
          {animating && a.lifeSupport > 0 && (
            <motion.circle cx="8" r="2" fill="white" initial={{ cy: 30, opacity: 1 }} animate={{ cy: 2, opacity: 0 }} transition={{ duration: 0.8, repeat: 2, delay: i * 0.3 }} />
          )}
        </g>
      ))}

      {/* Habitat dome */}
      <rect x="250" y="222" width="110" height="14" rx="4" fill="#475569" />
      <path d="M255 224 A50 50 0 0 1 355 224 Z" fill="url(#os-dome)" stroke="#e2e8f0" strokeWidth="2" />
      <path d="M270 224 A35 35 0 0 1 340 224" stroke="rgba(255,255,255,0.35)" fill="none" />
      <rect x="296" y="205" width="18" height="19" rx="4" fill="#0f172a" stroke="#00F0FF" strokeOpacity="0.6" />

      {/* Shield bubble */}
      <motion.path
        d="M230 230 A75 75 0 0 1 380 230"
        fill="rgba(139,124,255,0.12)"
        stroke="#8B7CFF"
        strokeWidth="3"
        initial={false}
        animate={
          animating
            ? { opacity: [shieldStrength * 0.6, 1, shieldStrength * 0.8], strokeWidth: [2, 6, 3] }
            : { opacity: 0.25 + shieldStrength * 0.6, strokeWidth: 2 + shieldStrength * 2 }
        }
        transition={{ duration: 1.6 }}
        style={{ filter: 'drop-shadow(0 0 8px #8B7CFF)' }}
      />

      {/* Greenhouse */}
      <g transform="translate(400 200)">
        <rect width="70" height="30" rx="6" fill="rgba(0,230,118,0.12)" stroke="#86efac" strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            cx={12 + i * 15}
            cy="18"
            r="5"
            fill="#00E676"
            animate={animating && a.food ? { opacity: [0.3, 1, 0.6], r: [4, 7, 5] } : { opacity: 0.25 + ((levels?.food ?? 50) / 100) * 0.7 }}
            transition={{ duration: 0.8, repeat: animating ? 1 : 0, delay: i * 0.1 }}
          />
        ))}
        <path d="M0 10 H70" stroke="#86efac" strokeOpacity="0.4" />
      </g>

      {/* Science dish */}
      <g transform="translate(510 180)">
        <line x1="10" y1="10" x2="10" y2="52" stroke="#94a3b8" strokeWidth="3" />
        <path d="M-6 8 Q10 30 26 8 Z" fill="#e2e8f0" stroke="#64748b" />
        <circle cx="10" cy="4" r="3" fill="#FF3B5C" />
        {animating &&
          a.science > 0 &&
          [0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx="10"
              cy="4"
              fill="none"
              stroke="#FF3B5C"
              strokeWidth="2"
              initial={{ r: 2, opacity: 1 }}
              animate={{ r: 34, opacity: 0 }}
              transition={{ duration: 1, delay: i * 0.3, repeat: 1 }}
            />
          ))}
      </g>

      {/* Blowing Martian dust */}
      {!lunar &&
        dust.map((d, i) => (
          <motion.circle
            key={i}
            cy={d.y}
            r={1 + (i % 3)}
            fill="rgba(250,200,160,0.6)"
            initial={{ cx: -20 }}
            animate={{ cx: 620 }}
            transition={{ duration: d.d, repeat: Infinity, delay: d.delay, ease: 'linear' }}
          />
        ))}
    </svg>
  )
}
