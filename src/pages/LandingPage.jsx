import { AnimatePresence, motion } from 'motion/react'
import { Satellite, Shield, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ATTACH, HangingAstronaut } from '../components/HangingFigures'
import LandingPlanets from '../components/LandingPlanets'
import RocketMascot from '../components/RocketMascot'
import { sfx } from '../utils/soundEffects'

const INTRO_STEPS = [
  {
    title: 'HELLO!',
    text: 'Welcome, Junior Commander! Famous NASA missions like Apollo 13 and Mars Polar Lander ran into sudden space storms and disasters.',
  },
  {
    title: 'YOUR JOB',
    text: 'Inside the Chrono-Simulator, you will pilot through the storm, survive the crash landing, and manage a real space outpost!',
  },
  {
    title: 'THE GOAL',
    text: 'Balance Oxygen, Shields, Power, Food, and Science to turn famous NASA failures into historic victories!',
  },
]

const FEATURES = [
  {
    id: 'donki',
    icon: Satellite,
    label: 'Real NASA DONKI space weather',
    color: 'text-cyan-glow',
    info: {
      title: 'NASA DONKI',
      text: "NASA's DONKI database records the solar flares, CMEs and particle storms the Sun throws at us. Every crisis in your outpost is built from a real DONKI record — you can even inspect its ID!",
    },
  },
  {
    id: 'dodge',
    icon: Shield,
    label: 'Dodge storms in the cockpit',
    color: 'text-solar',
    info: {
      title: 'COCKPIT',
      text: 'In the cockpit you have 15 seconds to steer through a meteoroid or solar-flare storm with the arrow keys, WASD, or by dragging. A stronger hull means a healthier crew later!',
    },
  },
  {
    id: 'rewrite',
    icon: Sparkles,
    label: 'Rewrite space history',
    color: 'text-bio',
    info: {
      title: 'REWRITE HISTORY',
      text: 'Apollo 13 and Mars Polar Lander never finished their missions. Share 10 power units between 5 habitat rooms, solve each crisis, and reach 100% Mission Progress to rewrite history!',
    },
  },
]

// One astronaut hangs from a single string under some CHRONO letters, bobbing at staggered speeds.
const HANGERS = {
  0: { size: 74, len: 34, duration: '3.2s', delay: '0s', patch: '#3b82f6' },
  2: { size: 60, len: 92, duration: '3.8s', delay: '-1.2s', patch: '#ef4444', flip: true },
  3: { size: 58, len: 46, duration: '2.8s', delay: '-0.6s', patch: '#22c55e' },
  5: { size: 70, len: 14, duration: '3.5s', delay: '-2s', patch: '#f59e0b', flip: true },
}

function Hanger({ h }) {
  // The string meets the astronaut's raised hand.
  const x = h.flip ? 100 - ATTACH.wave[0] : ATTACH.wave[0]
  return (
    <span
      className="relative -mt-10 flex animate-float-string flex-col items-center"
      style={{ animationDuration: h.duration, animationDelay: h.delay, width: h.size }}
    >
      <span className="relative block w-full" style={{ height: h.len + 40 }}>
        <span className="absolute top-0 bottom-0 w-[2px] -translate-x-1/2 bg-white/90" style={{ left: `${x}%` }} />
      </span>
      <span className="-mt-1">
        <HangingAstronaut pose="wave" size={h.size} flip={h.flip} patch={h.patch} />
      </span>
    </span>
  )
}

function useIsDesktop() {
  const query = '(min-width: 1024px)'
  const [desktop, setDesktop] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return desktop
}

export default function LandingPage() {
  const desktop = useIsDesktop()
  const navigate = useNavigate()
  const [guide, setGuide] = useState({ key: 'intro', steps: INTRO_STEPS, finishLabel: "I'm ready!" })

  const closeGuide = () => {
    sfx.success()
    setGuide(null)
  }

  const explain = (feature) => {
    sfx.click()
    setGuide({ key: feature.id, steps: [feature.info], finishLabel: 'Cool!' })
  }

  const mascot = (
    <AnimatePresence mode="wait">
      {guide && (
        <RocketMascot key={guide.key} steps={guide.steps} placement="inline" size={130} onFinish={closeGuide} finishLabel={guide.finishLabel} />
      )}
    </AnimatePresence>
  )

  return (
    <main className="relative mx-auto grid min-h-screen max-w-7xl gap-6 px-4 pt-20 pb-6 lg:h-screen lg:grid-cols-2 lg:items-start lg:gap-8 lg:overflow-hidden lg:pt-24 lg:pb-4">
      <LandingPlanets />

      {/* LEFT: CHRONO, single-string hanging astronauts, then the mascot dialogue */}
      <section className="flex flex-col items-center lg:items-start" aria-label="Chrono">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 12 }}
          className="flex items-start gap-0.5 sm:gap-1.5"
          aria-label="Chrono"
        >
          {'CHRONO'.split('').map((ch, i) => {
            const hanger = HANGERS[i]
            return (
              <span key={i} className="flex flex-col items-center" aria-hidden="true">
                <motion.span
                  className="pixel-sticker relative z-10 block text-[2.6rem] leading-none sm:text-7xl xl:text-8xl"
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 160, damping: 11 }}
                >
                  {ch}
                </motion.span>
                {hanger && <Hanger h={hanger} />}
              </span>
            )
          })}
        </motion.h1>
        {desktop && <div className="mt-2 w-full max-w-xl">{mascot}</div>}
      </section>

      {/* RIGHT: OUTPOST and the mission text */}
      <section className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <motion.h2
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="pixel-glow text-4xl leading-none sm:text-6xl"
        >
          OUTPOST
        </motion.h2>
        <p className="mt-5 font-pixel text-xs tracking-wider text-cyan-glow sm:text-sm">REWRITE THE MISSION</p>
        <p className="mt-2 font-display text-[10px] font-bold tracking-[0.3em] text-solar">NASA SPACE APPS CHALLENGE 2026</p>
        <p className="mt-4 max-w-xl text-base text-slate-200 sm:text-lg">
          Travel back in time, fly through real solar storms, and save famous NASA missions with your brain power!
        </p>

        <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
          {FEATURES.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => explain(f)}
                onMouseEnter={() => sfx.hover()}
                className={`glass-panel flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold text-slate-100 transition hover:scale-105 hover:border-cyan-glow ${
                  guide?.key === f.id ? 'border-cyan-glow shadow-[0_0_16px_rgba(0,240,255,0.5)]' : ''
                }`}
              >
                <f.icon size={16} className={f.color} /> {f.label}
              </button>
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 150, damping: 12 }}
          onMouseEnter={() => sfx.hover()}
          onClick={() => {
            sfx.powerUp()
            navigate('/sectors')
          }}
          className="mt-6 animate-pulse-glow rounded-2xl border-2 border-cyan-glow bg-cyan-glow/15 px-7 py-4 font-pixel text-sm text-white transition hover:bg-cyan-glow hover:text-cosmic sm:text-base"
        >
          🚀 LAUNCH MISSION
        </motion.button>

        {/* On small screens the mascot sits below the text instead */}
        {!desktop && <div className="mt-6 w-full max-w-xl">{mascot}</div>}
      </section>
    </main>
  )
}
