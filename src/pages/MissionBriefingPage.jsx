import { motion } from 'motion/react'
import { ArrowLeft, Calendar, Lock, Rocket, Target } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import missions from '../data/missions.json'
import { sfx } from '../utils/soundEffects'

const SECTOR_COPY = {
  moon: {
    eyebrow: 'LUNAR SECTOR · COMPETITION BOARD',
    title: 'Moon Missions',
    intro: 'Earth is rising over the lunar horizon. Pick a mission and get ready for launch!',
    accent: '#00F0FF',
    accentClass: 'text-cyan-glow',
    glowClass: 'glow-text',
  },
  mars: {
    eyebrow: 'MARTIAN SECTOR · COMPETITION BOARD',
    title: 'Mars Missions',
    intro: 'A dust storm is howling through the canyons while Phobos and Deimos race overhead. Choose your mission!',
    accent: '#FFB800',
    accentClass: 'text-solar',
    glowClass: 'glow-text-amber',
  },
}

export default function MissionBriefingPage({ sector }) {
  const navigate = useNavigate()
  const copy = SECTOR_COPY[sector]
  const mission = Object.values(missions).find((m) => m.sector === sector)

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pt-24 pb-40">
      <Link
        to="/sectors"
        onClick={() => sfx.click()}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-cosmic/50 px-4 py-2 text-sm font-bold text-slate-200 backdrop-blur transition hover:border-white/40"
      >
        <ArrowLeft size={16} /> Back to Sector Hub
      </Link>

      <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="font-display text-xs font-bold tracking-[0.35em]" style={{ color: copy.accent }}>
          {copy.eyebrow}
        </p>
        <h1 className={`mt-2 font-display text-3xl font-black text-white sm:text-5xl`}>
          <span className={`${copy.accentClass} ${copy.glowClass}`}>{copy.title}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-slate-200">{copy.intro}</p>
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.article
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:col-span-2"
          style={{ borderColor: `${copy.accent}80`, boxShadow: `0 0 40px ${copy.accent}33` }}
        >
          <div className="absolute top-5 right-5 flex items-center gap-1.5 rounded-full bg-bio/15 px-3 py-1 font-display text-[10px] font-bold tracking-widest text-bio">
            <span className="h-2 w-2 animate-pulse rounded-full bg-bio" /> ACTIVE MISSION
          </div>
          <p className="flex items-center gap-2 font-display text-xs font-bold tracking-widest text-slate-400">
            <Calendar size={14} /> {mission.year} · DESTINATION: {mission.destination.toUpperCase()}
          </p>
          <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">{mission.name}</h2>
          <p className="font-display text-lg font-bold" style={{ color: copy.accent }}>
            “{mission.nickname}”
          </p>
          <p className="mt-4 text-lg text-slate-200">{mission.summary}</p>
          <ol className="mt-5 space-y-3">
            {mission.briefing.map((line, i) => (
              <li key={line} className="flex gap-3 text-slate-300">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-xs font-black text-cosmic"
                  style={{ background: copy.accent }}
                >
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <Target size={18} className={copy.accentClass} />
            <span>
              <b className="text-white">Stage 1:</b> 15-second {mission.cockpit.hazardLabel.toLowerCase()} dodge ·{' '}
              <b className="text-white">Stage 2:</b> 6-Sol outpost survival
            </span>
          </div>
          <button
            type="button"
            onMouseEnter={() => sfx.hover()}
            onClick={() => {
              sfx.powerUp()
              navigate(`/cockpit/${mission.id}`)
            }}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-display text-lg font-black tracking-widest text-cosmic transition hover:scale-[1.02] hover:brightness-110 sm:w-auto sm:px-10"
            style={{ background: copy.accent, boxShadow: `0 0 30px ${copy.accent}99` }}
          >
            <Rocket size={22} /> LAUNCH MISSION
          </button>
        </motion.article>

        <div className="flex flex-col gap-6">
          {mission.lockedMissions.map((locked, i) => (
            <motion.article
              key={locked.name}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-panel relative flex-1 overflow-hidden rounded-3xl p-6 opacity-80"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_14px,rgba(255,255,255,0.03)_14px,rgba(255,255,255,0.03)_28px)]" />
              <div className="relative">
                <span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-slate-300">
                  <Lock size={22} />
                </span>
                <h3 className="font-display text-lg font-black tracking-wider text-slate-200">{locked.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{locked.teaser}</p>
                <p className="mt-3 inline-block rounded-full border border-white/15 px-3 py-1 font-display text-[10px] font-bold tracking-widest text-slate-400">
                  COMING SOON
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </main>
  )
}
