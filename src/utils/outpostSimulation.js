/**
 * Pure game rules for the 5-room habitat survival loop.
 * Kept free of React so it can later move to the Express backend unchanged.
 *
 * Power model: a strict 10-unit zero-sum grid. Each room holds 0–5 cells.
 * Every Sol a mission-specific Unexpected Event demands a trade-off: boost one
 * room to its target and cut others. Correct calls advance Mission Progress;
 * wrong calls trigger consequences (but the player can always execute).
 */

export const TOTAL_UNITS = 10
export const MAX_CELLS = 5
export const MAX_SOLS = 8
export const DECISION_SECONDS = 5

/** Rooms in strict priority order: Tier 5 (highest) → Tier 1 (lowest). */
export const ROOMS = [
  {
    key: 'lifeSupport',
    tier: 5,
    priority: 'CRITICAL',
    label: 'Life Support Bay',
    short: 'Life Support',
    sub: 'O₂ & Cabin Temp',
    color: '#00F0FF',
    tip: 'Never let this hit 0%, or the mission fails!',
  },
  {
    key: 'shielding',
    tier: 4,
    priority: 'HIGH',
    label: 'Radiation Shield Dome',
    short: 'Shield Dome',
    sub: 'Forcefield',
    color: '#8B7CFF',
    tip: 'Boost this when NASA DONKI detects a Solar Flare!',
  },
  {
    key: 'power',
    tier: 3,
    priority: 'MEDIUM-HIGH',
    label: 'Solar & Reactor Bay',
    short: 'Reactor',
    sub: 'Power Cables',
    color: '#FFB800',
    tip: 'Keeps your 10 power units flowing. Neglect it and you get a brownout!',
  },
  {
    key: 'food',
    tier: 2,
    priority: 'MEDIUM',
    label: 'NASA OSDR Space Garden',
    short: 'Space Garden',
    sub: 'VEG-05 Grow-Lights',
    color: '#FF5FD2',
    tip: 'Feeds your crew; you may need to dim grow-lights during storms.',
  },
  {
    key: 'science',
    tier: 1,
    priority: 'WIN GOAL',
    label: 'Earth Return Lab',
    labelMars: 'Comms & Science Lab',
    short: 'Return Lab',
    shortMars: 'Science Lab',
    sub: 'Trajectory Computer',
    subMars: 'Ice Core Analysis',
    color: '#00E676',
    tip: 'Lowest survival priority, but reach 100% Mission Progress to rewrite history and win!',
  },
]

export const ROOM_KEYS = ROOMS.map((r) => r.key)

export function roomText(room, sector) {
  const mars = sector === 'mars'
  return {
    label: (mars && room.labelMars) || room.label,
    short: (mars && room.shortMars) || room.short,
    sub: (mars && room.subMars) || room.sub,
  }
}

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)))

export const INITIAL_ALLOCATION = { lifeSupport: 2, shielding: 2, power: 2, food: 2, science: 2 }

export function totalCells(allocation) {
  return ROOM_KEYS.reduce((sum, k) => sum + (allocation[k] || 0), 0)
}

/** Starting state. Better cockpit flying → healthier crew. */
export function initialState(sector, hull = 70) {
  return {
    lifeSupport: 70,
    shielding: 60,
    power: 70,
    food: 65,
    science: 0,
    crewHealth: clamp(70 + hull * 0.3),
    dust: sector === 'mars' ? 10 : 0,
    brownout: 0,
  }
}

/** Power units available this Sol (10 unless brownouts or Martian dust cut it). */
export function availableUnits(state) {
  const dustLoss = Math.floor((state.dust || 0) / 30)
  return Math.max(6, TOTAL_UNITS - state.brownout - dustLoss)
}

/** Trims an allocation to fit the budget, cutting lowest-priority rooms first. */
export function fitAllocation(allocation, budget) {
  const next = { ...allocation }
  let used = totalCells(next)
  for (const key of [...ROOM_KEYS].reverse()) {
    while (used > budget && next[key] > 0) {
      next[key] -= 1
      used -= 1
    }
  }
  return next
}

/** CRITICAL / LOW / OPTIMAL badge for a room. */
export function roomStatus(key, cells, level, event) {
  const needs = event?.boost.room === key ? event.boost.min : null
  if (key === 'science') {
    // The Lab's bar is Mission Progress, so judge it on power alone.
    if (needs && cells < needs) return 'LOW'
    return cells <= 1 ? 'LOW' : 'OPTIMAL'
  }
  if (level <= 20 || (key === 'lifeSupport' && cells <= 1)) return 'CRITICAL'
  if (needs && cells < needs) return 'LOW'
  if (cells <= 1 || level <= 40) return 'LOW'
  return 'OPTIMAL'
}

