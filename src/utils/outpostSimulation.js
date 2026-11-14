/**
 * Pure game rules for the 6-Sol outpost survival loop.
 * Kept free of React so it can later move to the Express backend unchanged.
 */

export const TOTAL_SOLS = 6
export const MAX_ALLOCATION = 5

/** Subsystems in strict priority order: Tier 5 (highest) → Tier 1 (lowest). */
export const SUBSYSTEMS = [
  {
    key: 'lifeSupport',
    tier: 5,
    priority: 'CRITICAL',
    label: 'Life Support',
    sub: 'O₂ & Water',
    color: '#00F0FF',
    tip: 'Never let this hit 0%, or the mission fails!',
    effect: '+6% per point · uses 12% each Sol',
  },
  {
    key: 'shielding',
    tier: 4,
    priority: 'HIGH',
    label: 'Radiation Shielding',
    sub: 'Storm Dome',
    color: '#8B7CFF',
    tip: 'Boost this when NASA DONKI detects a Solar Flare!',
    effect: '+8% per point · storms wear it down',
  },
  {
    key: 'power',
    tier: 3,
    priority: 'MEDIUM-HIGH',
    label: 'Power Generation',
    sub: 'Solar Arrays',
    color: '#FFB800',
    tip: 'Produces the energy points you distribute each day.',
    effect: '+6% per point · more Power = more points',
  },
  {
    key: 'food',
    tier: 2,
    priority: 'MEDIUM',
    label: 'Food Production',
    sub: 'Greenhouse',
    color: '#00E676',
    tip: 'Feeds your crew; you may need to dim grow-lights during storms.',
    effect: '+7% per point · crew eats 9% each Sol',
  },
  {
    key: 'science',
    tier: 1,
    priority: 'WIN GOAL',
    label: 'Science Ops',
    sub: 'Experiments',
    color: '#FF3B5C',
    tip: 'Lowest survival priority, but reach 100% Science to rewrite history and win!',
    effect: '+4% per point · +50% on calm Sols',
  },
]

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)))

export function hullBonus(hull) {
  if (hull >= 80) return 2
  if (hull >= 50) return 1
  return 0
}

/** Power points the player may distribute this Sol. */
export function powerBudget(powerLevel, hull) {
  return 4 + Math.round(powerLevel / 15) + hullBonus(hull)
}

export const DEFAULT_ALLOCATION = { lifeSupport: 2, shielding: 1, power: 1, food: 1, science: 3 }

/** Trims an allocation to fit the budget, cutting lowest-priority tiers first. */
export function fitAllocation(allocation, budget) {
  const next = { ...allocation }
  let used = Object.values(next).reduce((a, b) => a + b, 0)
  for (const s of [...SUBSYSTEMS].reverse()) {
    while (used > budget && next[s.key] > 0) {
      next[s.key] -= 1
      used -= 1
    }
  }
  return next
}

/**
 * Runs one Sol of the simulation.
 * @returns {{ state: object, report: {text:string, tone:'good'|'bad'|'info'}[], radiation:number, crewDamage:number }}
 */
export function simulateSol(state, allocation, event) {
  const calm = event.type === 'CALM'
  const severity = event.severity ?? 1
  const radiation = Math.round(calm ? 4 : severity * 10)
  const report = []

  const lifeSupport = state.lifeSupport - 12 + allocation.lifeSupport * 6

  let shielding = state.shielding + allocation.shielding * 8 - 3
  const blocked = Math.min(radiation, shielding * 0.4)
  const crewDamage = Math.max(0, Math.round(radiation - blocked))
  shielding -= calm ? 0 : severity * 4

  const stormDrain = event.type === 'CME' ? severity * 2 : event.type === 'FLR' ? severity : 0
  const power = state.power + allocation.power * 6 - 5 - stormDrain

  const food = state.food - 9 + allocation.food * 7

  const scienceGain = Math.round(allocation.science * 4 * (calm ? 1.5 : 1))
  const science = state.science + scienceGain

  let crewHealth = state.crewHealth - crewDamage
  if (food <= 0) crewHealth -= 15
  if (lifeSupport < 20) crewHealth -= 5
  if (food > 40 && lifeSupport > 40 && crewDamage === 0) crewHealth += 4

  if (calm) report.push({ text: `Quiet Sun! Science got a 50% bonus (+${scienceGain}%).`, tone: 'good' })
  else if (crewDamage === 0) report.push({ text: `Shields blocked ALL ${radiation} radiation units. Awesome!`, tone: 'good' })
  else report.push({ text: `Shields blocked ${Math.round(blocked)} of ${radiation} radiation — the crew took ${crewDamage} damage.`, tone: crewDamage > 10 ? 'bad' : 'info' })

  if (lifeSupport < 25) report.push({ text: 'Oxygen is running low! Give Life Support more power.', tone: 'bad' })
  if (food <= 15) report.push({ text: 'The greenhouse is almost empty — the crew is hungry!', tone: 'bad' })
  if (stormDrain > 0) report.push({ text: `The storm drained ${Math.round(stormDrain)}% from your solar arrays.`, tone: 'info' })
  if (!calm && scienceGain > 0) report.push({ text: `Science experiments advanced +${scienceGain}%.`, tone: 'good' })

  return {
    state: {
      lifeSupport: clamp(lifeSupport),
      shielding: clamp(shielding),
      power: clamp(power),
      food: clamp(food),
      science: clamp(science),
      crewHealth: clamp(crewHealth),
    },
    report,
    radiation,
    crewDamage,
  }
}

/** Decides whether the mission has ended. */
export function evaluateOutcome(state, sol) {
  if (state.lifeSupport <= 0) return { result: 'failure', cause: 'lifeSupport' }
  if (state.crewHealth <= 0) return { result: 'failure', cause: state.food <= 0 ? 'food' : 'crewHealth' }
  if (state.science >= 100) return { result: 'victory' }
  if (sol >= TOTAL_SOLS) return { result: 'failure', cause: 'science' }
  return null
}

export const FAILURE_INFO = {
  lifeSupport: {
    title: 'Life Support ran out!',
    tip: 'Life Support is Tier 5 — the most important system. Try giving it at least 2 power points every Sol so it never drops to 0%.',
  },
  crewHealth: {
    title: 'Radiation hurt the crew!',
    tip: 'When NASA DONKI warns about X-class flares, fast CMEs or particle storms (SEP), pour extra power into Radiation Shielding first.',
  },
  food: {
    title: 'The crew ran out of food!',
    tip: 'Keep at least one point in Food Production on most Sols so the greenhouse never goes empty.',
  },
  science: {
    title: 'Time ran out before Science hit 100%!',
    tip: 'So close! Use calm "Quiet Sun" Sols for Science (+50% bonus), and keep Power strong so you get more points to spend.',
  },
}
