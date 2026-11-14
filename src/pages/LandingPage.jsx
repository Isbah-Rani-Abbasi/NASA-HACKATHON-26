import { AnimatePresence, motion } from 'motion/react'
import { FastForward, Satellite, Shield, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AstroBotMascot from '../components/AstroBotMascot'
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
  { icon: Satellite, label: 'Real NASA DONKI space weather', color: 'text-cyan-glow' },
  { icon: Shield, label: 'Dodge storms in the cockpit', color: 'text-solar' },
  { icon: Sparkles, label: 'Rewrite space history', color: 'text-bio' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [introDone, setIntroDone] = useState(false)

  const finishIntro = () => {
    setIntroDone(true)
    sfx.success()
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-10 sm:items-end sm:pr-[6%]">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className={`max-w-xl text-center transition-all duration-700 sm:text-right ${introDone ? '' : 'mb-[48vh] sm:mb-0'}`}
      >
        <p className="font-display text-xs font-bold tracking-[0.35em] text-solar">NASA SPACE APPS CHALLENGE 2026</p>
        <h1 className="mt-3 font-display text-4xl leading-tight font-black text-white sm:text-6xl">
          <span className="glow-text text-cyan-glow">CHRONO</span>-OUTPOST
        </h1>
        <p className="mt-2 font-display text-lg font-bold tracking-widest text-slate-200 sm:text-2xl">REWRITE THE MISSION</p>
        <p className="mt-4 text-base text-slate-300 sm:text-lg">
          Travel back in time, fly through real solar storms, and save famous NASA missions with your brain power!
        </p>
        <ul className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-end">
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <li key={label} className="glass-panel flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold text-slate-200">
              <Icon size={16} className={color} /> {label}
            </li>
          ))}
        </ul>

        <AnimatePresence>
          {introDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 14 }}
              className="mt-10 flex justify-center sm:justify-end"
            >
              <button
                type="button"
                onMouseEnter={() => sfx.hover()}
                onClick={() => {
                  sfx.powerUp()
                  navigate('/sectors')
                }}
                className="animate-pulse-glow rounded-2xl border-2 border-cyan-glow bg-cyan-glow/15 px-8 py-5 font-display text-lg font-black tracking-widest text-white transition hover:bg-cyan-glow hover:text-cosmic sm:text-2xl"
              >
                MOVE TO COMPETITION →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {!introDone && (
        <button
          type="button"
          onClick={() => {
            sfx.click()
            finishIntro()
          }}
          className="fixed top-16 right-4 z-[60] flex items-center gap-2 rounded-full border border-white/20 bg-cosmic/70 px-4 py-2 text-sm font-bold text-slate-200 backdrop-blur transition hover:border-cyan-glow hover:text-cyan-glow"
        >
          <FastForward size={16} /> Skip Intro
        </button>
      )}

      <AnimatePresence>
        {!introDone && (
          <AstroBotMascot
            steps={INTRO_STEPS}
            placement="center-left"
            onFinish={finishIntro}
            finishLabel="I'm ready!"
          />
        )}
      </AnimatePresence>
    </main>
  )
}
