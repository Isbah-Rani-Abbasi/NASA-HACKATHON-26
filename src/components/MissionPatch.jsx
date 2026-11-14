import { motion } from 'motion/react'

/** Collectible "History Rewritten" embroidered-style mission patch. */
export default function MissionPatch({ patch, size = 200 }) {
  const { title, subtitle, primary, secondary, planet } = patch
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.3 }}
      role="img"
      aria-label={`${title} mission patch`}
    >
      <defs>
        <path id="patch-top" d="M30 100 A70 70 0 0 1 170 100" />
        <path id="patch-bottom" d="M24 100 A76 76 0 0 0 176 100" />
        <radialGradient id="patch-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1e2a5a" />
          <stop offset="100%" stopColor="#050816" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill={secondary} />
      <circle cx="100" cy="100" r="90" fill="url(#patch-bg)" stroke={primary} strokeWidth="4" strokeDasharray="3 3" />
      <circle cx="100" cy="112" r="34" fill={planet} />
      <circle cx="90" cy="104" r="6" fill="rgba(0,0,0,0.25)" />
      <circle cx="112" cy="122" r="4" fill="rgba(0,0,0,0.25)" />
      <ellipse cx="100" cy="112" rx="56" ry="14" fill="none" stroke={primary} strokeWidth="3" transform="rotate(-18 100 112)" />
      <path d="M100 52 L106 70 L125 70 L110 81 L116 99 L100 88 L84 99 L90 81 L75 70 L94 70 Z" fill={secondary} stroke="white" strokeWidth="1.5" />
      <text fontFamily="Orbitron, sans-serif" fontSize="15" fontWeight="900" fill="white" letterSpacing="2">
        <textPath href="#patch-top" startOffset="50%" textAnchor="middle">
          {title}
        </textPath>
      </text>
      <text fontFamily="Orbitron, sans-serif" fontSize="8.5" fontWeight="800" fill={primary} letterSpacing="1">
        <textPath href="#patch-bottom" startOffset="50%" textAnchor="middle">
          {subtitle}
        </textPath>
      </text>
      <text x="100" y="158" textAnchor="middle" fontFamily="Orbitron, sans-serif" fontSize="8" fontWeight="900" fill={secondary}>
        HISTORY REWRITTEN
      </text>
    </motion.svg>
  )
}
