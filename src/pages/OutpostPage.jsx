import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'motion/react'
import {
  Atom,
  Award,
  BatteryCharging,
  ExternalLink,
  HeartPulse,
  Home,
  Loader2,
  Play,
  RotateCcw,
  Shield,
  Sprout,
  Sun,
  Wind,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import AstroBotMascot, { AstroBotFigure } from '../components/AstroBotMascot'
import MissionPatch from '../components/MissionPatch'
import OutpostScene from '../components/OutpostScene'
import missions from '../data/missions.json'
import { buildSolForecast } from '../services/spaceWeatherService'
import {
  DEFAULT_ALLOCATION,
  FAILURE_INFO,
  MAX_ALLOCATION,
  SUBSYSTEMS,
  TOTAL_SOLS,
  evaluateOutcome,
  fitAllocation,
  hullBonus,
  powerBudget,
  simulateSol,
} from '../utils/outpostSimulation'
import { sfx } from '../utils/soundEffects'

const ICONS = { lifeSupport: Wind, shielding: Shield, power: BatteryCharging, food: Sprout, science: Atom }
const SOL_ANIMATION_MS = 2000
const PATCH_STORAGE_KEY = 'chrono-outpost-patches'

export default function OutpostPage() {
  const { missionId } = useParams()
  const mission = missions[missionId]
  if (!mission) return <Navigate to="/sectors" replace />
  return <OutpostGame key={missionId} mission={mission} />
}

function readCockpitResult(missionId, routerState) {
  if (routerState && typeof routerState.hull === 'number') return { ...routerState, fromCockpit: true }
  try {
    const saved = JSON.parse(sessionStorage.getItem(`chrono-cockpit-${missionId}`))
    if (saved && typeof saved.hull === 'number') return { ...saved, fromCockpit: true }
  } catch {
    /* ignore malformed storage */
  }
  return { hull: 70, dodged: 0, hits: 0, fromCockpit: false }
}

function OutpostGame({ mission }) {
  const location = useLocation()
  const navigate = useNavigate()
  const cockpit = useMemo(() => readCockpitResult(mission.id, location.state), [mission.id, location.state])
  const theme = mission.environment.theme

  const [levels, setLevels] = useState(mission.startingSubsystems)
  const [sol, setSol] = useState(1)
  const [allocation, setAllocation] = useState(DEFAULT_ALLOCATION)
  const [forecast, setForecast] = useState(null)
  const [feed, setFeed] = useState({ source: 'loading', reason: '' })
  const [phase, setPhase] = useState('tutorial') // tutorial | planning | animating | victory | failure
  const [lastReport, setLastReport] = useState(null)
  const [outcome, setOutcome] = useState(null)
  const timerRef = useRef(null)

  const budget = powerBudget(levels.power, cockpit.hull)
  const used = Object.values(allocation).reduce((a, b) => a + b, 0)
  const remaining = budget - used
  const event = forecast?.[sol - 1]

  const loadForecast = useCallback(() => {
    let alive = true
    setForecast(null)
    buildSolForecast(mission.sector, TOTAL_SOLS).then((res) => {
      if (!alive) return
      setForecast(res.forecast)
      setFeed({ source: res.source, reason: res.reason })
    })
    return () => {
      alive = false
    }
  }, [mission.sector])

  useEffect(() => loadForecast(), [loadForecast])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  // Keep allocation inside the budget when Power changes between Sols.
  useEffect(() => {
    setAllocation((a) => fitAllocation(a, budget))
  }, [budget])

  const setSlider = (key, value) => {
    const others = used - allocation[key]
    const capped = Math.max(0, Math.min(value, budget - others, MAX_ALLOCATION))
    if (capped === allocation[key]) return
    sfx.hover()
    setAllocation({ ...allocation, [key]: capped })
  }

  const executeSol = () => {
    if (!event || phase !== 'planning') return
    sfx.powerUp()
    setPhase('animating')
    const { state: nextLevels, report } = simulateSol(levels, allocation, event)
    timerRef.current = setTimeout(() => {
      setLevels(nextLevels)
      setLastReport({ sol, report })
      const result = evaluateOutcome(nextLevels, sol)
      if (result?.result === 'victory') {
        setOutcome(result)
        setPhase('victory')
        celebrate(mission)
      } else if (result?.result === 'failure') {
        setOutcome(result)
        setPhase('failure')
        sfx.fail()
      } else {
        sfx.success()
        setSol((s) => s + 1)
        setPhase('planning')
      }
    }, SOL_ANIMATION_MS)
  }

  const retry = () => {
    sfx.click()
    clearTimeout(timerRef.current)
    setLevels(mission.startingSubsystems)
    setSol(1)
    setAllocation(DEFAULT_ALLOCATION)
    setLastReport(null)
    setOutcome(null)
    setPhase('planning')
    loadForecast()
  }

  const tutorialSteps = useMemo(
    () => [
      {
        title: 'WE LANDED!',
        text: `Phew, we survived the crash, Commander! Your ${theme === 'lunar' ? 'lunar' : 'Martian'} outpost has 5 subsystems. Let me show them from MOST important to least.`,
        target: '#subsystem-panel',
      },
      ...SUBSYSTEMS.map((s) => ({
        title: `TIER ${s.tier} · ${s.priority}`,
        text: `${s.label} (${s.sub}): ${s.tip}`,
        target: `#subsys-${s.key}`,
      })),
      {
        title: 'NASA DONKI',
        text: "Every Sol, NASA's DONKI space weather network sends a real alert about flares, CMEs or particle storms. Read it to decide where your power goes!",
        target: '#donki-alert',
      },
      {
        title: 'YOUR POWER',
        text: `You have ${budget} power points per Sol${hullBonus(cockpit.hull) ? ` (+${hullBonus(cockpit.hull)} bonus for protecting your hull!)` : ''}. Drag the sliders, then press EXECUTE SOL. Reach 100% Science within ${TOTAL_SOLS} Sols to win!`,
        target: '#execute-panel',
      },
    ],
    [theme, cockpit.hull, budget],
  )

  const lowestCritical = levels.lifeSupport <= 25 || levels.crewHealth <= 30

  return (
    <main className="mx-auto max-w-7xl px-3 pt-20 pb-16 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold tracking-[0.3em] text-solar">STAGE 2 · OUTPOST SURVIVAL</p>
          <h1 className="font-display text-2xl font-black text-white sm:text-3xl">
            {mission.name} <span className="text-slate-400">· {theme === 'lunar' ? 'Lunar' : 'Martian'} Outpost</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SolTracker sol={sol} done={phase === 'victory'} />
          <span className="glass-panel rounded-full px-3 py-1.5 text-xs font-bold text-slate-200">
            Hull from cockpit: <span className="text-cyan-glow">{cockpit.hull}%</span>
          </span>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT: alert + scene */}
        <section className="flex flex-col gap-5">
          <DonkiAlert event={event} feed={feed} sol={sol} />

          <div className="glass-panel relative overflow-hidden rounded-3xl">
            <div className="aspect-[2/1]">
              <OutpostScene theme={theme} animating={phase === 'animating'} allocation={allocation} event={event} levels={levels} />
            </div>
            <AnimatePresence>
              {phase === 'animating' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-cosmic/80 px-4 py-1.5 font-display text-xs font-bold tracking-widest text-cyan-glow"
                >
                  EXECUTING SOL {sol}...
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
              <HeartPulse className={levels.crewHealth > 30 ? 'text-bio' : 'animate-pulse text-crimson'} size={22} />
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-xs font-bold text-slate-300">
                  <span>CREW HEALTH</span>
                  <span>{levels.crewHealth}%</span>
                </div>
                <Bar value={levels.crewHealth} color={levels.crewHealth > 30 ? '#00E676' : '#FF3B5C'} />
              </div>
            </div>
          </div>

          {lastReport && (
            <motion.div key={lastReport.sol} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-3xl p-4">
              <p className="mb-2 font-display text-xs font-bold tracking-widest text-slate-400">SOL {lastReport.sol} REPORT</p>
              <ul className="space-y-1.5 text-sm">
                {lastReport.report.map((r) => (
                  <li key={r.text} className={r.tone === 'good' ? 'text-bio' : r.tone === 'bad' ? 'text-crimson' : 'text-slate-200'}>
                    {r.tone === 'good' ? '✓' : r.tone === 'bad' ? '⚠' : '•'} {r.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </section>

        {/* RIGHT: subsystem control panel */}
        <section id="subsystem-panel" className="glass-panel flex flex-col gap-3 rounded-3xl p-4 sm:p-5">
          <div id="power-budget" className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 p-3">
            <div className="flex items-center gap-2">
              <Zap className="text-solar" size={22} />
              <div>
                <p className="font-display text-xs font-bold tracking-widest text-slate-300">AVAILABLE POWER</p>
                <p className="text-xs text-slate-400">Points to spend this Sol</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1" aria-label={`${remaining} of ${budget} power points left`}>
              {Array.from({ length: budget }, (_, i) => (
                <motion.span
                  key={i}
                  layout
                  className="h-5 w-3 rounded-sm"
                  style={{
                    background: i < remaining ? '#FFB800' : 'rgba(255,255,255,0.12)',
                    boxShadow: i < remaining ? '0 0 8px #FFB800' : 'none',
                  }}
                />
              ))}
              <span className="ml-2 font-display text-lg font-black text-solar tabular-nums">
                {remaining}/{budget}
              </span>
            </div>
          </div>

          {SUBSYSTEMS.map((s) => (
            <SubsystemRow
              key={s.key}
              subsystem={s}
              level={levels[s.key]}
              value={allocation[s.key]}
              onChange={(v) => setSlider(s.key, v)}
              disabled={phase !== 'planning'}
              maxReachable={Math.min(MAX_ALLOCATION, allocation[s.key] + remaining)}
            />
          ))}

          <div id="execute-panel" className="mt-1 flex flex-col gap-2">
            {remaining > 0 && phase === 'planning' && (
              <p className="text-center text-xs font-bold text-solar">You still have {remaining} unused power point{remaining > 1 ? 's' : ''}!</p>
            )}
            {lowestCritical && phase === 'planning' && (
              <p className="text-center text-xs font-bold text-crimson">⚠ Danger! Life Support or Crew Health is low.</p>
            )}
            <button
              type="button"
              onClick={executeSol}
              disabled={phase !== 'planning' || !event}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-glow to-bio py-4 font-display text-lg font-black tracking-widest text-cosmic shadow-[0_0_24px_rgba(0,240,255,0.45)] transition enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === 'animating' ? <Loader2 className="animate-spin" size={22} /> : <Play size={22} />}
              {phase === 'animating' ? 'RUNNING SOL...' : `EXECUTE SOL ${Math.min(sol, TOTAL_SOLS)}`}
            </button>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {phase === 'tutorial' && (
          <AstroBotMascot
            steps={tutorialSteps}
            placement="bottom-left"
            onFinish={() => {
              sfx.success()
              setPhase('planning')
            }}
            finishLabel="Start Sol 1!"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'victory' && <VictoryModal mission={mission} levels={levels} sol={sol} onRetry={retry} />}
        {phase === 'failure' && outcome && (
          <FailureModal cause={outcome.cause} levels={levels} onRetry={retry} onCockpit={() => navigate(`/cockpit/${mission.id}`)} />
        )}
      </AnimatePresence>
    </main>
  )
}

function celebrate(mission) {
  sfx.fanfare()
  const colors = [mission.patch.primary, mission.patch.secondary, '#ffffff', '#00E676']
  confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 }, colors, zIndex: 9999 })
  const end = Date.now() + 2200
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors, zIndex: 9999 })
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors, zIndex: 9999 })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  try {
    const patches = new Set(JSON.parse(localStorage.getItem(PATCH_STORAGE_KEY) || '[]'))
    patches.add(mission.id)
    localStorage.setItem(PATCH_STORAGE_KEY, JSON.stringify([...patches]))
  } catch {
    /* storage unavailable — patch still shown for this session */
  }
}

