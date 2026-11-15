import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, SkipForward } from 'lucide-react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { sfx } from '../utils/soundEffects'

/**
 * Cute astronaut riding a white-and-red rocket, flashing a peace sign.
 * Flat sticker style: dark navy outlines, big glossy visor, teal porthole, jagged flame.
 * Pure SVG sprite (no background), with a flickering exhaust flame and a gentle hover.
 */
export function RocketMascotFigure({ size = 170, mood = 'happy', hover = true }) {
  const worried = mood === 'worried'
  const ink = '#1f2a44'
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      animate={hover ? { y: [0, -9, 0], rotate: worried ? [-2, 2, -2] : 0 } : undefined}
      transition={{ duration: worried ? 0.6 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
      role="img"
      aria-label="Astro-Bot, an astronaut riding a red and white rocket, giving a peace sign"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="rm-suit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e3e7ee" />
        </linearGradient>
        <radialGradient id="rm-visor" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#2c3a5e" />
          <stop offset="100%" stopColor="#0f1730" />
        </radialGradient>
        <radialGradient id="rm-port" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#3fb6c9" />
          <stop offset="100%" stopColor="#1b7f95" />
        </radialGradient>
      </defs>

      {/* ---------- Rocket (tilted up and to the right) ---------- */}
      <g transform="rotate(-25 112 132)">
        {/* Jagged exhaust flame + sparks */}
        <motion.g
          style={{ originX: 1, originY: 0.5 }}
          animate={{ scaleX: [1, 1.25, 0.92, 1.18, 1], scaleY: [1, 0.9, 1.08, 0.94, 1] }}
          transition={{ duration: 0.32, repeat: Infinity }}
        >
          <path d="M50 112 L30 106 L38 116 L14 118 L34 126 L10 132 L36 138 L22 148 L50 150 Z" fill="#f97316" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
          <path d="M50 118 L36 116 L42 124 L26 130 L42 134 L34 142 L50 144 Z" fill="#facc15" />
        </motion.g>
        {[
          [4, 120, 8],
          [0, 136, 6],
          [12, 150, 5],
        ].map(([x, y, w], i) => (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width={w}
            height="3.5"
            rx="1.8"
            fill="#f97316"
            animate={{ x: [x, x - 10], opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}

        {/* Tail fins */}
        <path d="M70 108 L52 84 Q66 80 92 106 Z" fill="#ef4f2f" stroke={ink} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M70 156 L52 182 Q68 186 94 158 Z" fill="#ef4f2f" stroke={ink} strokeWidth="2.6" strokeLinejoin="round" />

        {/* Body */}
        <path d="M58 106 Q120 96 160 104 L160 160 Q120 168 58 158 Q50 132 58 106 Z" fill="url(#rm-suit)" stroke={ink} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M70 150 Q115 158 152 152" stroke="#cfd6e2" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Nozzle ring */}
        <path d="M50 110 L60 106 Q54 132 60 158 L50 154 Q46 132 50 110 Z" fill="#2b3a5c" stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />
        {/* Nose cone */}
        <path d="M158 103 Q186 108 198 132 Q186 156 158 161 Q164 132 158 103 Z" fill="#ef4f2f" stroke={ink} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M168 112 Q182 118 188 128" stroke="#ffb199" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Porthole */}
        <circle cx="141" cy="133" r="15" fill="#d6dce6" stroke={ink} strokeWidth="2.6" />
        <circle cx="141" cy="133" r="10" fill="url(#rm-port)" stroke={ink} strokeWidth="2" />
        <path d="M135 129 Q137.5 125 142.5 124.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>

      {/* ---------- Astronaut sitting on the rocket ---------- */}
      {/* Back arm resting on the nose */}
      <path d="M124 96 Q138 100 146 96" stroke={ink} strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M124 96 Q138 100 146 96" stroke="url(#rm-suit)" strokeWidth="8.5" strokeLinecap="round" fill="none" />
      <circle cx="148" cy="95" r="7" fill="#ffffff" stroke={ink} strokeWidth="2.4" />
      <path d="M144 92 Q148 89 152 92" stroke={ink} strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* Torso */}
      <path d="M84 84 Q102 76 122 84 L126 116 Q104 124 82 116 Z" fill="url(#rm-suit)" stroke={ink} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M86 112 Q104 118 124 112" stroke="#cfd6e2" strokeWidth="3" fill="none" />
      {/* Chest panel */}
      <rect x="93" y="92" width="24" height="13" rx="3" fill="#ffffff" stroke={ink} strokeWidth="2" />
      <rect x="96.5" y="95" width="10" height="7" rx="1.5" fill="#2aa3b8" />
      <circle cx="111.5" cy="98.5" r="2.4" fill="#ef4f2f" />

      {/* Leg bent over the side of the rocket */}
      <path d="M96 116 Q112 116 120 124 L114 142" stroke={ink} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M96 116 Q112 116 120 124 L114 142" stroke="url(#rm-suit)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M104 146 Q114 138 124 144 Q126 152 116 153 Q106 154 104 146 Z" fill="#e3e7ee" stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />

      {/* Peace-sign arm */}
      <path d="M86 92 Q72 92 62 78" stroke={ink} strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M86 92 Q72 92 62 78" stroke="url(#rm-suit)" strokeWidth="8.5" strokeLinecap="round" fill="none" />
      <motion.g style={{ originX: 0.6, originY: 1 }} animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 1.4, repeat: Infinity }}>
        {[
          [57, 70, 50, 56],
          [62, 69, 64, 54],
        ].map(([x1, y1, x2, y2]) => (
          <g key={x2}>
            <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={ink} strokeWidth="8.5" strokeLinecap="round" />
            <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          </g>
        ))}
        <path d="M52 70 Q58 64 66 70 Q68 78 60 80 Q52 80 52 70 Z" fill="#ffffff" stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M55 74 Q59 72 63 74" stroke={ink} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </motion.g>

      {/* Helmet */}
      <circle cx="104" cy="52" r="33" fill="url(#rm-suit)" stroke={ink} strokeWidth="2.8" />
      <rect x="66" y="44" width="10" height="20" rx="5" fill="#ffffff" stroke={ink} strokeWidth="2.4" />
      <path d="M80 30 Q104 14 128 30 Q138 50 128 72 Q104 82 82 72 Q72 52 80 30 Z" fill="url(#rm-visor)" stroke={ink} strokeWidth="2.4" />
      <path d="M110 25 Q124 28 130 40" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
      <circle cx="131" cy="48" r="2.4" fill="white" opacity="0.9" />
      {worried && (
        <motion.text x="70" y="22" fontSize="16" fontWeight="900" fill="#FFB800" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
          !
        </motion.text>
      )}
    </motion.svg>
  )
}

/** Dims the page and draws a glowing ring around the element matching `selector`. */
function Spotlight({ selector }) {
  const [rect, setRect] = useState(null)

  useLayoutEffect(() => {
    const el = document.querySelector(selector)
    if (!el) {
      setRect(null)
      return undefined
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    let raf = 0
    const measure = () => {
      const r = el.getBoundingClientRect()
      setRect((prev) =>
        prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
          ? prev
          : { top: r.top, left: r.left, width: r.width, height: r.height },
      )
      raf = requestAnimationFrame(measure)
    }
    measure()
    return () => cancelAnimationFrame(raf)
  }, [selector])

  if (!rect) return null
  const pad = 10
  return (
    <motion.div
      className="pointer-events-none fixed z-40 rounded-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 22 }}
      style={{ boxShadow: '0 0 0 9999px rgba(2,4,12,0.72)' }}
    >
      <div className="absolute inset-0 animate-pulse-glow rounded-2xl border-2 border-cyan-glow" />
    </motion.div>
  )
}

const PLACEMENTS = {
  'bottom-left': 'fixed z-50 left-2 right-2 bottom-3 sm:left-6 sm:right-auto sm:bottom-6',
  'center-left': 'fixed z-50 left-2 right-2 top-1/2 -translate-y-1/2 sm:left-[4%] sm:right-auto',
  inline: 'relative z-20 w-full',
  dock: 'relative z-20 w-full',
}

/**
 * The rocket mascot + a separate side-by-side glass dialogue box.
 * Appears only when guidance is needed, flies in from off-screen, hovers, and flies away when dismissed.
 *
 * steps: [{ title?, text, note?, target? (CSS selector to spotlight) }]
 */
export default function RocketMascot({
  steps,
  onFinish,
  onStepChange,
  placement = 'bottom-left',
  finishLabel = 'Finish',
  mood = 'happy',
  showSkip = true,
  size = 160,
}) {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const step = steps[index]
  const fullText = step?.text || ''
  const done = typed.length >= fullText.length
  const isLast = index === steps.length - 1

  useEffect(() => {
    onStepChange?.(index)
  }, [index, onStepChange])

  useEffect(() => {
    let i = 0
    setTyped('')
    const timer = setInterval(() => {
      i += 1
      setTyped(fullText.slice(0, i))
      if (i % 3 === 0) sfx.beep()
      if (i >= fullText.length) clearInterval(timer)
    }, 24)
    return () => clearInterval(timer)
  }, [fullText])

  const next = () => {
    sfx.click()
    if (!done) {
      setTyped(fullText)
      return
    }
    if (isLast) onFinish?.()
    else setIndex((n) => n + 1)
  }

  const skip = () => {
    sfx.click()
    onFinish?.()
  }

  const compact = placement === 'dock'

  return (
    <>
      <AnimatePresence>{step?.target && <Spotlight key={step.target} selector={step.target} />}</AnimatePresence>
      <motion.div
        className={`flex items-end gap-1 sm:gap-3 ${PLACEMENTS[placement] || PLACEMENTS['bottom-left']}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.75 } }}
      >
        {/* Mascot flies in on its own, outside the dialogue box */}
        <motion.div
          className={`shrink-0 origin-bottom-left ${compact ? '' : 'scale-[0.62] sm:scale-100'}`}
          initial={{ x: -520, y: 120, rotate: -25 }}
          animate={{ x: 0, y: 0, rotate: 0 }}
          exit={{ x: 700, y: -420, rotate: 20, transition: { duration: 0.9, ease: 'easeIn' } }}
          transition={{ type: 'spring', stiffness: 60, damping: 13 }}
        >
          <RocketMascotFigure size={size} mood={mood} />
        </motion.div>

        {/* Separate glass dialogue box */}
        <motion.div
          className={
            compact
              ? 'glass-panel relative -ml-3 mb-3 w-full min-w-0 rounded-2xl p-3'
              : 'glass-panel relative -ml-10 mb-6 w-full max-w-md rounded-3xl p-4 sm:-ml-2 sm:mb-10 sm:p-5'
          }
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 140, damping: 16 }}
        >
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="font-display text-xs font-bold tracking-[0.2em] text-cyan-glow">ASTRO-BOT • {step?.title || 'HELLO!'}</span>
            <span className="font-display text-[10px] text-slate-400">
              {index + 1}/{steps.length}
            </span>
          </div>
          <p
            className={
              compact
                ? 'min-h-[4rem] text-sm leading-snug font-semibold text-slate-100'
                : 'min-h-[4.5rem] text-base leading-relaxed font-semibold text-slate-100 sm:text-lg'
            }
            aria-live="polite"
          >
            {typed}
            <span className="ml-0.5 animate-flicker font-bold text-cyan-glow">|</span>
          </p>
          <AnimatePresence>
            {done && step?.note && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-xl bg-cosmic/60 p-2.5">
                {step.noteTitle && <p className="font-display text-[10px] font-black tracking-widest text-bio">{step.noteTitle}</p>}
                <p className="mt-0.5 text-sm text-slate-200">{step.note}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-3 flex items-center justify-end gap-2">
            {showSkip && !isLast && (
              <button
                type="button"
                onClick={skip}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <SkipForward size={16} /> Skip
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1 rounded-full bg-cyan-glow px-5 py-2 font-display text-sm font-bold text-cosmic shadow-[0_0_18px_rgba(0,240,255,0.6)] transition hover:scale-105"
            >
              {isLast && done ? finishLabel : 'Next'} <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}
