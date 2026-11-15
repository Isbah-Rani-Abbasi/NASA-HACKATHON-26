import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  ExternalLink,
  HeartPulse,
  Home,
  Loader2,
  Microscope,
  Minus,
  Navigation,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Shield,
  Sprout,
  Target,
  Wind,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import RocketMascot, { RocketMascotFigure } from '../components/RocketMascot'
import EventAlarm from '../components/EventAlarm'
import MissionAchievedWindow from '../components/MissionAchievedWindow'
import MissionPatch from '../components/MissionPatch'
import OutpostScene from '../components/OutpostScene'
import missionEvents from '../data/mission_events.json'
import missions from '../data/missions.json'
import osdrData from '../data/osdr_biology.json'
import { getDonkiForEvent } from '../services/spaceWeatherService'
import {
  DECISION_SECONDS,
  FAILURE_INFO,
  INITIAL_ALLOCATION,
  MAX_CELLS,
  MAX_SOLS,
  ROOMS,
  TOTAL_UNITS,
  availableUnits,
  evaluateOutcome,
  fitAllocation,
  initialState,
  isCorrectCall,
  roomStatus,
  roomText,
  simulateSol,
  totalCells,
} from '../utils/outpostSimulation'
import { sfx } from '../utils/soundEffects'

const RESOLUTION_MS = 2600
const ALERT_MS = 3400
const AUTO_NEXT_SECONDS = 15
const PATCH_STORAGE_KEY = 'chrono-outpost-patches'

function roomIcon(key, sector) {
  if (key === 'science') return sector === 'mars' ? Radio : Navigation
  return { lifeSupport: Wind, shielding: Shield, power: Zap, food: Sprout }[key]
}

export default function OutpostPage() {
  const { missionId } = useParams()
  const mission = missions[missionId]
  if (!mission) return <Navigate to="/sectors" replace />
  return <OutpostGame key={missionId} mission={mission} />
}

function readCockpitResult(missionId, routerState) {
  if (routerState && typeof routerState.hull === 'number') return routerState
  try {
    const saved = JSON.parse(sessionStorage.getItem(`chrono-cockpit-${missionId}`))
    if (saved && typeof saved.hull === 'number') return saved
  } catch {
    /* ignore malformed storage */
  }
  return { hull: 70, dodged: 0, hits: 0 }
}