function Bar({ value, color }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full"
        initial={false}
        animate={{ width: `${value}%` }}
        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
      />
    </div>
  )
}

function SolTracker({ sol, done }) {
  return (
    <div className="glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5" aria-label={`Sol ${sol} of ${TOTAL_SOLS}`}>
      <span className="mr-1 font-display text-xs font-bold text-slate-300">SOL</span>
      {Array.from({ length: TOTAL_SOLS }, (_, i) => {
        const n = i + 1
        const state = n < sol || done ? 'done' : n === sol ? 'current' : 'todo'
        return (
          <span
            key={n}
            className={`grid h-6 w-6 place-items-center rounded-full font-display text-[10px] font-black ${
              state === 'done' ? 'bg-bio text-cosmic' : state === 'current' ? 'animate-pulse bg-cyan-glow text-cosmic' : 'bg-white/10 text-slate-400'
            }`}
          >
            {n}
          </span>
        )
      })}
    </div>
  )
}

function DonkiAlert({ event, feed, sol }) {
  const sevColor = !event ? '#94a3b8' : event.type === 'CALM' ? '#00E676' : event.severity >= 2.5 ? '#FF3B5C' : event.severity >= 1.5 ? '#FFB800' : '#00F0FF'
  return (
    <div id="donki-alert" className="glass-panel relative overflow-hidden rounded-3xl p-4 sm:p-5" style={{ borderColor: `${sevColor}88` }}>
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: sevColor, boxShadow: `0 0 12px ${sevColor}` }} />
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-display text-xs font-bold tracking-widest" style={{ color: sevColor }}>
          <Sun size={16} /> NASA DONKI SPACE WEATHER ALERT · SOL {Math.min(sol, TOTAL_SOLS)}
        </p>
        <span
          title={feed.reason}
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider ${
            feed.source === 'live' ? 'bg-bio/20 text-bio' : feed.source === 'archive' ? 'bg-solar/20 text-solar' : 'bg-white/10 text-slate-300'
          }`}
        >
          {feed.source === 'live' ? '● LIVE FEED' : feed.source === 'archive' ? 'ARCHIVE · MAY 2024 STORMS' : 'CONNECTING...'}
        </span>
      </div>
      {!event ? (
        <p className="flex items-center gap-2 text-slate-300">
          <Loader2 className="animate-spin" size={18} /> Contacting NASA DONKI...
        </p>
      ) : (
        <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-display text-lg font-black text-white sm:text-xl">{event.headline}</h2>
          <p className="mt-1 text-base leading-relaxed text-slate-100">{event.kidText}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
            <span>
              {event.typeLabel} · {event.detail}
            </span>
            {event.link && (
              <a href={event.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-glow hover:underline">
                DONKI record <ExternalLink size={11} />
              </a>
            )}
          </p>
        </motion.div>
      )}
    </div>
  )
}

function SubsystemRow({ subsystem: s, level, value, onChange, disabled, maxReachable }) {
  const Icon = ICONS[s.key]
  const danger = s.key === 'lifeSupport' && level <= 25
  return (
    <div id={`subsys-${s.key}`} className={`rounded-2xl border bg-white/[0.03] p-3 transition ${danger ? 'border-crimson/70' : 'border-white/10'}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${s.color}22`, color: s.color }}>
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-display text-sm font-bold text-white">{s.label}</span>
            <span className="rounded px-1.5 py-px font-display text-[9px] font-black tracking-wider" style={{ background: `${s.color}25`, color: s.color }}>
              TIER {s.tier} · {s.priority}
            </span>
          </div>
          <p className="truncate text-[11px] text-slate-400">
            {s.sub} · {s.effect}
          </p>
        </div>
        <span className={`font-display text-lg font-black tabular-nums ${danger ? 'animate-pulse text-crimson' : 'text-white'}`}>{level}%</span>
      </div>
      <div className="mt-2">
        <Bar value={level} color={s.color} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={MAX_ALLOCATION}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="power-slider"
          style={{ '--slider-color': s.color, '--fill': `${(value / MAX_ALLOCATION) * 100}%` }}
          aria-label={`Power to ${s.label}`}
          aria-valuetext={`${value} power points`}
        />
        <span className="w-16 shrink-0 text-right font-display text-xs font-bold" style={{ color: s.color }}>
          ⚡ {value}
          {value >= maxReachable && value < MAX_ALLOCATION ? <span className="text-slate-500"> max</span> : null}
        </span>
      </div>
    </div>
  )
}

function ModalShell({ children, tone }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-cosmic/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        className="glass-panel my-8 w-full max-w-4xl rounded-3xl p-5 sm:p-8"
        style={{ borderColor: tone }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function VictoryModal({ mission, levels, sol, onRetry }) {
  const other = Object.values(missions).find((m) => m.id !== mission.id)
  return (
    <ModalShell tone="#00E676">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <MissionPatch patch={mission.patch} size={170} />
        <div>
          <p className="flex items-center justify-center gap-2 font-display text-xs font-bold tracking-[0.3em] text-bio sm:justify-start">
            <Award size={16} /> PATCH UNLOCKED
          </p>
          <h2 className="mt-1 font-display text-3xl font-black text-white sm:text-4xl">
            HISTORY <span className="glow-text text-cyan-glow">REWRITTEN!</span>
          </h2>
          <p className="mt-2 text-slate-200">
            You reached 100% Science in {sol} Sol{sol > 1 ? 's' : ''} with Life Support at {levels.lifeSupport}% and Crew Health at {levels.crewHealth}%. Amazing work, Commander!
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 font-display text-sm font-black tracking-widest text-slate-300">📜 {mission.history.realTitle}</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {mission.history.real.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-slate-500">•</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-bio/40 bg-bio/10 p-4">
          <h3 className="mb-3 font-display text-sm font-black tracking-widest text-bio">🚀 {mission.history.rewriteTitle}</h3>
          <ul className="space-y-2 text-sm text-slate-100">
            {mission.history.rewrite.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-bio">✓</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onRetry} className="flex items-center gap-2 rounded-2xl border border-white/20 px-5 py-3 font-display text-sm font-bold text-white hover:bg-white/10">
          <RotateCcw size={18} /> PLAY AGAIN
        </button>
        {other && (
          <Link
            to={`/${other.sector}`}
            onClick={() => sfx.click()}
            className="flex items-center gap-2 rounded-2xl bg-cyan-glow px-5 py-3 font-display text-sm font-black text-cosmic hover:brightness-110"
          >
            TRY {other.sector === 'mars' ? 'MARS' : 'THE MOON'} →
          </Link>
        )}
        <Link to="/" onClick={() => sfx.click()} className="flex items-center gap-2 rounded-2xl border border-white/20 px-5 py-3 font-display text-sm font-bold text-white hover:bg-white/10">
          <Home size={18} /> HOME
        </Link>
      </div>
    </ModalShell>
  )
}

function FailureModal({ cause, levels, onRetry, onCockpit }) {
  const info = FAILURE_INFO[cause] || FAILURE_INFO.lifeSupport
  const failedLabel = cause === 'crewHealth' || cause === 'food' ? 'Crew Health' : SUBSYSTEMS.find((s) => s.key === cause)?.label
  return (
    <ModalShell tone="#FF3B5C">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0">
          <AstroBotFigure size={120} mood="worried" />
        </div>
        <div className="text-center sm:text-left">
          <p className="font-display text-xs font-bold tracking-[0.3em] text-crimson">MISSION INTERRUPTED · {failedLabel?.toUpperCase()}</p>
          <h2 className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">{info.title}</h2>
          <div className="mt-4 rounded-2xl border border-cyan-glow/30 bg-cyan-glow/10 p-4 text-left">
            <p className="font-display text-xs font-bold tracking-widest text-cyan-glow">ASTRO-BOT TIP</p>
            <p className="mt-1 text-slate-100">{info.tip}</p>
            <p className="mt-2 text-sm text-slate-300">Don't worry — real NASA engineers learn from every problem. That's how Apollo 13 got home!</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs sm:grid-cols-6">
            {[...SUBSYSTEMS, { key: 'crewHealth', label: 'Crew', color: '#00E676' }].map((s) => (
              <div key={s.key} className="rounded-xl bg-white/5 p-2 text-center">
                <p className="truncate text-slate-400">{s.label.split(' ')[0]}</p>
                <p className="font-display font-black" style={{ color: levels[s.key] <= 0 ? '#FF3B5C' : s.color }}>
                  {levels[s.key]}%
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 rounded-2xl bg-crimson px-6 py-3.5 font-display text-base font-black tracking-widest text-white shadow-[0_0_24px_rgba(255,59,92,0.5)] hover:brightness-110"
            >
              <RotateCcw size={20} /> RETRY MISSION
            </button>
            <button
              type="button"
              onClick={() => {
                sfx.click()
                onCockpit()
              }}
              className="rounded-2xl border border-white/20 px-5 py-3.5 font-display text-sm font-bold text-white hover:bg-white/10"
            >
              REPLAY COCKPIT
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
