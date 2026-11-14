/**
 * Synthesized sci-fi sound engine built entirely on the Web Audio API.
 * No audio files are needed: every effect is generated from oscillators
 * and filtered noise at play time.
 */

const STORAGE_KEY = 'chrono-outpost-muted'
const listeners = new Set()

let ctx = null
let master = null
let noiseBuffer = null
let muted = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
})()

function getContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = 0.45
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function getNoiseBuffer(ac) {
  if (!noiseBuffer) {
    const length = ac.sampleRate * 3
    noiseBuffer = ac.createBuffer(1, length, ac.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

/** Plays a single oscillator tone with an optional pitch glide. */
function tone({ freq = 440, freqEnd, type = 'sine', duration = 0.15, volume = 0.3, delay = 0, attack = 0.01 }) {
  const ac = getContext()
  if (!ac || muted) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(master)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

/** Plays filtered white noise (wind, whoosh, rumble). */
function noise({ duration = 0.5, volume = 0.3, delay = 0, filter = 'bandpass', freq = 1000, freqEnd, q = 1, attack = 0.02 }) {
  const ac = getContext()
  if (!ac || muted) return
  const t0 = ac.currentTime + delay
  const src = ac.createBufferSource()
  src.buffer = getNoiseBuffer(ac)
  const biquad = ac.createBiquadFilter()
  biquad.type = filter
  biquad.Q.value = q
  biquad.frequency.setValueAtTime(freq, t0)
  if (freqEnd) biquad.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), t0 + duration)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  src.connect(biquad).connect(gain).connect(master)
  src.start(t0, Math.random() * 1.5)
  src.stop(t0 + duration + 0.05)
}

export const sfx = {
  /** Short sci-fi UI button click. */
  click() {
    tone({ freq: 1200, freqEnd: 600, type: 'square', duration: 0.07, volume: 0.12 })
    tone({ freq: 2400, freqEnd: 1800, type: 'sine', duration: 0.05, volume: 0.08, delay: 0.02 })
  },
  /** Soft hover blip. */
  hover() {
    tone({ freq: 880, freqEnd: 1100, type: 'sine', duration: 0.05, volume: 0.05 })
  },
  /** Robot voice chirp for the mascot typewriter. */
  beep() {
    const f = 520 + Math.random() * 420
    tone({ freq: f, freqEnd: f * (Math.random() > 0.5 ? 1.25 : 0.8), type: 'square', duration: 0.06, volume: 0.05 })
  },
  /** Meteoroid / plasma bolt fly-by. */
  whoosh() {
    noise({ duration: 0.6, volume: 0.22, filter: 'bandpass', freq: 400, freqEnd: 3200, q: 2.5, attack: 0.15 })
  },
  /** Something hit the hull. */
  hit() {
    noise({ duration: 0.35, volume: 0.45, filter: 'lowpass', freq: 1800, freqEnd: 120, attack: 0.005 })
    tone({ freq: 140, freqEnd: 40, type: 'sawtooth', duration: 0.3, volume: 0.25 })
  },
  /** Rising/falling emergency siren (~1.8s). */
  alarm() {
    for (let i = 0; i < 3; i++) {
      tone({ freq: 620, freqEnd: 980, type: 'sawtooth', duration: 0.3, volume: 0.14, delay: i * 0.6, attack: 0.02 })
      tone({ freq: 980, freqEnd: 620, type: 'sawtooth', duration: 0.3, volume: 0.14, delay: i * 0.6 + 0.3, attack: 0.02 })
    }
  },
  /** Huge engine explosion rumble. */
  explosion() {
    noise({ duration: 2.6, volume: 0.9, filter: 'lowpass', freq: 2400, freqEnd: 60, attack: 0.01 })
    noise({ duration: 0.8, volume: 0.5, filter: 'highpass', freq: 3000, freqEnd: 600, attack: 0.005 })
    tone({ freq: 90, freqEnd: 25, type: 'sine', duration: 2.4, volume: 0.6 })
    tone({ freq: 60, freqEnd: 20, type: 'triangle', duration: 2.8, volume: 0.4, delay: 0.1 })
  },
  /** Power routed / Sol executed. */
  powerUp() {
    tone({ freq: 220, freqEnd: 880, type: 'sawtooth', duration: 0.6, volume: 0.1 })
    tone({ freq: 440, freqEnd: 1320, type: 'sine', duration: 0.6, volume: 0.12, delay: 0.1 })
  },
  /** Positive confirmation chime. */
  success() {
    ;[660, 880, 1320].forEach((f, i) => tone({ freq: f, type: 'triangle', duration: 0.18, volume: 0.15, delay: i * 0.08 }))
  },
  /** Gentle "mission failed" descending tones. */
  fail() {
    ;[440, 370, 311, 220].forEach((f, i) => tone({ freq: f, type: 'triangle', duration: 0.35, volume: 0.18, delay: i * 0.22 }))
  },
  /** Victory fanfare. */
  fanfare() {
    const notes = [
      [523.25, 0, 0.18],
      [659.25, 0.18, 0.18],
      [783.99, 0.36, 0.18],
      [1046.5, 0.54, 0.5],
      [783.99, 1.1, 0.16],
      [1046.5, 1.28, 0.9],
    ]
    notes.forEach(([f, d, len]) => {
      tone({ freq: f, type: 'square', duration: len, volume: 0.09, delay: d })
      tone({ freq: f, type: 'triangle', duration: len + 0.1, volume: 0.16, delay: d })
    })
    ;[523.25, 659.25, 783.99].forEach((f) => tone({ freq: f / 2, type: 'triangle', duration: 1.4, volume: 0.1, delay: 1.28 }))
  },
}

export function isMuted() {
  return muted
}

export function setMuted(value) {
  muted = Boolean(value)
  try {
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0')
  } catch {
    /* storage unavailable (private mode) — keep in-memory value */
  }
  if (master && ctx) master.gain.setValueAtTime(muted ? 0 : 0.45, ctx.currentTime)
  listeners.forEach((fn) => fn())
}

export function toggleMute() {
  setMuted(!muted)
  if (!muted) sfx.click()
}

export function subscribeMute(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Call from any user gesture to unlock audio on iOS/Safari. */
export function unlockAudio() {
  getContext()
}
