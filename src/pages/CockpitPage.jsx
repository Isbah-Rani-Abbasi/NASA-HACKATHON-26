import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, Gauge, Keyboard, MousePointer2, Rocket, ShieldAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import missions from '../data/missions.json'
import { getHeadlineFlare } from '../services/spaceWeatherService'
import { drawPlanet } from '../utils/planetRenderer'
import { sfx } from '../utils/soundEffects'

const GAME_SECONDS = 15
const OVERLOAD_SECONDS = 2.2
const EXPLOSION_SECONDS = 3.2
const HIT_DAMAGE = 10
const HIT_RADIUS = 0.22
const CAM_LIMIT = 1
const rand = (min, max) => min + Math.random() * (max - min)
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

export default function CockpitPage() {
  const { missionId } = useParams()
  const mission = missions[missionId]
  if (!mission) return <Navigate to="/sectors" replace />
  return <CockpitGame key={missionId} mission={mission} />
}

function makeRock() {
  const pts = []
  const n = 9
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    pts.push([Math.cos(a) * rand(0.75, 1.1), Math.sin(a) * rand(0.75, 1.1)])
  }
  return pts
}

function CockpitGame({ mission }) {
  const navigate = useNavigate()
  const isMars = mission.cockpit.hazard === 'flare'
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const phaseRef = useRef('ready')
  const [phase, setPhase] = useState('ready')
  const [hud, setHud] = useState({ time: 0, hull: 100, dodged: 0, hits: 0, blips: [], cam: { x: 0, y: 0 } })
  const [flareLabel, setFlareLabel] = useState(null)

  const game = useRef({
    cam: { x: 0, y: 0, vx: 0, vy: 0 },
    pointer: null,
    keys: new Set(),
    hazards: [],
    stars: [],
    sparks: [],
    cracks: [],
    elapsed: 0,
    phaseTime: 0,
    spawnTimer: 0.6,
    hull: 100,
    dodged: 0,
    hits: 0,
    hitFlash: 0,
    shockwave: 0,
  })

  const changePhase = useCallback((p) => {
    phaseRef.current = p
    game.current.phaseTime = 0
    setPhase(p)
  }, [])

  useEffect(() => {
    if (!isMars) return
    let alive = true
    getHeadlineFlare().then((f) => alive && f && setFlareLabel(`${f.metric} flare · ${f.timeLabel}`))
    return () => {
      alive = false
    }
  }, [isMars])

  // Keyboard controls
  useEffect(() => {
    const keys = game.current.keys
    const map = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd' }
    const down = (e) => {
      if (map[e.key]) {
        e.preventDefault()
        keys.add(map[e.key])
      }
    }
    const up = (e) => map[e.key] && keys.delete(map[e.key])
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Main render / simulation loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const g = game.current
    let width = 0
    let height = 0
    let raf = 0
    let last = performance.now()
    let hudTimer = 0

    const resize = () => {
      const rect = wrapRef.current.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrapRef.current)

    g.stars = Array.from({ length: 260 }, () => ({ x: rand(-3, 3), y: rand(-2, 2), z: rand(0.1, 4) }))

    const spawnHazard = () => {
      const targeted = Math.random() < 0.45
      const x = targeted ? clamp(g.cam.x + rand(-0.35, 0.35), -1.3, 1.3) : rand(-1.3, 1.3)
      const y = targeted ? clamp(g.cam.y + rand(-0.3, 0.3), -1.2, 1.2) : rand(-1.1, 1.1)
      g.hazards.push({
        x,
        y,
        z: 3.2,
        vx: isMars ? rand(-0.35, 0.35) : rand(-0.08, 0.08),
        vy: isMars ? rand(-0.2, 0.2) : rand(-0.05, 0.05),
        speed: rand(1.45, 1.9) + g.elapsed * 0.03,
        spin: rand(-2, 2),
        rot: rand(0, Math.PI * 2),
        size: rand(0.1, 0.15),
        rock: makeRock(),
        whooshed: false,
      })
    }

    const explode = () => {
      const cx = width / 2
      const cy = height * 0.45
      for (let i = 0; i < 320; i++) {
        const a = rand(0, Math.PI * 2)
        const sp = rand(120, 900)
        const fire = Math.random() < 0.45
        g.sparks.push({
          x: cx + rand(-40, 40),
          y: cy + rand(-30, 30),
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - (fire ? 60 : 0),
          life: 0,
          max: fire ? rand(0.8, 1.8) : rand(0.6, 1.6),
          size: fire ? rand(14, 46) : rand(1.5, 3.5),
          fire,
          hue: rand(10, 50),
        })
      }
      g.cracks = Array.from({ length: 7 }, () => {
        const sx = rand(width * 0.15, width * 0.85)
        const sy = rand(height * 0.1, height * 0.8)
        const branches = []
        for (let b = 0; b < 5; b++) {
          let px = sx
          let py = sy
          const ang = rand(0, Math.PI * 2)
          const seg = [[px, py]]
          for (let s = 0; s < 5; s++) {
            px += Math.cos(ang + rand(-0.5, 0.5)) * rand(20, 55)
            py += Math.sin(ang + rand(-0.5, 0.5)) * rand(20, 55)
            seg.push([px, py])
          }
          branches.push(seg)
        }
        return branches
      })
      g.shockwave = 0.001
    }

    const update = (dt) => {
      const phaseNow = phaseRef.current
      g.phaseTime += dt
      const controllable = phaseNow === 'playing' || phaseNow === 'overload'

      // Steering
      if (controllable) {
        const accel = 6
        let ax = 0
        let ay = 0
        if (g.keys.has('l')) ax -= 1
        if (g.keys.has('r')) ax += 1
        if (g.keys.has('u')) ay -= 1
        if (g.keys.has('d')) ay += 1
        if (g.pointer) {
          ax += clamp((g.pointer.x - g.cam.x) * 3, -1.4, 1.4)
          ay += clamp((g.pointer.y - g.cam.y) * 3, -1.4, 1.4)
        }
        g.cam.vx += ax * accel * dt
        g.cam.vy += ay * accel * dt
      }
      g.cam.vx *= Math.pow(0.04, dt)
      g.cam.vy *= Math.pow(0.04, dt)
      g.cam.x = clamp(g.cam.x + g.cam.vx * dt, -CAM_LIMIT, CAM_LIMIT)
      g.cam.y = clamp(g.cam.y + g.cam.vy * dt, -CAM_LIMIT * 0.8, CAM_LIMIT * 0.8)

      if (phaseNow === 'playing') {
        g.elapsed += dt
        g.spawnTimer -= dt
        if (g.spawnTimer <= 0) {
          spawnHazard()
          if (g.elapsed > 7 && Math.random() < 0.35) spawnHazard()
          g.spawnTimer = Math.max(0.42, 0.95 - g.elapsed * 0.035)
        }
        if (g.elapsed >= GAME_SECONDS) {
          changePhase('overload')
          sfx.alarm()
        }
      } else if (phaseNow === 'overload' && g.phaseTime >= OVERLOAD_SECONDS) {
        changePhase('explosion')
        sfx.explosion()
        explode()
      }

      // Hazards
      for (const h of g.hazards) {
        h.z -= h.speed * dt
        h.x += h.vx * dt
        h.y += h.vy * dt
        h.rot += h.spin * dt
        const dist = Math.hypot(h.x - g.cam.x, h.y - g.cam.y)
        if (!h.whooshed && h.z < 0.9 && dist < 0.9) {
          h.whooshed = true
          sfx.whoosh()
        }
        if (h.z <= 0.18 && !h.resolved) {
          h.resolved = true
          if (dist < HIT_RADIUS + h.size * 0.5 && phaseRef.current !== 'explosion') {
            g.hull = Math.max(0, g.hull - HIT_DAMAGE)
            g.hits += 1
            g.hitFlash = 1
            sfx.hit()
            const el = wrapRef.current
            if (el) {
              el.classList.remove('animate-shake-once')
              void el.offsetWidth
              el.classList.add('animate-shake-once')
            }
          } else {
            g.dodged += 1
          }
        }
      }
      g.hazards = g.hazards.filter((h) => h.z > 0.05)
      g.hitFlash = Math.max(0, g.hitFlash - dt * 2.5)

      // Explosion particles
      for (const s of g.sparks) {
        s.life += dt
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.vx *= Math.pow(0.35, dt)
        s.vy = s.vy * Math.pow(0.35, dt) + (s.fire ? -20 : 220) * dt
      }
      g.sparks = g.sparks.filter((s) => s.life < s.max)
      if (g.shockwave > 0) g.shockwave += dt

      if (phaseNow === 'explosion' && g.phaseTime >= EXPLOSION_SECONDS && !g.navigated) {
        g.navigated = true
        const result = { hull: Math.round(g.hull), dodged: g.dodged, hits: g.hits }
        try {
          sessionStorage.setItem(`chrono-cockpit-${mission.id}`, JSON.stringify(result))
        } catch {
          /* storage unavailable — router state still carries the result */
        }
        navigate(`/outpost/${mission.id}`, { state: result })
      }
    }

    const project = (x, y, z) => {
      const f = Math.min(width, height) * 0.55
      return {
        sx: width / 2 + ((x - game.current.cam.x) * f) / z,
        sy: height * 0.45 + ((y - game.current.cam.y) * f) / z,
        scale: f / z,
      }
    }

    const draw = (dt) => {
      const phaseNow = phaseRef.current
      ctx.save()
      ctx.fillStyle = '#02030a'
      ctx.fillRect(0, 0, width, height)

      // Gentle roll for a sense of steering
      const roll = clamp(-g.cam.vx * 0.06, -0.12, 0.12)
      ctx.translate(width / 2, height * 0.45)
      ctx.rotate(roll)
      ctx.translate(-width / 2, -height * 0.45)

      // Destination body grows as you approach
      const progress = clamp(g.elapsed / GAME_SECONDS, 0, 1)
      const f = Math.min(width, height)
      drawPlanet(ctx, {
        x: width / 2 - g.cam.x * f * 0.08 + f * 0.22,
        y: height * 0.45 - g.cam.y * f * 0.08 - f * 0.12,
        r: f * (0.06 + progress * 0.12),
        rotation: g.elapsed * 0.15,
        type: mission.cockpit.targetBody,
      })

      // Warp-speed starfield
      const warp = phaseNow === 'ready' ? 0.6 : phaseNow === 'explosion' ? 0.3 : 2.4
      ctx.lineCap = 'round'
      for (const s of g.stars) {
        const prev = project(s.x, s.y, s.z)
        s.z -= warp * dt
        if (s.z <= 0.08) {
          s.x = rand(-3, 3) + g.cam.x
          s.y = rand(-2, 2) + g.cam.y
          s.z = 4
          continue
        }
        const p = project(s.x, s.y, s.z)
        const alpha = clamp(1 - s.z / 4, 0.1, 1)
        ctx.strokeStyle = `rgba(200,230,255,${alpha})`
        ctx.lineWidth = clamp(2.2 - s.z * 0.5, 0.5, 2.2)
        ctx.beginPath()
        ctx.moveTo(prev.sx, prev.sy)
        ctx.lineTo(p.sx, p.sy)
        ctx.stroke()
      }

      // Hazards (far to near)
      const sorted = [...g.hazards].sort((a, b) => b.z - a.z)
      for (const h of sorted) {
        const p = project(h.x, h.y, h.z)
        const maxR = Math.min(width, height) * 0.22
        const r = Math.min(h.size * p.scale, maxR)
        if (r < 0.5) continue
        const fade = clamp((3.2 - h.z) / 0.6, 0, 1) * clamp((h.z - 0.12) / 0.3, 0, 1)
        ctx.globalAlpha = fade
        const vx = width / 2 - p.sx
        const vy = height * 0.45 - p.sy
        const vlen = Math.max(Math.hypot(vx, vy), r * 0.5, 1)
        if (isMars) {
          // Plasma tail
          const tail = ctx.createLinearGradient(p.sx, p.sy, p.sx + (vx / vlen) * r * 5 - h.vx * r * 6, p.sy + (vy / vlen) * r * 5 - h.vy * r * 6)
          tail.addColorStop(0, 'rgba(255,240,180,0.9)')
          tail.addColorStop(0.4, 'rgba(255,90,140,0.5)')
          tail.addColorStop(1, 'rgba(255,59,92,0)')
          ctx.strokeStyle = tail
          ctx.lineWidth = r * 1.1
          ctx.beginPath()
          ctx.moveTo(p.sx, p.sy)
          ctx.lineTo(p.sx + (vx / vlen) * r * 5 - h.vx * r * 6, p.sy + (vy / vlen) * r * 5 - h.vy * r * 6)
          ctx.stroke()
          const orb = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 1.8)
          orb.addColorStop(0, 'rgba(255,255,255,1)')
          orb.addColorStop(0.25, 'rgba(255,220,90,0.95)')
          orb.addColorStop(0.6, 'rgba(255,90,60,0.55)')
          orb.addColorStop(1, 'rgba(255,59,92,0)')
          ctx.fillStyle = orb
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, r * 1.8, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,250,200,0.85)'
          ctx.lineWidth = Math.max(1, r * 0.06)
          for (let k = 0; k < 3; k++) {
            let a = h.rot + k * 2.1 + Math.random() * 0.6
            let lx = p.sx
            let ly = p.sy
            ctx.beginPath()
            ctx.moveTo(lx, ly)
            for (let s = 0; s < 4; s++) {
              a += rand(-0.6, 0.6)
              lx += Math.cos(a) * r * 0.55
              ly += Math.sin(a) * r * 0.55
              ctx.lineTo(lx, ly)
            }
            ctx.stroke()
          }
        } else {
          // Flaming meteoroid tail
          const tx = p.sx + (vx / vlen) * r * 4
          const ty = p.sy + (vy / vlen) * r * 4
          const tail = ctx.createLinearGradient(p.sx, p.sy, tx, ty)
          tail.addColorStop(0, 'rgba(255,200,80,0.95)')
          tail.addColorStop(0.5, 'rgba(255,90,30,0.55)')
          tail.addColorStop(1, 'rgba(255,40,40,0)')
          ctx.strokeStyle = tail
          ctx.lineWidth = r * 1.6
          ctx.beginPath()
          ctx.moveTo(p.sx, p.sy)
          ctx.lineTo(tx, ty)
          ctx.stroke()
          const glow = ctx.createRadialGradient(p.sx, p.sy, r * 0.6, p.sx, p.sy, r * 1.8)
          glow.addColorStop(0, 'rgba(255,150,40,0.7)')
          glow.addColorStop(1, 'rgba(255,80,0,0)')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, r * 1.8, 0, Math.PI * 2)
          ctx.fill()
          ctx.save()
          ctx.translate(p.sx, p.sy)
          ctx.rotate(h.rot)
          const body = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r)
          body.addColorStop(0, '#a08a7a')
          body.addColorStop(1, '#3b2a22')
          ctx.fillStyle = body
          ctx.beginPath()
          h.rock.forEach(([rx, ry], i) => (i ? ctx.lineTo(rx * r, ry * r) : ctx.moveTo(rx * r, ry * r)))
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = 'rgba(30,20,15,0.6)'
          ctx.beginPath()
          ctx.arc(r * 0.25, r * 0.1, r * 0.2, 0, Math.PI * 2)
          ctx.arc(-r * 0.3, r * 0.35, r * 0.13, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        ctx.globalAlpha = 1
      }
      ctx.restore()

      // Targeting reticle (ship nose)
      if (phaseNow === 'playing' || phaseNow === 'overload') {
        const cx = width / 2
        const cy = height * 0.45
        ctx.strokeStyle = phaseNow === 'overload' ? 'rgba(255,59,92,0.9)' : 'rgba(0,240,255,0.85)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, 22, 0, Math.PI * 2)
        ctx.moveTo(cx - 36, cy)
        ctx.lineTo(cx - 12, cy)
        ctx.moveTo(cx + 12, cy)
        ctx.lineTo(cx + 36, cy)
        ctx.moveTo(cx, cy - 36)
        ctx.lineTo(cx, cy - 12)
        ctx.moveTo(cx, cy + 12)
        ctx.lineTo(cx, cy + 36)
        ctx.stroke()
      }

      // Red overload vignette
      if (phaseNow === 'overload') {
        const pulse = 0.35 + 0.25 * Math.sin(g.phaseTime * 14)
        const v = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.25, width / 2, height / 2, Math.max(width, height) * 0.75)
        v.addColorStop(0, 'rgba(255,59,92,0)')
        v.addColorStop(1, `rgba(255,59,92,${pulse})`)
        ctx.fillStyle = v
        ctx.fillRect(0, 0, width, height)
      }

      // Hit flash
      if (g.hitFlash > 0) {
        ctx.fillStyle = `rgba(255,59,92,${g.hitFlash * 0.35})`
        ctx.fillRect(0, 0, width, height)
      }

      // Explosion: shockwave, fire, sparks, cracked glass, white-out
      if (g.shockwave > 0) {
        const t = g.shockwave
        const radius = t * Math.max(width, height) * 0.9
        ctx.strokeStyle = `rgba(255,230,180,${clamp(1 - t / 1.2, 0, 1)})`
        ctx.lineWidth = 30 * clamp(1 - t / 1.2, 0, 1) + 2
        ctx.beginPath()
        ctx.arc(width / 2, height * 0.45, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'lighter'
      for (const s of g.sparks) {
        const k = 1 - s.life / s.max
        if (s.fire) {
          const rr = s.size * (1 + (1 - k) * 1.5)
          const fg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, rr)
          fg.addColorStop(0, `hsla(${s.hue + 15},100%,70%,${0.7 * k})`)
          fg.addColorStop(0.5, `hsla(${s.hue},100%,50%,${0.4 * k})`)
          fg.addColorStop(1, 'hsla(0,100%,40%,0)')
          ctx.fillStyle = fg
          ctx.beginPath()
          ctx.arc(s.x, s.y, rr, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.strokeStyle = `hsla(${s.hue + 20},100%,75%,${k})`
          ctx.lineWidth = s.size
          ctx.beginPath()
          ctx.moveTo(s.x, s.y)
          ctx.lineTo(s.x - s.vx * 0.03, s.y - s.vy * 0.03)
          ctx.stroke()
        }
      }
      ctx.globalCompositeOperation = 'source-over'
      if (g.cracks.length) {
        ctx.strokeStyle = 'rgba(220,240,255,0.55)'
        ctx.lineWidth = 1.4
        for (const crack of g.cracks) {
          for (const seg of crack) {
            ctx.beginPath()
            seg.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
            ctx.stroke()
          }
        }
      }
      if (phaseNow === 'explosion') {
        const t = g.phaseTime
        const white = t < 0.25 ? 1 - t * 2 : 0
        const fadeOut = clamp((t - 2.2) / 1, 0, 1)
        if (white > 0) {
          ctx.fillStyle = `rgba(255,250,235,${white})`
          ctx.fillRect(0, 0, width, height)
        }
        if (fadeOut > 0) {
          ctx.fillStyle = `rgba(5,8,22,${fadeOut})`
          ctx.fillRect(0, 0, width, height)
        }
      }
    }

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      update(dt)
      draw(dt)
      hudTimer += dt
      if (hudTimer > 0.1) {
        hudTimer = 0
        setHud({
          time: g.elapsed,
          hull: g.hull,
          dodged: g.dodged,
          hits: g.hits,
          cam: { x: g.cam.x, y: g.cam.y },
          blips: g.hazards.map((h) => ({ x: h.x - g.cam.x, z: h.z })),
        })
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [changePhase, isMars, mission, navigate])

  // Pointer (mouse / touch drag) steering
  const pointerToCam = (e) => {
    const rect = wrapRef.current.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ny = ((e.clientY - rect.top) / (rect.height * 0.9)) * 2 - 1
    game.current.pointer = { x: clamp(nx * 1.15, -1, 1), y: clamp(ny * 1.1, -0.8, 0.8) }
  }
  const onPointerDown = (e) => {
    if (phaseRef.current !== 'playing' && phaseRef.current !== 'overload') return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    pointerToCam(e)
  }
  const onPointerMove = (e) => {
    if (game.current.pointer) pointerToCam(e)
  }
  const onPointerUp = () => {
    game.current.pointer = null
  }

  const start = () => {
    sfx.powerUp()
    changePhase('playing')
  }

  const timeLeft = Math.max(0, GAME_SECONDS - hud.time)
  const hullColor = hud.hull > 66 ? '#00E676' : hud.hull > 33 ? '#FFB800' : '#FF3B5C'
  const accent = isMars ? '#FFB800' : '#00F0FF'

  return (
    <main
      className={`fixed inset-0 flex flex-col overflow-hidden bg-cosmic pt-14 ${phase === 'explosion' ? 'animate-shake' : ''}`}
    >
      <div
        className="relative flex-1"
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'none' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label={`${mission.cockpit.hazardLabel} dodge game`} />
        <CockpitFrame warning={phase === 'overload' || phase === 'explosion'} />

        {/* Top HUD */}
        {(phase === 'playing' || phase === 'overload') && (
          <div className="pointer-events-none absolute top-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
            <span className="font-display text-[10px] font-bold tracking-[0.3em]" style={{ color: accent }}>
              {mission.cockpit.hazardLabel}
            </span>
            <span className="font-display text-3xl font-black text-white tabular-nums">{timeLeft.toFixed(1)}s</span>
            {isMars && flareLabel && (
              <span className="rounded-full bg-crimson/20 px-3 py-0.5 text-[11px] font-bold text-crimson">NASA DONKI: {flareLabel}</span>
            )}
          </div>
        )}

        <AnimatePresence>
          {phase === 'overload' && (
            <motion.div
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center px-4"
            >
              <div className="flex animate-warning items-center gap-3 rounded-2xl border-4 border-crimson bg-crimson/25 px-6 py-4 font-display text-xl font-black tracking-widest text-white glow-text-crimson sm:text-4xl">
                <AlertTriangle className="shrink-0 text-crimson" size={40} /> WARNING: MAIN ENGINE OVERLOAD!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'explosion' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="pointer-events-none absolute inset-x-0 bottom-10 text-center font-display text-lg font-bold tracking-widest text-solar glow-text-amber"
            >
              EMERGENCY LANDING... BRACE FOR IMPACT!
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'ready' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 grid place-items-center bg-cosmic/60 p-4 backdrop-blur-sm"
            >
              <div className="glass-panel w-full max-w-lg rounded-3xl p-6 text-center sm:p-8" style={{ borderColor: `${accent}88` }}>
                <p className="font-display text-xs font-bold tracking-[0.3em]" style={{ color: accent }}>
                  STAGE 1 · COCKPIT
                </p>
                <h1 className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">{mission.name}</h1>
                <p className="mt-3 text-slate-200">{mission.cockpit.instructions}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <Keyboard className="mb-1 text-cyan-glow" size={20} />
                    <b className="text-white">Arrow keys / WASD</b>
                    <p className="text-slate-400">Steer the ship</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <MousePointer2 className="mb-1 text-solar" size={20} />
                    <b className="text-white">Drag mouse / finger</b>
                    <p className="text-slate-400">Point where to fly</p>
                  </div>
                </div>
                <p className="mt-4 flex items-center justify-center gap-2 text-sm text-bio">
                  <ShieldAlert size={16} /> Higher hull integrity = more power at your outpost!
                </p>
                <button
                  type="button"
                  onClick={start}
                  className="mt-6 inline-flex items-center gap-3 rounded-2xl px-8 py-4 font-display text-lg font-black tracking-widest text-cosmic transition hover:scale-105"
                  style={{ background: accent, boxShadow: `0 0 30px ${accent}aa` }}
                  autoFocus
                >
                  <Rocket size={22} /> START ENGINES
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dashboard hud={hud} hullColor={hullColor} accent={accent} timeLeft={timeLeft} warning={phase === 'overload' || phase === 'explosion'} />
    </main>
  )
}

/** Metallic windshield frame drawn over the canvas. */
function CockpitFrame({ warning }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b4458" />
          <stop offset="50%" stopColor="#1c2233" />
          <stop offset="100%" stopColor="#0b0f1a" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,240,255,0.06)" />
          <stop offset="100%" stopColor="rgba(0,240,255,0)" />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        fill="url(#metal)"
        d="M0 0 H1000 V600 H0 Z M120 40 L880 40 L975 300 L930 600 L70 600 L25 300 Z"
      />
      <path d="M120 40 L880 40 L975 300 L930 600 L70 600 L25 300 Z" fill="url(#glass)" />
      <path d="M120 40 L880 40 L975 300 L930 600 L70 600 L25 300 Z" fill="none" stroke={warning ? '#FF3B5C' : '#00F0FF'} strokeOpacity="0.55" strokeWidth="3" />
      <path d="M500 40 L500 92" stroke="url(#metal)" strokeWidth="18" />
      <path d="M120 40 L60 0 M880 40 L940 0 M25 300 L0 300 M975 300 L1000 300" stroke="#4b5563" strokeWidth="6" />
      {[150, 300, 700, 850].map((x) => (
        <circle key={x} cx={x} cy="22" r="5" fill="#64748b" />
      ))}
      <path d="M140 60 L260 60" stroke="rgba(255,255,255,0.12)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/** Glowing dashboard with hull gauge, radar and mission timer. */
function Dashboard({ hud, hullColor, accent, timeLeft, warning }) {
  const circumference = 2 * Math.PI * 36
  return (
    <div className="relative z-10 grid grid-cols-3 items-center gap-2 border-t-2 border-slate-700 bg-gradient-to-b from-slate-800 to-slate-950 px-3 py-3 sm:gap-6 sm:px-8">
      <div className="flex items-center gap-3">
        <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
          <circle cx="42" cy="42" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
          <circle
            cx="42"
            cy="42"
            r="36"
            stroke={hullColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - hud.hull / 100)}
            transform="rotate(-90 42 42)"
            style={{ transition: 'stroke-dashoffset 0.3s, stroke 0.3s', filter: `drop-shadow(0 0 6px ${hullColor})` }}
          />
          <text x="42" y="47" textAnchor="middle" className="font-display" fill="white" fontSize="16" fontWeight="800">
            {Math.round(hud.hull)}%
          </text>
        </svg>
        <div className="hidden sm:block">
          <p className="font-display text-[10px] font-bold tracking-widest text-slate-400">HULL INTEGRITY</p>
          <p className="text-sm text-slate-200">
            <span className="text-bio">✓ {hud.dodged} dodged</span> · <span className="text-crimson">✕ {hud.hits} hits</span>
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <svg width="110" height="110" viewBox="-55 -55 110 110" aria-label="Radar">
          <circle r="50" fill="#021014" stroke={warning ? '#FF3B5C' : '#00F0FF'} strokeOpacity="0.6" strokeWidth="2" />
          <circle r="33" fill="none" stroke="#00F0FF" strokeOpacity="0.2" />
          <circle r="16" fill="none" stroke="#00F0FF" strokeOpacity="0.2" />
          <line x1="-50" y1="0" x2="50" y2="0" stroke="#00F0FF" strokeOpacity="0.15" />
          <line x1="0" y1="-50" x2="0" y2="50" stroke="#00F0FF" strokeOpacity="0.15" />
          <g className="origin-center animate-[spin_2s_linear_infinite]">
            <path d="M0 0 L0 -50 A50 50 0 0 1 35 -35 Z" fill="#00F0FF" fillOpacity="0.18" />
          </g>
          {hud.blips.map((b, i) => {
            const bx = clamp(b.x * 22, -46, 46)
            const by = clamp(46 - (b.z / 3.2) * 92, -46, 46)
            return <circle key={i} cx={bx} cy={-by} r="3" fill={accent === '#FFB800' ? '#FF3B5C' : '#FFB800'} />
          })}
          <polygon points="0,-6 5,5 -5,5" fill="#00E676" />
        </svg>
      </div>

      <div className="flex flex-col items-end gap-2 text-right">
        <p className="flex items-center gap-1 font-display text-[10px] font-bold tracking-widest text-slate-400">
          <Gauge size={12} /> STORM CROSSING
        </p>
        <div className="h-3 w-full max-w-[200px] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((GAME_SECONDS - timeLeft) / GAME_SECONDS) * 100}%`, background: accent, boxShadow: `0 0 10px ${accent}` }}
          />
        </div>
        <p className={`font-display text-xs font-bold ${warning ? 'animate-warning text-crimson' : 'text-slate-300'}`}>
          {warning ? 'ENGINE FAILURE' : 'ENGINES NOMINAL'}
        </p>
      </div>
    </div>
  )
}
