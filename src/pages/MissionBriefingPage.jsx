import { AnimatePresence, motion } from 'motion/react'
import { Calendar, Lock, MessageCircle, Rocket, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RocketMascot from '../components/RocketMascot'
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
  // The briefing only flies in when the player asks for it.
  const [briefingOpen, setBriefingOpen] = useState(false)
  const briefingSteps = useMemo(
    () => [
      ...mission.briefing.map((text, i) => ({ title: `BRIEFING ${i + 1}`, text })),
      { title: 'READY?', text: `Press LAUNCH MISSION when you're ready to fly ${mission.name}, Commander!` },
    ],
    [mission],
  )

  return (
    <main className="mx-auto flex h-screen max-w-6xl flex-col overflow-hidden px-4 pt-[4.75rem] pb-4">

      <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-4 shrink-0">
        <p className="font-display text-[11px] font-bold tracking-[0.35em]" style={{ color: copy.accent }}>
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 pixel-heading text-2xl text-white sm:text-3xl">
          <span className={`${copy.accentClass} ${copy.glowClass}`}>{copy.title}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">{copy.intro}</p>
      </motion.header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3">
        <motion.article
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel relative flex flex-col overflow-y-auto rounded-3xl p-5 sm:p-6 lg:col-span-2 lg:self-start"
          style={{ borderColor: `${copy.accent}80`, boxShadow: `0 0 40px ${copy.accent}33` }}
        >
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-bio/15 px-3 py-1 font-display text-[10px] font-bold tracking-widest text-bio">
            <span className="h-2 w-2 animate-pulse rounded-full bg-bio" /> ACTIVE MISSION
          </div>
          <p className="flex items-center gap-2 font-display text-[11px] font-bold tracking-widest text-slate-400">
            <Calendar size={14} /> {mission.year} · DESTINATION: {mission.destination.toUpperCase()}
          </p>
          <h2 className="mt-2 pixel-heading text-lg text-white sm:text-xl">{mission.name}</h2>
          <p className="font-display text-base font-bold" style={{ color: copy.accent }}>
            “{mission.nickname}”
          </p>
          <p className="mt-2 text-base text-slate-200">{mission.summary}</p>
          <ol className="mt-3 space-y-2">
            {mission.briefing.map((line, i) => (
              <li key={line} className="flex gap-3 text-sm text-slate-300">
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-display text-[11px] font-black text-cosmic"
                  style={{ background: copy.accent }}
                >
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            <Target size={16} className={copy.accentClass} />
            <span>
              <b className="text-white">Stage 1:</b> 15-second {mission.cockpit.hazardLabel.toLowerCase()} dodge ·{' '}
              <b className="text-white">Stage 2:</b> habitat survival
            </span>
          </div>
          <button
            type="button"
            onMouseEnter={() => sfx.hover()}
            onClick={() => {
              sfx.powerUp()
              navigate(`/cockpit/${mission.id}`)
            }}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 font-display text-base font-black tracking-widest text-cosmic transition hover:scale-[1.02] hover:brightness-110 sm:w-auto sm:self-start sm:px-10"
            style={{ background: copy.accent, boxShadow: `0 0 30px ${copy.accent}99` }}
          >
            <Rocket size={20} /> LAUNCH MISSION
          </button>
        </motion.article>

        {/* Right column: locked previews + the docked mascot briefing (never covers the mission card) */}
        <div className="flex min-h-0 flex-col gap-3">
          {mission.lockedMissions.map((locked, i) => (
            <motion.article
              key={locked.name}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-panel relative overflow-hidden rounded-2xl px-4 py-3 opacity-80"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_14px,rgba(255,255,255,0.03)_14px,rgba(255,255,255,0.03)_28px)]" />
              <div className="relative flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-slate-300">
                  <Lock size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-black tracking-wider text-slate-200">{locked.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{locked.teaser}</p>
                  <p className="mt-1.5 inline-block rounded-full border border-white/15 px-2.5 py-0.5 font-display text-[9px] font-bold tracking-widest text-slate-400">
                    COMING SOON
                  </p>
                </div>
              </div>
            </motion.article>
          ))}

          <div className="relative min-h-0 flex-1">
            <AnimatePresence mode="wait">
              {briefingOpen ? (
                <RocketMascot
                  key="briefing"
                  steps={briefingSteps}
                  placement="dock"
                  size={110}
                  finishLabel="Let's fly!"
                  onFinish={() => {
                    sfx.success()
                    setBriefingOpen(false)
                  }}
                />
              ) : (
                <motion.button
                  key="reopen"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    sfx.click()
                    setBriefingOpen(true)
                  }}
                  className="glass-panel flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-cyan-glow transition hover:border-cyan-glow"
                >
                  <MessageCircle size={16} /> Ask Astro-Bot: what should I do?
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  )
}
