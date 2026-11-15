import { useEffect, useRef } from 'react'
import { drawPlanet, drawSun } from '../utils/planetRenderer'

/**
 * Persistent full-screen animated space canvas.
 * variant: 'landing' | 'sectors' | 'moon' | 'mars' | 'deep'
 */
const NEBULA_COLORS = {
  default: ['rgba(88,60,200,0.20)', 'rgba(0,240,255,0.10)', 'rgba(255,59,92,0.10)', 'rgba(60,90,220,0.16)'],
  mars: ['rgba(255,120,80,0.14)', 'rgba(255,184,0,0.08)', 'rgba(200,60,80,0.12)', 'rgba(255,150,120,0.10)'],
  moon: ['rgba(80,110,220,0.12)', 'rgba(0,240,255,0.06)', 'rgba(120,80,200,0.10)', 'rgba(60,90,160,0.10)'],
}

const rand = (min, max) => min + Math.random() * (max - min)

function makeRidge(width, baseY, amplitude, roughness, seed) {
  const points = []
  const step = Math.max(12, width / 80)
  let phase = seed
  for (let x = -step; x <= width + step; x += step) {
    phase += 0.13
    const y =
      baseY -
      Math.sin(x * 0.004 * roughness + seed) * amplitude * 0.6 -
      Math.sin(x * 0.011 * roughness + seed * 2) * amplitude * 0.3 -
      Math.abs(Math.sin(phase * 1.7)) * amplitude * 0.25
    points.push([x, y])
  }
  return points
}

function fillRidge(ctx, points, height, fill) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(points[0][0], height)
  points.forEach(([x, y]) => ctx.lineTo(x, y))
  ctx.lineTo(points[points.length - 1][0], height)
  ctx.closePath()
  ctx.fill()
}

