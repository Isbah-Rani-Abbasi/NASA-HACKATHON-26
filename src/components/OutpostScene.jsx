import { AnimatePresence, motion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { MAX_CELLS, ROOMS, roomStatus, roomText } from '../utils/outpostSimulation'
import { EarthStickerG } from './EarthSticker'

/*
 * Interactive 5-room habitat cross-section.
 * Coordinates use a 160 × 100 grid that matches the 16:10 viewport, so SVG
 * overlays and absolutely-positioned HTML rooms line up exactly.
 */
const LAYOUT = {
  lifeSupport: { x: 12, y: 26, w: 42, h: 31 },
  shielding: { x: 59, y: 26, w: 42, h: 31 },
  science: { x: 106, y: 26, w: 42, h: 31 },
  power: { x: 12, y: 60, w: 42, h: 28 },
  food: { x: 59, y: 60, w: 89, h: 28 },
}

// Cables from the Reactor Bay to every other room, routed through the corridors.
const CABLES = {
  lifeSupport: 'M30 60 V58.5 H30 V57',
  shielding: 'M40 60 V58.5 H80 V57',
  science: 'M48 60 V58.5 H127 V57',
  food: 'M54 74 H59',
}

const pos = ({ x, y, w, h }) => ({ left: `${(x / 160) * 100}%`, top: `${y}%`, width: `${(w / 160) * 100}%`, height: `${h}%` })

const STATUS_STYLE = {
  CRITICAL: 'bg-crimson text-white animate-pulse',
  LOW: 'bg-solar text-cosmic',
  OPTIMAL: 'bg-bio text-cosmic',
}

const WEATHER_EVENTS = new Set(['FLR', 'SEP'])

export default function OutpostScene({ mission, allocation, levels, event, resolution, hints, onAdjust, disabled, full }) {
  const mars = mission.sector === 'mars'
  const a = allocation
  const resRoom = resolution?.room
  const resOk = resolution?.status === 'success'
  const resFail = resolution?.status === 'fail'
  const weather = event && WEATHER_EVENTS.has(event.donki)

  const frost = (a.lifeSupport <= 1 && !(resOk && resRoom === 'lifeSupport')) || (resFail && resRoom === 'lifeSupport')
  const brownout = resFail && resRoom === 'power'
  const forcefield = a.shielding >= 4 || (resOk && resRoom === 'shielding')
  const radiationLeak = weather && (resolution ? resFail && resRoom === 'shielding' : a.shielding < 4)

  const stars = useMemo(
    () => Array.from({ length: 45 }, (_, i) => ({ x: (i * 53.7) % 160, y: (i * 17.3) % 32, r: 0.15 + (i % 3) * 0.12 })),
    [],
  )

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-white/10 ${full ? '' : 'aspect-[16/10]'}`}>
      {/* ---------- Exterior + structure (SVG) ---------- */}
      <svg viewBox="0 0 160 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="hab-sky" x1="0" y1="0" x2="0" y2="1">
            {mars ? (
              <>
                <stop offset="0%" stopColor="#2a0f1a" />
                <stop offset="70%" stopColor="#a7533f" />
                <stop offset="100%" stopColor="#d99472" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#02040c" />
                <stop offset="100%" stopColor="#0c1430" />
              </>
            )}
          </linearGradient>
          <linearGradient id="hab-hull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <radialGradient id="hab-field" cx="50%" cy="100%" r="100%">
            <stop offset="60%" stopColor="rgba(0,240,255,0)" />
            <stop offset="100%" stopColor="rgba(0,240,255,0.35)" />
          </radialGradient>
        </defs>

        <rect width="160" height="100" fill="url(#hab-sky)" />
        {!mars && stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity="0.8" />)}
        {mars && (
          <>
            <circle cx="140" cy="10" r="3" fill="#fff1d6" opacity="0.9" />
            <circle cx="140" cy="10" r="7" fill="#ffe0b0" opacity="0.2" />
            <motion.circle cy="8" r="1.3" fill="#9c8a7c" animate={{ cx: [10, 60, 10] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
          </>
        )}

        {/* Ground */}
        <path d={mars ? 'M0 86 L20 83 L45 87 L80 84 L120 87 L160 83 V100 H0Z' : 'M0 87 Q40 84 80 87 T160 86 V100 H0Z'} fill={mars ? '#9c3b1d' : '#6b7280'} />
        {!mars && <ellipse cx="140" cy="94" rx="9" ry="1.8" fill="rgba(30,30,40,0.5)" />}

        {/* Habitat hull */}
        <rect x="9" y="24" width="142" height="66" rx="5" fill="url(#hab-hull)" stroke="#64748b" strokeWidth="0.8" />
        <path d="M9 58.5 H151 M56.5 24 V90 M103.5 24 V58.5" stroke="#0b1020" strokeWidth="1.6" />

        {/* Shield dome frame + forcefield */}
        <path d="M9 24 A71 21 0 0 1 151 24" fill="rgba(148,163,184,0.06)" stroke="#94a3b8" strokeOpacity="0.4" strokeWidth="0.6" strokeDasharray="2 1.5" />
        <AnimatePresence>
          {forcefield && (
            <motion.path
              d="M7 24 A73 23 0 0 1 153 24"
              fill="url(#hab-field)"
              stroke="#00F0FF"
              strokeWidth="1.2"
              initial={{ opacity: 0 }}
              animate={{ opacity: resOk && resRoom === 'shielding' ? [0.6, 1, 0.6, 1] : [0.55, 0.9, 0.55] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 2px #00F0FF)' }}
            />
          )}
        </AnimatePresence>

        {/* NASA DONKI solar rays */}
        {weather &&
          [0, 1, 2, 3].map((i) => {
            const tx = 60 + i * 22
            const hitY = 24 - Math.sqrt(Math.max(0, 1 - ((tx - 80) / 73) ** 2)) * 23
            const color = event.donki === 'SEP' ? '#FF3B5C' : '#FFB800'
            return (
              <g key={i}>
                <motion.line
                  x1={160}
                  y1={i * 4}
                  x2={tx}
                  y2={radiationLeak ? 42 : hitY}
                  stroke={color}
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
                  transition={{ duration: resolution ? 0.8 : 1.8, repeat: Infinity, delay: i * 0.3 }}
                />
                {!radiationLeak && forcefield && (
                  <motion.line
                    x1={tx}
                    y1={hitY}
                    x2={tx - 18}
                    y2={hitY - 14}
                    stroke="#00F0FF"
                    strokeWidth="0.7"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.3 + 0.6, repeatDelay: 1 }}
                  />
                )}
              </g>
            )
          })}

        {/* Mars solar arrays outside, with dust */}
        {mars && (
          <g transform="translate(1 74)">
            <rect x="0" y="0" width="7" height="10" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="0.3" />
            <rect x="0" y="0" width="7" height={(levels.dust / 100) * 10} fill="#c2602f" opacity="0.85" />
          </g>
        )}
      </svg>

      {/* Radiation waves leaking inside */}
      <AnimatePresence>
        {radiationLeak && (resolution || a.shielding < 4) && (
          <motion.div
            className="pointer-events-none absolute inset-x-[6%] top-[24%] bottom-[10%] z-10 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: resolution ? [0, 0.7, 0.2, 0.7, 0] : [0.05, 0.25, 0.05] }}
            exit={{ opacity: 0 }}
            transition={{ duration: resolution ? 2 : 1.4, repeat: resolution ? 0 : Infinity }}
            style={{ background: 'repeating-radial-gradient(circle at 90% 0%, rgba(255,59,92,0.55) 0 2%, transparent 2% 5%)' }}
          />
        )}
      </AnimatePresence>

      {/* ---------- Rooms (HTML, interactive) ---------- */}
      {ROOMS.map((room) => (
        <Room
          key={room.key}
          room={room}
          sector={mission.sector}
          missionId={mission.id}
          cells={a[room.key]}
          level={levels[room.key]}
          levels={levels}
          event={event}
          hint={hints?.boost === room.key ? 'boost' : hints?.cut?.includes(room.key) ? 'cut' : null}
          resolution={resRoom === room.key ? resolution.status : null}
          onAdjust={onAdjust}
          disabled={disabled}
          frost={frost}
        />
      ))}

      {/* Power cables with travelling energy pulses */}
      <svg viewBox="0 0 160 100" className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden="true">
        {Object.entries(CABLES).map(([key, d]) => {
          const cells = a[key]
          const on = cells > 0 && a.power > 0 && !brownout
          return (
            <g key={key}>
              <path d={d} stroke="#3f3f46" strokeWidth="1.1" fill="none" strokeLinecap="round" />
              {on && (
                <motion.path
                  d={d}
                  stroke="#FFB800"
                  strokeWidth={0.5 + cells * 0.12}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="1.2 2.4"
                  animate={{ strokeDashoffset: [0, -7.2] }}
                  transition={{ duration: Math.max(0.25, 1.4 - a.power * 0.22), repeat: Infinity, ease: 'linear' }}
                  style={{ filter: 'drop-shadow(0 0 0.6px #FFB800)' }}
                />
              )}
            </g>
          )
        })}
      </svg>

      {/* Frost creeping over the viewport edges */}
      <AnimatePresence>
        {frost && (
          <motion.div
            key="frost"
            className="pointer-events-none absolute inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: resFail && resRoom === 'lifeSupport' ? 1 : 0.75 }}
            exit={{ opacity: 0, transition: { duration: 1.4 } }}
            transition={{ duration: 1.2 }}
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 45%, rgba(186,230,253,0.35) 70%, rgba(224,242,254,0.85) 100%)',
              boxShadow: 'inset 0 0 40px 12px rgba(224,242,254,0.6)',
            }}
          >
            <svg viewBox="0 0 160 100" className="h-full w-full" preserveAspectRatio="none">
              {[
                [6, 8],
                [154, 10],
                [8, 92],
                [150, 92],
                [80, 4],
                [3, 50],
                [157, 52],
              ].map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y})`} stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.9">
                  {[0, 60, 120].map((r) => (
                    <line key={r} x1="-3" y1="0" x2="3" y2="0" transform={`rotate(${r})`} />
                  ))}
                </g>
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brownout flicker */}
      <AnimatePresence>
        {brownout && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0.2, 0.8, 0.3, 0.7, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          />
        )}
      </AnimatePresence>

      {/* Hull sparks on failure */}
      <AnimatePresence>
        {resFail && (
          <motion.svg key="sparks" viewBox="0 0 160 100" className="pointer-events-none absolute inset-0 z-30 h-full w-full" exit={{ opacity: 0 }}>
            {Array.from({ length: 14 }, (_, i) => {
              const x = 15 + ((i * 37) % 130)
              const y = 26 + ((i * 13) % 60)
              const ang = (i * 47 * Math.PI) / 180
              return (
                <motion.line
                  key={i}
                  x1={x}
                  y1={y}
                  x2={x + Math.cos(ang) * 5}
                  y2={y + Math.sin(ang) * 5}
                  stroke={i % 2 ? '#FFB800' : '#fff7d1'}
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: [0, 1, 0], pathLength: [0, 1] }}
                  transition={{ duration: 0.4, delay: (i % 7) * 0.15, repeat: 3, repeatDelay: 0.2 }}
                />
              )
            })}
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Resolution banner */}
      <AnimatePresence>
        {resolution && (
          <motion.div
            key="banner"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`pointer-events-none absolute top-[3%] left-1/2 z-40 -translate-x-1/2 rounded-full px-4 py-1.5 font-display text-xs font-black tracking-widest whitespace-nowrap sm:text-sm ${
              resOk ? 'bg-bio text-cosmic shadow-[0_0_20px_#00E676]' : 'bg-crimson text-white shadow-[0_0_20px_#FF3B5C]'
            }`}
          >
            {resOk ? '✓ CRISIS RESOLVED' : '⚠ SYSTEM FAILURE'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------------------------------------------- */

function Room({ room, sector, missionId, cells, level, levels, event, hint, resolution, onAdjust, disabled, frost }) {
  const text = roomText(room, sector)
  const status = roomStatus(room.key, cells, level, event)
  const ring =
    hint === 'boost'
      ? 'ring-2 ring-bio shadow-[0_0_18px_#00E676]'
      : hint === 'cut'
        ? 'ring-2 ring-solar shadow-[0_0_18px_#FFB800]'
        : 'ring-1 ring-white/10'

  return (
    <div
      id={`scene-room-${room.key}`}
      className={`absolute z-10 flex flex-col overflow-hidden rounded-lg bg-slate-950/70 transition ${ring}`}
      style={pos(LAYOUT[room.key])}
    >
      {hint && (
        <motion.span
          className={`absolute top-0.5 right-0.5 z-20 rounded px-1 font-display text-[8px] font-black sm:text-[10px] ${
            hint === 'boost' ? 'bg-bio text-cosmic' : 'bg-solar text-cosmic'
          }`}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {hint === 'boost' ? '▲ BOOST' : '▼ CUT'}
        </motion.span>
      )}
      <div className="flex items-center gap-1 px-1.5 pt-1">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: room.color, boxShadow: `0 0 4px ${room.color}` }} />
        <span className="truncate font-display text-[8px] font-bold tracking-wide text-white sm:text-[10px]">{text.short}</span>
        {!hint && (
          <span className={`ml-auto hidden shrink-0 rounded px-1 font-display text-[8px] font-black sm:inline ${STATUS_STYLE[status]}`}>{status}</span>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <RoomArt roomKey={room.key} cells={cells} levels={levels} sector={sector} missionId={missionId} event={event} resolution={resolution} frost={frost} />
      </div>

      <div className="flex items-center gap-1 px-1 pb-1">
        <button
          type="button"
          aria-label={`Cut power to ${text.label}`}
          disabled={disabled || cells <= 0}
          onClick={() => onAdjust(room.key, -1)}
          className="grid h-4 w-4 shrink-0 place-items-center rounded bg-white/10 text-white transition enabled:hover:bg-solar enabled:hover:text-cosmic disabled:opacity-30 sm:h-5 sm:w-5"
        >
          <Minus size={10} strokeWidth={3} />
        </button>
        <div className="flex flex-1 gap-0.5">
          {Array.from({ length: MAX_CELLS }, (_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-sm transition-all sm:h-2"
              style={{ background: i < cells ? room.color : 'rgba(255,255,255,0.12)', boxShadow: i < cells ? `0 0 5px ${room.color}` : 'none' }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={`Boost power to ${text.label}`}
          disabled={disabled || cells >= MAX_CELLS}
          onClick={() => onAdjust(room.key, 1)}
          className="grid h-4 w-4 shrink-0 place-items-center rounded bg-white/10 text-white transition enabled:hover:bg-bio enabled:hover:text-cosmic disabled:opacity-30 sm:h-5 sm:w-5"
        >
          <Plus size={10} strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */

function MiniAstronaut({ x, y, mood, say, color = '#e2e8f0' }) {
  const shiver = mood === 'cold'
  const cheer = mood === 'happy'
  return (
    <motion.g
      initial={{ x, y }}
      animate={shiver ? { x: [x - 0.6, x + 0.6, x - 0.6], y } : cheer ? { x, y: [y, y - 4, y] } : { x, y: [y, y - 0.8, y] }}
      transition={{ duration: shiver ? 0.15 : cheer ? 0.6 : 2, repeat: Infinity }}
    >
      <circle cx="0" cy="-9" r="4" fill={color} stroke="#64748b" strokeWidth="0.5" />
      <rect x="-2.6" y="-11" width="5.2" height="3.2" rx="1.4" fill={shiver ? '#7dd3fc' : '#0f172a'} />
      <rect x="-3.2" y="-5" width="6.4" height="7" rx="2" fill={color} stroke="#64748b" strokeWidth="0.5" />
      {cheer ? (
        <path d="M-3 -4 L-6 -9 M3 -4 L6 -9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      ) : (
        <path d="M-3 -3 L-5 1 M3 -3 L5 1" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      )}
      {say && (
        <g transform="translate(5 -20)">
          <rect x="0" y="0" width={say.length * 2.3 + 4} height="7" rx="2" fill={shiver ? '#e0f2fe' : 'white'} />
          <text x="2" y="5" fontSize="4.2" fontWeight="800" fill={shiver ? '#0369a1' : '#065f46'} fontFamily="Nunito, sans-serif">
            {say}
          </text>
        </g>
      )}
    </motion.g>
  )
}

function RoomArt({ roomKey, cells, levels, sector, missionId, event, resolution, frost }) {
  const mars = sector === 'mars'
  const ok = resolution === 'success'
  const bad = resolution === 'fail'

  if (roomKey === 'lifeSupport') {
    const cold = frost || cells <= 1
    const happy = !cold && (cells >= 4 || ok)
    return (
      <svg viewBox="0 0 100 50" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {[8, 20].map((x) => (
          <g key={x}>
            <rect x={x} y="12" width="9" height="30" rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.6" />
            <motion.rect
              x={x + 2}
              width="5"
              rx="2"
              fill="#00F0FF"
              initial={false}
              animate={{ y: 40 - (levels.lifeSupport / 100) * 26, height: (levels.lifeSupport / 100) * 26 }}
              transition={{ duration: 1 }}
            />
            <text x={x + 4.5} y="10" fontSize="4" textAnchor="middle" fill="#7dd3fc" fontWeight="800">
              O₂
            </text>
          </g>
        ))}
        <MiniAstronaut x={50} y={44} mood={cold ? 'cold' : happy ? 'happy' : 'calm'} say={cold ? 'LOW O₂ / FREEZING!' : happy ? 'Fresh air!' : null} />
        <MiniAstronaut x={78} y={44} mood={cold ? 'cold' : happy ? 'happy' : 'calm'} color="#fde68a" />
        {(cells >= 4 || ok) &&
          Array.from({ length: ok ? 10 : 6 }, (_, i) => (
            <motion.circle
              key={i}
              cx={30 + ((i * 11) % 65)}
              r={1 + (i % 3) * 0.6}
              fill="none"
              stroke="#00E676"
              strokeWidth="0.6"
              initial={{ cy: 48, opacity: 0 }}
              animate={{ cy: 4, opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.35 }}
            />
          ))}
        <text x="96" y="10" fontSize="4.5" textAnchor="end" fill={cold ? '#7dd3fc' : '#94a3b8'} fontWeight="800">
          {cold ? '−4 °C' : happy ? '22 °C' : '16 °C'}
        </text>
      </svg>
    )
  }

  if (roomKey === 'shielding') {
    const leak = event && (event.donki === 'FLR' || event.donki === 'SEP') && (bad || (!resolution && cells < 4))
    return (
      <svg viewBox="0 0 100 50" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <rect x="38" y="30" width="24" height="12" rx="2" fill="#1e1b4b" stroke="#8B7CFF" strokeWidth="0.6" />
        {[0, 1, 2].map((i) => (
          <motion.ellipse
            key={i}
            cx="50"
            cy={26 - i * 6}
            rx={6 + i * 3}
            ry="2.2"
            fill="none"
            stroke={cells >= 4 || ok ? '#00F0FF' : '#8B7CFF'}
            strokeWidth="1"
            animate={{ opacity: cells === 0 ? 0.15 : [0.3, 0.3 + cells * 0.14, 0.3] }}
            transition={{ duration: 1.2 - cells * 0.15, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
        <motion.circle
          cx="50"
          cy="8"
          r={2 + cells}
          fill={cells >= 4 || ok ? '#00F0FF' : '#8B7CFF'}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ filter: 'blur(1px)' }}
        />
        <text x="50" y="48" fontSize="4.5" textAnchor="middle" fill="#c4b5fd" fontWeight="800">
          FIELD {levels.shielding}%
        </text>
        {leak && (
          <motion.text
            x="50"
            y="38.5"
            fontSize="5.5"
            textAnchor="middle"
            fill="#FF3B5C"
            fontWeight="900"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            ☢ RADIATION!
          </motion.text>
        )}
      </svg>
    )
  }

  if (roomKey === 'power') {
    const dust = levels.dust || 0
    return (
      <svg viewBox="0 0 100 50" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <motion.circle
          cx="22"
          cy="25"
          r="11"
          fill="#451a03"
          stroke="#FFB800"
          strokeWidth="1"
          animate={{ opacity: cells === 0 || bad ? 0.35 : [0.7, 1, 0.7] }}
          transition={{ duration: Math.max(0.3, 1.5 - cells * 0.25), repeat: Infinity }}
        />
        <motion.circle
          cx="22"
          cy="25"
          r={3 + cells * 1.3}
          fill="#FFB800"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: Math.max(0.3, 1.5 - cells * 0.25), repeat: Infinity }}
          style={{ filter: 'blur(1.2px)' }}
        />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${42 + i * 14} ${10 + (i % 2) * 2}) skewX(-12)`}>
            <rect width="11" height="16" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="0.5" />
            <path d="M0 5.3 H11 M0 10.6 H11 M5.5 0 V16" stroke="#93c5fd" strokeOpacity="0.4" strokeWidth="0.4" />
            {mars && (
              <motion.rect
                width="11"
                fill="#c2602f"
                initial={false}
                animate={{ height: ok ? 0 : (dust / 100) * 16, opacity: 0.85 }}
                transition={{ duration: ok ? 1.5 : 0.6 }}
              />
            )}
          </g>
        ))}
        <text x="70" y="40" fontSize="4.5" textAnchor="middle" fill="#fcd34d" fontWeight="800">
          {mars ? `DUST ${dust}%` : `CHARGE ${levels.power}%`}
        </text>
        {ok && mars &&
          Array.from({ length: 8 }, (_, i) => (
            <motion.circle
              key={i}
              r="0.8"
              fill="#d97745"
              initial={{ cx: 45 + i * 6, cy: 18, opacity: 1 }}
              animate={{ cx: 105, cy: 4 + i, opacity: 0 }}
              transition={{ duration: 1.2, delay: i * 0.1 }}
            />
          ))}
      </svg>
    )
  }

  if (roomKey === 'food') {
    const lights = cells >= 2 || ok
    const bright = cells >= 4 || ok
    const droop = (cells <= 1 && !ok) || bad
    const growth = Math.min(1.25, 0.35 + cells * 0.13 + levels.food / 400 + (ok ? 0.3 : 0))
    return (
      <svg viewBox="0 0 200 50" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <rect x="10" y="3" width="150" height="3" rx="1.5" fill={lights ? '#FF5FD2' : '#3f3f46'} />
        {lights && (
          <motion.path
            d="M10 6 L160 6 L170 40 L0 40 Z"
            fill={bright ? 'rgba(200,80,255,0.28)' : 'rgba(200,80,255,0.12)'}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <rect x="5" y="40" width="160" height="6" rx="2" fill="#3f2a1d" />
        {Array.from({ length: 8 }, (_, i) => (
          <motion.g
            key={i}
            initial={false}
            animate={{ scale: growth, rotate: droop ? (i % 2 ? 25 : -25) : 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 10 }}
            style={{ originX: 0.5, originY: 1 }}
          >
            <path d={`M${15 + i * 19} 40 q-6 -6 -5 -14 q6 3 5 14z`} fill={droop ? '#65a30d' : '#22c55e'} />
            <path d={`M${15 + i * 19} 40 q6 -7 4 -15 q-6 4 -4 15z`} fill={droop ? '#4d7c0f' : '#16a34a'} />
            {(ok || (bright && i % 3 === 0)) && <circle cx={15 + i * 19} cy="25" r="2" fill="#FF3B5C" />}
          </motion.g>
        ))}
        <text x="196" y="16" fontSize="7" textAnchor="end" fill="#f0abfc" fontWeight="800">
          VEG-05
        </text>
        <text x="196" y="25" fontSize="5.5" textAnchor="end" fill="#e9d5ff">
          {lights ? `R+B ${bright ? 400 : 200} µmol` : 'LIGHTS OFF'}
        </text>
        {droop && (
          <motion.text x="196" y="36" fontSize="7" textAnchor="end" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
            🍽️ Hungry!
          </motion.text>
        )}
      </svg>
    )
  }

  // Science / Earth Return Lab
  const progress = Math.min(1, levels.science / 100)
  if (missionId === 'apollo-13') {
    const t = progress
    const px = (1 - t) ** 2 * 14 + 2 * (1 - t) * t * 50 + t ** 2 * 86
    const py = (1 - t) ** 2 * 30 + 2 * (1 - t) * t * -6 + t ** 2 * 30
    return (
      <svg viewBox="0 0 100 50" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <rect x="2" y="2" width="96" height="44" rx="3" fill="#03121a" stroke="#00E676" strokeOpacity="0.4" strokeWidth="0.5" />
        <circle cx="14" cy="30" r="5" fill="#b8bcc8" />
        <EarthStickerG cx={86} cy={30} r={6.2} spin={30} />
        <path d="M14 30 Q50 -6 86 30" fill="none" stroke="#00E676" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="2 2" />
        <motion.circle
          initial={false}
          animate={{ cx: px, cy: py }}
          transition={{ type: 'spring', stiffness: 40, damping: 12 }}
          r="2.2"
          fill="#fff"
          style={{ filter: `drop-shadow(0 0 ${ok ? 3 : 1.5}px #00E676)` }}
        />
        <text x="50" y="44" fontSize="4.5" textAnchor="middle" fill="#86efac" fontWeight="800">
          RETURN TRAJECTORY {levels.science}%
        </text>
        {bad && (
          <motion.rect x="2" y="2" width="96" height="44" fill="white" animate={{ opacity: [0, 0.2, 0, 0.25, 0] }} transition={{ duration: 1.2, repeat: 1 }} />
        )}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 100 50" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g transform="translate(18 10)">
        <line x1="0" y1="10" x2="0" y2="32" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M-9 8 Q0 20 9 8 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.5" />
        <circle cx="0" cy="4" r="1.5" fill="#FF3B5C" />
        {(cells >= 2 || ok) &&
          [0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx="0"
              cy="4"
              fill="none"
              stroke="#00E676"
              strokeWidth="0.6"
              initial={{ r: 1, opacity: 1 }}
              animate={{ r: 14, opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.45 }}
            />
          ))}
      </g>
      <text x="40" y="12" fontSize="4.5" fill="#86efac" fontWeight="800">
        COMMS DELAY: 14 min
      </text>
      <text x="40" y="22" fontSize="4.2" fill="#cbd5e1">
        POLAR ICE CORE ANALYSIS
      </text>
      <rect x="40" y="25" width="54" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
      <motion.rect x="40" y="25" height="6" rx="3" fill="#7dd3fc" initial={false} animate={{ width: 54 * progress }} transition={{ duration: 1 }} />
      <text x="94" y="38" fontSize="4.5" textAnchor="end" fill="#e0f2fe" fontWeight="800">
        {levels.science}%
      </text>
      {bad && (
        <motion.text x="40" y="46" fontSize="4.5" fill="#FF3B5C" fontWeight="900" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.4, repeat: 4 }}>
          SIGNAL LOST
        </motion.text>
      )}
    </svg>
  )
}
