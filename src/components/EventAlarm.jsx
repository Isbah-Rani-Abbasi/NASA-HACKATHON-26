import { motion } from 'motion/react'
import { useMemo } from 'react'
import { RocketMascotFigure } from './RocketMascot'

/**
 * Full-screen "INCOMING EVENT" alarm that plays automatically when a new
 * Unexpected Event arrives. Each event type has its own animation:
 * flare rays falling, frost creeping, dust sweeping, shadow, wilting food, signal pings.
 */
export default function EventAlarm({ event, duration = 3.4, showMascot = false }) {
  const effect = event.alarm?.effect || 'flare'
  const color = { flare: '#FFB800', frost: '#7dd3fc', dust: '#e07a4a', shadow: '#8B7CFF', food: '#FF5FD2', signal: '#00E676' }[effect]

  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-cosmic/55 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      role="alertdialog"
      aria-live="assertive"
      aria-label={`Incoming event: ${event.title}`}
    >
      {/* Red emergency border flashing */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ boxShadow: ['inset 0 0 0px 0px rgba(255,59,92,0)', 'inset 0 0 120px 30px rgba(255,59,92,0.75)', 'inset 0 0 0px 0px rgba(255,59,92,0)'] }}
        transition={{ duration: 0.7, repeat: Infinity }}
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <EffectLayer effect={effect} />
      </div>

      <div className="relative flex w-full max-w-3xl items-center justify-center gap-2">
      {showMascot && (
      <motion.div
        className="hidden shrink-0 md:block"
        initial={{ x: -600, y: 200, rotate: -30 }}
        animate={{ x: 0, y: 0, rotate: 0 }}
        exit={{ x: 700, y: -400 }}
        transition={{ type: 'spring', stiffness: 70, damping: 13, delay: 0.3 }}
      >
        <RocketMascotFigure size={170} mood="worried" />
      </motion.div>
      )}
      <motion.div
        initial={{ scale: 2.2, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.15 }}
        className="relative w-full max-w-xl rounded-3xl border-4 bg-cosmic/85 p-6 text-center backdrop-blur-md sm:p-8"
        style={{ borderColor: color, boxShadow: `0 0 60px ${color}88` }}
      >
        <motion.p
          className="inline-block rounded-full bg-crimson px-4 py-1 font-display text-xs font-black tracking-[0.3em] text-white sm:text-sm"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ⚠ INCOMING EVENT ⚠
        </motion.p>
        <motion.div
          className="my-3 text-6xl sm:text-7xl"
          animate={{ scale: [1, 1.2, 1], rotate: [-8, 8, -8] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          aria-hidden="true"
        >
          {event.icon}
        </motion.div>
        <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{event.title}</h2>
        <p className="mt-2 text-lg font-bold" style={{ color }}>
          {event.alarm?.text}
        </p>
        {event.donkiRecord && (
          <p className="mt-2 text-xs font-bold text-slate-400">
            Detected by NASA DONKI · {event.donkiRecord.type}{' '}
            {event.donkiRecord.classType || (event.donkiRecord.speed ? `${event.donkiRecord.speed} km/s` : '')} · {event.donkiRecord.timeLabel}
          </p>
        )}
        <div className="mx-auto mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration, ease: 'linear' }}
          />
        </div>
        <p className="mt-2 font-display text-[11px] font-bold tracking-widest text-slate-300">GET READY TO REROUTE POWER!</p>
      </motion.div>
      </div>
    </motion.div>
  )
}

function EffectLayer({ effect }) {
  const items = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ i, a: (i * 37) % 100, b: (i * 53) % 100, d: (i % 7) * 0.12 })), [])

  if (effect === 'flare') {
    return (
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,247,209,0.95), rgba(255,184,0,0.6) 35%, transparent 70%)' }}
          animate={{ scale: [0.8, 1.25, 0.9, 1.2], opacity: [0.7, 1, 0.8, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        {items.map(({ i, a, d }) => (
          <motion.span
            key={i}
            className="absolute h-1 w-48 origin-right rounded-full sm:w-72"
            style={{
              top: `${(a * 0.6) % 60}%`,
              right: `${-10 + (i % 5) * 4}%`,
              rotate: '-35deg',
              background: 'linear-gradient(90deg, transparent, #FFB800 60%, #fff7d1)',
              boxShadow: '0 0 12px #FFB800',
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: ['0vw', '-110vw'], y: ['0vh', '75vh'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, delay: d + (i % 4) * 0.2, repeat: Infinity, ease: 'easeIn' }}
          />
        ))}
      </div>
    )
  }

  if (effect === 'frost') {
    return (
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ boxShadow: 'inset 0 0 0px 0px rgba(224,242,254,0)' }}
          animate={{ boxShadow: 'inset 0 0 220px 90px rgba(224,242,254,0.85)' }}
          transition={{ duration: 2.6, ease: 'easeOut' }}
        />
        {items.map(({ i, a, b, d }) => {
          const edge = i % 4
          const style =
            edge === 0 ? { left: `${a}%`, top: `${b % 12}%` } : edge === 1 ? { left: `${a}%`, bottom: `${b % 12}%` } : edge === 2 ? { left: `${b % 10}%`, top: `${a}%` } : { right: `${b % 10}%`, top: `${a}%` }
          return (
            <motion.span
              key={i}
              className="absolute text-3xl text-white sm:text-4xl"
              style={style}
              initial={{ scale: 0, rotate: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: 90, opacity: 0.9 }}
              transition={{ duration: 1, delay: 0.3 + d * 3 }}
            >
              ❄
            </motion.span>
          )
        })}
      </div>
    )
  }

  if (effect === 'dust') {
    return (
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(193,90,48,0.55), rgba(224,140,90,0.25), rgba(193,90,48,0.55))' }}
          animate={{ opacity: [0.3, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {[...items, ...items].map(({ i, a, d }, k) => (
          <motion.span
            key={k}
            className="absolute rounded-full"
            style={{ top: `${(a + k * 7) % 100}%`, width: 4 + (k % 4) * 3, height: 2 + (k % 3), background: '#f4b183' }}
            initial={{ x: '-10vw', opacity: 0 }}
            animate={{ x: '110vw', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.9 + (i % 5) * 0.2, delay: d + (k % 6) * 0.15, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>
    )
  }

  if (effect === 'shadow') {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(2,3,10,0.95) 30%, rgba(2,3,10,0.98) 100%)' }}
        initial={{ x: '100%' }}
        animate={{ x: '0%' }}
        transition={{ duration: 2.8, ease: 'easeInOut' }}
      />
    )
  }

  if (effect === 'food') {
    return (
      <div className="pointer-events-none absolute inset-0">
        {items.map(({ i, a, d }) => (
          <motion.span
            key={i}
            className="absolute text-3xl"
            style={{ left: `${a}%`, top: '-8%' }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, i % 2 ? 140 : -140], filter: ['saturate(1)', 'saturate(0) brightness(0.6)'] }}
            transition={{ duration: 2.4, delay: d * 2, repeat: Infinity, ease: 'easeIn' }}
          >
            {i % 3 === 0 ? '🍽️' : '🥬'}
          </motion.span>
        ))}
      </div>
    )
  }

  // signal: radar pings + scanning beam
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border-2 border-bio"
          initial={{ width: 20, height: 20, opacity: 1 }}
          animate={{ width: '140vmax', height: '140vmax', opacity: 0 }}
          transition={{ duration: 2.2, delay: i * 0.55, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
      <motion.span
        className="absolute inset-x-0 h-1 bg-bio shadow-[0_0_20px_#00E676]"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