export function isCorrectCall(allocation, event) {
  return (allocation[event.boost.room] || 0) >= event.boost.min
}

/**
 * Runs one Sol.
 * @returns {{ state, correct, deltas, consequences: string[], progressGain:number }}
 */
export function simulateSol(state, allocation, event, sector) {
  const correct = isCorrectCall(allocation, event)
  const room = event.boost.room
  const a = allocation
  const next = { ...state }
  const consequences = []

  // Baseline upkeep: 2 cells holds a room steady, each cell above/below moves it 6%.
  next.lifeSupport += (a.lifeSupport - 2) * 6
  next.shielding += (a.shielding - 2) * 6
  next.power += (a.power - 2) * 6
  next.food += (a.food - 2) * 6

  // Mission progress: Lab cells always help a little; solving the crisis helps a lot.
  let progressGain = a.science * 2 + (correct ? 14 : 0)
  if (correct && room === 'science') progressGain += 6

  if (correct) {
    next[room] += 12
    if (room === 'power') {
      next.brownout = Math.max(0, next.brownout - 2)
      next.dust = Math.max(0, next.dust - 45)
    }
  } else {
    switch (room) {
      case 'lifeSupport':
        next.lifeSupport -= 25
        next.crewHealth -= 10
        consequences.push('Frost spread through the habitat: Life Support −25%, Crew Health −10%.')
        break
      case 'shielding':
        next.shielding -= 20
        next.crewHealth -= 18
        consequences.push('Radiation leaked through the hull: Shield −20%, Crew Health −18%.')
        break
      case 'power':
        next.power -= 20
        next.brownout += 2
        if (sector === 'mars') next.dust += 25
        consequences.push('Brownout! Reactor −20% and only ' + availableUnits(next) + ' power units next Sol.')
        break
      case 'food':
        next.food -= 25
        next.crewHealth -= 8
        consequences.push('Plants drooped and the crew went hungry: Garden −25%, Crew Health −8%.')
        break
      case 'science':
        next.crewHealth -= 4
        consequences.push('The window closed — this Sol only earned a small bit of Mission Progress.')
        break
      default:
        break
    }
  }

  // Mars dust slowly piles up on the solar arrays unless the Reactor clears it.
  if (sector === 'mars') {
    next.dust += a.power >= 4 ? -30 : 10
  }
  // A strong Reactor recovers from brownouts.
  if (a.power >= 3) next.brownout = Math.max(0, next.brownout - 1)
  if (next.power <= 15) next.brownout += 1

  // Low systems hurt the crew.
  if (next.shielding <= 0) next.crewHealth -= 6
  if (next.food <= 0) next.crewHealth -= 10
  if (next.lifeSupport <= 20) next.crewHealth -= 5
  if (correct && next.food > 40 && next.lifeSupport > 40) next.crewHealth += 3

  next.science = state.science + progressGain
  for (const k of ['lifeSupport', 'shielding', 'power', 'food', 'science', 'crewHealth', 'dust']) next[k] = clamp(next[k])
  next.brownout = clamp(next.brownout, 0, 4)

  const deltas = {}
  for (const k of [...ROOM_KEYS, 'crewHealth']) deltas[k] = next[k] - state[k]

  return { state: next, correct, deltas, consequences, progressGain }
}

/** Decides whether the mission has ended after a Sol. */
export function evaluateOutcome(state, sol) {
  if (state.lifeSupport <= 0) return { result: 'failure', cause: 'lifeSupport' }
  if (state.crewHealth <= 0) return { result: 'failure', cause: state.food <= 0 ? 'food' : 'crewHealth' }
  if (state.science >= 100) return { result: 'victory' }
  if (sol >= MAX_SOLS) return { result: 'failure', cause: 'science' }
  return null
}

export const FAILURE_INFO = {
  lifeSupport: {
    title: 'Life Support ran out!',
    tip: 'Life Support is Tier 5 — the most important room. Keep at least 2 cells in it every Sol, and give it all 5 when oxygen or cold emergencies hit.',
  },
  crewHealth: {
    title: 'The crew got too sick to continue!',
    tip: 'When NASA DONKI warns about solar flares or particle storms, boost the Shield Dome to 4 cells before you execute.',
  },
  food: {
    title: 'The crew ran out of food!',
    tip: 'The Space Garden needs light to grow food. Boost it to 4 cells when the crew gets hungry, and never leave it at 0 for long.',
  },
  science: {
    title: `Time ran out after ${MAX_SOLS} Sols!`,
    tip: 'Each correct trade-off gives a big jump in Mission Progress. Read the event, boost the room it needs, and keep 1–2 cells in the Lab.',
  },
}
