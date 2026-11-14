import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, SkipForward } from 'lucide-react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { sfx } from '../utils/soundEffects'

/** The ASTRO-BOT robot astronaut illustration (pure SVG + motion). */
export function AstroBotFigure({ size = 150, mood = 'happy' }) {
  const eyeColor = mood === 'worried' ? '#FFB800' : '#00F0FF'
  return (
    <motion.svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 160 200"
      animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      aria-label="Astro-Bot, your robot guide"
      role="img"
    >
      <defs>
        <radialGradient id="ab-visor" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#050816" />
        </radialGradient>
        <linearGradient id="ab-shell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#b8c4d9" />
        </linearGradient>
        <radialGradient id="ab-flame" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="rgba(0,240,255,0)" />
        </radialGradient>
      </defs>

      {/* Thruster flame */}
      <motion.ellipse
        cx="80"
        cy="182"
        rx="14"
        ry="18"
        fill="url(#ab-flame)"
        style={{ originY: 0 }}
        animate={{ scaleY: [1, 1.45, 0.9, 1.3, 1], opacity: [0.9, 1, 0.8, 1, 0.9] }}
        transition={{ duration: 0.35, repeat: Infinity }}
      />
      <rect x="68" y="160" width="24" height="12" rx="4" fill="#64748b" />

      {/* Antenna */}
      <line x1="80" y1="22" x2="80" y2="6" stroke="#cbd5e1" strokeWidth="3" />
      <motion.circle
        cx="80"
        cy="6"
        r="5"
        fill="#FF3B5C"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />

      {/* Left arm (waving) */}
      <motion.g
        style={{ originX: '42px', originY: '118px' }}
        animate={{ rotate: [0, -28, 0, -28, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5 }}
      >
        <rect x="18" y="104" width="28" height="14" rx="7" fill="url(#ab-shell)" stroke="#94a3b8" />
        <circle cx="16" cy="111" r="8" fill="#e2e8f0" stroke="#94a3b8" />
      </motion.g>
      {/* Right arm */}
      <rect x="114" y="104" width="28" height="14" rx="7" fill="url(#ab-shell)" stroke="#94a3b8" />
      <circle cx="144" cy="111" r="8" fill="#e2e8f0" stroke="#94a3b8" />

      {/* Body */}
      <rect x="44" y="92" width="72" height="72" rx="20" fill="url(#ab-shell)" stroke="#94a3b8" strokeWidth="2" />
      <rect x="58" y="108" width="44" height="30" rx="8" fill="#0F172A" />
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={68 + i * 12}
          cy="123"
          r="4"
          fill={['#00E676', '#FFB800', '#FF3B5C'][i]}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <rect x="62" y="146" width="36" height="6" rx="3" fill="#00F0FF" opacity="0.6" />

      {/* Helmet */}
      <circle cx="80" cy="58" r="40" fill="url(#ab-shell)" stroke="#94a3b8" strokeWidth="2" />
      <rect x="50" y="36" width="60" height="44" rx="20" fill="url(#ab-visor)" stroke="#00F0FF" strokeOpacity="0.6" strokeWidth="2" />
      <path d="M56 46 Q64 38 76 40" stroke="rgba(255,255,255,0.55)" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* LED eyes */}
      {[66, 94].map((x) => (
        <motion.rect
          key={x}
          x={x - 7}
          y="50"
          width="14"
          height="16"
          rx="6"
          fill={eyeColor}
          style={{ originY: '58px', filter: `drop-shadow(0 0 6px ${eyeColor})` }}
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
        />
      ))}
      {/* Smile */}
      <path
        d={mood === 'worried' ? 'M70 74 Q80 69 90 74' : 'M70 70 Q80 78 90 70'}
        stroke={eyeColor}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
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
      animate={{
        opacity: 1,
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 22 }}
      style={{ boxShadow: '0 0 0 9999px rgba(2,4,12,0.72)' }}
    >
      <div className="absolute inset-0 animate-pulse-glow rounded-2xl border-2 border-cyan-glow" />
    </motion.div>
  )
}

/**
 * Interactive guide mascot with typewriter speech bubble, Next/Skip controls
 * and an optional spotlight on a target element for each step.
 *
 * steps: [{ text: string, target?: string (CSS selector), title?: string }]
 */
export default function AstroBotMascot({
  steps,
  onFinish,
  onStepChange,
  placement = 'bottom-left',
  finishLabel = "Let's go!",
  mood = 'happy',
  showSkip = true,
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

  const positionClass =
    placement === 'center-left'
      ? 'left-3 right-3 top-1/2 -translate-y-1/2 sm:left-[5%] sm:right-auto'
      : 'left-3 right-3 bottom-3 sm:left-6 sm:right-auto sm:bottom-6'

  return (
    <>
      <AnimatePresence>{step?.target && <Spotlight key={step.target} selector={step.target} />}</AnimatePresence>
      <motion.div
        className={`fixed z-50 flex items-end gap-2 sm:gap-4 ${positionClass}`}
        initial={{ x: -500, opacity: 0, rotate: -25 }}
        animate={{ x: 0, opacity: 1, rotate: 0 }}
        exit={{ x: -500, opacity: 0, rotate: -25 }}
        transition={{ type: 'spring', stiffness: 70, damping: 14 }}
      >
        <div className="shrink-0 scale-75 origin-bottom-left sm:scale-100">
          <AstroBotFigure size={130} mood={mood} />
        </div>
        <div className="glass-panel relative mb-10 w-full max-w-md rounded-3xl rounded-bl-md p-5 sm:mb-16">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="font-display text-xs font-bold tracking-[0.2em] text-cyan-glow">
              ASTRO-BOT {step?.title ? `· ${step.title}` : ''}
            </span>
            <span className="font-display text-[10px] text-slate-400">
              {index + 1}/{steps.length}
            </span>
          </div>
          <p className="min-h-[5.5rem] text-base leading-relaxed font-semibold text-slate-100 sm:text-lg" aria-live="polite">
            {typed}
            {!done && <span className="ml-0.5 inline-block h-5 w-2 animate-flicker bg-cyan-glow align-middle" />}
          </p>
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
        </div>
      </motion.div>
    </>
  )
}
