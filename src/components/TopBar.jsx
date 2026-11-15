import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Rocket, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import missions from '../data/missions.json'
import { isMuted, sfx, subscribeMute, toggleMute } from '../utils/soundEffects'

const CRUMBS = [
  { match: /^\/sectors/, label: 'Sector Hub' },
  { match: /^\/moon/, label: 'Lunar Sector' },
  { match: /^\/mars/, label: 'Martian Sector' },
  { match: /^\/cockpit/, label: 'Cockpit' },
  { match: /^\/outpost/, label: 'Outpost' },
]

/** Minimal retro-futuristic command-base glyph used for the Home button. */
function CommandBaseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.5v3.2" />
      <circle cx="12" cy="2.3" r="0.9" fill="currentColor" stroke="none" />
      <path d="M4.5 15.5a7.5 7.5 0 0 1 15 0" />
      <path d="M8 15.5a4 4 0 0 1 8 0" opacity="0.6" />
      <path d="M2.5 15.5h19" />
      <path d="M5 15.5v4M19 15.5v4M3.5 19.5h17" />
      <rect x="10.5" y="16.8" width="3" height="2.7" rx="0.6" />
      <path d="M1.8 10.5c3-2.2 7-3.4 10.2-3.4s7.2 1.2 10.2 3.4" opacity="0.45" strokeDasharray="1.6 1.8" />
    </svg>
  )
}

export default function TopBar() {
  const muted = useSyncExternalStore(subscribeMute, isMuted)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const crumb = CRUMBS.find((c) => c.match.test(pathname))

  const inMission = /^\/(cockpit|outpost)\//.test(pathname)
  const onBoard = /^\/(moon|mars)$/.test(pathname)
  const mission = inMission ? missions[pathname.split('/')[2]] : null

  useEffect(() => {
    setConfirming(false)
  }, [pathname])

  const go = (to) => {
    sfx.click()
    setConfirming(false)
    navigate(to)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[75] flex items-center justify-between gap-2 border-b border-cyan-glow/15 bg-cosmic/70 px-3 py-2.5 backdrop-blur-md sm:px-6">
      <Link to="/" className="group flex min-w-0 items-center gap-2" aria-label="Chrono-Outpost home">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-glow to-indigo-600 text-cosmic shadow-[0_0_16px_rgba(0,240,255,0.5)] transition group-hover:rotate-12">
          <Rocket size={20} />
        </span>
        <span className="hidden font-pixel text-[11px] text-white sm:inline">
          CHRONO<span className="text-cyan-glow">-OUTPOST</span>
        </span>
        {crumb && (
          <span className="hidden rounded-full border border-white/15 px-3 py-0.5 text-xs font-bold text-slate-300 lg:inline">{crumb.label}</span>
        )}
      </Link>

      <nav className="flex items-center gap-2" aria-label="Main">
        {onBoard && (
          <Link
            to="/sectors"
            onClick={() => sfx.click()}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-100 transition hover:border-cyan-glow hover:text-cyan-glow"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Sector Hub</span>
          </Link>
        )}
        {!inMission && (
        <Link
          to="/"
          onClick={() => sfx.click()}
          aria-label="Home"
          className="flex items-center gap-2 rounded-full border border-cyan-glow/40 bg-cyan-glow/10 px-3 py-1.5 text-sm font-bold text-cyan-glow transition hover:bg-cyan-glow/20 hover:shadow-[0_0_14px_rgba(0,240,255,0.5)]"
        >
          <CommandBaseIcon />
          <span className="hidden sm:inline">Home</span>
        </Link>
        )}

        {inMission && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sfx.click()
                setConfirming((c) => !c)
              }}
              aria-expanded={confirming}
              className="flex items-center gap-1.5 rounded-full border border-crimson/60 bg-crimson/15 px-3 py-1.5 text-sm font-bold text-crimson transition hover:bg-crimson hover:text-white"
            >
              <span aria-hidden="true">🚪</span>
              <span className="hidden sm:inline">Exit Mission</span>
            </button>
            <AnimatePresence>
              {confirming && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="glass-panel absolute top-12 right-0 w-64 rounded-2xl p-4"
                  role="dialog"
                  aria-label="Exit mission?"
                >
                  <p className="font-display text-sm font-black text-white">Exit this mission?</p>
                  <p className="mt-1 text-xs text-slate-300">Your current mission progress will be lost.</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {mission && (
                      <button
                        type="button"
                        onClick={() => go(`/${mission.sector}`)}
                        className="rounded-xl bg-crimson px-3 py-2 text-sm font-black text-white hover:brightness-110"
                      >
                        Exit to Mission Select
                      </button>
                    )}
                    <button type="button" onClick={() => go('/')} className="rounded-xl border border-white/20 px-3 py-2 text-sm font-bold text-white hover:bg-white/10">
                      Exit to Home
                    </button>
                    <button type="button" onClick={() => setConfirming(false)} className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white">
                      Keep playing
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition ${
            muted ? 'border-crimson/50 bg-crimson/10 text-crimson' : 'border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow hover:bg-cyan-glow/20'
          }`}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span className="hidden md:inline">{muted ? 'Muted' : 'Sound On'}</span>
        </button>
      </nav>
    </header>
  )
}