export default function SpaceBackdrop({ variant = 'landing' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let raf = 0
    let last = performance.now()
    let time = 0
    let stars = []
    let nebulae = []
    let meteors = []
    let particles = []
    let craters = []
    let ridges = []
    let nextMeteor = 1.5
    const satellites = Array.from({ length: 4 }, (_, i) => ({
      angle: (i / 4) * Math.PI * 2,
      speed: rand(0.15, 0.35) * (i % 2 ? 1 : -1),
      radius: 0.18 + i * 0.07,
      tilt: rand(0.35, 0.6),
    }))
    const waves = Array.from({ length: 5 }, (_, i) => i / 5)

    const colors = NEBULA_COLORS[variant] || NEBULA_COLORS.default
    const starDensity = variant === 'mars' ? 0.35 : 1

    function setup() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.floor(((width * height) / 2600) * starDensity)
      stars = Array.from({ length: count }, () => {
        const layer = Math.random() < 0.6 ? 0 : Math.random() < 0.75 ? 1 : 2
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: [0.6, 1.1, 1.8][layer] * rand(0.7, 1.2),
          layer,
          phase: Math.random() * Math.PI * 2,
          twinkle: rand(0.8, 3),
          tint: Math.random() < 0.12 ? '#9fe8ff' : Math.random() < 0.08 ? '#ffe4a8' : '#ffffff',
        }
      })
      nebulae = colors.map((color, i) => ({
        x: rand(0, width),
        y: rand(0, height * 0.8),
        r: rand(0.25, 0.45) * Math.max(width, height),
        vx: rand(-6, 6),
        vy: rand(-3, 3),
        color,
        phase: i,
      }))

      if (variant === 'moon') {
        ridges = [
          { pts: makeRidge(width, height * 0.8, height * 0.05, 0.8, 1.3), fill: '#3a3e48' },
          { pts: makeRidge(width, height * 0.86, height * 0.04, 1.4, 4.1), fill: '#5c616d' },
        ]
        craters = Array.from({ length: 14 }, () => ({
          x: rand(0, width),
          y: rand(height * 0.89, height * 0.99),
          rx: rand(18, 70),
        }))
        particles = Array.from({ length: 70 }, () => ({
          x: rand(0, width),
          y: rand(height * 0.4, height),
          vx: rand(-4, 4),
          vy: rand(-10, -3),
          size: rand(0.6, 2),
          alpha: rand(0.2, 0.6),
        }))
      }
      if (variant === 'mars') {
        ridges = [
          { pts: makeRidge(width, height * 0.7, height * 0.12, 0.6, 2.2), fill: '#7a2d17' },
          { pts: makeRidge(width, height * 0.8, height * 0.1, 1.1, 5.7), fill: '#9c3b1d' },
          { pts: makeRidge(width, height * 0.9, height * 0.06, 1.8, 8.3), fill: '#b9532c' },
        ]
        particles = Array.from({ length: 180 }, () => ({
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(80, 260),
          vy: rand(-12, 18),
          size: rand(0.8, 2.6),
          alpha: rand(0.15, 0.55),
          len: rand(4, 22),
        }))
      }
    }

    function spawnMeteor() {
      const fromLeft = Math.random() < 0.5
      const speed = rand(500, 900)
      const angle = rand(0.25, 0.55)
      meteors.push({
        x: fromLeft ? rand(-100, width * 0.4) : rand(width * 0.6, width + 100),
        y: rand(-80, height * 0.3),
        vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: rand(1.2, 2.2),
        size: rand(1.5, 3),
      })
    }

    function drawStars(dt) {
      const drift = variant === 'mars' ? 0 : [2, 5, 10]
      for (const s of stars) {
        if (drift) {
          s.x -= drift[s.layer] * dt
          if (s.x < -2) s.x = width + 2
        }
        const tw = 0.55 + 0.45 * Math.sin(time * s.twinkle + s.phase)
        ctx.globalAlpha = tw * (variant === 'mars' ? 0.5 : 1)
        ctx.fillStyle = s.tint
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
        if (s.layer === 2 && tw > 0.85) {
          ctx.globalAlpha = (tw - 0.85) * 3
          ctx.fillRect(s.x - s.size * 3, s.y - 0.4, s.size * 6, 0.8)
          ctx.fillRect(s.x - 0.4, s.y - s.size * 3, 0.8, s.size * 6)
        }
      }
      ctx.globalAlpha = 1
    }

    function drawNebulae(dt) {
      for (const n of nebulae) {
        n.x += n.vx * dt
        n.y += n.vy * dt
        if (n.x < -n.r) n.x = width + n.r
        if (n.x > width + n.r) n.x = -n.r
        if (n.y < -n.r || n.y > height + n.r) n.vy *= -1
        const r = n.r * (1 + Math.sin(time * 0.2 + n.phase) * 0.06)
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r)
        g.addColorStop(0, n.color)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(n.x - r, n.y - r, r * 2, r * 2)
      }
    }

    function drawMeteors(dt) {
      nextMeteor -= dt
      if (nextMeteor <= 0) {
        spawnMeteor()
        nextMeteor = rand(2, 5)
      }
      meteors = meteors.filter((m) => m.life < m.maxLife)
      for (const m of meteors) {
        m.life += dt
        m.x += m.vx * dt
        m.y += m.vy * dt
        const fade = Math.sin((m.life / m.maxLife) * Math.PI)
        const tailX = m.x - m.vx * 0.18
        const tailY = m.y - m.vy * 0.18
        const g = ctx.createLinearGradient(m.x, m.y, tailX, tailY)
        g.addColorStop(0, `rgba(255,255,255,${0.95 * fade})`)
        g.addColorStop(0.2, `rgba(255,184,0,${0.7 * fade})`)
        g.addColorStop(1, 'rgba(255,59,92,0)')
        ctx.strokeStyle = g
        ctx.lineWidth = m.size
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(tailX, tailY)
        ctx.stroke()
        ctx.fillStyle = `rgba(255,255,255,${fade})`
        ctx.shadowColor = '#FFB800'
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.size * 1.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    function drawSectors() {
      const cx = width / 2
      const cy = height * 0.52
      const m = Math.min(width, height)
      waves.forEach((w) => {
        const p = (w + time * 0.08) % 1
        ctx.strokeStyle = `rgba(255,184,0,${0.35 * (1 - p)})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, m * 0.06 + p * m * 0.75, 0, Math.PI * 2)
        ctx.stroke()
      })
      ctx.strokeStyle = 'rgba(0,240,255,0.12)'
      ctx.lineWidth = 1
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, m * 0.12 * i, 0, Math.PI * 2)
        ctx.stroke()
      }
      const sweep = time * 0.8
      const grad = ctx.createConicGradient ? ctx.createConicGradient(sweep, cx, cy) : null
      if (grad) {
        grad.addColorStop(0, 'rgba(0,240,255,0.28)')
        grad.addColorStop(0.08, 'rgba(0,240,255,0)')
        grad.addColorStop(1, 'rgba(0,240,255,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, m * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
      drawSun(ctx, { x: cx, y: cy, r: m * 0.05, time })
      satellites.forEach((s) => {
        s.angle += s.speed * 0.016
        const sx = cx + Math.cos(s.angle) * m * s.radius * 1.6
        const sy = cy + Math.sin(s.angle) * m * s.radius * s.tilt
        ctx.strokeStyle = 'rgba(0,240,255,0.08)'
        ctx.beginPath()
        ctx.ellipse(cx, cy, m * s.radius * 1.6, m * s.radius * s.tilt, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.save()
        ctx.translate(sx, sy)
        ctx.rotate(s.angle)
        ctx.fillStyle = '#1e3a8a'
        ctx.fillRect(-14, -3, 10, 6)
        ctx.fillRect(4, -3, 10, 6)
        ctx.fillStyle = '#cbd5e1'
        ctx.fillRect(-4, -4, 8, 8)
        ctx.fillStyle = Math.sin(time * 6 + s.radius * 10) > 0 ? '#FF3B5C' : '#00F0FF'
        ctx.beginPath()
        ctx.arc(0, -6, 1.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
    }

    function drawMoonScene(dt) {
      fillRidge(ctx, ridges[0].pts, height, ridges[0].fill)
      fillRidge(ctx, ridges[1].pts, height, ridges[1].fill)
      const ground = ctx.createLinearGradient(0, height * 0.88, 0, height)
      ground.addColorStop(0, '#8a8f9c')
      ground.addColorStop(1, '#5d6270')
      ctx.fillStyle = ground
      ctx.fillRect(0, height * 0.885, width, height * 0.12)
      for (const c of craters) {
        ctx.fillStyle = 'rgba(40,44,54,0.45)'
        ctx.beginPath()
        ctx.ellipse(c.x, c.y, c.rx, c.rx * 0.22, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(220,224,232,0.35)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.ellipse(c.x, c.y + 1, c.rx, c.rx * 0.22, 0, 0.1, Math.PI - 0.1)
        ctx.stroke()
      }
      for (const p of particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.y < height * 0.35) {
          p.y = height
          p.x = rand(0, width)
        }
        ctx.fillStyle = `rgba(210,215,225,${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function drawMarsScene(dt) {
      const m = Math.min(width, height)
      const cx = width * 0.5
      const cy = height * 0.3
      const phobosA = time * 0.35
      const deimosA = time * 0.15 + 2
      drawPlanet(ctx, { x: cx + Math.cos(phobosA) * width * 0.35, y: cy + Math.sin(phobosA) * height * 0.08, r: m * 0.028, rotation: time * 0.5, type: 'phobos' })
      drawPlanet(ctx, { x: cx + Math.cos(deimosA) * width * 0.42, y: cy * 0.6 + Math.sin(deimosA) * height * 0.05, r: m * 0.016, rotation: time * 0.3, type: 'phobos' })
      ridges.forEach((r) => fillRidge(ctx, r.pts, height, r.fill))
      for (let i = 0; i < 3; i++) {
        const bandY = height * (0.45 + i * 0.17) + Math.sin(time * 0.4 + i) * 20
        const bandX = ((time * (60 + i * 30)) % (width * 1.6)) - width * 0.6
        const g = ctx.createRadialGradient(bandX, bandY, 0, bandX, bandY, width * 0.45)
        g.addColorStop(0, 'rgba(230,140,90,0.22)')
        g.addColorStop(1, 'rgba(230,140,90,0)')
        ctx.fillStyle = g
        ctx.fillRect(bandX - width * 0.45, bandY - width * 0.45, width * 0.9, width * 0.9)
      }
      ctx.lineCap = 'round'
      for (const p of particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt + Math.sin(time * 2 + p.x * 0.01) * 0.4
        if (p.x > width + 30) {
          p.x = -30
          p.y = rand(0, height)
        }
        ctx.strokeStyle = `rgba(245,180,130,${p.alpha})`
        ctx.lineWidth = p.size
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.len, p.y - p.vy * 0.02)
        ctx.stroke()
      }
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      time += dt

      if (variant === 'mars') {
        const sky = ctx.createLinearGradient(0, 0, 0, height)
        sky.addColorStop(0, '#1a0a12')
        sky.addColorStop(0.45, '#5a2230')
        sky.addColorStop(1, '#d48a68')
        ctx.fillStyle = sky
      } else {
        const sky = ctx.createLinearGradient(0, 0, 0, height)
        sky.addColorStop(0, '#050816')
        sky.addColorStop(1, variant === 'moon' ? '#0a1024' : '#0F172A')
        ctx.fillStyle = sky
      }
      ctx.fillRect(0, 0, width, height)

      drawNebulae(dt)
      drawStars(dt)

      if (variant === 'sectors') drawSectors()
      if (variant === 'moon') drawMoonScene(dt)
      if (variant === 'mars') drawMarsScene(dt)
      if (variant !== 'mars') drawMeteors(dt)

      if (!reduceMotion) raf = requestAnimationFrame(frame)
    }

    setup()
    window.addEventListener('resize', setup)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', setup)
    }
  }, [variant])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
}
