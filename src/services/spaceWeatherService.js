import axios from 'axios'
import fallbackData from '../data/donki_fallback.json'

/**
 * Space weather engine backed by NASA CCMC DONKI
 * (Database Of Notifications, Knowledge, Information).
 *
 * Fetches recent FLR (solar flare), CME (coronal mass ejection) and
 * SEP (solar energetic particle) events. If the network is offline,
 * rate-limited or returns too little data, it falls back to the bundled
 * May 2024 storm records in src/data/donki_fallback.json.
 */
const DONKI_BASE_URL =
  import.meta.env.VITE_DONKI_BASE_URL || 'https://ccmc.gsfc.nasa.gov/DONKI-API/get/'

const donki = axios.create({ baseURL: DONKI_BASE_URL, timeout: 8000 })

const LOOKBACK_DAYS = 45
let cachedPromise = null

const isoDate = (date) => date.toISOString().slice(0, 10)

function formatTime(iso) {
  if (!iso) return 'Unknown time'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

function flareSeverity(classType = '') {
  const letter = classType.charAt(0).toUpperCase()
  const magnitude = parseFloat(classType.slice(1)) || 1
  if (letter === 'X') return magnitude >= 3 ? 3 : 2.5
  if (letter === 'M') return magnitude >= 5 ? 2 : 1.5
  return 1
}

function normalizeFlare(f, source) {
  const cls = f.classType || 'C1.0'
  const letter = cls.charAt(0).toUpperCase()
  const kidText =
    letter === 'X'
      ? `A MEGA solar flare (class ${cls})! The Sun just fired a super-bright blast of X-rays — the strongest kind of flare. Boost Radiation Shielding right away!`
      : letter === 'M'
        ? `A strong solar flare (class ${cls}) flashed on the Sun. Some radiation is heading your way — give your shields a little extra power.`
        : `Only a small flare (class ${cls}) today. Skies are mostly calm — a great Sol to power up Science!`
  return {
    id: f.flrID,
    type: 'FLR',
    typeLabel: 'Solar Flare',
    headline: `${letter}-CLASS SOLAR FLARE · ${cls}`,
    metric: cls,
    time: f.peakTime || f.beginTime,
    timeLabel: formatTime(f.peakTime || f.beginTime),
    detail: `Peak ${formatTime(f.peakTime || f.beginTime)} · Active Region ${f.activeRegionNum ?? 'n/a'} · ${f.sourceLocation || 'unknown location'}`,
    kidText,
    severity: flareSeverity(cls),
    link: f.link,
    source,
  }
}

function normalizeCme(c, source) {
  const analysis = (c.cmeAnalyses || []).find((a) => a.isMostAccurate) || (c.cmeAnalyses || [])[0]
  const speed = Math.round(analysis?.speed || 500)
  const severity = speed >= 1500 ? 3 : speed >= 1000 ? 2.5 : speed >= 700 ? 2 : 1.5
  const kmh = (speed * 3600).toLocaleString('en-US')
  return {
    id: c.activityID,
    type: 'CME',
    typeLabel: 'Coronal Mass Ejection',
    headline: `CME PLASMA CLOUD · ${speed.toLocaleString('en-US')} km/s`,
    metric: `${speed} km/s`,
    time: c.startTime,
    timeLabel: formatTime(c.startTime),
    detail: `Launched ${formatTime(c.startTime)} · Speed ${speed} km/s · ${c.sourceLocation || 'source unknown'}`,
    kidText: `The Sun burped out a giant cloud of hot plasma racing at ${speed.toLocaleString('en-US')} km per second — that's ${kmh} km per hour! It can rattle your power grid, so keep Power and Shields strong.`,
    severity,
    link: c.link,
    source,
  }
}

function normalizeSep(s, source) {
  const instrument = s.instruments?.[0]?.displayName || 'space sensors'
  return {
    id: s.sepID,
    type: 'SEP',
    typeLabel: 'Solar Energetic Particles',
    headline: 'SOLAR PARTICLE STORM · SEP',
    metric: 'SEP',
    time: s.eventTime,
    timeLabel: formatTime(s.eventTime),
    detail: `Detected ${formatTime(s.eventTime)} by ${instrument}`,
    kidText:
      'Particle storm! Billions of tiny, super-fast particles are zooming from the Sun. They can hurt astronauts, so put lots of power into Radiation Shielding!',
    severity: 3,
    link: s.link,
    source,
  }
}

function normalizeAll(raw, source) {
  return {
    FLR: (raw.FLR || []).map((f) => normalizeFlare(f, source)),
    CME: (raw.CME || []).map((c) => normalizeCme(c, source)),
    SEP: (raw.SEP || []).map((s) => normalizeSep(s, source)),
  }
}

async function fetchLive() {
  const end = new Date()
  const start = new Date(end.getTime() - LOOKBACK_DAYS * 86400000)
  const params = { startDate: isoDate(start), endDate: isoDate(end) }
  const [flr, cme, sep] = await Promise.all(
    ['FLR', 'CME', 'SEP'].map((type) =>
      donki.get(type, { params }).then((res) => (Array.isArray(res.data) ? res.data : [])),
    ),
  )
  return { FLR: flr, CME: cme, SEP: sep }
}

/**
 * Returns normalized events grouped by type, plus the data source used.
 * The result is cached for the browser session.
 */
export function getSpaceWeatherEvents() {
  if (!cachedPromise) {
    cachedPromise = (async () => {
      const archive = normalizeAll(fallbackData, 'archive')
      try {
        const live = normalizeAll(await fetchLive(), 'live')
        const total = live.FLR.length + live.CME.length + live.SEP.length
        if (total < 4) {
          return { events: archive, archive, source: 'archive', reason: 'Quiet Sun lately — using the May 2024 storm archive' }
        }
        return { events: live, archive, source: 'live', reason: 'Live NASA DONKI feed' }
      } catch (err) {
        return {
          events: archive,
          archive,
          source: 'archive',
          reason: `Offline mode (${err.message || 'DONKI unreachable'}) — using the May 2024 storm archive`,
        }
      }
    })()
  }
  return cachedPromise
}

/** Picks one strong solar flare to label hazards in the cockpit mini-game. */
export async function getHeadlineFlare() {
  const { events, archive } = await getSpaceWeatherEvents()
  const flares = [...(events.FLR || []), ...(archive?.FLR || [])]
  return flares.reduce((best, f) => (!best || f.severity > best.severity ? f : best), null)
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Builds a Sol-by-Sol forecast mixing flare, CME and SEP alerts.
 * Mars missions are flare-heavy; Moon missions lean on CMEs and particle storms.
 * One Sol is always calm so Science has a chance to shine.
 */
export async function buildSolForecast(sector, sols = 6) {
  const { events, archive, source, reason } = await getSpaceWeatherEvents()
  const pools = {}
  for (const type of ['FLR', 'CME', 'SEP']) {
    pools[type] = [...shuffle(events[type] || []), ...shuffle(archive?.[type] || [])]
  }

  const pattern =
    sector === 'mars'
      ? ['FLR', 'CME', 'FLR', 'SEP', 'FLR', 'CME']
      : ['CME', 'FLR', 'SEP', 'CME', 'FLR', 'SEP']

  const forecast = pattern.slice(0, sols).map((type, i) => {
    const list = pools[type].length ? pools[type] : pools.FLR.length ? pools.FLR : pools.CME
    return { ...list.shift(), sol: i + 1 }
  })

  const calmIndex = sector === 'mars' ? 2 : 3
  const calmSource = forecast[calmIndex]
  if (calmSource) {
    forecast[calmIndex] = {
      ...calmSource,
      id: `${calmSource.id}-calm`,
      type: 'CALM',
      typeLabel: 'Quiet Sun',
      headline: 'QUIET SUN · ALL CLEAR',
      metric: 'CALM',
      detail: `Sensors report calm skies after the ${calmSource.typeLabel.toLowerCase()} of ${calmSource.timeLabel}.`,
      kidText:
        'All clear! The Sun is resting today. This is the BEST time for experiments — Science earns a 50% bonus this Sol!',
      severity: 0.5,
    }
  }

  return { forecast, source, reason }
}
