import { Rocket, Volume2, VolumeX } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isMuted, subscribeMute, toggleMute } from '../utils/soundEffects'

const CRUMBS = [
  { match: /^\/sectors/, label: 'Sector Hub' },
  { match: /^\/moon/, label: 'Lunar Sector' },
  { match: /^\/mars/, label: 'Martian Sector' },
  { match: /^\/cockpit/, label: 'Cockpit' },
  { match: /^\/outpost/, label: 'Outpost' },
]

export default function TopBar() {
  const muted = useSyncExternalStore(subscribeMute, isMuted)
  const { pathname } = useLocation()
  const crumb = CRUMBS.find((c) => c.match.test(pathname))

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 border-b border-cyan-glow/15 bg-cosmic/60 px-4 py-2.5 backdrop-blur-md sm:px-6">
      <Link to="/" className="group flex items-center gap-2" aria-label="Chrono-Outpost home">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-glow to-indigo-600 text-cosmic shadow-[0_0_16px_rgba(0,240,255,0.5)] transition group-hover:rotate-12">
          <Rocket size={20} />
        </span>
        <span className="font-display text-sm font-extrabold tracking-[0.18em] text-white sm:text-base">
          CHRONO<span className="text-cyan-glow">-OUTPOST</span>
        </span>
        {crumb && (
          <span className="hidden rounded-full border border-white/15 px-3 py-0.5 text-xs font-bold text-slate-300 sm:inline">
            {crumb.label}
          </span>
        )}
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden font-display text-[10px] tracking-[0.25em] text-solar md:inline">NASA SPACE APPS 2026</span>
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition ${
            muted
              ? 'border-crimson/50 bg-crimson/10 text-crimson'
              : 'border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow hover:bg-cyan-glow/20'
          }`}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span className="hidden sm:inline">{muted ? 'Muted' : 'Sound On'}</span>
        </button>
      </div>
    </header>
  )
}