function OutpostGame({ mission }) {
  const location = useLocation()
  const navigate = useNavigate()
  const sector = mission.sector
  const eventDefs = missionEvents[mission.id]
  const cockpit = useMemo(() => readCockpitResult(mission.id, location.state), [mission.id, location.state])

  const [levels, setLevels] = useState(() => initialState(sector, cockpit.hull))
  const [allocation, setAllocation] = useState(INITIAL_ALLOCATION)
  const [sol, setSol] = useState(1)
  const [cursor, setCursor] = useState(0)
  const [event, setEvent] = useState(null)
  // Astro-Bot only appears when the player taps "Ask Astro-Bot".
  const [phase, setPhase] = useState('planning') // alert | planning | animating | result | victory | failure
  const [resolution, setResolution] = useState(null)
  const [result, setResult] = useState(null)
  const [outcome, setOutcome] = useState(null)
  const [timeLeft, setTimeLeft] = useState(DECISION_SECONDS)
  const [hintActive, setHintActive] = useState(false)
  const [hintBubble, setHintBubble] = useState(false)
  const [autoLeft, setAutoLeft] = useState(AUTO_NEXT_SECONDS)
  const [autoPaused, setAutoPaused] = useState(false)
  const alertedKey = useRef(null)
  const [gridFull, setGridFull] = useState({ tick: 0, show: false })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const usedDonki = useRef(new Set())
  const timerRef = useRef(null)
  const gridTimerRef = useRef(null)

  const budget = availableUnits(levels)
  const used = totalCells(allocation)
  const correctNow = event ? isCorrectCall(allocation, event) : false
  const showHighlights = hintActive && !correctNow && phase === 'planning'
  const hints = showHighlights
    ? { boost: event.boost.room, cut: event.cut.filter((k) => allocation[k] > 0) }
    : null

  // Load the Unexpected Event (with a real DONKI record) for the current cursor.
  useEffect(() => {
    let alive = true
    const def = eventDefs[cursor % eventDefs.length]
    setEvent(null)
    getDonkiForEvent(def.donki, { preferClass: cursor < eventDefs.length ? def.preferClass : undefined, exclude: usedDonki.current }).then(
      (record) => {
        if (!alive) return
        if (record) usedDonki.current.add(record.id)
        const cls = record?.classType || 'X-class'
        setEvent({
          ...def,
          key: `${def.id}-${cursor}`,
          title: def.title.replace('{class}', cls),
          story: def.story.replaceAll('{class}', cls),
          donkiRecord: record,
          osdrFacts: def.osdr.map((k) => osdrData[k]).filter(Boolean),
        })
      },
    )
    return () => {
      alive = false
    }
  }, [cursor, eventDefs])

  // Every new event resets the 5-second decision timer and hints.
  useEffect(() => {
    setTimeLeft(DECISION_SECONDS)
    setHintActive(false)
    setHintBubble(false)
  }, [event?.key])

  // 5-second decision timer (Astro-Bot only helps when asked).
  useEffect(() => {
    if (phase !== 'planning' || !event || hintActive) return undefined
    const started = Date.now()
    const id = setInterval(() => {
      const left = Math.max(0, DECISION_SECONDS - (Date.now() - started) / 1000)
      setTimeLeft(left)
      if (left <= 0) clearInterval(id)
    }, 100)
    return () => clearInterval(id)
  }, [phase, event, hintActive])

  useEffect(
    () => () => {
      clearTimeout(timerRef.current)
      clearTimeout(gridTimerRef.current)
    },
    [],
  )

  // Every new event arrives automatically with a full-screen alarm.
  useEffect(() => {
    if (phase === 'planning' && event && alertedKey.current !== event.key) {
      alertedKey.current = event.key
      setPhase('alert')
      sfx.alarm()
      if (event.alarm?.effect === 'flare' || event.alarm?.effect === 'dust') sfx.whoosh()
    }
  }, [phase, event])

  useEffect(() => {
    if (phase !== 'alert') return undefined
    const t = setTimeout(() => {
      setTimeLeft(DECISION_SECONDS)
      setPhase('planning')
    }, ALERT_MS)
    return () => clearTimeout(t)
  }, [phase])

  // After a Sol's report, the next event arrives by itself (unless paused).
  const continueRef = useRef(null)
  useEffect(() => {
    if (phase !== 'result' || autoPaused) return undefined
    const id = setInterval(() => setAutoLeft((n) => Math.max(0, n - 1)), 1000)
    return () => clearInterval(id)
  }, [phase, autoPaused])

  useEffect(() => {
    if (phase === 'result' && !autoPaused && autoLeft === 0) continueRef.current?.()
  }, [phase, autoPaused, autoLeft])

  const askAstroBot = () => {
    sfx.beep()
    setHintActive(true)
    setHintBubble(true)
  }

  const adjust = (key, delta) => {
    if (phase !== 'planning') return
    const current = allocation[key]
    if (delta > 0) {
      if (current >= MAX_CELLS) return
      if (used >= budget) {
        setGridFull((g) => ({ tick: g.tick + 1, show: true }))
        clearTimeout(gridTimerRef.current)
        gridTimerRef.current = setTimeout(() => setGridFull((g) => ({ ...g, show: false })), 1800)
        sfx.hit()
        return
      }
    } else if (current <= 0) return
    const next = { ...allocation, [key]: current + delta }
    setAllocation(next)
    if (delta > 0) sfx.click()
    else sfx.hover()
    if (event && isCorrectCall(next, event) && !isCorrectCall(allocation, event)) sfx.success()
  }

  const execute = () => {
    if (phase !== 'planning' || !event) return
    sfx.powerUp()
    const sim = simulateSol(levels, allocation, event, sector)
    setHintBubble(false)
    setResolution({ status: sim.correct ? 'success' : 'fail', room: event.boost.room })
    setPhase('animating')
    timerRef.current = setTimeout(() => {
      setLevels(sim.state)
      setResult({ ...sim, event, sol, allocation })
      const end = evaluateOutcome(sim.state, sol)
      if (end?.result === 'victory') {
        setOutcome(end)
        setPhase('victory')
        celebrate(mission)
      } else if (end?.result === 'failure') {
        setOutcome(end)
        setPhase('failure')
        sfx.fail()
      } else {
        if (sim.correct) sfx.success()
        else sfx.fail()
        setAutoLeft(AUTO_NEXT_SECONDS)
        setAutoPaused(false)
        setPhase('result')
      }
    }, RESOLUTION_MS)
  }

  const continueToNextSol = () => {
    sfx.click()
    setResolution(null)
    setSol((s) => s + 1)
    setAllocation((a) => fitAllocation(a, availableUnits(levels)))
    setCursor((c) => c + 1)
    setPhase('planning')
  }
  continueRef.current = continueToNextSol

  const retry = () => {
    sfx.click()
    clearTimeout(timerRef.current)
    usedDonki.current = new Set()
    alertedKey.current = null
    setLevels(initialState(sector, cockpit.hull))
    setAllocation(INITIAL_ALLOCATION)
    setSol(1)
    setCursor(0)
    setResolution(null)
    setResult(null)
    setOutcome(null)
    setPhase('planning')
  }

  const progress = levels.science

  return (
    <main className="mx-auto max-w-7xl px-3 pt-20 pb-16 sm:px-6">
      {/* Header */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold tracking-[0.3em] text-solar">STAGE 2 · HABITAT SURVIVAL</p>
          <h1 className="mt-1 pixel-heading text-lg text-white sm:text-2xl">
            {mission.name} <span className="text-slate-400">· {sector === 'mars' ? 'Mars Habitat' : 'Lunar Lifeboat'}</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SolTracker sol={sol} done={phase === 'victory'} />
          <button
            id="inspect-data"
            type="button"
            onClick={() => {
              sfx.click()
              setDrawerOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-full border border-cyan-glow/50 bg-cyan-glow/10 px-3 py-1.5 text-xs font-bold text-cyan-glow transition hover:bg-cyan-glow hover:text-cosmic sm:text-sm"
          >
            <Microscope size={16} /> 🔬 Inspect Real NASA Data
          </button>
        </div>
      </header>

      {/* Mission progress + crew */}
      <div className="glass-panel mb-4 grid gap-3 rounded-2xl p-3 sm:grid-cols-[2fr_1fr] sm:p-4">
        <div>
          <div className="mb-1 flex justify-between font-display text-[11px] font-bold tracking-widest text-slate-300">
            <span className="flex items-center gap-1.5">
              <Target size={14} className="text-bio" /> MISSION SUCCESS PROGRESS
            </span>
            <span className="text-bio">{progress}%</span>
          </div>
          <Bar value={progress} color="#00E676" tall />
        </div>
        <div>
          <div className="mb-1 flex justify-between font-display text-[11px] font-bold tracking-widest text-slate-300">
            <span className="flex items-center gap-1.5">
              <HeartPulse size={14} className={levels.crewHealth > 30 ? 'text-bio' : 'animate-pulse text-crimson'} /> CREW HEALTH
            </span>
            <span>{levels.crewHealth}%</span>
          </div>
          <Bar value={levels.crewHealth} color={levels.crewHealth > 30 ? '#00E676' : '#FF3B5C'} tall />
        </div>
      </div>

      <EventCard
        event={event}
        timeLeft={timeLeft}
        phase={phase}
        hintActive={hintActive}
        correct={correctNow}
        showHint={phase === 'planning' && hintBubble}
        onAsk={askAstroBot}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <section className="flex flex-col gap-4">
          <div id="habitat-scene">
            <OutpostScene
              mission={mission}
              allocation={allocation}
              levels={levels}
              event={event}
              resolution={phase === 'animating' || phase === 'result' ? resolution : null}
              hints={hints}
              onAdjust={adjust}
              disabled={phase !== 'planning'}
            />
          </div>
          <AnimatePresence mode="wait">
            {phase === 'result' && result && (
              <ResultCard
                key={result.sol}
                result={result}
                mission={mission}
                levels={levels}
                onContinue={continueToNextSol}
                autoLeft={autoLeft}
                autoPaused={autoPaused}
                onTogglePause={() => setAutoPaused((p) => !p)}
              />
            )}
          </AnimatePresence>
        </section>

        {/* Power grid control panel */}
        <section className="glass-panel flex flex-col gap-2.5 rounded-3xl p-3 sm:p-4">
          <PowerGridMeter used={used} budget={budget} gridFull={gridFull} levels={levels} sector={sector} />
          {ROOMS.map((room) => (
            <RoomCard
              key={room.key}
              room={room}
              sector={sector}
              cells={allocation[room.key]}
              level={levels[room.key]}
              status={roomStatus(room.key, allocation[room.key], levels[room.key], event)}
              hint={hints?.boost === room.key ? 'boost' : hints?.cut?.includes(room.key) ? 'cut' : null}
              disabled={phase !== 'planning'}
              canAdd={used < budget}
              onAdjust={adjust}
            />
          ))}
          <div id="execute-panel" className="mt-1">
            <button
              type="button"
              onClick={execute}
              aria-disabled={phase !== 'planning'}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-glow to-bio py-4 font-display text-lg font-black tracking-widest text-cosmic shadow-[0_0_24px_rgba(0,240,255,0.45)] transition hover:scale-[1.02] ${
                phase === 'planning' ? 'animate-pulse-glow' : 'opacity-70'
              }`}
            >
              {phase === 'animating' ? <Loader2 className="animate-spin" size={22} /> : <Play size={22} />}
              {phase === 'animating' ? 'RUNNING SOL...' : `EXECUTE SOL ${sol}`}
            </button>
            <p className="mt-1.5 text-center text-[11px] text-slate-400">
              {used < budget ? `${budget - used} unit${budget - used > 1 ? 's' : ''} unused — that's allowed, but wasted!` : 'Grid fully routed. Ready when you are!'}
            </p>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {phase === 'planning' && hintBubble && event && (
          <RocketMascot
            key={`hint-${event.key}`}
            steps={[
              {
                title: 'CO-PILOT HINT',
                text: event.hint,
                noteTitle: '🧠 WHY? LEARN THE SCIENCE',
                note: event.learn,
              },
            ]}
            placement="bottom-left"
            size={130}
            showSkip={false}
            finishLabel="Got it!"
            onFinish={() => setHintBubble(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{phase === 'alert' && event && <EventAlarm key={event.key} event={event} duration={ALERT_MS / 1000} />}</AnimatePresence>

      <AnimatePresence>
        {drawerOpen && <DataDrawer event={event} sector={sector} onClose={() => setDrawerOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'victory' && <VictoryModal mission={mission} levels={levels} sol={sol} onRetry={retry} />}
        {phase === 'failure' && outcome && (
          <FailureModal
            cause={outcome.cause}
            levels={levels}
            result={result}
            onRetry={retry}
            onCockpit={() => navigate(`/cockpit/${mission.id}`)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

/* ------------------------------------------------------------------ */

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

function Bar({ value, color, tall }) {
  return (
    <div className={`overflow-hidden rounded-full bg-white/10 ${tall ? 'h-3' : 'h-1.5'}`}>
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
    <div className="glass-panel flex items-center gap-1 rounded-full px-3 py-1.5" aria-label={`Sol ${sol} of ${MAX_SOLS}`}>
      <span className="mr-1 font-display text-xs font-bold text-slate-300">SOL</span>
      {Array.from({ length: MAX_SOLS }, (_, i) => {
        const n = i + 1
        const state = n < sol || done ? 'done' : n === sol ? 'current' : 'todo'
        return (
          <span
            key={n}
            className={`grid h-5 w-5 place-items-center rounded-full font-display text-[9px] font-black ${
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

function EventCard({ event, timeLeft, phase, hintActive, correct, showHint, onAsk }) {
  const record = event?.donkiRecord
  const ring = 2 * Math.PI * 20
  const showTimer = phase === 'planning' && event
  return (
    <div id="event-card" className="glass-panel relative overflow-hidden rounded-3xl p-4 sm:p-5" style={{ borderColor: '#FF3B5C88' }}>
      <div className="absolute inset-y-0 left-0 w-1.5 bg-crimson shadow-[0_0_12px_#FF3B5C]" />
      {!event ? (
        <p className="flex items-center gap-2 text-slate-300">
          <Loader2 className="animate-spin" size={18} /> Scanning NASA DONKI & OSDR feeds...
        </p>
      ) : (
        <motion.div key={event.key} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4">
          <motion.span
            className="hidden text-5xl sm:block"
            animate={{ rotate: [-6, 6, -6], scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            aria-hidden="true"
          >
            {event.icon}
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="animate-warning rounded bg-crimson px-2 py-0.5 font-display text-[10px] font-black tracking-widest text-white">
                ⚠ UNEXPECTED EVENT
              </span>
              {record && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-wider ${
                    record.source === 'live' ? 'bg-bio/20 text-bio' : 'bg-solar/20 text-solar'
                  }`}
                >
                  {record.source === 'live' ? '● LIVE DONKI' : 'DONKI ARCHIVE · MAY 2024'} · {record.type} {record.classType || (record.speed ? `${record.speed} km/s` : '')}
                </span>
              )}
            </div>
            <h2 className="mt-1.5 font-display text-lg font-black text-white sm:text-2xl">
              <span className="sm:hidden">{event.icon} </span>
              {event.title}
            </h2>
            <p className="mt-1 text-base leading-relaxed text-slate-100">{event.story}</p>
            {phase === 'planning' && !showHint && !correct && (
              <motion.button
                type="button"
                onClick={onAsk}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-bio/60 bg-bio/10 px-4 py-2 font-display text-xs font-black tracking-wider text-bio transition hover:bg-bio hover:text-cosmic sm:text-sm"
                animate={(hintActive || timeLeft <= 0) && !correct ? { scale: [1, 1.06, 1] } : {}}
                transition={{ duration: 0.9, repeat: Infinity }}
              >
                🚀 ASK ASTRO-BOT: WHAT SHOULD I DO?
              </motion.button>
            )}
          </div>
          {showTimer && (
            <div className="flex shrink-0 flex-col items-center gap-1" aria-live="polite">
              <svg width="54" height="54" viewBox="0 0 54 54">
                <circle cx="27" cy="27" r="20" stroke="rgba(255,255,255,0.12)" strokeWidth="5" fill="none" />
                <circle
                  cx="27"
                  cy="27"
                  r="20"
                  stroke={correct ? '#00E676' : hintActive ? '#FFB800' : '#00F0FF'}
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={ring}
                  strokeDashoffset={correct ? 0 : ring * (1 - timeLeft / DECISION_SECONDS)}
                  transform="rotate(-90 27 27)"
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
                <text x="27" y="32" textAnchor="middle" fontSize="15" fontWeight="900" fill="white" fontFamily="Orbitron, sans-serif">
                  {correct ? '✓' : hintActive || timeLeft <= 0 ? '?' : Math.ceil(timeLeft)}
                </text>
              </svg>
              <span className="text-center font-display text-[9px] font-bold tracking-wider text-slate-400">
                {correct ? 'GREAT CALL' : hintActive ? 'HINT ON' : timeLeft <= 0 ? 'NEED HELP?' : 'DECIDE!'}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function PowerGridMeter({ used, budget, gridFull, levels, sector }) {
  const lost = TOTAL_UNITS - budget
  const flashing = gridFull.show
  return (
    <div id="power-grid" className="rounded-2xl bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-display text-xs font-bold tracking-widest text-slate-300">
          <Zap size={16} className="text-solar" /> POWER GRID
        </p>
        <span className="font-display text-xl font-black text-solar tabular-nums">
          {used} / {budget}
        </span>
      </div>
      <motion.div className="mt-2 flex gap-1" animate={flashing ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }} key={gridFull.tick}>
        {Array.from({ length: TOTAL_UNITS }, (_, i) => {
          const locked = i >= budget
          const on = i < used
          return (
            <span
              key={i}
              className="relative h-6 flex-1 rounded"
              style={{
                background: locked ? 'repeating-linear-gradient(45deg,#3f3f46 0 3px,#18181b 3px 6px)' : on ? '#FFB800' : 'rgba(255,255,255,0.1)',
                boxShadow: on ? '0 0 8px #FFB800' : 'none',
              }}
              title={locked ? 'Lost to brownout or dust' : undefined}
            />
          )
        })}
      </motion.div>
      <AnimatePresence>
        {flashing && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs font-bold text-crimson">
            Grid full! Press − on another room first — that's the trade-off!
          </motion.p>
        )}
      </AnimatePresence>
      {lost > 0 && (
        <p className="mt-1.5 text-[11px] font-bold text-solar">
          ⚠ {lost} unit{lost > 1 ? 's' : ''} offline ({sector === 'mars' && levels.dust >= 30 ? 'dust on solar arrays' : 'brownout'}). Boost the Reactor to 4 to recover.
        </p>
      )}
    </div>
  )
}

const BADGE = {
  CRITICAL: 'bg-crimson text-white animate-pulse',
  LOW: 'bg-solar text-cosmic',
  OPTIMAL: 'bg-bio text-cosmic',
}

function RoomCard({ room, sector, cells, level, status, hint, disabled, canAdd, onAdjust }) {
  const text = roomText(room, sector)
  const Icon = roomIcon(room.key, sector)
  return (
    <motion.div
      id={`room-card-${room.key}`}
      layout
      className={`relative rounded-2xl border bg-white/[0.03] p-2.5 transition ${
        hint === 'boost' ? 'border-bio shadow-[0_0_18px_#00E676]' : hint === 'cut' ? 'border-solar shadow-[0_0_18px_#FFB800]' : 'border-white/10'
      }`}
    >
      {hint && (
        <motion.span
          className={`absolute -top-2.5 right-3 rounded-full px-2 py-0.5 font-display text-[10px] font-black ${hint === 'boost' ? 'bg-bio text-cosmic' : 'bg-solar text-cosmic'}`}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {hint === 'boost' ? '▲ BOOST' : '▼ CUT'}
        </motion.span>
      )}
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${room.color}22`, color: room.color }}>
          <Icon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5">
            <span className="truncate font-display text-[13px] font-bold text-white">{text.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded px-1 py-px font-display text-[8px] font-black tracking-wider" style={{ background: `${room.color}25`, color: room.color }}>
              TIER {room.tier}
            </span>
            <span className={`rounded px-1 py-px font-display text-[8px] font-black tracking-wider ${BADGE[status]}`}>{status}</span>
            <span className="ml-auto text-[11px] font-bold text-slate-300 tabular-nums">{level}%</span>
          </div>
        </div>
      </div>
      <div className="mt-1.5">
        <Bar value={level} color={room.color} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAdjust(room.key, -1)}
          disabled={disabled || cells <= 0}
          aria-label={`Cut power to ${text.label}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/5 text-white transition enabled:hover:border-solar enabled:hover:bg-solar enabled:hover:text-cosmic enabled:active:scale-90 disabled:opacity-30"
        >
          <Minus size={16} strokeWidth={3} />
        </button>
        <div className="flex flex-1 gap-1" role="meter" aria-valuemin={0} aria-valuemax={MAX_CELLS} aria-valuenow={cells} aria-label={`${text.label} power cells`}>
          {Array.from({ length: MAX_CELLS }, (_, i) => (
            <motion.span
              key={i}
              className="h-6 flex-1 rounded-md border"
              initial={false}
              animate={{
                backgroundColor: i < cells ? room.color : 'rgba(255,255,255,0.06)',
                boxShadow: i < cells ? `0 0 10px ${room.color}` : '0 0 0px rgba(0,0,0,0)',
                scale: i === cells - 1 ? [1, 1.15, 1] : 1,
              }}
              transition={{ duration: 0.25 }}
              style={{ borderColor: i < cells ? room.color : 'rgba(255,255,255,0.12)' }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => onAdjust(room.key, 1)}
          disabled={disabled || cells >= MAX_CELLS}
          aria-label={`Boost power to ${text.label}`}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-white transition enabled:hover:border-bio enabled:hover:bg-bio enabled:hover:text-cosmic enabled:active:scale-90 disabled:opacity-30 ${
            canAdd ? 'border-white/15 bg-white/5' : 'border-white/5 bg-white/[0.02] text-slate-500'
          }`}
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  )
}

function ResultCard({ result, mission, levels, onContinue, autoLeft, autoPaused, onTogglePause }) {
  const ok = result.correct
  const ev = result.event
  const roomName = roomText(ROOMS.find((r) => r.key === ev.boost.room), mission.sector).label
  const deltaRooms = ROOMS.filter((r) => r.key !== 'science' && result.deltas[r.key] !== 0)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`glass-panel rounded-3xl p-4 sm:p-5 ${ok ? 'border-bio/60' : 'border-crimson/60'}`}
    >
      <p className={`font-display text-xs font-black tracking-widest ${ok ? 'text-bio' : 'text-crimson'}`}>
        SOL {result.sol} · {ok ? '✓ CORRECT TRADE-OFF' : '✕ WRONG TRADE-OFF'}
      </p>
      <p className="mt-1 text-base text-slate-100">{ok ? ev.success : ev.fail}</p>
      {!ok && (
        <p className="mt-2 rounded-xl bg-crimson/10 p-2.5 text-sm text-slate-200">
          <b className="text-crimson">Why it failed:</b> {roomName} needed {ev.boost.min}/5 cells but only had {result.allocation[ev.boost.room]}/5.{' '}
          {result.consequences.join(' ')}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-bio/15 px-2 py-0.5 font-bold text-bio">Mission +{result.progressGain}%</span>
        {deltaRooms.map((r) => (
          <span key={r.key} className="rounded-full bg-white/5 px-2 py-0.5 font-bold" style={{ color: result.deltas[r.key] > 0 ? r.color : '#FF8BA0' }}>
            {roomText(r, mission.sector).short} {result.deltas[r.key] > 0 ? '+' : ''}
            {result.deltas[r.key]}%
          </span>
        ))}
        {result.deltas.crewHealth !== 0 && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 font-bold" style={{ color: result.deltas.crewHealth > 0 ? '#00E676' : '#FF8BA0' }}>
            Crew {result.deltas.crewHealth > 0 ? '+' : ''}
            {result.deltas.crewHealth}%
          </span>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-solar/40 bg-solar/5 p-3">
        <p className="font-display text-[11px] font-black tracking-widest text-solar">
          📜 NASA HISTORICAL LOG · {mission.name} ({mission.year})
        </p>
        <p className="mt-0.5 text-xs font-bold text-slate-400">{ev.history.when}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-white/5 p-2.5 text-sm text-slate-300">
            <p className="mb-1 font-display text-[10px] font-bold tracking-widest text-slate-400">REAL HISTORY</p>
            {ev.history.text}
          </div>
          <div className={`rounded-xl p-2.5 text-sm ${ok ? 'bg-bio/10 text-slate-100' : 'bg-crimson/10 text-slate-200'}`}>
            <p className={`mb-1 font-display text-[10px] font-bold tracking-widest ${ok ? 'text-bio' : 'text-crimson'}`}>YOUR DECISION</p>
            {ok
              ? `You routed ${result.allocation[ev.boost.room]}/5 cells to the ${roomName} and solved the crisis.`
              : `You gave the ${roomName} only ${result.allocation[ev.boost.room]}/5 cells. Next time, boost it to ${ev.boost.min}/5!`}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-slate-400">Life Support {levels.lifeSupport}% · Crew {levels.crewHealth}%</p>
          <p className={`mt-0.5 font-display text-[11px] font-bold tracking-wider ${autoPaused ? 'text-slate-400' : 'animate-pulse text-crimson'}`}>
            {autoPaused ? '⏸ Paused — read as long as you like' : `⚠ Next event arrives in ${autoLeft}s...`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className="rounded-2xl border border-white/20 px-4 py-2.5 font-display text-xs font-bold text-white hover:bg-white/10"
          >
            {autoPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-2xl bg-cyan-glow px-5 py-2.5 font-display text-sm font-black tracking-widest text-cosmic transition hover:scale-105"
          >
            NEXT SOL NOW →
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function DataDrawer({ event, sector, onClose }) {
  const record = event?.donkiRecord
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const rows = record
    ? [
        ['DONKI Event ID', record.id],
        ['Type', `${record.type} · ${record.typeLabel}`],
        record.classType && ['Flare class', record.classType],
        record.speed && ['CME speed', `${record.speed.toLocaleString('en-US')} km/s`],
        ['Time (UTC)', record.timeLabel],
        record.sourceLocation && ['Location on Sun', record.sourceLocation],
        record.activeRegion && ['Active region', `AR ${record.activeRegion}`],
        record.instrument && ['Detected by', record.instrument],
        ['Data feed', record.source === 'live' ? 'Live NASA CCMC DONKI API' : 'Bundled DONKI archive (May 2024 storms)'],
      ].filter(Boolean)
    : []
  const boostRoom = event && ROOMS.find((r) => r.key === event.boost.room)
  return (
    <>
      <motion.div className="fixed inset-0 z-[65] bg-cosmic/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Real NASA data for this Sol"
        className="glass-panel fixed top-0 right-0 bottom-0 z-[66] w-full max-w-md overflow-y-auto rounded-l-3xl p-5"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 160, damping: 22 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-black text-white">🔬 Real NASA Data</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-300 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        {!event ? (
          <p className="mt-4 text-slate-300">Loading this Sol's data...</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-400">
              Driving this Sol: <b className="text-white">{event.title}</b>
            </p>

            <section className="mt-4 rounded-2xl border border-solar/30 bg-solar/5 p-3">
              <h3 className="font-display text-xs font-black tracking-widest text-solar">NASA DONKI · SPACE WEATHER</h3>
              {record ? (
                <dl className="mt-2 space-y-1.5 text-sm">
                  {rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="shrink-0 text-slate-400">{k}</dt>
                      <dd className="text-right font-bold break-all text-slate-100">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-sm text-slate-300">No DONKI record loaded.</p>
              )}
              {record?.link && (
                <a href={record.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-cyan-glow hover:underline">
                  Open the official DONKI record <ExternalLink size={12} />
                </a>
              )}
              {record?.kidText && <p className="mt-2 text-xs text-slate-300">{record.kidText}</p>}
            </section>

            {event.osdrFacts.map((fact) => (
              <section key={fact.title} className="mt-3 rounded-2xl border border-[#FF5FD2]/30 bg-[#FF5FD2]/5 p-3">
                <h3 className="font-display text-xs font-black tracking-widest text-[#FF8BE0]">NASA OSDR · {fact.title}</h3>
                <p className="mt-0.5 text-[11px] text-slate-400">{fact.experiment}</p>
                <ul className="mt-2 space-y-2">
                  {fact.metrics.map((m) => (
                    <li key={m.label} className="text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">{m.label}</span>
                        <span className="text-right font-bold text-slate-100">{m.value}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{m.note}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-200">
                  <b>Why it matters:</b> {fact.why}
                </p>
              </section>
            ))}

            <section className="mt-3 rounded-2xl border border-bio/30 bg-bio/5 p-3">
              <h3 className="font-display text-xs font-black tracking-widest text-bio">💡 WHY THIS MATTERS</h3>
              <p className="mt-1 text-sm text-slate-100">
                Real astronauts and mission controllers read data like this to make life-or-death choices. Today the numbers point to the{' '}
                <b>{boostRoom ? roomText(boostRoom, sector).label : 'right room'}</b> — but every boost means cutting power somewhere else, just like the real Apollo 13 and Mars teams had to.
              </p>
            </section>
            <p className="mt-3 text-[10px] text-slate-500">{osdrData.note}</p>
          </>
        )}
      </motion.aside>
    </>
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
      <div className="grid items-center gap-5 md:grid-cols-[1.4fr_1fr]">
        <MissionAchievedWindow missionId={mission.id} />
        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <MissionPatch patch={mission.patch} size={130} />
          <p className="flex items-center gap-2 font-display text-xs font-bold tracking-[0.3em] text-bio">
            <Award size={16} /> PATCH UNLOCKED
          </p>
          <h2 className="pixel-heading text-2xl text-white sm:text-3xl">
            MISSION <span className="glow-text text-cyan-glow">ACHIEVED!</span>
          </h2>
          <p className="text-sm text-slate-200">
            100% Mission Progress in {sol} Sol{sol > 1 ? 's' : ''}, with Life Support at {levels.lifeSupport}% and Crew Health at {levels.crewHealth}%.
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

function FailureModal({ cause, levels, result, onRetry, onCockpit }) {
  const info = FAILURE_INFO[cause] || FAILURE_INFO.lifeSupport
  const lastWhy = result && !result.correct && result.event.boost.room === cause ? result.event.fail : null
  return (
    <ModalShell tone="#FF3B5C">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0">
          <RocketMascotFigure size={150} mood="worried" />
        </div>
        <div className="text-center sm:text-left">
          <p className="font-display text-xs font-bold tracking-[0.3em] text-crimson">MISSION INTERRUPTED</p>
          <h2 className="mt-2 pixel-heading text-lg text-white sm:text-xl">{info.title}</h2>
          {lastWhy && <p className="mt-2 text-sm text-slate-300">{lastWhy}</p>}
          <div className="mt-4 rounded-2xl border border-cyan-glow/30 bg-cyan-glow/10 p-4 text-left">
            <p className="font-display text-xs font-bold tracking-widest text-cyan-glow">ASTRO-BOT TIP</p>
            <p className="mt-1 text-slate-100">{info.tip}</p>
            <p className="mt-2 text-sm text-slate-300">Don't worry — real NASA engineers learn from every problem. That's how Apollo 13 got home!</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs sm:grid-cols-6">
            {[...ROOMS, { key: 'crewHealth', short: 'Crew', color: '#00E676' }].map((r) => (
              <div key={r.key} className="rounded-xl bg-white/5 p-2 text-center">
                <p className="truncate text-slate-400">{r.short}</p>
                <p className="font-display font-black" style={{ color: levels[r.key] <= 0 ? '#FF3B5C' : r.color }}>
                  {levels[r.key]}%
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
